export interface CartProduct {
  name: string
  price: number
  image: string
}

export interface CartItem {
  product: CartProduct
  quantity: number
}

const defaultProduct: CartProduct = {
  name: 'Colar em Pedras Verde Esmeralda',
  price: 488.00,
  image: 'https://lh3.googleusercontent.com/aida/AP1WRLv32RCOxvnLt6F9GVk2xQB2SLlIZw-JJNeXrtBr-AbV3tEAsg7iBiFWAAHGQ2MgJpZjyg7UWvydCDyf6DzWZu1oi6ssAzBHor5h-AbIYfVyAHgaobl_bau3CYboabcP1ETLbyM_y_wsCC698GjwAnLa-OlFeJaeCim5QP0kbo8ebTNhvnCose7vqxvN_giMcm0wZ9pJWC5L_eiXK8Lh050yYOvUDqIdV_lqSO51l-QRvNlMLqGOgcTfON8'
}

export const useCart = () => {
  const items = useState<CartItem[]>('cart-items', () => [
    { product: defaultProduct, quantity: 1 }
  ])
  const giftWrap = useState<boolean>('cart-giftwrap', () => false)
  const isCartEmpty = useState<boolean>('cart-empty', () => false)
  const isPopupOpen = useState<boolean>('cart-popup-open', () => false)

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
    if (items.value.length === 0) {
      isCartEmpty.value = true
    }
  }

  const resetCart = () => {
    items.value = [{ product: defaultProduct, quantity: 1 }]
    giftWrap.value = false
    isCartEmpty.value = false
  }

  const addToCart = (newProduct: CartProduct) => {
    const existingItem = items.value.find(i => i.product.name === newProduct.name)
    if (existingItem) {
      existingItem.quantity++
    } else {
      items.value.push({ product: { ...newProduct }, quantity: 1 })
    }
    isCartEmpty.value = false
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
    addToCart
  }
}
