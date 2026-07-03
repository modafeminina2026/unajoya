<template>
  <header class="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile lg:px-margin-desktop xl:px-margin-desktop-xl 3xl:px-[160px] h-24 lg:h-32 xl:h-36 3xl:h-44 bg-white border-b border-soft-stone">
    <!-- Back to Home Button -->
    <NuxtLink 
      to="/" 
      class="text-primary hover:opacity-75 transition-opacity active:scale-95 flex items-center justify-center p-2 w-10 h-10 lg:w-12 lg:h-12 3xl:w-14 3xl:h-14"
      aria-label="Voltar para a página inicial"
    >
      <span class="material-symbols-outlined text-2xl lg:text-3xl 3xl:text-4xl">arrow_back</span>
    </NuxtLink>
    
    <!-- Stacked Brand Logo -->
    <div class="flex flex-col items-center select-none">
      <h1 class="font-display-lg text-headline-lg-mobile lg:text-[36px] xl:text-[44px] 3xl:text-[56px] tracking-[0.2em] leading-none uppercase text-primary font-bold">UNA</h1>
      <h1 class="font-display-lg text-headline-lg-mobile lg:text-[36px] xl:text-[44px] 3xl:text-[56px] tracking-[0.2em] leading-none uppercase text-primary -mt-1 font-bold">JOYA</h1>
    </div>
    
    <!-- Info trigger -->
    <button 
      class="text-primary hover:opacity-75 transition-opacity active:scale-95 flex items-center justify-center p-2 w-10 h-10 lg:w-12 lg:h-12 3xl:w-14 3xl:h-14"
      aria-label="Informações de segurança"
    >
      <span class="material-symbols-outlined text-primary text-2xl lg:text-3xl 3xl:text-4xl">info</span>
    </button>
  </header>
</template>

