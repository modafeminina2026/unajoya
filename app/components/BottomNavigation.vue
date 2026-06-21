<template>
  <nav class="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-14 bg-surface border-t border-soft-stone shadow-lg md:hidden">
    <a 
      class="text-primary flex flex-col items-center p-2 active:scale-90 transition-transform" 
      href="#"
      aria-label="Início"
    >
      <span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1;">home</span>
    </a>
    
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
    
    <a 
      class="text-secondary hover:text-champagne-gold active:scale-90 transition-all flex flex-col items-center p-2" 
      href="#"
      aria-label="Carrinho de Compras"
    >
      <span class="material-symbols-outlined text-2xl">shopping_cart</span>
    </a>
  </nav>
</template>
