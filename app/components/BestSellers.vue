<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Product {
  id: number
  name: string
  price: number
  installments: string
  image: string
  images: string[]
  category: { name: string; slug: string } | null
}

const { client } = useSupabase()
const products = ref<Product[]>([])
const loading = ref(true)

const { addToCart } = useCart()

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

const fetchProducts = async () => {
  loading.value = true
  try {
    const { data, error } = await client
      .from('products')
      .select('*, categories(name, slug)')
      .order('id', { ascending: true })
    
    if (error) throw error
    
    products.value = (data || [])
      .filter(p => {
        // Filtra para remover produtos expirados da vitrine pública
        const createdAt = new Date(p.created_at)
        const durationDays = Number(p.duration || 15)
        const diffTime = (createdAt.getTime() + durationDays * 24 * 60 * 60 * 1000) - Date.now()
        return diffTime > 0 // Retorna true se ainda estiver no período de exibição
      })
      .map(p => {
        const price = Number(p.price) || 0
        // Calcula as parcelas dinamicamente
        const isExpensive = price >= 400
        const instCount = isExpensive ? 6 : 3
        const instPrice = price > 0
          ? (price / instCount).toFixed(2).replace('.', ',')
          : '0,00'

        let imgList: string[] = []
        if (Array.isArray(p.images) && p.images.length > 0) {
          imgList = p.images.map((img: any) => String(img)).filter(Boolean)
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
          installments: price > 0 ? `${instCount}x de R$ ${instPrice} sem juros` : '',
          image: imgList[0] || p.image || '',
          images: imgList,
          category: p.categories ? { name: p.categories.name, slug: p.categories.slug } : null
        }
      })
  } catch (err) {
    console.error('Erro ao carregar produtos:', err)
  } finally {
    loading.value = false
  }
}

const handleBuy = (product: Product) => {
  addToCart({
    name: product.name,
    price: product.price,
    image: product.images[0] || product.image
  })
}

onMounted(() => {
  fetchProducts()
})
</script>

<template>
  <section class="py-16 lg:py-24 3xl:py-32 px-margin-mobile lg:px-margin-desktop xl:px-margin-desktop-xl 3xl:px-[160px] bg-surface-container-low border-b border-soft-stone">
    <div class="mb-12 lg:mb-16 3xl:mb-20 flex flex-col items-center">
      <h2 class="font-display-lg text-headline-lg-mobile lg:text-[40px] xl:text-[48px] 3xl:text-[60px] text-primary tracking-[0.2em] mb-2 uppercase">MAIS VENDIDOS</h2>
      <div class="w-12 lg:w-16 h-[2px] bg-primary"></div>
    </div>
    
    <!-- Loading State Skeleton -->
    <div v-if="loading" class="grid grid-cols-2 lg:grid-cols-4 gap-x-4 lg:gap-x-6 xl:gap-x-8 3xl:gap-x-10 gap-y-8 lg:gap-y-12">
      <div v-for="i in 4" :key="i" class="animate-pulse flex flex-col">
        <div class="aspect-[3/4] mb-4 bg-soft-stone rounded-sm"></div>
        <div class="h-4 bg-soft-stone w-3/4 mb-3 rounded"></div>
        <div class="h-4 bg-soft-stone w-1/4 mb-2 rounded"></div>
        <div class="h-3 bg-soft-stone w-1/2 mb-5 rounded"></div>
        <div class="h-12 bg-soft-stone w-full rounded-sm"></div>
      </div>
    </div>

    <!-- Product Grid -->
    <div v-else class="grid grid-cols-2 lg:grid-cols-4 gap-x-4 lg:gap-x-6 xl:gap-x-8 3xl:gap-x-10 gap-y-8 lg:gap-y-12">
      <div 
        v-for="product in products" 
        :key="product.id"
        class="flex flex-col group"
      >
        <!-- Product Image Container -->
        <div class="aspect-[3/4] mb-4 overflow-hidden bg-pure-white shadow-sm relative">
          <!-- Main Image -->
          <img 
            :alt="product.name" 
            class="w-full h-full object-cover transition-all duration-700 group-hover:scale-105" 
            :class="product.images.length > 1 ? 'group-hover:opacity-0' : ''"
            :src="product.images[0] || product.image"
            loading="lazy"
          >
          
          <!-- Secondary Image (Hover Effect) -->
          <img 
            v-if="product.images.length > 1"
            :alt="`${product.name} - Vista 2`" 
            class="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105" 
            :src="product.images[1]"
            loading="lazy"
          >

          <!-- Multiple Photos Badge -->
          <div v-if="product.images.length > 1" class="absolute bottom-2 right-2 bg-primary/80 text-white font-label-caps text-[9px] px-2 py-0.5 tracking-wider rounded-xs backdrop-blur-xs opacity-90 group-hover:opacity-100 transition-opacity">
            +{{ product.images.length - 1 }}
          </div>

          <div class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        </div>
        
        <!-- Category Badge -->
        <NuxtLink 
          v-if="product.category" 
          :to="`/categoria/${product.category.slug}`"
          class="text-[10px] font-label-caps tracking-[0.15em] text-champagne-gold hover:opacity-80 transition-opacity mb-1 inline-block"
        >
          {{ product.category.name }}
        </NuxtLink>
        
        <!-- Product Title -->
        <h4 class="font-body-md text-[13px] lg:text-[14px] 3xl:text-[16px] text-primary mb-2 line-clamp-2 min-h-[40px] leading-snug group-hover:text-champagne-gold transition-colors duration-300">
          {{ product.name }}
        </h4>
        
        <!-- Product Price -->
        <div class="mb-1">
          <p class="font-bold text-primary lg:text-[17px] 3xl:text-[20px]">
            {{ product.price > 0 ? formatCurrency(product.price) : '—' }}
          </p>
          <p v-if="product.price > 0" class="text-[10px] text-[#2D8A5B] font-label-caps tracking-wider font-semibold">
            à vista no PIX
          </p>
        </div>
        
        <!-- Installments -->
        <div class="mb-4 min-h-[16px]">
          <p v-if="product.installments" class="text-[10px] lg:text-[11px] 3xl:text-[13px] text-secondary tracking-widest uppercase font-semibold">
            {{ product.installments }}
          </p>
          <p v-else-if="product.price >= 200" class="text-[10px] text-secondary tracking-wider uppercase font-semibold mt-0.5">
            ou em até {{ Math.min(12, Math.floor(product.price / 100)) }}x sem juros
          </p>
        </div>
        
        <!-- Buy Button -->
        <button 
          @click="handleBuy(product)"
          class="w-full py-3 lg:py-4 3xl:py-5 bg-soft-stone font-label-caps text-[10px] lg:text-[11px] 3xl:text-[13px] text-primary hover:bg-primary hover:text-pure-white transition-colors duration-300 tracking-widest uppercase active:scale-95 block text-center"
        >
          COMPRAR
        </button>
      </div>
    </div>
  </section>
</template>


