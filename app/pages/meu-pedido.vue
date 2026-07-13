<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  title: 'UNA JOYA - Consultar Pedido'
})

const orderId = ref('')
const errorMessage = ref('')

const handleSearch = () => {
  errorMessage.value = ''
  const id = orderId.value.trim().replace('#', '')
  
  if (!id || isNaN(Number(id))) {
    errorMessage.value = 'Por favor, insira um número de pedido válido.'
    return
  }

  navigateTo(`/pedido/${id}`)
}
</script>

<template>
  <div class="bg-[#fcf8f8] font-body-md text-on-surface min-h-screen flex flex-col">
    <!-- Header -->
    <CheckoutHeader />

    <main class="flex-grow pt-32 lg:pt-40 flex items-center justify-center px-margin-mobile">
      <div class="max-w-md w-full bg-white border border-soft-stone p-8 lg:p-10 shadow-md rounded-sm space-y-8 fade-in">
        
        <!-- Ícone -->
        <div class="text-center space-y-4">
          <div class="w-20 h-20 bg-champagne-gold/10 rounded-full flex items-center justify-center mx-auto border border-champagne-gold/20">
            <span class="material-symbols-outlined text-4xl text-primary">search</span>
          </div>
          <div>
            <h2 class="font-display-lg text-2xl lg:text-3xl text-primary italic">Consultar Pedido</h2>
            <p class="text-secondary text-sm mt-2 leading-relaxed">
              Insira o número do seu pedido para acompanhar o status e as informações de envio.
            </p>
          </div>
        </div>

        <!-- Formulário de Busca -->
        <form @submit.prevent="handleSearch" class="space-y-4">
          <div>
            <label class="text-xs font-label-caps text-secondary tracking-wider block mb-2">NÚMERO DO PEDIDO</label>
            <div class="flex gap-3">
              <div class="relative flex-1">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/50 font-bold text-lg">#</span>
                <input 
                  v-model="orderId"
                  type="text" 
                  placeholder="Ex: 1" 
                  class="w-full border border-soft-stone pl-10 pr-4 py-4 text-lg focus:outline-none focus:border-primary transition-colors"
                  @keyup.enter="handleSearch"
                  autofocus
                >
              </div>
              <button 
                type="submit"
                class="bg-primary text-white px-6 font-label-caps text-xs tracking-widest uppercase hover:bg-deep-onyx active:scale-95 transition-all font-bold flex items-center gap-2 flex-shrink-0"
              >
                <span class="material-symbols-outlined text-lg">search</span>
                BUSCAR
              </button>
            </div>
          </div>
          
          <!-- Mensagem de Erro -->
          <p v-if="errorMessage" class="text-red-500 text-xs font-medium flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">error</span>
            {{ errorMessage }}
          </p>
        </form>

        <!-- Dica -->
        <div class="border-t border-soft-stone pt-6 text-center">
          <p class="text-xs text-secondary leading-relaxed">
            O número do pedido é exibido na tela de confirmação de pagamento. Se você não lembra o número, entre em contato conosco pelo nosso WhatsApp.
          </p>
        </div>

        <!-- Voltar -->
        <NuxtLink 
          to="/" 
          class="block w-full text-center text-primary font-label-caps text-xs tracking-widest uppercase hover:text-champagne-gold transition-colors font-bold py-2"
        >
          ← Voltar para a Loja
        </NuxtLink>
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
