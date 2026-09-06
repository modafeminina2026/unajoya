<script setup lang="ts">
definePageMeta({
  title: 'UNA JOYA - Status do Pagamento'
})

useHead({
  meta: [
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})
</script>

<template>
  <div class="bg-[#fcf8f8] font-body-md text-on-surface min-h-screen flex flex-col justify-between">
    <!-- Header Simplificado -->
    <CheckoutHeader />

    <main class="flex-grow pt-32 lg:pt-40 flex items-center justify-center px-margin-mobile">
      <div class="max-w-lg w-full space-y-6 fade-in">
        
        <!-- Card Principal Neutro -->
        <div class="bg-white border border-soft-stone p-8 lg:p-10 text-center shadow-md rounded-sm space-y-6">
          <div class="w-20 h-20 bg-champagne-gold/10 text-champagne-gold rounded-full flex items-center justify-center mx-auto border border-champagne-gold/20">
            <span class="material-symbols-outlined text-4xl text-primary">hourglass_top</span>
          </div>

          <div class="space-y-3">
            <h2 class="font-display-lg text-2xl lg:text-3xl text-primary italic">Verificação de Pagamento</h2>
            <p class="text-secondary font-body-md text-sm leading-relaxed">
              Estamos verificando as informações do pagamento. Esta tela não confirma a aprovação da transação. Caso você tenha concluído um pagamento, entre em contato pelos canais oficiais da Una Joya.
            </p>
          </div>
        </div>

        <!-- Botão de Retorno -->
        <div>
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
