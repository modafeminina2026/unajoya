<script setup lang="ts">
import { computed, onMounted } from 'vue'
import ProductGrid from './ProductGrid.vue'
import { filterAndSort } from '~/utils/catalog'

const { products, loading, loaded, load } = useStoreProducts()
onMounted(() => { void load() })

// Destaques: disponíveis primeiro, até 8 peças
const featured = computed(() => filterAndSort(products.value).slice(0, 8))
</script>

<template>
  <section class="py-16 lg:py-24 3xl:py-32 px-margin-mobile lg:px-margin-desktop xl:px-margin-desktop-xl 3xl:px-[160px] bg-surface-container-low border-b border-soft-stone">
    <div class="mb-10 lg:mb-16 3xl:mb-20 flex flex-col items-center">
      <h2 class="font-display-lg text-headline-lg-mobile lg:text-[40px] xl:text-[48px] 3xl:text-[60px] text-primary tracking-[0.2em] mb-2 uppercase">DESTAQUES</h2>
      <div class="w-12 lg:w-16 h-[2px] bg-primary"></div>
    </div>

    <ProductGrid :products="featured" :loading="loading || !loaded" :toolbar="false" :skeleton-count="4" />

    <div v-if="loaded && products.length > featured.length" class="mt-12 text-center">
      <NuxtLink to="/busca" class="inline-flex items-center justify-center min-h-[44px] px-8 border border-primary text-primary font-label-caps text-xs tracking-widest uppercase hover:bg-primary hover:text-pure-white transition-colors">
        Ver todas as peças
      </NuxtLink>
    </div>
  </section>
</template>
