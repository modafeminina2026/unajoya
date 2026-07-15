<script setup lang="ts">
import { ref, onMounted } from 'vue'

const { toggleDrawer } = useDrawer()
const { totalItemsCount, isCartEmpty } = useCart()
const { client } = useSupabase()

const categories = ref<any[]>([])
const loading = ref(true)

const fetchCategories = async () => {
  try {
    const { data, error } = await client
      .from('categories')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })
    
    if (error) throw error
    categories.value = data || []
  } catch (err) {
    console.error('Erro ao buscar categorias para o header:', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchCategories()
})
</script>

<template>
  <header class="fixed top-0 left-0 w-full z-50 bg-surface border-b border-soft-stone">
    <!-- Mobile Header -->
    <div class="flex lg:hidden justify-between items-center px-margin-mobile py-unit h-16">
      <button 
        class="text-primary hover:opacity-70 transition-opacity active:scale-95 duration-150 flex items-center justify-center p-2" 
        @click="toggleDrawer"
        aria-label="Abrir Menu"
      >
        <span class="material-symbols-outlined text-2xl">menu</span>
      </button>
      
      <div class="flex items-center">
        <NuxtLink to="/" class="flex items-center">
          <img 
            alt="UNA JOYA" 
            class="h-10 w-auto object-contain" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9glF-h10U3EKLc9s_Tuoc4vkAruhbL4hQffNpsIAux2zoX7LQcoUvD7fCrht5oLf-GCSVHadrbZOILsbDQM3cQwabxpdI-s5hKP1Tdu5q1xDKuQcn7Wku6YQWAeUJFsKFXU5bUqvVG2a-Q6vm6OsrnWq5c57MMZbvrRLDaUjo03Q0Rtye5ZLVF2wSzNs207dnfQNJCVZntrtDNjDggu5nEXe4zPZ7Q61lPfd1sIwXNBwO1z6O7uR-k7z7UyU-4vbK4yM6nDa_fz9R"
          >
        </NuxtLink>
      </div>
      
      <div class="flex items-center gap-2">
        <button class="text-primary hover:opacity-70 transition-opacity active:scale-95 duration-150 p-2" aria-label="Buscar">
          <span class="material-symbols-outlined text-2xl">search</span>
        </button>
        <NuxtLink to="/meu-pedido" class="text-primary hover:opacity-70 transition-opacity active:scale-95 duration-150 p-2 flex items-center justify-center" aria-label="Meus Pedidos">
          <span class="material-symbols-outlined text-2xl">receipt_long</span>
        </NuxtLink>
        <NuxtLink to="/checkout" class="text-primary hover:opacity-70 transition-opacity active:scale-95 duration-150 p-2 relative flex items-center justify-center" aria-label="Ver Sacola">
          <span class="material-symbols-outlined text-2xl">shopping_bag</span>
          <!-- Dynamic Badge -->
          <span 
            v-if="!isCartEmpty && totalItemsCount > 0" 
            class="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#202223] text-[9px] font-bold text-pure-white"
          >
            {{ totalItemsCount }}
          </span>
        </NuxtLink>
      </div>
    </div>

    <!-- Desktop Header -->
    <div class="hidden lg:flex flex-col w-full">
      <!-- Top bar: logo + actions -->
      <div class="flex justify-between items-center px-margin-desktop xl:px-margin-desktop-xl 3xl:px-[160px] py-4 border-b border-soft-stone/50">
        <NuxtLink to="/" class="flex items-center">
          <img 
            alt="UNA JOYA" 
            class="h-12 xl:h-14 3xl:h-16 w-auto object-contain" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9glF-h10U3EKLc9s_Tuoc4vkAruhbL4hQffNpsIAux2zoX7LQcoUvD7fCrht5oLf-GCSVHadrbZOILsbDQM3cQwabxpdI-s5hKP1Tdu5q1xDKuQcn7Wku6YQWAeUJFsKFXU5bUqvVG2a-Q6vm6OsrnWq5c57MMZbvrRLDaUjo03Q0Rtye5ZLVF2wSzNs207dnfQNJCVZntrtDNjDggu5nEXe4zPZ7Q61lPfd1sIwXNBwO1z6O7uR-k7z7UyU-4vbK4yM6nDa_fz9R"
          >
        </NuxtLink>

        <div class="flex items-center gap-3 xl:gap-4">
          <button class="text-primary hover:opacity-70 transition-opacity active:scale-95 duration-150 p-2 flex items-center gap-2 font-label-caps text-label-caps tracking-widest" aria-label="Buscar">
            <span class="material-symbols-outlined text-xl">search</span>
            <span class="hidden xl:inline">BUSCAR</span>
          </button>
          <NuxtLink to="/meu-pedido" class="text-primary hover:opacity-70 transition-opacity active:scale-95 duration-150 p-2 flex items-center gap-2 font-label-caps text-label-caps tracking-widest" aria-label="Meus Pedidos">
            <span class="material-symbols-outlined text-xl">receipt_long</span>
            <span>MEUS PEDIDOS</span>
          </NuxtLink>
          <NuxtLink to="/checkout" class="text-primary hover:opacity-70 transition-opacity active:scale-95 duration-150 p-2 relative flex items-center gap-2 font-label-caps text-label-caps tracking-widest" aria-label="Ver Sacola">
            <span class="material-symbols-outlined text-xl">shopping_bag</span>
            <span class="hidden xl:inline">SACOLA</span>
            <!-- Dynamic Badge -->
            <span 
              v-if="!isCartEmpty && totalItemsCount > 0" 
              class="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#202223] text-[9px] font-bold text-pure-white px-1.5"
            >
              {{ totalItemsCount }}
            </span>
          </NuxtLink>
        </div>
      </div>

      <!-- Nav links bar -->
      <nav class="flex justify-center items-center gap-8 xl:gap-12 2xl:gap-16 py-3 xl:py-4">
        <span v-if="loading" class="font-label-caps text-xs text-secondary opacity-50 tracking-widest">CARREGANDO...</span>
        <NuxtLink 
          v-else
          v-for="cat in categories"
          :key="cat.id"
          :to="`/categoria/${cat.slug}`"
          class="font-label-caps text-label-caps xl:text-[13px] 3xl:text-[15px] text-primary tracking-widest hover:text-champagne-gold transition-colors duration-300 relative group pb-1"
        >
          {{ cat.name }}
          <span class="absolute bottom-0 left-0 w-0 h-[1px] bg-champagne-gold transition-all duration-300 group-hover:w-full"></span>
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>

