/**
 * UNA JOYA - Middleware de Servidor para Bloqueio de Rota Administrativa
 *
 * Intercepta no servidor Nitro/H3 requisições à rota administrativa legada,
 * retornando HTTP 404 real com headers no-store e noindex antes que
 * qualquer shell SPA seja gerado ou entregue.
 */
import { defineEventHandler, getRequestURL, setResponseStatus, setResponseHeaders } from 'h3'

export default defineEventHandler((event) => {
  const url = getRequestURL(event)
  // Normaliza barras finais preservando o pathname exato sem query parameters
  const pathname = url.pathname.replace(/\/+$/, '') || '/'

  if (pathname === '/painel-exclusivo-unajoya') {
    setResponseStatus(event, 404, 'Página não encontrada')
    setResponseHeaders(event, {
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
      'Cache-Control': 'no-store'
    })
    return 'Página não encontrada'
  }
})