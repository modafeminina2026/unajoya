<template>
  <section class="py-16 lg:py-0 bg-surface-container border-b border-soft-stone overflow-hidden">
    <!-- Mobile layout: stacked -->
    <div class="lg:hidden">
      <div class="w-full aspect-[4/5] overflow-hidden shadow-sm">
        <img 
          alt="Fundadoras da Una Joya - Cristina e Danielle" 
          class="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700 ease-in-out hover:scale-105" 
          src="/about_us.png"
          loading="lazy"
        >
      </div>
      <div class="px-margin-mobile py-12">
        <div class="mb-8">
          <h2 class="font-label-caps text-label-caps text-primary tracking-[0.4em] mb-4 font-bold">SOBRE NÓS</h2>
          <h3 class="font-display-lg text-headline-lg-mobile text-primary leading-tight mb-6">
            Uma jornada de afeto lapidada pelo tempo.
          </h3>
          <p class="font-body-md text-on-surface-variant leading-relaxed mb-10 text-secondary">
            A Una Joya nasceu do meu desejo profundo de traduzir mais de uma década de experiência no ramo da joalheria em algo que tivesse a minha própria alma. Depois de mais de 10 anos dedicados aos bastidores e ao mercado das joias, decidi que era hora de dar forma ao meu próprio sonho.
            <br><br>
            Unindo o conhecimento técnico que acumulei ao longo dessa trajetória ao amor por transformar metais e pedras naturais em poesia, criei este espaço. Aqui, cada peça é feita à mão, com calma, afeto e intenção — como um pequeno tesouro esculpido para acompanhar os seus dias. Escolha a joia que vai ressignificar o seu momento.
          </p>
          <a 
            href="#" 
            class="inline-block bg-primary px-12 py-4 font-label-caps text-label-caps text-pure-white transition-all duration-300 hover:bg-deep-onyx active:scale-95 shadow-md"
          >
            CONFERIR
          </a>
        </div>
      </div>
    </div>

    <!-- Desktop layout: side-by-side -->
    <div class="hidden lg:flex min-h-[600px] xl:min-h-[700px] 2xl:min-h-[800px] 3xl:min-h-[900px]">
      <!-- Image: left half -->
      <div class="w-1/2 xl:w-[45%] overflow-hidden flex-shrink-0">
        <img 
          alt="Fundadoras da Una Joya - Cristina e Danielle" 
          class="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700 ease-in-out hover:scale-105" 
          src="/about_us.png"
          loading="lazy"
        >
      </div>
      <!-- Text: right half -->
      <div class="flex-1 flex items-center px-margin-desktop xl:px-margin-desktop-xl 3xl:px-[120px] py-16">
        <div class="max-w-xl xl:max-w-2xl 3xl:max-w-3xl">
          <h2 class="font-label-caps text-label-caps xl:text-[13px] 3xl:text-[15px] text-primary tracking-[0.4em] mb-6 font-bold">SOBRE NÓS</h2>
          <h3 class="font-display-lg text-[36px] xl:text-[44px] 2xl:text-[52px] 3xl:text-[64px] text-primary leading-tight mb-8">
            Uma jornada de afeto lapidada pelo tempo.
          </h3>
          <p class="font-body-md text-[15px] xl:text-[16px] 3xl:text-[18px] text-on-surface-variant leading-relaxed mb-12 text-secondary">
            A Una Joya nasceu do meu desejo profundo de traduzir mais de uma década de experiência no ramo da joalheria em algo que tivesse a minha própria alma. Depois de mais de 10 anos dedicados aos bastidores e ao mercado das joias, decidi que era hora de dar forma ao meu próprio sonho.
            <br><br>
            Unindo o conhecimento técnico que acumulei ao longo dessa trajetória ao amor por transformar metais e pedras naturais em poesia, criei este espaço. Aqui, cada peça é feita à mão, com calma, afeto e intenção — como um pequeno tesouro esculpido para acompanhar os seus dias.
          </p>
          <a 
            href="#" 
            class="inline-block bg-primary px-12 xl:px-16 3xl:px-20 py-4 xl:py-5 3xl:py-6 font-label-caps text-label-caps xl:text-[13px] 3xl:text-[15px] text-pure-white transition-all duration-300 hover:bg-deep-onyx active:scale-95 shadow-md"
          >
            CONFERIR
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

