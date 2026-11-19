/**
 * UNA JOYA - Prévia do link da peça (WhatsApp, Instagram, Facebook, Telegram...)
 *
 * O site é renderizado no navegador, então os robôs que montam a prévia do link
 * não veriam foto nem preço. Para ESSES robôs (pelo user-agent), devolvemos uma página
 * mínima com as tags Open Graph da peça. Pessoas e o Google recebem o site normal.
 */
import { createClient } from '@supabase/supabase-js'
import { defineEventHandler, getRequestURL, getHeader, setResponseHeaders } from 'h3'

const PREVIEW_BOTS = /WhatsApp|facebookexternalhit|Facebot|Twitterbot|TelegramBot|Slackbot|LinkedInBot|Discordbot|Pinterest|SkypeUriPreview|Applebot|redditbot|vkShare|Embedly/i

const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))

const firstImage = (images: unknown, image: unknown): string => {
  let list: string[] = []
  if (Array.isArray(images)) list = images.map(String)
  else if (typeof images === 'string') {
    try { const p = JSON.parse(images); if (Array.isArray(p)) list = p.map(String) } catch { list = [images] }
  }
  const url = list.find(Boolean) || (typeof image === 'string' ? image : '')
  // versão de 800px das fotos enviadas pelo painel (leve para a prévia)
  return url.replace(/-(400|1600)\.webp$/, '-800.webp')
}

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const m = url.pathname.match(/^\/produto\/(\d+)/)
  if (!m) return
  if (!PREVIEW_BOTS.test(getHeader(event, 'user-agent') || '')) return

  const config = useRuntimeConfig()
  const supabase = createClient(config.public.supabaseUrl, config.public.supabaseKey, { auth: { persistSession: false } })
  const { data } = await supabase.from('products').select('id, name, description, price, image, images').eq('id', Number(m[1])).maybeSingle()
  if (!data) return

  const price = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(data.price) || 0).replace(/ /g, ' ')
  const title = `${data.name} · ${price}`
  const desc = (data.description || 'Joia artesanal Una Joya, feita à mão com pedras naturais.').slice(0, 200)
  const img = firstImage(data.images, data.image)
  const imgAbs = img.startsWith('http') ? img : `${url.origin}${img}`
  const pageUrl = `${url.origin}${url.pathname}`

  setResponseHeaders(event, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'public, max-age=600' })
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<title>${esc(title)} | UNA JOYA</title>
<meta name="description" content="${esc(desc)}">
<meta property="og:type" content="product">
<meta property="og:site_name" content="UNA JOYA">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:image" content="${esc(imgAbs)}">
<meta property="og:url" content="${esc(pageUrl)}">
<meta property="product:price:amount" content="${(Number(data.price) || 0).toFixed(2)}">
<meta property="product:price:currency" content="BRL">
<meta name="twitter:card" content="summary_large_image">
<link rel="canonical" href="${esc(pageUrl)}">
</head><body><h1>${esc(data.name)}</h1><p>${esc(price)}</p><img src="${esc(imgAbs)}" alt="${esc(data.name)}"></body></html>`
})
