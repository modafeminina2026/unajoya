<script setup lang="ts">
const { isCartEmpty, totalItemsCount } = useCart()

definePageMeta({
  title: 'UNA JOYA - Sacola de Compras'
})

useHead({
  meta: [
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})
</script>

<template>
  <div class="bg-[#fcf8f8] min-h-screen pb-24">
    <!-- Header -->
    <CheckoutHeader />

    <!-- Conteúdo Principal -->
    <main class="pt-32 lg:pt-40 xl:pt-44 pb-24 px-margin-mobile lg:px-margin-desktop xl:px-margin-desktop-xl max-w-5xl mx-auto">
      
      <!-- Aviso de Manutenção de Compras -->
      <div class="mb-8 p-6 bg-surface-container-low border border-soft-stone rounded-sm text-center space-y-2 card-shadow">
        <div class="flex items-center justify-center gap-2 text-primary font-bold text-sm font-label-caps">
          <span class="material-symbols-outlined text-lg text-champagne-gold">build_circle</span>
          <span>MANUTENÇÃO TÉCNICA PREVENTIVA</span>
        </div>
        <p class="text-secondary text-sm max-w-xl mx-auto leading-relaxed">
          Compras online temporariamente pausadas. Estamos realizando melhorias para oferecer uma experiência mais segura. Você ainda pode navegar pelas coleções da Una Joya.
        </p>
      </div>

      <div v-if="!isCartEmpty">
        <!-- Layout Mobile -->
        <div class="lg:hidden space-y-4">
          <div class="bg-white rounded-lg border border-soft-stone p-6 flex justify-between items-center card-shadow">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-primary text-2xl">shopping_cart</span>
              <span class="font-headline-md text-headline-md font-medium">Sua Sacola</span>
            </div>
            <span class="text-on-surface-variant font-body-md">{{ totalItemsCount }} {{ totalItemsCount === 1 ? 'Item' : 'Itens' }}</span>
          </div>
          <CartItemCard />
          <CheckoutSummary />
        </div>

        <!-- Layout Desktop -->
        <div class="hidden lg:grid grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] gap-8 xl:gap-12 items-start">
          <div class="space-y-4">
            <div class="bg-white rounded-lg border border-soft-stone p-6 xl:p-8 flex justify-between items-center card-shadow">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-primary text-2xl xl:text-3xl">shopping_cart</span>
                <span class="font-headline-md text-headline-md xl:text-[28px] font-medium">Sua Sacola</span>
              </div>
              <span class="text-on-surface-variant font-body-md xl:text-[17px]">{{ totalItemsCount }} {{ totalItemsCount === 1 ? 'Item' : 'Itens' }}</span>
            </div>
            <CartItemCard />
          </div>

          <!-- Coluna Direita: Resumo Informativo -->
          <div class="sticky top-44">
            <CheckoutSummary />
          </div>
        </div>
      </div>

      <!-- Estado de Carrinho Vazio -->
      <div v-else class="bg-white rounded-lg border border-soft-stone p-12 lg:p-20 text-center card-shadow space-y-6 flex flex-col items-center animate-fade-in">
        <span class="material-symbols-outlined text-secondary-fixed-dim text-6xl lg:text-8xl">remove_shopping_cart</span>
        <h2 class="font-headline-md text-2xl lg:text-3xl text-primary font-medium">Sua sacola está vazia</h2>
        <p class="text-secondary text-body-md max-w-lg leading-relaxed">
          Navegue pelas nossas coleções exclusivas de joias artesanais feitas à mão com pedras naturais.
        </p>
        <div>
          <NuxtLink 
            to="/" 
            class="px-8 py-3 lg:px-12 lg:py-4 bg-primary text-white font-label-caps text-xs tracking-widest uppercase hover:bg-deep-onyx transition-all active:scale-95 font-bold inline-block"
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
