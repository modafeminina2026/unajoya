import { MercadoPagoConfig, Payment } from 'mercadopago'
import { createClient } from '@supabase/supabase-js'
import { sendOrderConfirmationEmail } from '../../utils/mailer'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const body = await readBody(event).catch(() => ({}))

  const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!mpAccessToken) {
    return { status: 'ok', message: 'AccessToken missing' }
  }

  // Notificação do Mercado Pago pode vir via query params ou body
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

          // Buscar o pedido antes de atualizar
          let orderData: any = null

          if (trackingCode) {
            const { data } = await supabase
              .from('orders')
              .select('*')
              .eq('tracking_code', trackingCode)
              .maybeSingle()
            orderData = data

            await supabase
              .from('orders')
              .update({ status: 'pago' })
              .eq('tracking_code', trackingCode)
          } else if (preferenceId) {
            const { data } = await supabase
              .from('orders')
              .select('*')
              .eq('stripe_session_id', preferenceId)
              .maybeSingle()
            orderData = data

            await supabase
              .from('orders')
              .update({ status: 'pago' })
              .eq('stripe_session_id', preferenceId)
          }

          // Enviar e-mail de confirmação de pedido se tiver os dados do cliente
          if (orderData && orderData.customer_email) {
            await sendOrderConfirmationEmail({
              tracking_code: orderData.tracking_code,
              customer_name: orderData.customer_name || 'Cliente UNA JOYA',
              customer_email: orderData.customer_email,
              customer_phone: orderData.customer_phone,
              items: orderData.items || [],
              subtotal: Number(orderData.subtotal || 0),
              total: Number(orderData.total || 0),
              created_at: orderData.created_at
            })
          }
        }
      }
    } catch (err) {
      console.error('Erro ao processar webhook do Mercado Pago:', err)
    }
  }

  return { status: 'ok' }
})
