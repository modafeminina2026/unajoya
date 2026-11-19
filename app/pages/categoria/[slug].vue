<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import ProductGrid from '~/components/ProductGrid.vue'
import type { SortKey } from '~/utils/catalog'

interface CategoryData {
  id: number
  name: string
  slug: string
}

const route = useRoute()
const { client } = useSupabase()
const { products, loading: loadingProducts, loaded, load } = useStoreProducts()

const category = ref<CategoryData | null>(null)
const loadingCategory = ref(true)
const notFound = ref(false)

const currentSlug = computed(() => (route.params.slug as string)?.trim()?.toLowerCase() || '')

const categoryTitle = computed(() => {
  if (currentSlug.value === 'novidades') return 'Novidades'
  if (currentSlug.value === 'sale') return 'Sale / Ofertas'
  return category.value ? category.value.name : 'Categoria'
})

useHead({
  title: computed(() => `UNA JOYA | ${categoryTitle.value}`),
  meta: [
    { name: 'description', content: computed(() => `Confira nossa curadoria exclusiva de ${categoryTitle.value} na UNA JOYA. Peças artesanais com design único e pedras naturais.`) }
  ]
})

const loadCategory = async () => {
  loadingCategory.value = true
  notFound.value = false
  category.value = null
  try {
    const slug = currentSlug.value
    if (!slug) { notFound.value = true; return }
    if (slug === 'novidades' || slug === 'sale') return
    const { data, error } = await client.from('categories').select('id, name, slug').eq('slug', slug).eq('active', true).maybeSingle()
    if (error) throw error
    if (!data) notFound.value = true
    else category.value = data
  } catch (err) {
    console.error('Erro ao carregar categoria:', err)
    notFound.value = true
  } finally {
    loadingCategory.value = false
  }
}

const categoryProducts = computed(() => {
  const slug = currentSlug.value
  if (slug === 'novidades') return products.value
  if (slug === 'sale') return products.value.filter(p => p.promo)
  return products.value.filter(p => p.category?.slug === slug)
})
const initialSort = computed<SortKey>(() => (currentSlug.value === 'novidades' ? 'newest' : 'featured'))
const loading = computed(() => loadingCategory.value || loadingProducts.value || !loaded.value)

onMounted(() => {
  void load()
  void loadCategory()
})
watch(() => route.params.slug, () => { void loadCategory() })
</script>

<template>
  <div class="bg-soft-stone min-h-screen">
    <AppHeader />
    <AppDrawer />

    <main class="pt-16 lg:pt-[116px] xl:pt-[126px] 3xl:pt-[134px] pb-safe-nav md:pb-0 bg-surface relative min-h-screen flex flex-col justify-between">
      <div class="flex-grow py-12 lg:py-20 3xl:py-28 px-margin-mobile md:px-8 lg:px-margin-desktop xl:px-margin-desktop-xl 3xl:px-[160px]">
        <div v-if="notFound && !loadingCategory" class="text-center py-20 space-y-6 max-w-md mx-auto">
          <span class="material-symbols-outlined text-6xl text-secondary/40">explore_off</span>
          <h2 class="font-display-lg text-2xl lg:text-3xl text-primary italic">Categoria não encontrada</h2>
          <p class="text-secondary text-sm leading-relaxed">A categoria que você tentou acessar não existe ou não está ativa no momento.</p>
          <NuxtLink to="/busca" class="inline-flex items-center min-h-[44px] bg-primary text-pure-white px-8 font-label-caps text-xs tracking-widest uppercase hover:bg-deep-onyx transition-all font-bold">
            Ver todas as peças
          </NuxtLink>
        </div>

        <template v-else>
          <div class="mb-10 lg:mb-14 flex flex-col items-center">
            <h1 class="font-display-lg text-headline-lg-mobile lg:text-[40px] xl:text-[48px] 3xl:text-[60px] text-primary tracking-[0.2em] mb-2 uppercase text-center">
              {{ loadingCategory ? ' ' : categoryTitle }}
            </h1>
            <div class="w-12 lg:w-16 h-[2px] bg-primary"></div>
          </div>

          <div v-if="!loading && categoryProducts.length === 0" class="text-center py-16 bg-surface-container-low border border-soft-stone p-8 max-w-lg mx-auto">
            <span class="material-symbols-outlined text-5xl text-secondary/40 mb-4">diamond</span>
            <p class="font-headline-md text-primary text-lg mb-2">Vitrine vazia</p>
            <p class="text-secondary text-sm leading-relaxed mb-6">
              Nenhuma peça de {{ categoryTitle }} está disponível agora. Nossas joias são artesanais e de tiragem limitada.
            </p>
            <NuxtLink to="/busca" class="inline-flex items-center min-h-[44px] bg-primary text-pure-white px-8 font-label-caps text-xs tracking-widest uppercase hover:bg-deep-onyx transition-all font-bold">
              Ver outras peças
            </NuxtLink>
          </div>

          <ProductGrid v-else :key="currentSlug" :products="categoryProducts" :loading="loading" :initial-sort="initialSort" />
        </template>
      </div>

      <AppFooter />
    </main>

    <BottomNavigation />
  </div>
</template>
