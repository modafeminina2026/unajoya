<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

interface Product {
  id: number
  name: string
  price: number
  image: string
  images: string[]
  category: { name: string; slug: string } | null
}

interface CategoryData {
  id: number
  name: string
  slug: string
}

const route = useRoute()
const { client } = useSupabase()

const category = ref<CategoryData | null>(null)
const products = ref<Product[]>([])
const loading = ref(true)
const notFound = ref(false)

const currentSlug = computed(() => (route.params.slug as string)?.trim()?.toLowerCase() || '')

const categoryTitle = computed(() => {
  if (currentSlug.value === 'novidades') return 'Novidades'
  if (currentSlug.value === 'sale') return 'Sale / Ofertas'
  return category.value ? category.value.name : 'Categoria'
})

// Configurar o SEO da página dinamicamente
useHead({
  title: computed(() => `UNA JOYA | ${categoryTitle.value}`),
  meta: [
    { name: 'description', content: computed(() => `Confira nossa curadoria exclusiva de ${categoryTitle.value} na UNA JOYA. Peças artesanais com design único e pedras naturais.`) }
  ]
})

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

const loadCategoryAndProducts = async () => {
  loading.value = true
  notFound.value = false
  products.value = []
  category.value = null

  try {
    const slugVal = currentSlug.value

    if (!slugVal) {
      notFound.value = true
      return
    }

    // 1. Determinar Categoria
    if (slugVal !== 'novidades' && slugVal !== 'sale') {
      const { data: catData, error: catError } = await client
        .from('categories')
        .select('*')
        .eq('slug', slugVal)
        .eq('active', true)
        .maybeSingle()

      if (catError) throw catError
      if (!catData) {
        notFound.value = true
        return
      }
      category.value = catData
    }

    // 2. Determinar query de produtos
    let query = client.from('products').select('*, categories(name, slug)')

    if (slugVal === 'novidades') {
      query = query.order('created_at', { ascending: false })
    } else if (slugVal === 'sale') {
      query = query.eq('promo', true).order('id', { ascending: true })
    } else if (category.value) {
      query = query.eq('category_id', category.value.id).order('id', { ascending: true })
    }

    const { data: prodData, error: prodError } = await query

    if (prodError) throw prodError

    // 3. Filtrar expirados e mapear
    products.value = (prodData || [])
      .filter((p: { created_at: string; duration?: number }) => {
        const createdAt = new Date(p.created_at)
        const durationDays = Number(p.duration || 15)
        const diffTime = (createdAt.getTime() + durationDays * 24 * 60 * 60 * 1000) - Date.now()
        return diffTime > 0
      })
      .map((p: { id: number; name: string; price: number; images?: string | string[]; image?: string; categories?: { name: string; slug: string } }) => {
        const price = Number(p.price) || 0

        let imgList: string[] = []
        if (Array.isArray(p.images) && p.images.length > 0) {
          imgList = p.images.map(img => String(img)).filter(Boolean)
        } else if (p.images && typeof p.images === 'string') {
          try {
            const parsed = JSON.parse(p.images)
            if (Array.isArray(parsed)) imgList = parsed.filter(Boolean)
          } catch {
            imgList = [p.images]
          }
        }
        if (imgList.length === 0 && p.image) {
          imgList = [p.image]
        }

        return {
          id: p.id,
          name: p.name,
          price,
          image: imgList[0] || p.image || '',
          images: imgList,
          category: p.categories ? { name: p.categories.name, slug: p.categories.slug } : null
        }
      })
  } catch (err) {
    console.error('Erro ao carregar categoria e produtos:', err)
    notFound.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCategoryAndProducts()
})

// Monitorar alterações no slug da rota para recarregar quando o usuário troca de categoria
watch(() => route.params.slug, () => {
  loadCategoryAndProducts()
})
</script>

