<script setup lang="ts">
interface Collection {
  name: string
  image: string
  link: string
  alt: string
}

const collections: Collection[] = [
  {
    name: 'PEDRARIAS',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOhn5yadqgjU36oeIWkzqDIu72yoHbq9MN5vRfIlb6859fRfcC62g1dWPknrX0KV76j7PlnMb9U0HZ3-CR59N6Xr0AzHK6EEjYyHzJfYZHniTXhw--36xU32_vZyXNoTirn8eVaaZgLHoJ1gCu9qbJvWvh7Rw7X5ibJLiND5al2UXZH_6sEnzBX0WiUJv2NXhqmNYZ53MABQQ2sf1niQgbiK4LBcLBr2czJkn8ppTO8xy-U_131WVr2Hf1wuC53qVbjKpXCtGsR79l',
    link: '/categoria/colares', // Default to colares since these are colares
    alt: 'Colares delicados feitos com quartzo branco bruto e moonstone arranjados de forma minimalista'
  },
  {
    name: 'CORRENTES',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-9m4aGr6v7EbQrlde3X6YKPxVqEwMqZ6tsH2QnqSklMa7YGMkk2d35KJqsLinz3B3UcukZLnOa7hAhuNb0V9jqMltN5tIboIdrNBYRIi8alicc0iM-aj4fQJvpkWH5GWf2VYw0jGUvYTxhQPuxGN_RO-D95eK6rLZIZjkbSbLPCSZ6aqlByVQMQlK1bfgCTeEx84yPFs-gCP9abvudVeLTfNc3wGPiPgvrUs4487v8E0SVuQeWLexznrxiHWZPamiuQ4uzcQL4Aye',
    link: '/categoria/colares',
    alt: 'Colares de corrente banhados a ouro com elos artesanais exclusivos e sombras elegantes'
  },
  {
    name: 'LONGOS',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBe5VuAix8v42HnsAM_1CF3sttjXYjbTAo-x5u-We9Lojp5F6Oo5-1SBKwO1SL3yb_-kynQgYc2twHdEDAvB-oixzokYSdd5ZyHcVWzPRh0oPlXJcc_lY8KBQOWLk4loifmm_2IfjRLwhqrhZ6BJhLXT__2u-CkhS2ndVY6I2kLNIElEtGIYKbLIOKaKtf8E6kRNnTSJMZfBQxM68Cv8mBhVgUD_7qzcWoqm_-L956GwREZJLzao5q-Xkk537sEaeYhOcIKAaylGqzI',
    link: '/categoria/colares',
    alt: 'Colares longos em camadas com turquesa azul e acentos de pedras neutras penduradas no tecido creme'
  },
  {
    name: 'MAXIS',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-w4cZx0G30bEKrxuaLeUxsqLIECri2-nw8FjMieu1nJZaiUxovaZe8R6chduBx2JU0DJMCVSXWw1niNVT7BVSjQHnQLSBwG0ubLP_eOABQ0ffWb8mWxyXb21VU-N4I9VyAG6ppo9qJNd_jbANktX3D2hJgxu0TjBwk0sna6H4uAMCcvR3F9lfStNDFSNyHNKyVLJJUSy3pPZ_xw_h6NVylphr8pHGxf5Jk78I0chvyXBcGfaPf7Dh9FYY7bDjnHlADeMPVJOuvY32',
    link: '/categoria/colares',
    alt: 'Colares de destaque maxis feitos de pedras cinza brutas e obsidian'
  }
]
</script>

<template>
  <section class="py-16 lg:py-24 3xl:py-32 bg-surface">
    <div class="px-margin-mobile lg:px-margin-desktop xl:px-margin-desktop-xl 3xl:px-[160px] mb-8 lg:mb-12 3xl:mb-16 flex flex-col items-center">
      <h2 class="font-display-lg text-headline-lg-mobile lg:text-[40px] xl:text-[48px] 3xl:text-[60px] text-primary tracking-[0.2em] mb-2 uppercase">COLEÇÕES</h2>
      <div class="w-12 lg:w-16 h-[2px] bg-primary"></div>
    </div>
    
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-[1px] bg-soft-stone">
      <NuxtLink 
        v-for="collection in collections" 
        :key="collection.name"
        :to="collection.link"
        class="relative aspect-square lg:aspect-[3/4] group overflow-hidden bg-surface block"
      >
        <div 
          class="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
          :style="{ backgroundImage: `url('${collection.image}')` }"
          role="img"
          :aria-label="collection.alt"
        ></div>
        <!-- overlay for readability -->
        <div class="absolute inset-0 bg-black/10 transition-opacity duration-300 group-hover:bg-black/25"></div>
        <div class="absolute inset-0 flex items-end justify-center pb-6 lg:pb-8 3xl:pb-12">
          <span class="font-label-caps text-[14px] lg:text-[13px] xl:text-[14px] 3xl:text-[16px] text-pure-white tracking-[0.3em] font-bold transition-all duration-300 group-hover:tracking-[0.35em]">
            {{ collection.name }}
          </span>
        </div>
      </NuxtLink>
    </div>
  </section>
</template>

