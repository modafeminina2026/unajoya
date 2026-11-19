<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import ProductGrid from '~/components/ProductGrid.vue'
import { productIdFromParam, productPath, responsiveImage, stockState, filterAndSort } from '~/utils/catalog'
import { formatBRL } from '~/utils/whatsapp'

const route = useRoute()
const router = useRouter()
const { products, loaded, loading, load } = useStoreProducts()
const { addToCart } = useCart()
const { sendProductToWhatsApp } = useWhatsAppCheckout()
const { open: openImageModal } = useImageModal()

const id = computed(() => productIdFromParam(route.params.id as string))
const product = computed(() => products.value.find(p => p.id === id.value) ?? null)
const notFound = computed(() => loaded.value && !product.value)
const state = computed(() => (product.value ? stockState(product.value) : 'available'))
const images = computed(() => (product.value ? (product.value.images.length ? product.value.images : [product.value.image]) : []))
const active = ref(0)
watch(id, () => { active.value = 0 })

// Corrige a URL para o formato com o nome da peça (ex.: /produto/12-colar-perola)
watch(product, (p) => {
  if (p && route.path !== productPath(p)) void router.replace({ path: productPath(p), query: route.query })
}, { immediate: true })

const related = computed(() => {
  const p = product.value
  if (!p) return []
  const same = products.value.filter(o => o.id !== p.id && o.category?.slug && o.category.slug === p.category?.slug)
  const others = products.value.filter(o => o.id !== p.id && !same.includes(o))
  return filterAndSort([...same, ...others]).filter(o => o.available > 0).slice(0, 4)
})

const pageUrl = computed(() => (import.meta.client && product.value ? `${window.location.origin}${productPath(product.value)}` : ''))
const firstImage = computed(() => responsiveImage(images.value[0] || '').src)

useHead(() => ({
  title: product.value ? `${product.value.name} | UNA JOYA` : 'UNA JOYA',
  meta: product.value
    ? [
        { name: 'description', content: (product.value.description || `${product.value.name} - joia artesanal Una Joya.`).slice(0, 160) },
        { property: 'og:title', content: product.value.name },
        { property: 'og:image', content: firstImage.value },
        { property: 'og:type', content: 'product' }
      ]
    : [],
  script: product.value
    ? [{
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.value.name,
          description: product.value.description || undefined,
          image: images.value.map(u => responsiveImage(u).src),
          brand: { '@type': 'Brand', name: 'Una Joya' },
          offers: {
            '@type': 'Offer',
            priceCurrency: 'BRL',
            price: product.value.price.toFixed(2),
            availability: product.value.available > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            url: pageUrl.value || undefined
          }
        })
      }]
    : []
}))

const add = () => {
  const p = product.value
  if (!p || state.value === 'sold_out') return
  addToCart({ id: p.id, name: p.name, price: p.price, image: p.image })
}
const askWhatsApp = () => { if (product.value) sendProductToWhatsApp(product.value) }
const zoom = (i: number) => {
  if (product.value) openImageModal({ title: product.value.name, images: images.value, initialIndex: i, product: product.value })
}

const shareMsg = ref('')
const share = async () => {
  const p = product.value
  if (!p) return
  const url = pageUrl.value
  try {
    if (navigator.share) {
      await navigator.share({ title: p.name, text: `${p.name} - Una Joya`, url })
      return
    }
    await navigator.clipboard.writeText(url)
    shareMsg.value = 'Link copiado!'
  } catch {
    shareMsg.value = ''
  }
  setTimeout(() => { shareMsg.value = '' }, 2500)
}

// galeria com rolagem lateral no celular: acompanha a foto visível
const strip = ref<HTMLElement | null>(null)
const onScroll = () => {
  const el = strip.value
  if (el && el.clientWidth) active.value = Math.round(el.scrollLeft / el.clientWidth)
}
const goTo = (i: number) => {
  active.value = i
  strip.value?.scrollTo({ left: i * (strip.value?.clientWidth || 0), behavior: 'smooth' })
}

onMounted(() => { void load() })
</script>

