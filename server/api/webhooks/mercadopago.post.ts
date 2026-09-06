/**
 * UNA JOYA - Webhook de Notificações do Mercado Pago
 *
 * FASE 0A-1: Contenção Emergencial do Servidor
 * Retorna HTTP 200 neutro de forma imediata para acusar recebimento ao provedor
 * sem executar consultas externas, mutações no banco ou disparos de e-mail.
 */
export default defineEventHandler((event) => {
  // Resposta neutra sem efeitos colaterais durante a contenção
  return { status: 'maintenance_acknowledged' }
})
