/**
 * UNA JOYA - Handler de Upload de Imagens (Cloudflare R2)
 *
 * FASE 0A-1: Contenção Emergencial do Servidor
 * O endpoint de upload público permanece incondicionalmente bloqueado (HTTP 403)
 * até a implementação de autenticação administrativa formal e autorização com MFA.
 */
export default defineEventHandler((event) => {
  // Bloqueio preventivo sem processamento de payload ou chamadas ao storage
  throw createError({
    statusCode: 403,
    statusMessage: 'Endpoint temporariamente indisponível.'
  })
})
