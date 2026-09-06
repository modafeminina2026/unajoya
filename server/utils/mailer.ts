import nodemailer from 'nodemailer'

/**
 * Interfaces de dados para e-mails transacionais da Una Joya
 */
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

/**
 * Cria o transporter do Nodemailer de forma preguiçosa.
 * Valida estritamente as variáveis de ambiente sem usar fallbacks literais.
 */
export const createMailTransporter = () => {
  const user = process.env.GMAIL_USER
  const pass = process.env.GMAIL_APP_PASSWORD

  if (!user || !pass) {
    throw new Error('Configurações de e-mail ausentes: GMAIL_USER e GMAIL_APP_PASSWORD são obrigatórios.')
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user,
      pass
    }
  })
}

/**
 * Gera o template HTML do e-mail de confirmação de pedido
 */
export const generateOrderEmailHTML = (order: OrderEmailData): string => {
  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  const itemsHTML = (order.items || []).map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #E5E0DA; font-family: sans-serif; font-size: 14px; color: #1C1917;">
        <strong>${item.name}</strong><br>
        <span style="font-size: 12px; color: #78716C;">Qtd: ${item.quantity} x ${formatBRL(item.price)}</span>
      </td>
      <td align="right" style="padding: 12px 0; border-bottom: 1px solid #E5E0DA; font-family: sans-serif; font-size: 14px; font-weight: bold; color: #1C1917;">
        ${formatBRL(item.price * item.quantity)}
      </td>
    </tr>
  `).join('')

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><title>Confirmação de Pedido - UNA JOYA</title></head>
<body style="margin: 0; padding: 20px; background-color: #FAF8F5; font-family: sans-serif;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 560px; margin: 0 auto; background-color: #FFFFFF; border: 1px solid #E7E2DB; border-radius: 8px; overflow: hidden;">
    <tr>
      <td align="center" style="padding: 30px 20px; background-color: #1C1917; color: #FFFFFF;">
        <h1 style="margin: 0; font-size: 24px; letter-spacing: 4px;">UNA JOYA</h1>
        <p style="margin: 4px 0 0 0; font-size: 10px; letter-spacing: 2px; color: #C5A059;">JOALHERIA ARTESANAL</p>
      </td>
    </tr>
    <tr>
      <td style="padding: 24px;">
        <h2 style="margin: 0 0 12px 0; font-size: 20px; color: #1C1917;">Pedido Confirmado</h2>
        <p style="margin: 0 0 16px 0; font-size: 14px; color: #57534E; line-height: 1.5;">
          Olá, <strong>${order.customer_name}</strong>! Seu pedido foi registrado com sucesso.
        </p>
        <div style="background-color: #FAF8F5; border: 1px dashed #C5A059; border-radius: 6px; padding: 12px; text-align: center; margin-bottom: 20px;">
          <span style="font-size: 11px; color: #78716C; text-transform: uppercase; display: block;">Código de Rastreamento</span>
          <span style="font-size: 20px; font-weight: bold; letter-spacing: 3px; color: #1C1917;">${order.tracking_code}</span>
        </div>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
          ${itemsHTML}
        </table>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAF8F5; padding: 12px; border-radius: 6px;">
          <tr>
            <td style="font-size: 13px; color: #57534E;">Subtotal</td>
            <td align="right" style="font-size: 13px; font-weight: 600; color: #1C1917;">${formatBRL(order.subtotal)}</td>
          </tr>
          <tr>
            <td style="font-size: 14px; font-weight: bold; color: #1C1917; padding-top: 8px;">Total</td>
            <td align="right" style="font-size: 16px; font-weight: bold; color: #C5A059; padding-top: 8px;">${formatBRL(order.total)}</td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 16px; background-color: #1C1917; color: #A8A29E; font-size: 11px;">
        UNA JOYA • Joalheria Artesanal em Prata 925 & Pedras Naturais
      </td>
    </tr>
  </table>
</body>
</html>`
}

/**
 * Envia o e-mail de confirmação de pedido via Nodemailer
 */
export const sendOrderConfirmationEmail = async (order: OrderEmailData) => {
  if (!order.customer_email) {
    return { success: false, error: 'E-mail do destinatário não informado.' }
  }

  try {
    const transporter = createMailTransporter()
    const htmlContent = generateOrderEmailHTML(order)
    const sender = process.env.GMAIL_USER

    const info = await transporter.sendMail({
      from: `"UNA JOYA" <${sender}>`,
      to: order.customer_email,
      subject: `Pedido Confirmado [${order.tracking_code}] - UNA JOYA`,
      html: htmlContent
    })

    return { success: true, messageId: info.messageId }
  } catch (err: any) {
    return { success: false, error: err.message || 'Erro no envio de e-mail.' }
  }
}
