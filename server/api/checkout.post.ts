/**
 * UNA JOYA - Handler de Checkout
 *
 * FASE 0A-1 / 0A-2: Contenção Emergencial do Servidor
 * O endpoint de checkout permanece temporariamente bloqueado no servidor
 * em modo fail-closed, impedindo a criação de preferências ou pedidos.
 */
export default defineEventHandler(() => {
  // Durante a Fase 0, o checkout permanece incondicionalmente bloqueado
  // até a reconstrução completa e autoritativa do backend nas fases posteriores.
  throw createError({
    statusCode: 503,
    statusMessage: 'Compras online temporariamente indisponíveis para manutenção.'
  })
})
