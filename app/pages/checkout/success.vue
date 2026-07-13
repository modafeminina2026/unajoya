<script setup lang="ts">
import { ref, onMounted } from 'vue'

const { clearCart } = useCart()
const { client } = useSupabase()
const route = useRoute()

definePageMeta({
  title: 'UNA JOYA - Pedido Confirmado!'
})

interface OrderData {
  id: number
  created_at: string
  items: Array<{ name: string; price: number; quantity: number; image: string }>
  subtotal: number
  total: number
  status: string
  tracking_code: string | null
}

const order = ref<OrderData | null>(null)
const loading = ref(true)
const error = ref(false)

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const statusLabels: Record<string, string> = {
  pendente: 'Pedido Recebido',
  preparando: 'Em Preparação',
  enviado: 'Enviado',
  entregue: 'Entregue'
}

const statusColors: Record<string, string> = {
  pendente: 'bg-amber-100 text-amber-800',
  preparando: 'bg-blue-100 text-blue-800',
  enviado: 'bg-purple-100 text-purple-800',
  entregue: 'bg-green-100 text-green-800'
}

onMounted(async () => {
  // Limpar o carrinho após confirmação de pagamento
  clearCart()

  const sessionId = route.query.session_id as string
  if (sessionId) {
    try {
      const { data, error: dbError } = await client
        .from('orders')
        .select('*')
        .eq('stripe_session_id', sessionId)
        .single()

      if (dbError) throw dbError
      if (data) {
        order.value = data as OrderData
      }
    } catch (err) {
      console.error('Erro ao buscar pedido:', err)
      error.value = true
    }
  }
  loading.value = false
})
</script>

<template>
  <div class="bg-[#fcf8f8] font-body-md text-on-surface min-h-screen flex flex-col justify-between">
    <!-- Header Simplificado -->
    <CheckoutHeader />

    <main class="flex-grow pt-32 lg:pt-40 flex items-center justify-center px-margin-mobile">
      <div class="max-w-lg w-full space-y-6 fade-in">
        
        <!-- Card Principal de Sucesso -->
        <div class="bg-white border border-soft-stone p-8 lg:p-10 text-center shadow-md rounded-sm space-y-6">
          <!-- Ícone Elegante de Sucesso -->
          <div class="w-20 h-20 bg-champagne-gold/10 text-champagne-gold rounded-full flex items-center justify-center mx-auto border border-champagne-gold/20">
            <span class="material-symbols-outlined text-4xl text-primary" style="font-variation-settings: 'FILL' 1;">check_circle</span>
          </div>

          <div class="space-y-3">
            <h2 class="font-display-lg text-2xl lg:text-3xl text-primary italic">Pagamento Confirmado!</h2>
            <p class="text-secondary font-body-md text-sm leading-relaxed">
              Agradecemos por escolher a <strong>Una Joya</strong>. Seu pagamento foi processado com sucesso. Em breve, enviaremos as informações do envio e rastreio para o seu e-mail.
            </p>
          </div>

          <!-- Badge de Status -->
          <div v-if="order" class="flex items-center justify-center gap-2">
            <span 
              class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
              :class="statusColors[order.status] || 'bg-gray-100 text-gray-800'"
            >
              <span class="w-2 h-2 rounded-full bg-current opacity-60"></span>
              {{ statusLabels[order.status] || order.status }}
            </span>
          </div>
        </div>

        <!-- Resumo dos Itens -->
        <div v-if="order" class="bg-white border border-soft-stone p-6 shadow-md rounded-sm space-y-4">
          <h3 class="font-headline-md text-headline-md border-b border-soft-stone pb-3 font-medium flex items-center gap-2">
            <span class="material-symbols-outlined text-lg text-secondary">receipt_long</span>
            Resumo do Pedido #{{ order.id }}
          </h3>

          <!-- Data -->
          <p class="text-xs text-secondary">{{ formatDate(order.created_at) }}</p>

          <!-- Lista de itens -->
          <div class="space-y-3">
            <div 
              v-for="(item, idx) in order.items" 
              :key="idx"
              class="flex items-center gap-4 py-3 border-b border-soft-stone/50 last:border-0"
            >
              <img 
                v-if="item.image"
                :src="item.image" 
                :alt="item.name" 
                class="w-14 h-14 object-cover rounded-sm border border-soft-stone flex-shrink-0"
              >
              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm truncate">{{ item.name }}</p>
                <p class="text-xs text-secondary">Qtd: {{ item.quantity }}</p>
              </div>
              <p class="text-sm font-semibold text-primary flex-shrink-0">{{ formatCurrency(item.price * item.quantity) }}</p>
            </div>
          </div>

          <!-- Totais -->
          <div class="border-t border-soft-stone pt-4 space-y-2">
            <div class="flex justify-between text-sm">
              <span class="text-secondary">Subtotal</span>
              <span>{{ formatCurrency(order.subtotal) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-secondary">Desconto (5%)</span>
              <span class="text-[#2D8A5B]">-{{ formatCurrency(order.subtotal - order.total) }}</span>
            </div>
            <div class="flex justify-between font-bold text-lg pt-2 border-t border-soft-stone">
              <span>Total</span>
              <span class="text-primary">{{ formatCurrency(order.total) }}</span>
            </div>
          </div>

          <!-- Código de Rastreio -->
          <div v-if="order.tracking_code" class="bg-champagne-gold/5 border border-champagne-gold/20 p-4 rounded-sm text-center">
            <p class="text-xs text-secondary uppercase tracking-wider mb-1 font-label-caps">Código de Rastreio</p>
            <p class="font-bold text-primary text-lg tracking-wider">{{ order.tracking_code }}</p>
          </div>
        </div>

        <!-- Loading state -->
        <div v-else-if="loading" class="bg-white border border-soft-stone p-8 shadow-md rounded-sm text-center">
          <span class="material-symbols-outlined animate-spin text-3xl text-secondary">sync</span>
          <p class="text-secondary mt-3 text-sm">Carregando detalhes do pedido...</p>
        </div>

        <!-- Botões -->
        <div class="space-y-3">
          <NuxtLink 
            v-if="order"
            :to="`/pedido/${order.id}`" 
            class="block w-full bg-white border-2 border-primary text-primary py-4 font-label-caps text-xs tracking-widest uppercase hover:bg-primary hover:text-white active:scale-[0.98] transition-all font-bold text-center"
          >
            Acompanhar Pedido
          </NuxtLink>
          <NuxtLink 
            to="/" 
            class="block w-full bg-primary text-white py-4 font-label-caps text-xs tracking-widest uppercase hover:bg-deep-onyx active:scale-[0.98] transition-all font-bold text-center"
          >
            Voltar para a Loja
          </NuxtLink>
        </div>
      </div>
    </main>

    <!-- Rodapé -->
    <footer class="py-8 border-t border-soft-stone bg-white text-center text-xs text-secondary">
      <p>&copy; 2026 UNA JOYA. Todos os direitos reservados.</p>
    </footer>
  </div>
</template>

<style scoped>
.fade-in {
  animation: fadeIn 0.6s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
