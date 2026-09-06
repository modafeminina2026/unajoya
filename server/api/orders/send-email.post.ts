/**
 * UNA JOYA - Handler de Disparo de E-mails Transacionais
 *
 * FASE 0A-1: Contenção Emergencial do Servidor
 * O endpoint de disparo de e-mails permanece incondicionalmente bloqueado (HTTP 403)
 * para evitar acionamentos desprotegidos ou exposição de dados transacionais.
 */
export default defineEventHandler((event) => {
  // Bloqueio preventivo incondicional
  throw createError({
    statusCode: 403,
    statusMessage: 'Endpoint temporariamente indisponível.'
  })
})
