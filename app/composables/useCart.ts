export const useCart = () => {
  const quantity = useState<number>('cart-quantity', () => 1)
  const giftWrap = useState<boolean>('cart-giftwrap', () => false)
  const isCartEmpty = useState<boolean>('cart-empty', () => false)
  
  const product = {
    name: 'Colar em Pedras Verde Esmeralda',
    price: 488.00,
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLv32RCOxvnLt6F9GVk2xQB2SLlIZw-JJNeXrtBr-AbV3tEAsg7iBiFWAAHGQ2MgJpZjyg7UWvydCDyf6DzWZu1oi6ssAzBHor5h-AbIYfVyAHgaobl_bau3CYboabcP1ETLbyM_y_wsCC698GjwAnLa-OlFeJaeCim5QP0kbo8ebTNhvnCose7vqxvN_giMcm0wZ9pJWC5L_eiXK8Lh050yYOvUDqIdV_lqSO51l-QRvNlMLqGOgcTfON8'
  }

  const subtotal = computed(() => {
    return product.price * quantity.value
  })

  const discount = computed(() => {
    // 5% discount
    return subtotal.value * 0.05
  })

  const total = computed(() => {
    return subtotal.value - discount.value
  })

  const increment = () => {
    quantity.value++
  }

  const decrement = () => {
    if (quantity.value > 1) {
      quantity.value--
    }
  }

  const deleteItem = () => {
    isCartEmpty.value = true
  }

  const resetCart = () => {
    quantity.value = 1
    giftWrap.value = false
    isCartEmpty.value = false
  }

  return {
    quantity,
    giftWrap,
    isCartEmpty,
    product,
    subtotal,
    discount,
    total,
    increment,
    decrement,
    deleteItem,
    resetCart
  }
}
