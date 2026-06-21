<script setup lang="ts">
const { isDrawerOpen, closeDrawer } = useDrawer()

const menuItems = [
  { label: 'NOVIDADES', path: '#', hasSubmenu: false },
  { label: 'COLARES', path: '#', hasSubmenu: true },
  { label: 'PULSEIRAS', path: '#', hasSubmenu: false },
  { label: 'BRINCOS', path: '#', hasSubmenu: false },
  { label: 'BRACELETES', path: '#', hasSubmenu: false },
  { label: 'ANÉIS', path: '#', hasSubmenu: false },
  { label: 'ACESSÓRIOS', path: '#', hasSubmenu: false },
  { label: 'SALE', path: '#', hasSubmenu: false }
]
</script>

<template>
  <div>
    <!-- Backdrop Overlay -->
    <div 
      class="overlay fixed inset-0 bg-black/40 z-[60]" 
      :class="{ 'active': isDrawerOpen }"
      @click="closeDrawer"
    ></div>

    <!-- Navigation Drawer -->
    <nav 
      class="nav-drawer fixed top-0 left-0 h-full w-4/5 max-w-sm bg-pure-white shadow-2xl z-[70] flex flex-col"
      :class="{ 'active': isDrawerOpen }"
    >
      <!-- Header of Drawer -->
      <div class="flex justify-between items-center px-6 py-8 border-b border-soft-stone mb-4">
        <div class="flex items-center gap-4">
          <span class="material-symbols-outlined text-2xl" style="font-variation-settings: 'FILL' 1;">person</span>
          <span class="font-label-caps text-label-caps tracking-[0.2em] text-primary font-bold">MINHA CONTA</span>
        </div>
        <button class="text-primary hover:opacity-75 transition-opacity" @click="closeDrawer" aria-label="Fechar Menu">
          <span class="material-symbols-outlined text-3xl">close</span>
        </button>
      </div>

      <!-- Navigation Links -->
      <ul class="flex flex-col px-6 overflow-y-auto no-scrollbar">
        <li 
          v-for="item in menuItems" 
          :key="item.label"
          class="border-b border-soft-stone"
        >
          <a 
            :href="item.path" 
            class="flex justify-between items-center py-6 font-label-caps text-label-caps text-primary tracking-[0.2em] hover:text-champagne-gold transition-colors"
            @click="closeDrawer"
          >
            <span>{{ item.label }}</span>
            <span v-if="item.hasSubmenu" class="material-symbols-outlined text-sm">chevron_right</span>
          </a>
        </li>
      </ul>
    </nav>
  </div>
</template>
