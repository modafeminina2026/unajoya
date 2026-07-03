<script setup lang="ts">
const { isCartEmpty, resetCart, totalItemsCount } = useCart()

definePageMeta({
  title: 'UNA JOYA - Checkout'
})
</script>

<template>
  <div class="bg-[#fcf8f8] min-h-screen pb-24">
    <!-- Header -->
    <CheckoutHeader />

    <!-- Main Content Container: mobile = single col, desktop = 2 cols -->
    <main class="pt-32 lg:pt-40 xl:pt-44 3xl:pt-52 pb-24 px-margin-mobile lg:px-margin-desktop xl:px-margin-desktop-xl 3xl:px-[160px] max-w-[600px] lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl 3xl:max-w-none mx-auto">
      
      <div v-if="!isCartEmpty">
        <!-- Mobile: stacked layout -->
        <div class="lg:hidden space-y-4">
          <OfferCountdown />
          <div class="bg-white rounded-lg border border-soft-stone p-6 flex justify-between items-center card-shadow">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-primary text-2xl">shopping_cart</span>
              <span class="font-headline-md text-headline-md font-medium">Carrinho</span>
            </div>
            <span class="text-on-surface-variant font-body-md">{{ totalItemsCount }} {{ totalItemsCount === 1 ? 'Produto' : 'Produtos' }}</span>
          </div>
          <CartItemCard />
          <CheckoutSummary />
        </div>

        <!-- Desktop: 2-column layout -->
        <div class="hidden lg:grid grid-cols-[1fr_400px] xl:grid-cols-[1fr_440px] 2xl:grid-cols-[1fr_480px] 3xl:grid-cols-[1fr_560px] gap-8 xl:gap-12 3xl:gap-16 items-start">
          <!-- Left column: offer + cart items -->
          <div class="space-y-4 xl:space-y-6">
            <OfferCountdown />
            <!-- Cart Title Card -->
            <div class="bg-white rounded-lg border border-soft-stone p-6 xl:p-8 flex justify-between items-center card-shadow">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-primary text-2xl xl:text-3xl">shopping_cart</span>
                <span class="font-headline-md text-headline-md xl:text-[28px] 3xl:text-[32px] font-medium">Carrinho</span>
              </div>
              <span class="text-on-surface-variant font-body-md xl:text-[17px]">{{ totalItemsCount }} {{ totalItemsCount === 1 ? 'Produto' : 'Produtos' }}</span>
            </div>
            <CartItemCard />
          </div>

          <!-- Right column: order summary (sticky) -->
          <div class="sticky top-44 xl:top-52 3xl:top-60">
            <CheckoutSummary />
          </div>
        </div>
      </div>

      <!-- Empty Cart State -->
      <div v-else class="bg-white rounded-lg border border-soft-stone p-12 lg:p-20 3xl:p-28 text-center card-shadow space-y-6 flex flex-col items-center animate-fade-in">
        <span class="material-symbols-outlined text-secondary-fixed-dim text-6xl lg:text-8xl 3xl:text-9xl">remove_shopping_cart</span>
        <h2 class="font-headline-md text-2xl lg:text-3xl 3xl:text-4xl text-primary font-medium">Seu carrinho está vazio</h2>
        <p class="text-secondary text-body-md lg:text-[17px] 3xl:text-[20px] max-w-sm lg:max-w-lg">
          Que tal dar uma olhada nas nossas coleções de joias artesanais e escolher algo especial?
        </p>
        <div class="flex gap-4">
          <button 
            class="px-6 py-3 lg:px-10 lg:py-4 3xl:px-14 3xl:py-5 bg-soft-stone text-primary font-label-caps text-xs tracking-widest uppercase hover:bg-secondary-container transition-colors font-bold"
            @click="resetCart"
          >
            Restaurar
          </button>
          <NuxtLink 
            to="/" 
            class="px-8 py-3 lg:px-12 lg:py-4 3xl:px-16 3xl:py-5 bg-primary text-white font-label-caps text-xs tracking-widest uppercase hover:bg-deep-onyx transition-all active:scale-95 font-bold flex items-center justify-center"
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

