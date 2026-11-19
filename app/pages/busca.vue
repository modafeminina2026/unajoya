<script setup lang="ts">
import { onMounted } from 'vue'
import ProductGrid from '~/components/ProductGrid.vue'

const route = useRoute()
const router = useRouter()
const { products, loading, loaded, load } = useStoreProducts()

useHead({ title: 'UNA JOYA | Todas as peças' })

const initialQuery = typeof route.query.q === 'string' ? route.query.q : ''
// Mantém a busca na URL (dá para compartilhar o link e voltar sem perder o filtro)
const onQuery = (q: string) => {
  void router.replace({ query: q.trim() ? { q: q.trim() } : {} })
}

onMounted(() => { void load() })
</script>

<template>
  <div class="bg-soft-stone min-h-screen">
    <AppHeader />
    <AppDrawer />

    <main class="pt-16 lg:pt-[116px] xl:pt-[126px] 3xl:pt-[134px] pb-safe-nav md:pb-0 bg-surface relative min-h-screen flex flex-col justify-between">
      <div class="flex-grow py-12 lg:py-20 px-margin-mobile md:px-8 lg:px-margin-desktop xl:px-margin-desktop-xl 3xl:px-[160px]">
        <div class="mb-10 lg:mb-14 flex flex-col items-center">
          <h1 class="font-display-lg text-headline-lg-mobile lg:text-[40px] xl:text-[48px] text-primary tracking-[0.2em] mb-2 uppercase text-center">Todas as peças</h1>
          <div class="w-12 lg:w-16 h-[2px] bg-primary"></div>
        </div>
        <ProductGrid :products="products" :loading="loading || !loaded" :initial-query="initialQuery" :autofocus="!initialQuery" @query-change="onQuery" />
      </div>
      <AppFooter />
    </main>

    <BottomNavigation />
  </div>
</template>
