import { buildWhatsAppMessage, buildWhatsAppUrl, generateOrderCode } from '~/utils/whatsapp'

export interface WhatsAppCheckoutOptions {
  customerName?: string
  note?: string
}

/**
 * Finaliza o pedido pelo WhatsApp:
 * 1) monta a mensagem com todos os itens da sacola;
 * 2) registra o pedido no banco (RPC create_whatsapp_order, preço recalculado no servidor);
 * 3) abre o WhatsApp. A venda nunca depende do registro: se o banco falhar, o WhatsApp abre mesmo assim.
 */
export const useWhatsAppCheckout = () => {
  const { items, isCartEmpty, clearCart } = useCart()
  const { client } = useSupabase()
  const config = useRuntimeConfig()

  const lastCode = useState<string | null>('whatsapp-last-code', () => null)
  const lastUrl = useState<string | null>('whatsapp-last-url', () => null)
  const lastMessage = useState<string>('whatsapp-last-message', () => '')

  interface Line { id: number; name: string; price: number; quantity: number }
  const cartLines = (): Line[] => items.value.map(i => ({ id: i.product.id, name: i.product.name, price: i.product.price, quantity: i.quantity }))

  const prepare = (opts: WhatsAppCheckoutOptions, lines: Line[] = cartLines()) => {
    const number = String(config.public.whatsappNumber || '')
    const code = generateOrderCode()
    const message = buildWhatsAppMessage(
      {
        code,
        customerName: opts.customerName,
        note: opts.note,
        items: lines.map(l => ({ name: l.name, price: l.price, quantity: l.quantity }))
      },
      number
    )
    return { code, message, url: buildWhatsAppUrl(number, message) }
  }

  // Origem = página + parâmetros utm_* (sem dados pessoais)
  const getOrigin = () => {
    if (!import.meta.client) return ''
    const params = new URLSearchParams(window.location.search)
    const utm = new URLSearchParams()
    params.forEach((value, key) => {
      if (key.startsWith('utm_')) utm.set(key, value.slice(0, 40))
    })
    const qs = utm.toString()
    return qs ? `${window.location.pathname}?${qs}` : window.location.pathname
  }

  const saveOrder = (code: string, opts: WhatsAppCheckoutOptions, lines: Line[] = cartLines()) => {
    const payload = lines.map(l => ({ product_id: l.id, quantity: l.quantity }))
    return Promise.resolve(
      client.rpc('create_whatsapp_order', {
        p_code: code,
        p_items: payload,
        p_customer_name: opts.customerName?.trim() || null,
        p_note: opts.note?.trim() || null,
        p_origin: getOrigin() || null
      })
    )
      .then(({ error }) => {
        if (error) console.warn('Pedido não registrado no sistema (WhatsApp segue normalmente):', error.message)
      })
      .catch((err) => {
        console.warn('Falha ao registrar pedido (WhatsApp segue normalmente):', err)
      })
  }

  /** Deve ser chamada diretamente no clique (sem await antes) para o navegador não bloquear a nova aba. */
  const sendToWhatsApp = (opts: WhatsAppCheckoutOptions = {}) => {
    if (isCartEmpty.value || !import.meta.client) return

    const { code, message, url } = prepare(opts)
    lastCode.value = code
    lastUrl.value = url
    lastMessage.value = message

    void saveOrder(code, opts)

    const win = window.open(url, '_blank')
    if (win) {
      win.opener = null
    } else {
      window.location.href = url
    }
  }

  /** "Pedir pelo WhatsApp" direto do card: só esta peça, sem mexer na sacola. Chamar no clique. */
  const sendProductToWhatsApp = (product: { id: number; name: string; price: number }, opts: WhatsAppCheckoutOptions = {}) => {
    if (!import.meta.client) return
    const lines: Line[] = [{ id: product.id, name: product.name, price: product.price, quantity: 1 }]
    const { code, url } = prepare(opts, lines)
    void saveOrder(code, opts, lines)
    const win = window.open(url, '_blank')
    if (win) win.opener = null
    else window.location.href = url
  }

  const copyMessage = async (opts: WhatsAppCheckoutOptions = {}) => {
    if (isCartEmpty.value || !import.meta.client) return false
    const { code, message, url } = prepare(opts)
    lastCode.value = code
    lastUrl.value = url
    lastMessage.value = message
    void saveOrder(code, opts)
    try {
      await navigator.clipboard.writeText(message)
      return true
    } catch {
      return false
    }
  }

  const resetLast = () => {
    lastCode.value = null
    lastUrl.value = null
    lastMessage.value = ''
  }

  const finishAndClear = () => {
    clearCart()
    resetLast()
  }

  return { sendToWhatsApp, sendProductToWhatsApp, copyMessage, lastCode, lastUrl, lastMessage, finishAndClear }
}
