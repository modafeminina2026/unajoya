/**
 * UNA JOYA - Handler de Cotação de Frete
 *
 * FASE 0A-1: Contenção Emergencial do Servidor
 * As cotações de frete permanecem temporariamente suspensas no servidor,
 * sem acionamento de APIs externas (Correios/ViaCEP) ou tabelas estáticas.
 */
export default defineEventHandler((event) => {
  // Durante a Fase 0A-1, cotações de frete permanecem desativadas
  throw createError({
    statusCode: 503,
    statusMessage: 'Cotações de frete temporariamente indisponíveis.'
  })
})
