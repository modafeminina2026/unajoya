<script setup lang="ts">
interface Product {
  id: number
  name: string
  price: number
  installments: string
  image: string
}

const products: Product[] = [
  {
    id: 1,
    name: 'Colar keshi perolas agua doce',
    price: 488.00,
    installments: '6x de R$ 81,33',
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLvDq2-x30MCpcTRgKRQJDTaf15A_P7vGs32RxaCWnMXc88pl2utfO3Az4vWizC18Hip261_Fu4grr7GukWJ9IUXFR-eb-oDKuyhXCF3kmbxYVmB_Q_WdZg10KEVo_km_Ei5xBM5zxsxHYbfrI_UswNhEA5aaR_bCTi6NdcGfTd0gMV4BEgib36XSIcKBnkV-POlVeLeMiKMIDf2cgAk8oBTBWF-tLBYv_4jnyxsRuP4L7nlpkmyEjMNZ5M'
  },
  {
    id: 2,
    name: 'Colar Pingente Quartzo Marrom',
    price: 288.00,
    installments: '3x de R$ 96,00',
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLv32RCOxvnLt6F9GVk2xQB2SLlIZw-JJNeXrtBr-AbV3tEAsg7iBiFWAAHGQ2MgJpZjyg7UWvydCDyf6DzWZu1oi6ssAzBHor5h-AbIYfVyAHgaobl_bau3CYboabcP1ETLbyM_y_wsCC698GjwAnLa-OlFeJaeCim5QP0kbo8ebTNhvnCose7vqxvN_giMcm0wZ9pJWC5L_eiXK8Lh050yYOvUDqIdV_lqSO51l-QRvNlMLqGOgcTfON8'
  },
  {
    id: 3,
    name: 'Colar Cascalho Vermelho telha e Citrino',
    price: 298.00,
    installments: '3x de R$ 99,33',
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLtRaI7-XCwcPIFOIJEEydB2nrJkln0BCRn-q57Ofm5kct-vuvbHu_L72mERuHcBb6cHXU2r2gy5sDyokKdOWHVzm8tBsaojmLECOCSPy3q5fmSNgE6FErZVBdDxJnIDSIbYPq7se9EcrbAAS2-NzdJd8giSUBZyivsih_3452Fprmq75gsiurV_QQgW1YZ7TDI7ul4-uTcxwyeAeoSClwI1SqrcEjqvnPYBc_U2-ayYQ-MlmDheh42nMsOt'
  },
  {
    id: 4,
    name: 'Colar em Pedras Verde Esmeralda',
    price: 488.00,
    installments: '6x de R$ 81,33',
    image: 'https://lh3.googleusercontent.com/aida/AP1WRLtIEgtXN9RYzGNtwsCGKHwQHJlhbOoiV1_dQb5HTX1QdYGZVmjQLMfYvK0IlV-yus2Wu2XshtQP8x5QsLkJgDk6S3oMLPi-uZG5vYa2IQ4Fzf0bI2KgTEux91qery7Br4UBnWmn0Nz6WU4FrdgM2Aod2LjsXQZAUelCitUsAugNua5IjtJtS2kSL3dvKyD73C-NdunIryj_9xY8SYfrzGJdB0Jg6yc-dMgH8q3h1dHpsJrmuT7y6r0aAzTq'
  }
]

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}
</script>

<template>
  <section class="py-16 px-margin-mobile bg-surface-container-low border-b border-soft-stone">
    <div class="mb-12 flex flex-col items-center">
      <h2 class="font-display-lg text-headline-lg-mobile text-primary tracking-[0.2em] mb-2 uppercase">MAIS VENDIDOS</h2>
      <div class="w-12 h-[2px] bg-primary"></div>
    </div>
    
    <div class="grid grid-cols-2 gap-x-4 gap-y-8">
      <div 
        v-for="product in products" 
        :key="product.id"
        class="flex flex-col group"
      >
        <!-- Product Image Container -->
        <div class="aspect-[3/4] mb-4 overflow-hidden bg-pure-white shadow-sm relative">
          <img 
            :alt="product.name" 
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            :src="product.image"
            loading="lazy"
          >
          <div class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        </div>
        
        <!-- Product Title -->
        <h4 class="font-body-md text-[13px] text-primary mb-2 line-clamp-2 min-h-[40px] leading-snug group-hover:text-champagne-gold transition-colors duration-300">
          {{ product.name }}
        </h4>
        
        <!-- Product Price -->
        <p class="font-bold text-primary mb-1">
          {{ formatCurrency(product.price) }}
        </p>
        
        <!-- Installments -->
        <p class="text-[10px] text-secondary tracking-widest uppercase mb-4 font-semibold">
          {{ product.installments }}
        </p>
        
        <!-- Buy Button -->
        <NuxtLink 
          to="/checkout" 
          class="w-full py-3 bg-soft-stone font-label-caps text-[10px] text-primary hover:bg-primary hover:text-pure-white transition-colors duration-300 tracking-widest uppercase active:scale-95 block text-center"
        >
          COMPRAR
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
