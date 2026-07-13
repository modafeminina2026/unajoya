export interface CartProduct {
  name: string
  price: number
  image: string
}

export interface CartItem {
  product: CartProduct
  quantity: number
}

const CART_STORAGE_KEY = 'unajoya-cart'

// Helpers para persistência no localStorage
const loadCartFromStorage = (): CartItem[] | null => {
  if (import.meta.server) return null
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored) as CartItem[]
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

  const increment = (productName: string) => {
    const item = items.value.find(i => i.product.name === productName)
    if (item) {
      item.quantity++
    }
  }

  const decrement = (productName: string) => {
    const item = items.value.find(i => i.product.name === productName)
    if (item && item.quantity > 1) {
      item.quantity--
    }
  }

  const deleteItem = (productName: string) => {
    items.value = items.value.filter(i => i.product.name !== productName)
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
    const existingItem = items.value.find(i => i.product.name === newProduct.name)
    if (existingItem) {
      existingItem.quantity++
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
