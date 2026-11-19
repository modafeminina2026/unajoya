export interface CartProduct {
  id: number
  name: string
  price: number
  image: string
}

export interface CartItem {
  product: CartProduct
  quantity: number
}

// v2: itens agora são identificados por id (carrinhos antigos, só com nome, são ignorados)
const CART_STORAGE_KEY = 'unajoya-cart-v2'

// Helpers para persistência no localStorage
const loadCartFromStorage = (): CartItem[] | null => {
  if (import.meta.server) return null
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as CartItem[]
      return Array.isArray(parsed) ? parsed.filter(i => i?.product && typeof i.product.id === 'number' && i.quantity > 0) : null
    }
  } catch (e) {
    console.warn('Erro ao ler carrinho do localStorage:', e)
  }
  return null
}

const saveCartToStorage = (items: CartItem[]) => {
  if (import.meta.server) return
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
  } catch (e) {
    console.warn('Erro ao salvar carrinho no localStorage:', e)
  }
}

const clearCartStorage = () => {
  if (import.meta.server) return
  try {
    localStorage.removeItem(CART_STORAGE_KEY)
  } catch (e) {
    console.warn('Erro ao limpar carrinho do localStorage:', e)
  }
}

export const useCart = () => {
  const items = useState<CartItem[]>('cart-items', () => [])
  const giftWrap = useState<boolean>('cart-giftwrap', () => false)
  const isCartEmpty = computed(() => items.value.length === 0)
  const isPopupOpen = useState<boolean>('cart-popup-open', () => false)
  const hydrated = useState<boolean>('cart-hydrated', () => false)

  // Hidratar o carrinho do localStorage no cliente (apenas uma vez)
  if (import.meta.client && !hydrated.value) {
    const stored = loadCartFromStorage()
    if (stored && stored.length > 0) {
      items.value = stored
    }
    hydrated.value = true
  }

  // Watcher para persistir alterações no localStorage
  watch(items, (newItems) => {
    saveCartToStorage(newItems)
  }, { deep: true })

  const subtotal = computed(() => {
    return items.value.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  })

  const discount = computed(() => {
    // 5% discount
    return subtotal.value * 0.05
  })

  const total = computed(() => {
    return subtotal.value - discount.value
  })

  const totalItemsCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  const MAX_QUANTITY_PER_ITEM = 99

  const increment = (productId: number) => {
    const item = items.value.find(i => i.product.id === productId)
    if (item && item.quantity < MAX_QUANTITY_PER_ITEM) {
      item.quantity++
    }
  }

  const decrement = (productId: number) => {
    const item = items.value.find(i => i.product.id === productId)
    if (item && item.quantity > 1) {
      item.quantity--
    }
  }

  const deleteItem = (productId: number) => {
    items.value = items.value.filter(i => i.product.id !== productId)
  }

  // clearCart: esvazia completamente (usado após pagamento)
  const clearCart = () => {
    items.value = []
    giftWrap.value = false
    clearCartStorage()
  }

  // resetCart: restaura ao estado padrão (botão "Restaurar" no checkout)
  const resetCart = () => {
    items.value = []
    giftWrap.value = false
    clearCartStorage()
  }

  const addToCart = (newProduct: CartProduct) => {
    const existingItem = items.value.find(i => i.product.id === newProduct.id)
    if (existingItem) {
      if (existingItem.quantity < MAX_QUANTITY_PER_ITEM) existingItem.quantity++
    } else {
      items.value.push({ product: { ...newProduct }, quantity: 1 })
    }
    isPopupOpen.value = true
  }

  return {
    items,
    giftWrap,
    isCartEmpty,
    isPopupOpen,
    subtotal,
    discount,
    total,
    totalItemsCount,
    increment,
    decrement,
    deleteItem,
    resetCart,
    clearCart,
    addToCart
  }
}
