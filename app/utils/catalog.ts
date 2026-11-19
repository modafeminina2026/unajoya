/**
 * UNA JOYA - Catálogo público: converte as linhas do banco em peças da vitrine,
 * filtra peças vencidas e aplica busca e ordenação. Funções puras (testáveis).
 */
import { normalizeText } from './finance'

export interface StoreProduct {
  id: number
  name: string
  description: string
  price: number
  image: string
  images: string[]
  promo: boolean
  createdAt: string
  /** unidades que ainda podem ser vendidas (estoque − reservado) */
  available: number
  category: { name: string; slug: string } | null
}

export interface ProductRow {
  id: number
  name: string
  description?: string | null
  price: number | string
  image?: string | null
  images?: string[] | string | null
  promo?: boolean | null
  created_at: string
  duration?: number | null
  stock?: number | null
  reserved_stock?: number | null
  categories?: { name: string; slug: string } | null
}

/** Últimas unidades: aviso de urgência quando restam poucas */
export const LOW_STOCK_THRESHOLD = 2

export const parseImages = (row: Pick<ProductRow, 'images' | 'image'>): string[] => {
  let list: string[] = []
  if (Array.isArray(row.images)) list = row.images.map(String).filter(Boolean)
  else if (typeof row.images === 'string' && row.images) {
    try {
      const parsed = JSON.parse(row.images)
      if (Array.isArray(parsed)) list = parsed.map(String).filter(Boolean)
    } catch {
      list = [row.images]
    }
  }
  if (!list.length && row.image) list = [row.image]
  return list
}

/** Peças ficam na vitrine por `duration` dias a partir da criação */
export const isListed = (row: Pick<ProductRow, 'created_at' | 'duration'>, now = Date.now()): boolean => {
  const created = new Date(row.created_at).getTime()
  if (Number.isNaN(created)) return false
  return created + Number(row.duration || 15) * 86_400_000 > now
}

export const mapProductRow = (row: ProductRow): StoreProduct => {
  const images = parseImages(row)
  const stock = Number(row.stock ?? 0)
  const reserved = Number(row.reserved_stock ?? 0)
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? '',
    price: Number(row.price) || 0,
    image: images[0] || row.image || '',
    images,
    promo: !!row.promo,
    createdAt: row.created_at,
    available: Math.max(0, stock - reserved),
    category: row.categories ? { name: row.categories.name, slug: row.categories.slug } : null
  }
}

export const toStoreProducts = (rows: ProductRow[] | null | undefined, now = Date.now()): StoreProduct[] =>
  (rows || []).filter(r => isListed(r, now)).map(mapProductRow)

export type StockState = 'available' | 'low' | 'sold_out'
export const stockState = (p: Pick<StoreProduct, 'available'>): StockState =>
  p.available <= 0 ? 'sold_out' : p.available <= LOW_STOCK_THRESHOLD ? 'low' : 'available'

export type SortKey = 'featured' | 'newest' | 'price_asc' | 'price_desc'
export const SORT_LABELS: Record<SortKey, string> = {
  featured: 'Destaques',
  newest: 'Novidades',
  price_asc: 'Menor preço',
  price_desc: 'Maior preço'
}

export const filterAndSort = (
  products: StoreProduct[],
  opts: { query?: string; sort?: SortKey; onlyAvailable?: boolean } = {}
): StoreProduct[] => {
  const words = normalizeText(opts.query || '').split(/\s+/).filter(Boolean)
  let list = products.filter((p) => {
    if (opts.onlyAvailable && p.available <= 0) return false
    if (!words.length) return true
    const hay = normalizeText(`${p.name} ${p.category?.name ?? ''} ${p.description}`)
    return words.every(w => hay.includes(w))
  })
  const soldOutLast = (a: StoreProduct, b: StoreProduct) => Number(a.available <= 0) - Number(b.available <= 0)
  list = [...list]
  switch (opts.sort ?? 'featured') {
    case 'newest': list.sort((a, b) => soldOutLast(a, b) || b.createdAt.localeCompare(a.createdAt)); break
    case 'price_asc': list.sort((a, b) => soldOutLast(a, b) || a.price - b.price); break
    case 'price_desc': list.sort((a, b) => soldOutLast(a, b) || b.price - a.price); break
    default: list.sort(soldOutLast)
  }
  return list
}

/** "Colar Pérola Barroca" -> "colar-perola-barroca" (só para a URL ficar legível) */
export const slugify = (text: string): string =>
  normalizeText(text).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)

export const productPath = (p: Pick<StoreProduct, 'id' | 'name'>): string => {
  const slug = slugify(p.name)
  return `/produto/${p.id}${slug ? `-${slug}` : ''}`
}

/** "/produto/12-colar-perola" ou "12" -> 12 */
export const productIdFromParam = (param: string | string[] | undefined): number | null => {
  const raw = Array.isArray(param) ? param[0] : param
  const m = String(raw ?? '').match(/^(\d+)/)
  return m ? Number(m[1]) : null
}

/* -------------------------------------------------------- imagens responsivas */

/** Larguras geradas no upload (ver server/api/upload.post.ts) */
export const IMAGE_WIDTHS = [400, 800, 1600] as const

/**
 * Imagens enviadas pelo painel são salvas como ".../<id>-1600.webp" com irmãs -400 e -800.
 * Para essas, devolve um srcset; para links antigos/externos, só a própria URL.
 */
export const responsiveImage = (url: string): { src: string; srcset?: string } => {
  const m = url.match(/^(.*)-(400|800|1600)\.webp(\?.*)?$/)
  if (!m) return { src: url }
  const base = m[1]
  return {
    src: `${base}-800.webp`,
    srcset: IMAGE_WIDTHS.map(w => `${base}-${w}.webp ${w}w`).join(', ')
  }
}
