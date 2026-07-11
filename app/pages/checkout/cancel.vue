<script setup lang="ts">
definePageMeta({
  title: 'UNA JOYA - Pagamento Cancelado'
})
</script>

<template>
  <div class="bg-[#fcf8f8] font-body-md text-on-surface min-h-screen flex flex-col justify-between">
    <!-- Header Simplificado -->
    <CheckoutHeader />

    <main class="flex-grow pt-32 lg:pt-40 flex items-center justify-center px-margin-mobile">
      <div class="max-w-md w-full bg-white border border-soft-stone p-8 lg:p-12 text-center shadow-md rounded-sm space-y-8 fade-in">
        <!-- Ícone Elegante de Alerta -->
        <div class="w-20 h-20 bg-error/10 text-error rounded-full flex items-center justify-center mx-auto border border-error/20">
          <span class="material-symbols-outlined text-4xl text-error" style="font-variation-settings: 'FILL' 1;">error</span>
        </div>

        <div class="space-y-4">
          <h2 class="font-display-lg text-2xl lg:text-3xl text-primary italic">Pagamento não concluído</h2>
          <p class="text-secondary font-body-md text-sm leading-relaxed">
            O processo de checkout foi cancelado ou o pagamento não pôde ser processado. Nenhuma cobrança foi realizada.
          </p>
        </div>

        <div class="pt-4 space-y-3">
          <NuxtLink 
            to="/checkout" 
            class="inline-block w-full bg-primary text-white py-4 font-label-caps text-xs tracking-widest uppercase hover:bg-deep-onyx active:scale-[0.98] transition-all font-bold"
          >
            Voltar para o Carrinho
          </NuxtLink>
          <NuxtLink 
            to="/" 
            class="inline-block w-full border border-soft-stone text-secondary py-4 font-label-caps text-xs tracking-widest uppercase hover:bg-soft-stone/20 active:scale-[0.98] transition-all font-bold"
          >
            Continuar Comprando
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
