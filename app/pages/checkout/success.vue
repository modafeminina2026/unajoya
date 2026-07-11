<script setup lang="ts">
import { onMounted } from 'vue'

const { resetCart } = useCart()

definePageMeta({
  title: 'UNA JOYA - Pedido Confirmado!'
})

onMounted(() => {
  // Limpar a sacola do cliente após a confirmação da compra
  resetCart()
})
</script>

<template>
  <div class="bg-[#fcf8f8] font-body-md text-on-surface min-h-screen flex flex-col justify-between">
    <!-- Header Simplificado -->
    <CheckoutHeader />

    <main class="flex-grow pt-32 lg:pt-40 flex items-center justify-center px-margin-mobile">
      <div class="max-w-md w-full bg-white border border-soft-stone p-8 lg:p-12 text-center shadow-md rounded-sm space-y-8 fade-in">
        <!-- Ícone Elegante de Sucesso -->
        <div class="w-20 h-20 bg-champagne-gold/10 text-champagne-gold rounded-full flex items-center justify-center mx-auto border border-champagne-gold/20">
          <span class="material-symbols-outlined text-4xl text-primary" style="font-variation-settings: 'FILL' 1;">check_circle</span>
        </div>

        <div class="space-y-4">
          <h2 class="font-display-lg text-2xl lg:text-3xl text-primary italic">Pagamento Confirmado!</h2>
          <p class="text-secondary font-body-md text-sm leading-relaxed">
            Agradecemos por escolher a **Una Joya**. Seu pagamento foi processado com sucesso pelo Stripe. Em breve, enviaremos as informações do envio e rastreio para o seu e-mail.
          </p>
        </div>

        <div class="border-t border-soft-stone pt-6">
          <p class="text-xs text-on-surface-variant font-label-caps tracking-wider uppercase mb-2">Método de pagamento</p>
          <p class="text-xs text-secondary font-semibold font-label-caps uppercase bg-soft-stone/30 py-2 rounded">Pix / Cartão (Stripe)</p>
        </div>

        <div class="pt-4">
          <NuxtLink 
            to="/" 
            class="inline-block w-full bg-primary text-white py-4 font-label-caps text-xs tracking-widest uppercase hover:bg-deep-onyx active:scale-[0.98] transition-all font-bold"
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
