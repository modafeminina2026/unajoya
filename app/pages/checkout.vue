<script setup lang="ts">
const { isCartEmpty, resetCart } = useCart()

definePageMeta({
  title: 'UNA JOYA - Checkout'
})
</script>

<template>
  <div class="bg-[#fcf8f8] min-h-screen pb-24">
    <!-- Header -->
    <CheckoutHeader />

    <!-- Main Content Container -->
    <main class="pt-32 pb-24 px-margin-mobile max-w-[600px] mx-auto space-y-4">
      
      <div v-if="!isCartEmpty" class="space-y-4">
        <!-- Offer Countdown -->
        <OfferCountdown />

        <!-- Cart Title Card -->
        <div class="bg-white rounded-lg border border-soft-stone p-6 flex justify-between items-center card-shadow">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-primary text-2xl">shopping_cart</span>
            <span class="font-headline-md text-headline-md font-medium">Carrinho</span>
          </div>
          <span class="text-on-surface-variant font-body-md">1 Produto</span>
        </div>

        <!-- Product Item Card -->
        <CartItemCard />

        <!-- Summary -->
        <CheckoutSummary />
      </div>

      <!-- Empty Cart State -->
      <div v-else class="bg-white rounded-lg border border-soft-stone p-12 text-center card-shadow space-y-6 flex flex-col items-center animate-fade-in">
        <span class="material-symbols-outlined text-secondary-fixed-dim text-6xl">remove_shopping_cart</span>
        <h2 class="font-headline-md text-2xl text-primary font-medium">Seu carrinho está vazio</h2>
        <p class="text-secondary text-body-md max-w-sm">
          Que tal dar uma olhada nas nossas coleções de joias artesanais e escolher algo especial?
        </p>
        <div class="flex gap-4">
          <button 
            class="px-6 py-3 bg-soft-stone text-primary font-label-caps text-xs tracking-widest uppercase hover:bg-secondary-container transition-colors font-bold"
            @click="resetCart"
          >
            Restaurar
          </button>
          <NuxtLink 
            to="/" 
            class="px-8 py-3 bg-primary text-white font-label-caps text-xs tracking-widest uppercase hover:bg-deep-onyx transition-all active:scale-95 font-bold flex items-center justify-center"
          >
            Ver Coleção
          </NuxtLink>
        </div>
      </div>

    </main>
  </div>
</template>

<style scoped>
.card-shadow {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.5s ease-out forwards;
}
</style>
