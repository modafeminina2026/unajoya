import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const items = body.items // Array de { name, price, quantity, image }

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Nenhum item no carrinho para checkout.'
    })
  }

  const stripeSecret = process.env.STRIPE_SECRET_KEY
  if (!stripeSecret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Stripe Secret Key não está configurada no servidor (.env).'
    })
  }

  const stripe = new Stripe(stripeSecret)

  // Inicializar Supabase para salvar o pedido
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_KEY
  if (!supabaseUrl || !supabaseKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Configuração do Supabase ausente no servidor (.env).'
    })
  }
  const supabase = createClient(supabaseUrl, supabaseKey)

  // Detectar a URL base atual da aplicação de forma dinâmica para sucesso/cancelamento
  const headers = getRequestHeaders(event)
  const host = headers.host || 'localhost:3000'
  const protocol = headers['x-forwarded-proto'] || 'http'
  const baseUrl = `${protocol}://${host}`

  try {
    const lineItems = items.map((item: any) => {
      const unitAmount = Math.round(item.price * 100) // Stripe trabalha com centavos
      
      const priceData: any = {
        currency: 'brl',
        product_data: {
          name: item.name,
        },
        unit_amount: unitAmount,
      }

      // Se a imagem for um link absoluto (válido), enviamos para o Stripe
      if (item.image && (item.image.startsWith('http://') || item.image.startsWith('https://'))) {
        priceData.product_data.images = [item.image]
      }

      return {
        price_data: priceData,
        quantity: item.quantity,
      }
    })

    const customerName = body.customerName
    const customerEmail = body.customerEmail
    const customerPhone = body.customerPhone

    // Calcular subtotal e total
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
    const total = subtotal * 0.95 // 5% de desconto à vista

    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: 'payment',
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/checkout/cancel`,
      payment_method_options: {
        card: {
          installments: {
            enabled: true
          }
        }
      }
    })

    // Gerar código de rastreio único de 8 caracteres
    const generateTrackingCode = (): string => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      let code = ''
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return code
    }

    let trackingCode = generateTrackingCode()
    // Verificar unicidade no banco (retry até encontrar um código único)
    for (let attempt = 0; attempt < 5; attempt++) {
      const { data: existing } = await supabase
        .from('orders')
        .select('id')
        .eq('tracking_code', trackingCode)
        .maybeSingle()
      
      if (!existing) break
      trackingCode = generateTrackingCode()
    }

    // Salvar o pedido na tabela orders do Supabase
    const { error: dbError } = await supabase
      .from('orders')
      .insert([{
        stripe_session_id: session.id,
        tracking_code: trackingCode,
        items: items.map((item: any) => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        subtotal,
        total,
        status: 'pendente',
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone
      }])

    if (dbError) {
      console.error('Erro ao salvar pedido no Supabase:', dbError)
      // Não interrompe o fluxo — o pagamento já foi criado no Stripe
    }

    return {
      success: true,
      url: session.url
    }
  } catch (err: any) {
    console.error('Erro ao criar sessão no Stripe:', err)
    throw createError({
      statusCode: 500,
      statusMessage: `Erro ao iniciar pagamento no Stripe: ${err.message}`
    })
  }
})
