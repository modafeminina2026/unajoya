import { MercadoPagoConfig, Preference } from 'mercadopago'
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

  const mpAccessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!mpAccessToken) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Mercado Pago Access Token não está configurado no servidor (.env).'
    })
  }

  const mpClient = new MercadoPagoConfig({ accessToken: mpAccessToken })
  const preferenceClient = new Preference(mpClient)

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

  // Detectar a URL base atual da aplicação de forma dinâmica
  const headers = getRequestHeaders(event)
  const host = headers.host || 'localhost:3000'
  const protocol = headers['x-forwarded-proto'] || 'http'
  const baseUrl = `${protocol}://${host}`

  try {
    const customerName = body.customerName || 'Cliente UNA JOYA'
    const customerEmail = body.customerEmail || 'cliente@unajoya.com.br'
    const customerPhone = body.customerPhone || ''

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

    // Calcular subtotal e total
    const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0)
    const total = subtotal * 0.95 // 5% de desconto à vista

    // Montar os itens para o Mercado Pago
    const mpItems = items.map((item: any, index: number) => ({
      id: item.id || item.slug || `item-${index}`,
      title: item.name,
      quantity: Number(item.quantity),
      unit_price: Number(item.price),
      currency_id: 'BRL',
      picture_url: (item.image && (item.image.startsWith('http://') || item.image.startsWith('https://'))) ? item.image : undefined
    }))

    const isPublicUrl = baseUrl.startsWith('https://')

    const preferenceBody: any = {
      items: mpItems,
      payer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone ? { number: customerPhone } : undefined
      },
      back_urls: {
        success: `${baseUrl}/checkout/success`,
        failure: `${baseUrl}/checkout/cancel`,
        pending: `${baseUrl}/checkout/success`
      },
      external_reference: trackingCode
    }

    if (isPublicUrl) {
      preferenceBody.auto_return = 'approved'
      preferenceBody.notification_url = `${baseUrl}/api/webhooks/mercadopago`
    }

    const preferenceResult = await preferenceClient.create({
      body: preferenceBody
    })

    const checkoutUrl = preferenceResult.init_point || preferenceResult.sandbox_init_point

    // Salvar o pedido na tabela orders do Supabase
    const { error: dbError } = await supabase
      .from('orders')
      .insert([{
        stripe_session_id: preferenceResult.id,
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
    }

    return {
      success: true,
      url: checkoutUrl
    }
  } catch (err: any) {
    console.error('Erro ao criar preferência no Mercado Pago:', err)
    throw createError({
      statusCode: 500,
      statusMessage: `Erro ao iniciar pagamento no Mercado Pago: ${err.message}`
    })
  }
})
