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
  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1bN2GwVJfIq9B0RDrPenIwKDU28PNlwjAZhd-pM1A1DZyUxQN0lY8j69TovaBQUpQNw8H4Mu_mst4xrrZaQrGrWvUknbD3h-5EKxN4v43_v4EdmG36PpingB9_xSpn8y2uNR5cK3rU-w0ASkpHoo9iE4RykowqWXnlU1Afe__5rf5KuIA4Vz1_0Oa0uUEGfrGQPEO7ANklGwPNkSTcCs3yaVKQS0b1mwP1Os4gCZ6O3-aSfa1-Wt9j5Nn6xXLKTBbITtiHBQ0cQGN'
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
