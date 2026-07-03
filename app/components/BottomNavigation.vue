<script setup lang="ts">
const { totalItemsCount, isCartEmpty } = useCart()
</script>

<template>
  <nav class="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-14 bg-surface border-t border-soft-stone shadow-lg md:hidden">
    <NuxtLink 
      class="text-primary flex flex-col items-center p-2 active:scale-90 transition-transform" 
      to="/"
      aria-label="Início"
    >
      <span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1;">home</span>
    </NuxtLink>
    
    <a 
      class="text-secondary hover:text-champagne-gold active:scale-90 transition-all flex flex-col items-center p-2" 
      href="#"
      aria-label="Buscar"
    >
      <span class="material-symbols-outlined text-2xl">search</span>
    </a>
    
    <a 
      class="text-secondary hover:text-champagne-gold active:scale-90 transition-all flex flex-col items-center p-2" 
      href="#"
      aria-label="Minha Conta"
    >
      <span class="material-symbols-outlined text-2xl">person</span>
    </a>
    
    <NuxtLink 
      class="text-secondary hover:text-champagne-gold active:scale-90 transition-all flex flex-col items-center p-2 relative" 
      to="/checkout"
      aria-label="Carrinho de Compras"
    >
      <span class="material-symbols-outlined text-2xl">shopping_cart</span>
      <!-- Dynamic Badge -->
      <span 
        v-if="!isCartEmpty && totalItemsCount > 0" 
        class="absolute top-0.5 right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#202223] text-[9px] font-bold text-pure-white"
      >
        {{ totalItemsCount }}
      </span>
    </NuxtLink>
  </nav>
</template>