<template>
  <div class="bg-soft-stone min-h-screen">
    <!-- Shell do Header e Menu lateral -->
    <AppHeader />
    <AppDrawer />

    <!-- Main Container -->
    <main class="pt-16 lg:pt-[116px] xl:pt-[126px] 3xl:pt-[134px] pb-14 md:pb-0 lg:pb-0 max-w-[780px] lg:max-w-none mx-auto bg-surface shadow-xl relative min-h-screen flex flex-col justify-between">
      
      <!-- Content Area -->
      <div class="flex-grow py-16 lg:py-24 3xl:py-32 px-margin-mobile lg:px-margin-desktop xl:px-margin-desktop-xl 3xl:px-[160px]">
        
        <!-- Loading State -->
        <div v-if="loading" class="space-y-12">
          <div class="animate-pulse flex flex-col items-center mb-16">
            <div class="h-10 bg-soft-stone w-64 mb-4 rounded"></div>
            <div class="w-12 h-[2px] bg-soft-stone"></div>
          </div>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-x-4 lg:gap-x-6 xl:gap-x-8 gap-y-8 lg:gap-y-12">
            <div v-for="i in 4" :key="i" class="animate-pulse flex flex-col">
              <div class="aspect-[3/4] mb-4 bg-soft-stone rounded-sm"></div>
              <div class="h-4 bg-soft-stone w-3/4 mb-3 rounded"></div>
              <div class="h-4 bg-soft-stone w-1/4 mb-2 rounded"></div>
              <div class="h-3 bg-soft-stone w-1/2 mb-5 rounded"></div>
              <div class="h-12 bg-soft-stone w-full rounded-sm"></div>
            </div>
          </div>
        </div>

        <!-- 404 / Não encontrado -->
        <div v-else-if="notFound" class="text-center py-20 space-y-6 max-w-md mx-auto">
          <span class="material-symbols-outlined text-6xl text-secondary/40">explore_off</span>
          <h2 class="font-display-lg text-2xl lg:text-3xl text-primary italic">Categoria não encontrada</h2>
          <p class="text-secondary text-sm leading-relaxed">
            A categoria que você tentou acessar não existe ou não está ativa no momento.
          </p>
          <NuxtLink 
            to="/" 
            class="inline-block bg-primary text-pure-white px-8 py-3 font-label-caps text-xs tracking-widest uppercase hover:bg-deep-onyx transition-all font-bold"
          >
            Voltar para a Home
          </NuxtLink>
        </div>

        <!-- Lista de Produtos da Categoria -->
        <div v-else>
          <!-- Cabeçalho da Categoria -->
          <div class="mb-12 lg:mb-16 3xl:mb-20 flex flex-col items-center">
            <h2 class="font-display-lg text-headline-lg-mobile lg:text-[40px] xl:text-[48px] 3xl:text-[60px] text-primary tracking-[0.2em] mb-2 uppercase text-center">
              {{ categoryTitle }}
            </h2>
            <div class="w-12 lg:w-16 h-[2px] bg-primary"></div>
          </div>

          <!-- Sem produtos -->
          <div v-if="products.length === 0" class="text-center py-20 bg-surface-container-low border border-soft-stone rounded-sm p-8 max-w-lg mx-auto">
            <span class="material-symbols-outlined text-5xl text-secondary/40 mb-4">diamond</span>
            <p class="font-headline-md text-primary text-lg mb-2">Vitrine Vazia</p>
            <p class="text-secondary text-sm leading-relaxed mb-6">
              Nenhuma joia exclusiva de {{ categoryTitle }} está disponível no momento. Nossas peças são artesanais e de tiragem limitada.
            </p>
            <NuxtLink 
              to="/" 
              class="inline-block bg-primary text-pure-white px-8 py-3 font-label-caps text-xs tracking-widest uppercase hover:bg-deep-onyx transition-all font-bold"
            >
              Ver Outras Peças
            </NuxtLink>
          </div>

          <!-- Grid de Produtos -->
          <div v-else class="grid grid-cols-2 lg:grid-cols-4 gap-x-4 lg:gap-x-6 xl:gap-x-8 3xl:gap-x-10 gap-y-8 lg:gap-y-12">
            <div 
              v-for="product in products" 
              :key="product.id"
              class="flex flex-col group"
            >
              <!-- Imagem -->
              <div class="aspect-[3/4] mb-4 overflow-hidden bg-pure-white shadow-sm relative">
                <!-- Imagem Principal -->
                <img 
                  :alt="product.name" 
                  class="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" 
                  :class="product.images.length > 1 ? 'group-hover:opacity-0' : ''"
                  :src="product.images[0] || product.image"
                  loading="lazy"
                >

                <!-- Segunda Imagem (Efeito Hover) -->
                <img 
                  v-if="product.images.length > 1"
                  :alt="`${product.name} - Vista 2`" 
                  class="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" 
                  :src="product.images[1]"
                  loading="lazy"
                >

                <!-- Badge de Múltiplas Fotos -->
                <div v-if="product.images.length > 1" class="absolute bottom-2 right-2 bg-primary/80 text-white font-label-caps text-[9px] px-2 py-0.5 tracking-wider rounded-xs backdrop-blur-xs opacity-90 group-hover:opacity-100 transition-opacity">
                  +{{ product.images.length - 1 }}
                </div>

                <div class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
              
              <!-- Categoria Badge -->
              <span 
                v-if="product.category"
                class="text-[10px] font-label-caps tracking-[0.15em] text-champagne-gold mb-1 inline-block"
              >
                {{ product.category.name }}
              </span>

              <!-- Título -->
              <h4 class="font-body-md text-[13px] lg:text-[14px] 3xl:text-[16px] text-primary mb-2 line-clamp-2 min-h-[40px] leading-snug group-hover:text-champagne-gold transition-colors duration-300">
                {{ product.name }}
              </h4>
              
              <!-- Preço -->
              <div class="mb-4">
                <p class="font-bold text-primary lg:text-[17px] 3xl:text-[20px]">
                  {{ product.price > 0 ? formatCurrency(product.price) : '—' }}
                </p>
              </div>
              
              <!-- Disabled Buy Button -->
              <button 
                disabled
                aria-disabled="true"
                class="w-full py-3 lg:py-4 3xl:py-5 bg-soft-stone font-label-caps text-[10px] lg:text-[11px] 3xl:text-[13px] text-secondary cursor-not-allowed tracking-widest uppercase block text-center opacity-70 font-bold"
              >
                COMPRAS PAUSADAS
              </button>
            </div>
          </div>
        </div>

      </div>

      <!-- Rodapé -->
      <AppFooter />
    </main>

    <!-- Menu inferior no Mobile -->
    <BottomNavigation />
  </div>
</template>
