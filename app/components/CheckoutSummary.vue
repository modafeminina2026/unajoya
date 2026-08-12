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
const cepInput = ref('')
const calculatedShipping = ref<{ label: string; days: string; isFree: boolean; service: string; price: number } | null>(null)
const calculatingShipping = ref(false)
const cepError = ref('')
const checkoutLoading = ref(false)

const customerName = ref('')
const customerEmail = ref('')
const customerPhone = ref('')

const FREE_SHIPPING_THRESHOLD = 300
const isFreeShipping = computed(() => subtotal.value >= FREE_SHIPPING_THRESHOLD)
const amountLeftForFreeShipping = computed(() => Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal.value))

const shippingCost = computed(() => {
  if (isFreeShipping.value) return 0
  if (calculatedShipping.value && typeof calculatedShipping.value.price === 'number') {
    return calculatedShipping.value.price
  }
  return 0 // sem frete calculado ainda, nao adicionar ao total
})
const finalTotalWithShipping = computed(() => total.value + shippingCost.value)

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)
}

// Máximo de parcelas: mínimo de R$ 100 por parcela, até 12x
const maxInstallments = computed(() => Math.min(12, Math.max(1, Math.floor(subtotal.value / 100))))
const installmentValue = computed(() => formatCurrency(subtotal.value / maxInstallments.value))

const installmentText = computed(() => {
  const n = maxInstallments.value
  if (n <= 1) return 'pagamento à vista'
  return `em até ${n}x de ${installmentValue.value} sem juros`
})

const handleCalculateShipping = async () => {
  const clean = cepInput.value.replace(/\D/g, '')
  if (clean.length !== 8) {
    cepError.value = 'Digite um CEP válido com 8 dígitos.'
    return
  }
  cepError.value = ''
  calculatingShipping.value = true
  try {
    const res = await $fetch<any>('/api/shipping', {
      method: 'POST',
      body: { cep: clean, subtotal: subtotal.value }
    })
    calculatedShipping.value = {
      label: res.isFree ? 'Grátis' : res.label,
      days: res.days,
      isFree: res.isFree,
      service: res.service,
      price: Number(res.price) || 0
    }
  } catch {
    cepError.value = 'Não foi possível calcular. Tente novamente.'
  } finally {
    calculatingShipping.value = false
  }
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
    <h3 class="font-headline-md text-headline-md border-b border-soft-stone pb-4 font-medium">Resumo do Pedido</h3>

    <!-- Free shipping progress bar -->
    <div class="p-3 bg-surface-container-low border border-soft-stone rounded-sm text-center">
      <div v-if="isFreeShipping" class="flex items-center justify-center gap-2 text-[#2D8A5B] font-bold text-xs font-label-caps">
        <span class="material-symbols-outlined text-base">local_shipping</span>
        <span>VOCÊ GANHOU FRETE GRÁTIS!</span>
      </div>
      <div v-else class="space-y-1">
        <p class="text-xs text-primary font-body-md">
          Faltam <strong class="text-primary font-bold">{{ formatCurrency(amountLeftForFreeShipping) }}</strong> para ganhar <span class="text-[#2D8A5B] font-bold">FRETE GRÁTIS</span>
        </p>
        <div class="w-full bg-soft-stone h-1.5 rounded-full overflow-hidden">
          <div 
            class="bg-champagne-gold h-full transition-all duration-500" 
            :style="{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }"
          ></div>
        </div>
      </div>
    </div>
    
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
      <div class="space-y-2">
        <div class="flex justify-between items-start">
          <span class="text-on-surface-variant font-body-md">Frete</span>
          <div class="text-right">
            <span v-if="isFreeShipping" class="font-semibold text-body-md text-[#2D8A5B]">Grátis 🎉</span>
            <span v-else-if="calculatingShipping" class="text-secondary text-sm animate-pulse">Calculando...</span>
            <span v-else-if="calculatedShipping" :class="calculatedShipping.isFree ? 'text-[#2D8A5B]' : 'text-primary'" class="font-semibold text-body-md">
              {{ calculatedShipping.label }}
            </span>
            <span v-else class="text-secondary text-sm">—</span>
          </div>
        </div>

        <!-- CEP input (só aparece se não tiver frete grátis automático) -->
        <div v-if="!isFreeShipping" class="space-y-1">
          <div class="flex gap-2">
            <input
              v-model="cepInput"
              type="text"
              placeholder="00000-000"
              maxlength="9"
              @input="cepInput = cepInput.replace(/\D/g, '').replace(/^(\d{5})(\d)/, '$1-$2')"
              @keyup.enter="handleCalculateShipping"
              class="flex-1 border border-soft-stone px-3 py-1.5 text-sm focus:outline-none focus:border-primary transition-colors rounded-none"
            >
            <button
              :disabled="calculatingShipping"
              class="bg-primary text-white text-xs px-3 py-1.5 hover:bg-on-surface-variant transition-colors font-label-caps tracking-wider disabled:opacity-50"
              @click="handleCalculateShipping"
            >
              {{ calculatingShipping ? '...' : 'OK' }}
            </button>
          </div>
          <p v-if="cepError" class="text-red-500 text-[10px]">{{ cepError }}</p>
          <p v-if="calculatedShipping && !calculatedShipping.isFree" class="text-[10px] text-secondary">
            {{ calculatedShipping.service }} · {{ calculatedShipping.days }}
          </p>
          <a href="https://buscacepinter.correios.com.br/app/endereco/index.php" target="_blank" class="text-[10px] text-champagne-gold hover:underline">Não sei meu CEP</a>
        </div>
      </div>
    </div>

    <!-- Pricing summary totals -->
    <div class="border-t border-soft-stone pt-6 space-y-3">
      <div class="flex justify-between items-baseline">
        <span class="font-bold text-headline-md">Total</span>
        <div class="text-right">
          <span class="font-bold text-2xl text-primary">{{ formatCurrency(finalTotalWithShipping) }}</span>
          <p class="text-[#2D8A5B] text-xs font-bold mt-0.5">à vista no PIX (com 5% OFF)</p>
        </div>
      </div>

      <!-- Options breakdown -->
      <div class="p-3 bg-surface-container-low border border-soft-stone rounded-sm space-y-2">
        <div class="flex items-center justify-between text-xs">
          <span class="font-bold text-primary flex items-center gap-1.5">
            <span class="material-symbols-outlined text-sm text-champagne-gold">credit_card</span>
            Parcelamento no Cartão
          </span>
          <span class="font-semibold text-primary">{{ maxInstallments > 1 ? `até ${maxInstallments}x` : 'à vista' }}</span>
        </div>
        <p class="text-[10px] text-secondary leading-tight">
          <span v-if="maxInstallments > 1">{{ installmentText }} no cartão via Mercado Pago.</span>
          <span v-else>Valor abaixo de R$ 200 — pague à vista no cartão ou PIX com 5% OFF.</span>
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
      {{ checkoutLoading ? 'Carregando Mercado Pago...' : 'IR PARA O PAGAMENTO' }}
    </button>

    <!-- Mercado Pago Security Seal -->
    <div class="text-center space-y-1">
      <p class="text-[10px] text-secondary font-label-caps tracking-wider flex items-center justify-center gap-1">
        <span class="material-symbols-outlined text-xs text-[#2D8A5B]">lock</span>
        PAGAMENTO 100% SEGURO VIA MERCADO PAGO
      </p>
    </div>
  </div>
</template>
