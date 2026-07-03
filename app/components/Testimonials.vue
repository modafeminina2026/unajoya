<template>
  <section class="py-20 lg:py-28 3xl:py-40 px-margin-mobile lg:px-margin-desktop xl:px-margin-desktop-xl 3xl:px-[160px] text-center bg-surface border-b border-soft-stone">
    <div class="mb-12 lg:mb-16 3xl:mb-20 flex flex-col items-center">
      <h2 class="font-display-lg text-headline-lg-mobile lg:text-[40px] xl:text-[48px] 3xl:text-[60px] text-primary tracking-[0.2em] mb-2 uppercase">DEPOIMENTOS</h2>
      <div class="w-12 lg:w-16 h-[2px] bg-primary"></div>
    </div>
    
    <!-- Mobile: single testimonial -->
    <div class="lg:hidden max-w-md mx-auto">
      <div class="flex justify-center gap-1 mb-6 text-champagne-gold">
        <span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1;">star</span>
        <span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1;">star</span>
        <span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1;">star</span>
        <span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1;">star</span>
        <span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1;">star</span>
      </div>
      <p class="font-body-md italic text-on-surface-variant leading-relaxed mb-6 px-4 text-secondary">
        "Recebi as encomendas tudo direitinho, Amei demais ❤️✨ Estou encantada com o capricho e o carinho que vocês têm com os clientes, amei o meu brinde!!! Muito obrigada!"
      </p>
      <h5 class="font-label-caps text-label-caps text-primary font-bold tracking-widest">
        CAROL B. | SÃO PAULO, SP
      </h5>
    </div>

    <!-- Desktop: three testimonials -->
    <div class="hidden lg:grid grid-cols-3 gap-8 xl:gap-12 3xl:gap-16 max-w-6xl 3xl:max-w-none mx-auto">
      <div v-for="t in [
        { quote: 'Recebi as encomendas tudo direitinho, Amei demais ❤️✨ Estou encantada com o capricho e o carinho que vocês têm com os clientes, amei o meu brinde!!! Muito obrigada!', author: 'CAROL B. | SÃO PAULO, SP' },
        { quote: 'As joias são lindíssimas! Qualidade impecável, pedras naturais belíssimas. Chegou muito bem embalado e rápido. Super recomendo a Una Joya!', author: 'MARINA S. | RIO DE JANEIRO, RJ' },
        { quote: 'Comprei um colar de quartzo que é simplesmente deslumbrante. O atendimento foi excepcional e cada detalhe da peça é perfeito. Vou comprar muito mais!', author: 'BEATRIZ L. | CURITIBA, PR' }
      ]" :key="t.author" class="flex flex-col items-center p-8 xl:p-10 3xl:p-12 bg-surface-container-low border border-soft-stone group hover:border-champagne-gold/30 transition-colors duration-300">
        <div class="flex justify-center gap-1 mb-6 text-champagne-gold">
          <span v-for="i in 5" :key="i" class="material-symbols-outlined text-xl 3xl:text-2xl" style="font-variation-settings: 'FILL' 1;">star</span>
        </div>
        <p class="font-body-md text-[15px] xl:text-[16px] 3xl:text-[18px] italic text-secondary leading-relaxed mb-8 flex-1">
          "{{ t.quote }}"
        </p>
        <h5 class="font-label-caps text-label-caps xl:text-[12px] 3xl:text-[14px] text-primary font-bold tracking-widest">
          {{ t.author }}
        </h5>
      </div>
    </div>
  </section>
</template>

