<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const { client } = useSupabase()
const route = useRoute()

definePageMeta({
  title: 'UNA JOYA - Acompanhar Pedido'
})

interface OrderData {
  id: number
  created_at: string
  items: Array<{ name: string; price: number; quantity: number; image: string }>
  subtotal: number
  total: number
  status: string
  tracking_code: string | null
  notes: string | null
}

const order = ref<OrderData | null>(null)
const loading = ref(true)
const notFound = ref(false)

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const statusSteps = [
  { key: 'pendente', label: 'Pedido Recebido', icon: 'check_circle', description: 'Seu pedido foi confirmado e registrado.' },
  { key: 'preparando', label: 'Em Preparação', icon: 'inventory_2', description: 'Estamos preparando sua joia com todo carinho.' },
  { key: 'enviado', label: 'Enviado', icon: 'local_shipping', description: 'Seu pedido está a caminho!' },
  { key: 'entregue', label: 'Entregue', icon: 'done_all', description: 'Pedido entregue. Aproveite sua joia!' },
]

const currentStepIndex = computed(() => {
  if (!order.value) return -1
  return statusSteps.findIndex(s => s.key === order.value!.status)
})

const isStepCompleted = (index: number) => {
  return index <= currentStepIndex.value
}

const isStepCurrent = (index: number) => {
  return index === currentStepIndex.value
}

onMounted(async () => {
  const param = (route.params.id as string).trim()
  if (param) {
    try {
      let query = client.from('orders').select('*')
      
      if (!isNaN(Number(param))) {
        // Se for número, busca por ID ou código de rastreio
        query = query.or(`id.eq.${Number(param)},tracking_code.eq.${param.toUpperCase()}`)
      } else {
        // Se não for número, busca por código de rastreio
        query = query.eq('tracking_code', param.toUpperCase())
      }

      const { data, error } = await query.maybeSingle()

      if (error) throw error
      if (data) {
        order.value = data as OrderData
      } else {
        notFound.value = true
      }
    } catch (err) {
      console.error('Erro ao buscar pedido:', err)
      notFound.value = true
    }
  } else {
    notFound.value = true
  }
  loading.value = false
})
</script>

