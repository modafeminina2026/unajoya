/**
 * UNA JOYA - Cabeçalhos de proteção da rota do painel administrativo
 *
 * O painel agora exige login (e-mail + senha de uma conta ativa em admin_profiles).
 * Este middleware não bloqueia mais a rota; só impede indexação e cache da página.
 */
import { defineEventHandler, getRequestURL, setResponseHeaders } from 'h3'

export default defineEventHandler((event) => {
  const pathname = getRequestURL(event).pathname.replace(/\/+$/, '') || '/'
  if (pathname === '/painel-exclusivo-unajoya' || pathname.startsWith('/painel-exclusivo-unajoya/')) {
    setResponseHeaders(event, {
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
      'Cache-Control': 'no-store'
    })
  }
})
