import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const body = await readBody(event).catch(() => ({}))

  const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!mpAccessToken) {
    return { status: 'ok', message: 'AccessToken missing' }
  }

  // Notificação do Mercado Pago pode vir via query params ou body
  // Exemplo: ?type=payment&data.id=123456 ou body { action: 'payment.updated', data: { id: '123456' } }
  const topic = query.topic || query.type || body.type || body.action
  const paymentId = query['data.id'] || query.id || (body.data && body.data.id)

  if ((topic === 'payment' || topic === 'payment.created' || topic === 'payment.updated') && paymentId) {
    try {
      const mpClient = new MercadoPagoConfig({ accessToken: mpAccessToken })
      const paymentClient = new Payment(mpClient)

      const paymentInfo = await paymentClient.get({ id: String(paymentId) })

      if (paymentInfo && paymentInfo.status === 'approved') {
        const trackingCode = paymentInfo.external_reference
        const preferenceId = paymentInfo.preference_id

        const supabaseUrl = process.env.SUPABASE_URL
        const supabaseKey = process.env.SUPABASE_KEY

        if (supabaseUrl && supabaseKey) {
          const supabase = createClient(supabaseUrl, supabaseKey)

          // Atualizar status do pedido para 'pago' pelo tracking_code ou preference_id
          if (trackingCode) {
            await supabase
              .from('orders')
              .update({ status: 'pago' })
              .eq('tracking_code', trackingCode)
          } else if (preferenceId) {
            await supabase
              .from('orders')
              .update({ status: 'pago' })
              .eq('stripe_session_id', preferenceId)
          }
        }
      }
    } catch (err) {
      console.error('Erro ao processar webhook do Mercado Pago:', err)
    }
  }

  return { status: 'ok' }
})
