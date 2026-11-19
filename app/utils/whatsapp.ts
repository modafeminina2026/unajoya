/**
 * UNA JOYA - Utilitários do pedido via WhatsApp
 * Funções puras (sem Vue/Nuxt) para facilitar os testes.
 */

export interface WhatsAppOrderItem {
  name: string
  price: number
  quantity: number
}

export interface WhatsAppMessageInput {
  items: WhatsAppOrderItem[]
  code: string
  customerName?: string
  note?: string
}

// Alfabeto sem caracteres ambíguos (0/O, 1/I)
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const MAX_URL_LENGTH = 1900

/** Código curto do pedido, ex.: UJ-7K3Q9XPA (aceito pelo banco: ^UJ-[A-Z0-9]{8}$) */
export const generateOrderCode = (): string => {
  const bytes = new Uint8Array(8)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes)
  } else {
    for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256)
  }
  let code = ''
  for (const b of bytes) code += CODE_ALPHABET[b % CODE_ALPHABET.length]
  return `UJ-${code}`
}

/** R$ 1.234,56 com espaço comum (o Intl usa espaço não separável) */
export const formatBRL = (value: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
    .format(value || 0)
    .replace(/ /g, ' ')

const cleanText = (text: string | undefined, max: number): string =>
  (text || '').replace(/\s+/g, ' ').trim().slice(0, max)

const buildLines = (items: WhatsAppOrderItem[]): string[] =>
  items.map((item) => {
    const lineTotal = formatBRL(item.price * item.quantity)
    const each = item.quantity > 1 ? ` (${formatBRL(item.price)} cada)` : ''
    return `${item.quantity}x ${item.name.trim()} - ${lineTotal}${each}`
  })

const composeMessage = (
  lines: string[],
  hiddenCount: number,
  total: number,
  code: string,
  customerName: string,
  note: string
): string => {
  const parts: string[] = ['Olá, Una Joya! Gostaria de finalizar este pedido:', '', ...lines]
  if (hiddenCount > 0) {
    parts.push(`... e mais ${hiddenCount} ${hiddenCount === 1 ? 'item' : 'itens'} (veja o código do pedido)`)
  }
  parts.push('', `Total estimado: ${formatBRL(total)}`)
  if (note) parts.push(`Observações: ${note}`)
  if (customerName) parts.push(`Nome: ${customerName}`)
  parts.push(`Pedido: ${code}`)
  return parts.join('\n')
}

/**
 * Monta a mensagem do pedido. Se ficar grande demais para o link do WhatsApp,
 * encurta a lista de itens (o pedido completo continua salvo no sistema pelo código).
 */
export const buildWhatsAppMessage = (input: WhatsAppMessageInput, whatsappNumber = ''): string => {
  const customerName = cleanText(input.customerName, 80)
  const note = cleanText(input.note, 300)
  const total = input.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const lines = buildLines(input.items)

  let visible = lines.length
  let message = composeMessage(lines, 0, total, input.code, customerName, note)
  while (visible > 1 && buildWhatsAppUrl(whatsappNumber, message).length > MAX_URL_LENGTH) {
    visible--
    message = composeMessage(lines.slice(0, visible), lines.length - visible, total, input.code, customerName, note)
  }
  return message
}

/** Apenas dígitos, com DDI 55 se vier sem (ex.: "+55 11 95376-9317" -> 5511953769317) */
export const normalizeWhatsAppNumber = (raw: string): string => {
  const digits = (raw || '').replace(/\D/g, '')
  if (!digits) return ''
  return digits.length <= 11 ? `55${digits}` : digits
}

export const buildWhatsAppUrl = (number: string, message: string): string =>
  `https://wa.me/${normalizeWhatsAppNumber(number)}?text=${encodeURIComponent(message)}`
