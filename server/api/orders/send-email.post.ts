import { createClient } from '@supabase/supabase-js'
import { sendOrderConfirmationEmail } from '../../utils/mailer'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const trackingCode = body.tracking_code || body.trackingCode

  if (!trackingCode) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Código de rastreamento (tracking_code) é obrigatório.'
    })
  }

  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_KEY
  if (!supabaseUrl || !supabaseKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Configuração do Supabase ausente no servidor.'
    })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('tracking_code', trackingCode)
    .maybeSingle()

  if (error || !order) {
    throw createError({
      statusCode: 444,
      statusMessage: `Pedido com o código de rastreio ${trackingCode} não foi encontrado.`
    })
  }

  const emailResult = await sendOrderConfirmationEmail({
    tracking_code: order.tracking_code,
    customer_name: order.customer_name || 'Cliente UNA JOYA',
    customer_email: order.customer_email,
    customer_phone: order.customer_phone,
    items: order.items || [],
    subtotal: Number(order.subtotal || 0),
    total: Number(order.total || 0),
    created_at: order.created_at
  })

  if (!emailResult.success) {
    throw createError({
      statusCode: 500,
      statusMessage: `Falha ao enviar e-mail: ${emailResult.error}`
    })
  }

  return {
    success: true,
    message: `E-mail de confirmação enviado com sucesso para ${order.customer_email}`,
    messageId: emailResult.messageId
  }
})
