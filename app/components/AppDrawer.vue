<script setup lang="ts">
import { ref, onMounted } from 'vue'

const { isDrawerOpen, closeDrawer } = useDrawer()
const { client } = useSupabase()

const menuItems = ref<any[]>([])
const loading = ref(true)

const fetchCategories = async () => {
  try {
    const { data, error } = await client
      .from('categories')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })
    
    if (error) throw error
    
    const items = [
      { label: 'MEUS PEDIDOS', path: '/meu-pedido', hasSubmenu: false, isOpen: false, subcategories: [] }
    ]
    
    if (data) {
      data.forEach(cat => {
        items.push({
          label: cat.name,
          path: `/categoria/${cat.slug}`,
          hasSubmenu: false,
          isOpen: false,
          subcategories: []
        })
      })
    }
    
    menuItems.value = items
  } catch (err) {
    console.error('Erro ao buscar categorias para o drawer:', err)
  } finally {
    loading.value = false
  }
}

const toggleSubmenu = (index: number, event: Event) => {
  closeDrawer()
  if (menuItems.value[index].path.startsWith('/')) {
    event.preventDefault()
    navigateTo(menuItems.value[index].path)
  }
}

onMounted(() => {
  fetchCategories()
})
</script>

<template>
  <div>
    <!-- Backdrop Overlay -->
    <div 
      class="overlay fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[60]" 
      :class="{ 'active': isDrawerOpen }"
      @click="closeDrawer"
    ></div>

    <!-- Navigation Drawer -->
    <nav 
      class="nav-drawer fixed top-0 left-0 h-full w-[85%] max-w-sm bg-surface shadow-2xl z-[70] flex flex-col justify-between border-r border-soft-stone"
      :class="{ 'active': isDrawerOpen }"
    >
      <!-- Top Section -->
      <div class="flex flex-col flex-1 overflow-y-auto no-scrollbar">
        <!-- Header of Drawer -->
        <div class="flex justify-between items-center px-6 py-6 border-b border-soft-stone/60 mb-2">
          <div class="flex items-center gap-3">
            <span class="material-symbols-outlined text-primary text-xl" style="font-variation-settings: 'FILL' 1;">person</span>
            <span class="font-label-caps text-[11px] tracking-[0.25em] text-primary font-bold">MINHA CONTA</span>
          </div>
          <button class="text-primary hover:text-champagne-gold transition-colors p-2" @click="closeDrawer" aria-label="Fechar Menu">
            <span class="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        <!-- Navigation Links -->
        <ul class="flex flex-col px-6">
          <li 
            v-for="(item, idx) in menuItems" 
            :key="item.label"
            class="border-b border-soft-stone/40 overflow-hidden"
            :style="{ 
              animationDelay: isDrawerOpen ? `${100 + (idx * 50)}ms` : '0ms',
              transform: isDrawerOpen ? 'translateX(0)' : 'translateX(-20px)',
              opacity: isDrawerOpen ? 1 : 0,
              transition: 'transform 0.4s ease-out, opacity 0.4s ease-out'
            }"
          >
            <!-- Parent Link -->
            <a 
              :href="item.path" 
              class="flex justify-between items-center py-5 font-label-caps text-xs md:text-[13px] text-primary tracking-[0.2em] font-semibold hover:text-champagne-gold transition-colors group"
              @click="toggleSubmenu(idx, $event)"
            >
              <span>{{ item.label }}</span>
              <span 
                v-if="item.hasSubmenu" 
                class="material-symbols-outlined text-lg transition-transform duration-300"
                :class="{ 'rotate-90 text-champagne-gold': item.isOpen }"
              >
                chevron_right
              </span>
            </a>

            <!-- Submenu Dropdown -->
            <div 
              v-if="item.hasSubmenu"
              class="transition-all duration-300 ease-in-out overflow-hidden"
              :style="{ 
                maxHeight: item.isOpen ? `${item.subcategories.length * 56}px` : '0px',
                opacity: item.isOpen ? 1 : 0
              }"
            >
              <ul class="pl-4 pb-4 space-y-1">
                <li v-for="sub in item.subcategories" :key="sub.label">
                  <a 
                    :href="sub.path"
                    class="block py-3 font-label-caps text-[11px] text-secondary tracking-widest hover:text-champagne-gold transition-colors"
                    @click="closeDrawer"
                  >
                    — {{ sub.label }}
                  </a>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>

      <!-- Bottom Section (Drawer Footer) -->
      <div 
        class="p-6 border-t border-soft-stone bg-surface-container-low flex flex-col space-y-6"
        :style="{ 
          transform: isDrawerOpen ? 'translateY(0)' : 'translateY(20px)',
          opacity: isDrawerOpen ? 1 : 0,
          transition: 'transform 0.5s ease-out 0.4s, opacity 0.5s ease-out 0.4s'
        }"
      >
        <!-- Info Badges inside menu -->
        <div class="text-center py-2 px-4 border border-champagne-gold/30 bg-surface/50 rounded-sm">
          <p class="text-[9px] font-label-caps text-champagne-gold tracking-widest font-semibold">
            FRETE GRÁTIS ACIMA DE R$ 350
          </p>
        </div>

        <!-- Atendimento details -->
        <div class="space-y-3">
          <p class="font-label-caps text-[10px] text-secondary-fixed-dim tracking-widest font-bold">ATENDIMENTO</p>
          <a class="flex items-center gap-2 text-xs font-bold text-primary hover:text-champagne-gold transition-colors" href="tel:5511953769317">
            <span class="material-symbols-outlined text-lg">phone</span>
            (11) 95376-9317
          </a>
          <a class="flex items-center gap-2 text-xs text-primary hover:text-champagne-gold transition-colors" href="mailto:contato@unajoya.com">
            <span class="material-symbols-outlined text-lg">mail</span>
            contato@unajoya.com
          </a>
        </div>

        <!-- Social Icons in Drawer -->
        <div class="flex gap-6 justify-center pt-2 border-t border-soft-stone/40">
          <a class="text-secondary hover:text-champagne-gold transition-colors" href="#" aria-label="Facebook"><span class="material-symbols-outlined text-xl">face_nod</span></a>
          <a class="text-secondary hover:text-champagne-gold transition-colors" href="#" aria-label="Instagram"><span class="material-symbols-outlined text-xl">photo_camera</span></a>
          <a class="text-secondary hover:text-champagne-gold transition-colors" href="#" aria-label="WhatsApp"><span class="material-symbols-outlined text-xl">share</span></a>
        </div>
      </div>
    </nav>
  </div>
</template>