<template>
  <div class="bg-soft-stone min-h-screen">
    <AppHeader />
    <AppDrawer />

    <main class="pt-16 lg:pt-[116px] xl:pt-[126px] 3xl:pt-[134px] pb-safe-nav md:pb-0 bg-surface relative min-h-screen flex flex-col justify-between">
      <div class="flex-grow px-margin-mobile md:px-8 lg:px-margin-desktop xl:px-margin-desktop-xl 3xl:px-[160px] py-6 lg:py-14">
        <!-- Carregando -->
        <div v-if="!loaded && loading" class="grid md:grid-cols-2 gap-8 lg:gap-16 animate-pulse" aria-busy="true">
          <div class="aspect-[3/4] bg-soft-stone"></div>
          <div class="space-y-4 pt-4"><div class="h-4 w-1/4 bg-soft-stone"></div><div class="h-8 w-3/4 bg-soft-stone"></div><div class="h-6 w-1/3 bg-soft-stone"></div><div class="h-12 w-full bg-soft-stone"></div></div>
        </div>

        <!-- Não encontrada -->
        <div v-else-if="notFound" class="text-center py-20 space-y-6 max-w-md mx-auto">
          <span class="material-symbols-outlined text-6xl text-secondary/40">diamond</span>
          <h1 class="font-display-lg text-2xl lg:text-3xl text-primary italic">Esta peça não está mais na vitrine</h1>
          <p class="text-secondary text-sm">Nossas joias são artesanais e de tiragem limitada. Veja as peças disponíveis agora.</p>
          <NuxtLink to="/busca" class="inline-flex items-center min-h-[44px] bg-primary text-pure-white px-8 font-label-caps text-xs tracking-widest uppercase">Ver todas as peças</NuxtLink>
        </div>

        <template v-else-if="product">
          <nav class="text-xs text-secondary mb-4 lg:mb-8 flex flex-wrap gap-1" aria-label="Você está em">
            <NuxtLink to="/" class="hover:text-primary">Início</NuxtLink><span>/</span>
            <template v-if="product.category"><NuxtLink :to="`/categoria/${product.category.slug}`" class="hover:text-primary">{{ product.category.name }}</NuxtLink><span>/</span></template>
            <span class="text-primary truncate max-w-[60vw]">{{ product.name }}</span>
          </nav>

          <div class="grid md:grid-cols-2 gap-6 md:gap-10 lg:gap-16 items-start">
            <!-- Galeria -->
            <div class="md:sticky md:top-32">
              <div class="relative -mx-margin-mobile md:mx-0">
                <div ref="strip" class="flex overflow-x-auto snap-x snap-mandatory no-scrollbar bg-pure-white" @scroll.passive="onScroll">
                  <button v-for="(img, i) in images" :key="img + i" type="button" class="w-full flex-shrink-0 snap-center aspect-[3/4] cursor-zoom-in" :aria-label="`Ampliar foto ${i + 1}`" @click="zoom(i)">
                    <img
                      :src="responsiveImage(img).src"
                      :srcset="responsiveImage(img).srcset"
                      sizes="(min-width: 768px) 50vw, 100vw"
                      :alt="`${product.name} - foto ${i + 1}`"
                      width="900"
                      height="1200"
                      :loading="i === 0 ? 'eager' : 'lazy'"
                      :fetchpriority="i === 0 ? 'high' : 'auto'"
                      decoding="async"
                      class="w-full h-full object-cover"
                      :class="state === 'sold_out' ? 'grayscale-[60%]' : ''"
                    >
                  </button>
                </div>
                <div v-if="images.length > 1" class="absolute bottom-3 left-0 right-0 flex justify-center gap-2 md:hidden">
                  <span v-for="(_, i) in images" :key="i" class="w-2 h-2 rounded-full" :class="i === active ? 'bg-primary' : 'bg-primary/30'"></span>
                </div>
              </div>
              <div v-if="images.length > 1" class="hidden md:flex gap-3 mt-4 overflow-x-auto no-scrollbar">
                <button v-for="(img, i) in images" :key="'t' + i" type="button" class="w-20 h-24 flex-shrink-0 border-2 transition-colors" :class="i === active ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100'" :aria-label="`Ver foto ${i + 1}`" @click="goTo(i)">
                  <img :src="responsiveImage(img).srcset ? responsiveImage(img).src.replace(/-800\.webp$/, '-400.webp') : img" alt="" loading="lazy" class="w-full h-full object-cover">
                </button>
              </div>
            </div>

            <!-- Informações -->
            <div class="md:pt-2">
              <NuxtLink v-if="product.category" :to="`/categoria/${product.category.slug}`" class="font-label-caps text-xs tracking-[0.2em] text-champagne-gold">{{ product.category.name }}</NuxtLink>
              <h1 class="font-display-lg text-3xl lg:text-4xl 3xl:text-5xl text-primary mt-2 mb-4 leading-tight" data-testid="product-name">{{ product.name }}</h1>
              <p class="text-2xl lg:text-3xl text-primary font-bold mb-2">{{ product.price > 0 ? formatBRL(product.price) : 'Consulte o valor' }}</p>
              <p class="text-sm mb-6" :class="state === 'sold_out' ? 'text-error' : 'text-secondary'" data-testid="product-stock">
                <template v-if="state === 'sold_out'">Esgotada no momento. Fale com a gente para encomendar uma parecida.</template>
                <template v-else-if="state === 'low'">Últimas unidades disponíveis.</template>
                <template v-else>Disponível para entrega ou retirada.</template>
              </p>

              <div class="flex flex-col gap-3 mb-8">
                <button v-if="state !== 'sold_out'" type="button" class="w-full min-h-[52px] bg-primary text-pure-white font-label-caps text-sm tracking-widest uppercase font-bold hover:bg-deep-onyx active:scale-[0.99] transition-all flex items-center justify-center gap-2" data-testid="page-add" @click="add">
                  <span class="material-symbols-outlined text-[20px]" aria-hidden="true">shopping_bag</span> Adicionar à sacola
                </button>
                <button type="button" class="w-full min-h-[52px] bg-[#1f7a4d] text-pure-white font-label-caps text-sm tracking-widest uppercase font-bold hover:bg-[#186440] active:scale-[0.99] transition-all flex items-center justify-center gap-2" data-testid="page-whatsapp" @click="askWhatsApp">
                  <span class="material-symbols-outlined text-[20px]" aria-hidden="true">chat</span> {{ state === 'sold_out' ? 'Quero encomendar' : 'Pedir pelo WhatsApp' }}
                </button>
                <button type="button" class="self-start min-h-[44px] text-sm text-secondary hover:text-primary flex items-center gap-2" @click="share">
                  <span class="material-symbols-outlined text-[20px]" aria-hidden="true">share</span> Compartilhar esta peça
                  <span v-if="shareMsg" class="text-primary" role="status">{{ shareMsg }}</span>
                </button>
              </div>

              <div v-if="product.description" class="border-t border-soft-stone pt-6">
                <h2 class="font-label-caps text-xs tracking-[0.2em] text-secondary mb-3">SOBRE A PEÇA</h2>
                <p class="text-primary text-base leading-relaxed whitespace-pre-line">{{ product.description }}</p>
              </div>
              <ul class="border-t border-soft-stone mt-6 pt-6 space-y-3 text-sm text-secondary">
                <li class="flex items-center gap-3"><span class="material-symbols-outlined text-primary" aria-hidden="true">diamond</span> Feita à mão, com pedras naturais</li>
                <li class="flex items-center gap-3"><span class="material-symbols-outlined text-primary" aria-hidden="true">support_agent</span> Atendimento personalizado pelo WhatsApp</li>
              </ul>
            </div>
          </div>

          <section v-if="related.length" class="mt-16 lg:mt-24">
            <h2 class="font-display-lg text-2xl lg:text-3xl text-primary italic mb-8 text-center">Você também pode gostar</h2>
            <ProductGrid :products="related" :toolbar="false" />
          </section>
        </template>
      </div>

      <AppFooter />
    </main>

    <BottomNavigation />
  </div>
</template>