<template>
  <div class="bg-[#fcf8f8] font-body-md text-on-surface min-h-screen flex flex-col">
    <!-- Header Simplificado -->
    <CheckoutHeader />

    <main class="flex-grow pt-32 lg:pt-40 px-margin-mobile lg:px-margin-desktop pb-24">
      <div class="max-w-2xl mx-auto space-y-6 fade-in">

        <!-- Loading -->
        <div v-if="loading" class="bg-white border border-soft-stone p-12 shadow-md rounded-sm text-center">
          <span class="material-symbols-outlined animate-spin text-4xl text-secondary">sync</span>
          <p class="text-secondary mt-4 text-sm">Carregando detalhes do pedido...</p>
        </div>

        <!-- Pedido não encontrado -->
        <div v-else-if="notFound" class="bg-white border border-soft-stone p-12 shadow-md rounded-sm text-center space-y-4">
          <span class="material-symbols-outlined text-6xl text-secondary/40">search_off</span>
          <h2 class="font-display-lg text-2xl text-primary italic">Pedido não encontrado</h2>
          <p class="text-secondary text-sm">Verifique o número do pedido e tente novamente.</p>
          <NuxtLink to="/" class="inline-block mt-4 bg-primary text-white px-8 py-3 font-label-caps text-xs tracking-widest uppercase hover:bg-deep-onyx transition-all font-bold">
            Voltar à Loja
          </NuxtLink>
        </div>

        <!-- Detalhes do Pedido -->
        <template v-else-if="order">
          <!-- Cabeçalho do Pedido -->
          <div class="bg-white border border-soft-stone p-6 lg:p-8 shadow-md rounded-sm">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p class="text-xs text-secondary uppercase tracking-wider font-label-caps">Acompanhamento</p>
                <h2 class="font-display-lg text-2xl lg:text-3xl text-primary italic">Pedido #{{ order.id }}</h2>
                <p class="text-xs text-secondary mt-1">{{ formatDate(order.created_at) }}</p>
              </div>
              <div class="text-right">
                <p class="text-xs text-secondary">Total pago</p>
                <p class="font-bold text-xl text-primary">{{ formatCurrency(order.total) }}</p>
              </div>
            </div>
          </div>

          <!-- Timeline de Status -->
          <div class="bg-white border border-soft-stone p-6 lg:p-8 shadow-md rounded-sm">
            <h3 class="font-headline-md text-headline-md font-medium mb-8 flex items-center gap-2">
              <span class="material-symbols-outlined text-lg text-secondary">timeline</span>
              Status do Pedido
            </h3>

            <div class="relative">
              <div 
                v-for="(step, index) in statusSteps" 
                :key="step.key" 
                class="flex items-start gap-4 pb-8 last:pb-0 relative"
              >
                <!-- Linha vertical -->
                <div v-if="index < statusSteps.length - 1" class="absolute left-[19px] top-10 w-0.5 h-[calc(100%-24px)]" :class="isStepCompleted(index + 1) ? 'bg-primary' : 'bg-soft-stone'"></div>

                <!-- Ícone do Step -->
                <div 
                  class="relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500"
                  :class="[
                    isStepCurrent(index) ? 'bg-primary text-white shadow-lg ring-4 ring-primary/20 scale-110' :
                    isStepCompleted(index) ? 'bg-primary text-white' : 
                    'bg-soft-stone/50 text-secondary/40'
                  ]"
                >
                  <span class="material-symbols-outlined text-lg" :style="isStepCompleted(index) ? 'font-variation-settings: \'FILL\' 1;' : ''">
                    {{ isStepCompleted(index) && !isStepCurrent(index) ? 'check' : step.icon }}
                  </span>
                </div>

                <!-- Conteúdo do Step -->
                <div class="pt-1.5 flex-1">
                  <p 
                    class="font-bold text-sm"
                    :class="isStepCompleted(index) ? 'text-primary' : 'text-secondary/50'"
                  >
                    {{ step.label }}
                  </p>
                  <p 
                    class="text-xs mt-0.5"
                    :class="isStepCompleted(index) ? 'text-secondary' : 'text-secondary/30'"
                  >
                    {{ step.description }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Código de Rastreio -->
          <div v-if="order.tracking_code" class="bg-white border border-soft-stone p-6 shadow-md rounded-sm">
            <div class="bg-champagne-gold/5 border border-champagne-gold/20 p-6 rounded-sm text-center space-y-2">
              <span class="material-symbols-outlined text-3xl text-champagne-gold">local_shipping</span>
              <p class="text-xs text-secondary uppercase tracking-wider font-label-caps">Código de Rastreio</p>
              <p class="font-bold text-primary text-2xl tracking-wider">{{ order.tracking_code }}</p>
              <p class="text-xs text-secondary">Consulte seu rastreio nos Correios ou transportadora.</p>
            </div>
          </div>

          <!-- Itens do Pedido -->
          <div class="bg-white border border-soft-stone p-6 shadow-md rounded-sm space-y-4">
            <h3 class="font-headline-md text-headline-md font-medium border-b border-soft-stone pb-3 flex items-center gap-2">
              <span class="material-symbols-outlined text-lg text-secondary">shopping_bag</span>
              Itens do Pedido
            </h3>

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
                  class="w-16 h-16 object-cover rounded-sm border border-soft-stone flex-shrink-0"
                >
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-sm">{{ item.name }}</p>
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
          </div>

          <!-- Botão Voltar -->
          <NuxtLink 
            to="/" 
            class="block w-full bg-primary text-white py-4 font-label-caps text-xs tracking-widest uppercase hover:bg-deep-onyx active:scale-[0.98] transition-all font-bold text-center"
          >
            Continuar Comprando
          </NuxtLink>
        </template>
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
