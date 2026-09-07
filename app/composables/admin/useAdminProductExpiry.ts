import type { AdminProduct, SupabaseProductRow } from '~/types/admin'

export const getExpirationDays = (product: AdminProduct): number => {
  const diffTime = (product.createdAt.getTime() + product.duration * 24 * 60 * 60 * 1000) - Date.now()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export const getExpirationText = (product: AdminProduct): string => {
  const diffDays = getExpirationDays(product)

  if (diffDays <= 0) {
    return 'Expirado'
  } else if (diffDays === 1) {
    return '24h restantes'
  } else if (diffDays === 2) {
    return '48h restantes'
  } else {
    return `${diffDays} dias restantes`
  }
}

export const isExpiringSoon = (product: AdminProduct): boolean => {
  const diffDays = getExpirationDays(product)
  return diffDays <= 2
}

export const countActiveProducts = (products: AdminProduct[]): number => {
  return products.filter(p => {
    const diffTime = (p.createdAt.getTime() + p.duration * 24 * 60 * 60 * 1000) - Date.now()
    return diffTime > 0
  }).length
}

export const formatCurrency = (val: number): string => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

export const mapSupabaseProduct = (p: SupabaseProductRow, defaultImage: string): AdminProduct => {
  let imgList: string[] = []
  if (Array.isArray(p.images) && p.images.length > 0) {
    imgList = p.images.map((img: unknown) => String(img)).filter(Boolean)
  } else if (p.images && typeof p.images === 'string') {
    try {
      const parsed = JSON.parse(p.images)
      if (Array.isArray(parsed)) imgList = parsed.filter(Boolean)
    } catch {
      imgList = [p.images]
    }
  }
  if (imgList.length === 0 && p.image) {
    imgList = [p.image]
  }
  if (imgList.length === 0) {
    imgList = [defaultImage]
  }

  // Semântica canônica do commit-base: baseada exclusivamente em p.created_at
  const dateValue: string | number = p.created_at === null ? 0 : (p.created_at ?? NaN)

  return {
    id: p.id,
    name: p.name,
    description: p.description || '',
    price: Number(p.price),
    stock: Number(p.stock),
    promo: p.promo,
    duration: Number(p.duration),
    image: imgList[0] || p.image || '',
    images: imgList,
    createdAt: new Date(dateValue),
    category_id: p.category_id,
    category_name: p.categories?.name || 'Nenhuma'
  }
}
