<script setup lang="ts">
import { ref, computed } from 'vue'

const { 
  items,
  subtotal, 
  total,
  discount
} = useCart()

const showCouponInput = ref(false)
const couponCode = ref('')
const calculatedShipping = ref<string | null>(null)
const calculatingShipping = ref(false)
const checkoutLoading = ref(false)

const customerName = ref('')
const customerEmail = ref('')
const customerPhone = ref('')

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

const formatInstallment = computed(() => {
  const price = subtotal.value
  const installment = price / 6
  return formatCurrency(installment)
})

const handleCalculateShipping = () => {
  calculatingShipping.value = true
  setTimeout(() => {
    calculatingShipping.value = false
    calculatedShipping.value = 'Grátis'
  }, 1200)
}

const handleCheckout = async () => {
  if (items.value.length === 0) {
    alert('Seu carrinho está vazio!')
    return
  }

  if (!customerName.value.trim() || !customerEmail.value.trim() || !customerPhone.value.trim()) {
    alert('Por favor, preencha todos os campos de contato (Nome, E-mail e Telefone) para prosseguir.')
    return
  }

  checkoutLoading.value = true
  try {
    const response = await $fetch<{ success: boolean; url: string }>('/api/checkout', {
      method: 'POST',
      body: {
        customerName: customerName.value.trim(),
        customerEmail: customerEmail.value.trim(),
        customerPhone: customerPhone.value.trim(),
        items: items.value.map(item => ({
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          image: item.product.image
        }))
      }
    })

    if (response.success && response.url) {
      window.location.href = response.url
    } else {
      alert('Falha ao processar checkout. Tente novamente.')
    }
  } catch (err: any) {
    console.error('Erro ao redirecionar para checkout:', err)
    alert(`Erro ao iniciar pagamento: ${err.data?.message || err.message || 'Erro desconhecido'}`)
  } finally {
    checkoutLoading.value = false
  }
}
</script>

<template>
  <div class="bg-white rounded-lg border border-soft-stone p-6 space-y-6 card-shadow">
    <h3 class="font-headline-md text-headline-md border-b border-soft-stone pb-4 font-medium">Resumo</h3>
    
    <!-- Dados de Contato -->
    <div class="space-y-4 border-b border-soft-stone pb-6">
      <h4 class="font-label-caps text-secondary text-xs font-bold tracking-wider">DADOS DE CONTATO</h4>
      
      <div class="space-y-3">
        <div>
          <label class="text-[10px] text-secondary font-label-caps tracking-wider block mb-1">NOME COMPLETO</label>
          <input 
            v-model="customerName"
            type="text" 
            placeholder="Nome Completo" 
            class="w-full border border-soft-stone px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors rounded-none"
            required
          >
        </div>

        <div>
          <label class="text-[10px] text-secondary font-label-caps tracking-wider block mb-1">E-MAIL</label>
          <input 
            v-model="customerEmail"
            type="email" 
            placeholder="exemplo@email.com" 
            class="w-full border border-soft-stone px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors rounded-none"
            required
          >
        </div>

        <div>
          <label class="text-[10px] text-secondary font-label-caps tracking-wider block mb-1">TELEFONE / WHATSAPP</label>
          <input 
            v-model="customerPhone"
            type="tel" 
            placeholder="(11) 99999-9999" 
            class="w-full border border-soft-stone px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors rounded-none"
            required
          >
        </div>
      </div>
    </div>

    <div class="space-y-4">
      <!-- Subtotal -->
      <div class="flex justify-between items-center">
        <span class="text-on-surface-variant font-body-md">Subtotal</span>
        <span class="font-body-md font-semibold">{{ formatCurrency(subtotal) }}</span>
      </div>

      <!-- Coupon Discount -->
      <div class="flex justify-between items-center">
        <span class="text-on-surface-variant font-body-md">Cupom de desconto</span>
        <div class="flex flex-col items-end">
          <button 
            v-if="!showCouponInput"
            class="flex items-center gap-2 text-primary font-body-md hover:text-champagne-gold transition-colors"
            @click="showCouponInput = true"
          >
            <span class="material-symbols-outlined text-lg">confirmation_number</span>
            <span>Inserir cupom</span>
          </button>
          <div v-else class="flex gap-2">
            <input 
              v-model="couponCode"
              type="text" 
              placeholder="CUPOM" 
              class="border border-soft-stone px-2 py-1 text-sm rounded focus:outline-none focus:border-primary uppercase w-24"
            >
            <button 
              class="bg-primary text-white text-xs px-3 py-1 rounded hover:bg-on-surface-variant transition-colors"
              @click="showCouponInput = false"
            >
              Ok
            </button>
          </div>
        </div>
      </div>

      <!-- Shipping -->
      <div class="flex justify-between items-center">
        <span class="text-on-surface-variant font-body-md">Frete</span>
        <div class="flex items-center">
          <span v-if="calculatingShipping" class="text-secondary text-sm">Calculando...</span>
          <span v-else-if="calculatedShipping" class="font-semibold text-body-md text-[#2D8A5B]">Grátis</span>
          <button 
            v-else
            class="text-primary font-body-md hover:underline hover:text-champagne-gold transition-colors"
            @click="handleCalculateShipping"
          >
            Calcular
          </button>
        </div>
      </div>
    </div>

    <!-- Pricing summary totals -->
    <div class="border-t border-soft-stone pt-6 space-y-2">
      <div class="flex justify-between items-baseline">
        <span class="font-bold text-headline-md">Total</span>
        <div class="text-right">
          <span class="font-bold text-2xl text-primary">{{ formatCurrency(total) }}</span>
          <p class="text-on-surface-variant text-sm mt-1">à vista com 5% OFF</p>
        </div>
      </div>
      <div class="flex justify-end">
        <p class="text-[#2D8A5B] font-bold text-sm font-semibold">
          ou 6x {{ formatInstallment }} sem juros
        </p>
      </div>
    </div>

    <!-- Submit checkout action -->
    <button 
      @click="handleCheckout"
      :disabled="checkoutLoading"
      class="w-full bg-primary text-white py-4 font-label-caps tracking-widest uppercase hover:bg-on-surface-variant transition-all active:scale-[0.98] duration-150 font-bold flex items-center justify-center gap-2"
      :class="{ 'opacity-50 pointer-events-none': checkoutLoading }"
    >
      <span v-if="checkoutLoading" class="material-symbols-outlined animate-spin text-sm">sync</span>
      {{ checkoutLoading ? 'Carregando...' : 'Finalizar a compra' }}
    </button>
  </div>
</template>
