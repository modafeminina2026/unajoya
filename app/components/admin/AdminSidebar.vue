<script setup lang="ts">
import type { AdminTab } from '~/types/admin'

defineProps<{
  currentTab: AdminTab
  pendingOrdersCount: number
  isSidebarOpen: boolean
}>()

const emit = defineEmits<{
  'update:currentTab': [tab: AdminTab]
  'update:isSidebarOpen': [isOpen: boolean]
}>()

const setTab = (tab: AdminTab) => {
  emit('update:currentTab', tab)
  emit('update:isSidebarOpen', false)
}
</script>

<template>
  <div>
    <!-- Top Bar (Mobile Only) -->
    <header class="md:hidden fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile h-16 bg-surface border-b border-soft-stone">
      <button
        @click="emit('update:isSidebarOpen', !isSidebarOpen)"
        class="text-primary hover:opacity-75 flex items-center justify-center p-2"
        aria-label="Abrir menu"
      >
        <span class="material-symbols-outlined text-2xl">menu</span>
      </button>
      <h1 class="font-display-lg text-[20px] tracking-widest text-primary font-bold">UNA JOYA</h1>
      <NuxtLink to="/" class="text-primary hover:opacity-75 flex items-center justify-center p-2" aria-label="Voltar para a loja">
        <span class="material-symbols-outlined text-2xl">home</span>
      </NuxtLink>
    </header>

    <!-- Sidebar Overlay (Mobile Only) -->
    <div
      v-if="isSidebarOpen"
      @click="emit('update:isSidebarOpen', false)"
      class="fixed inset-0 bg-black/40 z-40 md:hidden"
    ></div>

    <!-- Navigation Drawer (Sidebar) -->
    <aside
      class="fixed inset-y-0 left-0 z-50 w-64 md:w-72 bg-surface border-r border-soft-stone flex flex-col justify-between transition-transform duration-300 md:translate-x-0"
      :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
      id="sidebar"
    >
      <div class="flex flex-col h-full px-8 pt-12 pb-8 relative">
        <!-- Close Button (Mobile Only) -->
        <button
          @click="emit('update:isSidebarOpen', false)"
          class="absolute top-4 right-4 text-primary hover:opacity-75 md:hidden p-2 flex items-center justify-center"
          aria-label="Fechar menu"
        >
          <span class="material-symbols-outlined text-2xl">close</span>
        </button>

        <div class="mb-12">
          <NuxtLink to="/" class="font-display-lg text-headline-md tracking-[0.2em] text-primary hover:text-champagne-gold font-bold">UNA JOYA</NuxtLink>
          <p class="font-label-caps text-[10px] text-secondary mt-2 opacity-60">PAINEL ADMINISTRATIVO</p>
        </div>

        <nav class="flex-1 space-y-2">
          <p class="font-label-caps text-secondary mb-4 text-[11px] tracking-widest">GERENCIAR BOUTIQUE</p>
          <a
            class="flex items-center gap-4 py-4 transition-all cursor-pointer"
            :class="currentTab === 'orders' ? 'text-primary font-bold border-b border-primary' : 'text-secondary hover:text-primary'"
            href="#"
            data-admin-tab="orders"
            @click.prevent="setTab('orders')"
          >
            <span class="material-symbols-outlined">shopping_bag</span>
            <span class="font-label-caps">PEDIDOS</span>
            <span v-if="pendingOrdersCount > 0" class="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{{ pendingOrdersCount }}</span>
          </a>
          <a
            class="flex items-center gap-4 py-4 transition-all cursor-pointer"
            :class="currentTab === 'products' ? 'text-primary font-bold border-b border-primary' : 'text-secondary hover:text-primary'"
            href="#"
            data-admin-tab="products"
            @click.prevent="setTab('products')"
          >
            <span class="material-symbols-outlined">diamond</span>
            <span class="font-label-caps">PRODUTOS</span>
          </a>
          <a
            class="flex items-center gap-4 py-4 transition-all cursor-pointer"
            :class="currentTab === 'categories' ? 'text-primary font-bold border-b border-primary' : 'text-secondary hover:text-primary'"
            href="#"
            data-admin-tab="categories"
            @click.prevent="setTab('categories')"
          >
            <span class="material-symbols-outlined">category</span>
            <span class="font-label-caps">CATEGORIAS</span>
          </a>
          <a
            class="flex items-center gap-4 py-4 transition-all cursor-pointer"
            :class="currentTab === 'carousel' ? 'text-primary font-bold border-b border-primary' : 'text-secondary hover:text-primary'"
            href="#"
            data-admin-tab="carousel"
            @click.prevent="setTab('carousel')"
          >
            <span class="material-symbols-outlined">view_carousel</span>
            <span class="font-label-caps">CARROSSEL</span>
          </a>
          <a
            class="flex items-center gap-4 py-4 transition-all cursor-pointer"
            :class="currentTab === 'lookbook' ? 'text-primary font-bold border-b border-primary' : 'text-secondary hover:text-primary'"
            href="#"
            data-admin-tab="lookbook"
            @click.prevent="setTab('lookbook')"
          >
            <span class="material-symbols-outlined">photo_library</span>
            <span class="font-label-caps">LOOKBOOK (FAIXA)</span>
          </a>
          <a
            class="flex items-center gap-4 py-4 transition-all cursor-pointer"
            :class="currentTab === 'about' ? 'text-primary font-bold border-b border-primary' : 'text-secondary hover:text-primary'"
            href="#"
            data-admin-tab="about"
            @click.prevent="setTab('about')"
          >
            <span class="material-symbols-outlined">info</span>
            <span class="font-label-caps">SOBRE NÓS</span>
          </a>
          <NuxtLink to="/" class="flex items-center gap-4 text-secondary hover:text-primary py-4 transition-all group" @click="emit('update:isSidebarOpen', false)">
            <span class="material-symbols-outlined group-hover:scale-110">home</span>
            <span class="font-label-caps">IR PARA A LOJA</span>
          </NuxtLink>
          <NuxtLink to="/checkout" class="flex items-center gap-4 text-secondary hover:text-primary py-4 transition-all group" @click="emit('update:isSidebarOpen', false)">
            <span class="material-symbols-outlined group-hover:scale-110">shopping_bag</span>
            <span class="font-label-caps">SACOLA/CHECKOUT</span>
          </NuxtLink>
        </nav>

        <div class="mt-auto pt-8 border-t border-soft-stone">
          <NuxtLink to="/" class="flex items-center gap-4 text-error opacity-70 hover:opacity-100 transition-opacity" @click="emit('update:isSidebarOpen', false)">
            <span class="material-symbols-outlined">logout</span>
            <span class="font-label-caps">VOLTAR</span>
          </NuxtLink>
        </div>
      </div>
    </aside>
  </div>
</template>