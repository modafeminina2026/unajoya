import nodemailer from 'nodemailer'

export interface OrderEmailItem {
  name: string
  price: number
  quantity: number
  image?: string
}

export interface OrderEmailData {
  tracking_code: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  items: OrderEmailItem[]
  subtotal: number
  total: number
  created_at?: string
}

export const createMailTransporter = () => {
  const user = process.env.GMAIL_USER || 'unajoya.2023@gmail.com'
  const pass = process.env.GMAIL_APP_PASSWORD || 'uyyxlpsznqxocwqy'

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass
    }
  })
}

export const generateOrderEmailHTML = (order: OrderEmailData): string => {
  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const itemsHTML = (order.items || []).map(item => `
    <tr>
      <td style="padding: 14px 0; border-bottom: 1px solid #E5E0DA; vertical-align: middle;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            ${item.image ? `
              <td width="60" style="vertical-align: middle; padding-right: 14px;">
                <img src="${item.image}" alt="${item.name}" width="54" height="54" style="border-radius: 4px; object-fit: cover; display: block; border: 1px solid #E5E0DA;" />
              </td>
            ` : ''}
            <td style="vertical-align: middle;">
              <span style="font-family: 'Karla', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 600; color: #1C1917; display: block;">${item.name}</span>
              <span style="font-family: 'Karla', Helvetica, Arial, sans-serif; font-size: 12px; color: #78716C;">Qtd: ${item.quantity} x ${formatBRL(item.price)}</span>
            </td>
            <td align="right" style="vertical-align: middle; font-family: 'Karla', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 700; color: #1C1917;">
              ${formatBRL(item.price * item.quantity)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  `).join('')

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmação de Pedido - UNA JOYA</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF8F5; font-family: 'Karla', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAF8F5; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Container Principal -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 580px; background-color: #FFFFFF; border: 1px solid #E7E2DB; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
          
          <!-- Header UNA JOYA -->
          <tr>
            <td align="center" style="padding: 36px 20px 24px 20px; background-color: #1C1917; border-bottom: 2px solid #C5A059;">
              <h1 style="margin: 0; font-family: 'EB Garamond', Georgia, serif; font-size: 28px; font-weight: 700; letter-spacing: 6px; color: #FFFFFF; text-transform: uppercase;">
                UNA JOYA
              </h1>
              <p style="margin: 6px 0 0 0; font-family: 'Karla', sans-serif; font-size: 10px; letter-spacing: 3px; color: #C5A059; text-transform: uppercase;">
                Joalheria Artesanal
              </p>
            </td>
          </tr>

          <!-- Ícone de Sucesso & Título -->
          <tr>
            <td align="center" style="padding: 32px 28px 16px 28px;">
              <div style="width: 50px; height: 50px; background-color: #F7F3E9; border-radius: 50%; display: inline-block; text-align: center; line-height: 50px; margin-bottom: 16px;">
                <span style="font-size: 24px; color: #2D8A5B;">✓</span>
              </div>
              <h2 style="margin: 0; font-family: 'EB Garamond', Georgia, serif; font-size: 26px; font-weight: 600; font-style: italic; color: #1C1917;">
                Pagamento Confirmado!
              </h2>
              <p style="margin: 10px 0 0 0; font-family: 'Karla', sans-serif; font-size: 14px; color: #57534E; line-height: 1.5;">
                Olá, <strong>${order.customer_name}</strong>! Agradecemos por escolher a <strong>Una Joya</strong>. Seu pagamento foi processado e seu pedido já está sendo preparado com todo carinho.
              </p>
            </td>
          </tr>

          <!-- Caixa de Código de Rastreio -->
          <tr>
            <td style="padding: 0 28px 24px 28px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAF8F5; border: 1px dashed #C5A059; border-radius: 6px; padding: 18px;">
                <tr>
                  <td align="center">
                    <span style="font-family: 'Karla', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: 2px; color: #78716C; text-transform: uppercase; display: block; margin-bottom: 4px;">
                      CÓDIGO DE RASTREAMENTO DO PEDIDO
                    </span>
                    <span style="font-family: 'EB Garamond', Georgia, serif; font-size: 24px; font-weight: 700; letter-spacing: 4px; color: #1C1917; display: block;">
                      ${order.tracking_code}
                    </span>
                    <span style="font-family: 'Karla', sans-serif; font-size: 12px; color: #57534E; display: block; margin-top: 4px;">
                      Guarde este código para acompanhar o status e envio do seu pedido.
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Resumo dos Itens -->
          <tr>
            <td style="padding: 0 28px 24px 28px;">
              <h3 style="margin: 0 0 12px 0; font-family: 'Karla', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 2px; color: #78716C; text-transform: uppercase; border-bottom: 1px solid #E7E2DB; padding-bottom: 8px;">
                ITENS DO PEDIDO
              </h3>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                ${itemsHTML}
              </table>
            </td>
          </tr>

          <!-- Totais e Financeiro -->
          <tr>
            <td style="padding: 0 28px 24px 28px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAF8F5; border-radius: 6px; padding: 16px;">
                <tr>
                  <td style="font-family: 'Karla', sans-serif; font-size: 13px; color: #57534E; padding-bottom: 6px;">Subtotal</td>
                  <td align="right" style="font-family: 'Karla', sans-serif; font-size: 13px; font-weight: 600; color: #1C1917; padding-bottom: 6px;">${formatBRL(order.subtotal)}</td>
                </tr>
                <tr>
                  <td style="font-family: 'Karla', sans-serif; font-size: 13px; color: #57534E; padding-bottom: 6px;">Frete</td>
                  <td align="right" style="font-family: 'Karla', sans-serif; font-size: 13px; font-weight: 600; color: #2D8A5B; padding-bottom: 6px;">Grátis</td>
                </tr>
                <tr>
                  <td style="font-family: 'Karla', sans-serif; font-size: 15px; font-weight: 700; color: #1C1917; border-top: 1px solid #E7E2DB; padding-top: 10px;">Total Pago</td>
                  <td align="right" style="font-family: 'Karla', sans-serif; font-size: 18px; font-weight: 700; color: #C5A059; border-top: 1px solid #E7E2DB; padding-top: 10px;">${formatBRL(order.total)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Dados de Contato -->
          <tr>
            <td style="padding: 0 28px 32px 28px;">
              <h3 style="margin: 0 0 12px 0; font-family: 'Karla', sans-serif; font-size: 12px; font-weight: 700; letter-spacing: 2px; color: #78716C; text-transform: uppercase; border-bottom: 1px solid #E7E2DB; padding-bottom: 8px;">
                DADOS DE CONTATO
              </h3>
              <p style="margin: 0; font-family: 'Karla', sans-serif; font-size: 13px; color: #57534E; line-height: 1.6;">
                <strong>Nome:</strong> ${order.customer_name}<br>
                <strong>E-mail:</strong> ${order.customer_email}<br>
                ${order.customer_phone ? `<strong>Telefone:</strong> ${order.customer_phone}` : ''}
              </p>
            </td>
          </tr>

          <!-- Rodapé -->
          <tr>
            <td align="center" style="padding: 24px 20px; background-color: #1C1917; color: #A8A29E; font-size: 12px; line-height: 1.6;">
              <p style="margin: 0; font-family: 'EB Garamond', Georgia, serif; font-size: 16px; color: #FFFFFF; font-weight: 600; letter-spacing: 2px;">
                UNA JOYA
              </p>
              <p style="margin: 4px 0 12px 0; font-size: 11px; color: #C5A059;">
                Joalheria Artesanal • Peças em Prata 925 & Pedras Naturais
              </p>
              <p style="margin: 0; font-size: 11px; color: #78716C;">
                Este é um e-mail automático da Una Joya. Em caso de dúvidas, entre em contato através de unajoya.2023@gmail.com.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

export const sendOrderConfirmationEmail = async (order: OrderEmailData) => {
  if (!order.customer_email) {
    console.error('Nenhum e-mail de cliente fornecido para envio de confirmação.')
    return { success: false, message: 'Nenhum e-mail de cliente informado.' }
  }

  try {
    const transporter = createMailTransporter()
    const htmlContent = generateOrderEmailHTML(order)

    const mailOptions = {
      from: `"UNA JOYA" <${process.env.GMAIL_USER || 'unajoya.2023@gmail.com'}>`,
      to: order.customer_email,
      subject: `✨ Pedido Confirmado [${order.tracking_code}] - UNA JOYA`,
      html: htmlContent
    }

    const info = await transporter.sendMail(mailOptions)
    console.log(`E-mail de confirmação enviado para ${order.customer_email}: ${info.messageId}`)
    return { success: true, messageId: info.messageId }
  } catch (err: any) {
    console.error('Erro ao enviar e-mail de confirmação de pedido via Gmail:', err)
    return { success: false, error: err.message }
  }
}
