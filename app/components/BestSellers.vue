<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Product {
  id: number
  name: string
  price: number
  installments: string
  image: string
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
      .select('*')
      .order('id', { ascending: true })
    
    if (error) throw error
    
    products.value = (data || []).map(p => {
      // Calcula as parcelas dinamicamente
      const isExpensive = p.price >= 400
      const instCount = isExpensive ? 6 : 3
      const instPrice = (p.price / instCount).toFixed(2).replace('.', ',')
      
      return {
        id: p.id,
        name: p.name,
        price: Number(p.price),
        installments: `${instCount}x de R$ ${instPrice} sem juros`,
        image: p.image
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
    image: product.image
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
          <img 
            :alt="product.name" 
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
            :src="product.image"
            loading="lazy"
          >
          <div class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        </div>
        
        <!-- Product Title -->
        <h4 class="font-body-md text-[13px] lg:text-[14px] 3xl:text-[16px] text-primary mb-2 line-clamp-2 min-h-[40px] leading-snug group-hover:text-champagne-gold transition-colors duration-300">
          {{ product.name }}
        </h4>
        
        <!-- Product Price -->
        <p class="font-bold text-primary mb-1 lg:text-[17px] 3xl:text-[20px]">
          {{ formatCurrency(product.price) }}
        </p>
        
        <!-- Installments -->
        <p class="text-[10px] lg:text-[11px] 3xl:text-[13px] text-secondary tracking-widest uppercase mb-4 font-semibold">
          {{ product.installments }}
        </p>
        
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

