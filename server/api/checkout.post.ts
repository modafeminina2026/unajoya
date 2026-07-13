import Stripe from 'stripe'

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

    const session = await stripe.checkout.sessions.create({
      automatic_payment_methods: {
        enabled: true,
      },
      line_items: lineItems,
      mode: 'payment',
      success_url: `${baseUrl}/checkout/success`,
      cancel_url: `${baseUrl}/checkout/cancel`,
    })

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
