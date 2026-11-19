<script setup lang="ts">
import type { AdminTab } from '~/types/admin'

const props = defineProps<{ currentTab: AdminTab; newContactsCount?: number }>()
const emit = defineEmits<{ 'update:currentTab': [tab: AdminTab]; quickAdd: []; more: [] }>()

const MAIN: { tab: AdminTab; icon: string; label: string }[] = [
  { tab: 'dashboard', icon: 'monitoring', label: 'Painel' },
  { tab: 'sales', icon: 'point_of_sale', label: 'Vendas' }
]
const isMore = () => !['dashboard', 'sales', 'contacts'].includes(props.currentTab)
</script>

<template>
  <!-- Barra de abas do painel no celular (o menu completo fica em "Mais") -->
  <nav class="md:hidden fixed bottom-0 left-0 w-full z-40 bg-surface border-t border-soft-stone shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)]" aria-label="Menu do painel" data-testid="admin-mobile-nav">
    <div class="grid grid-cols-5 h-16 items-stretch">
      <button v-for="item in MAIN" :key="item.tab" type="button" class="flex flex-col items-center justify-center gap-0.5"
        :class="currentTab === item.tab ? 'text-primary font-bold' : 'text-secondary'" :data-mobile-tab="item.tab"
        :aria-current="currentTab === item.tab ? 'page' : undefined" @click="emit('update:currentTab', item.tab)">
        <span class="material-symbols-outlined text-[24px]" aria-hidden="true">{{ item.icon }}</span>
        <span class="text-[11px]">{{ item.label }}</span>
      </button>

      <div class="flex items-center justify-center">
        <button type="button" class="w-14 h-14 -mt-6 rounded-full bg-primary text-pure-white shadow-lg flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Registrar venda ou gasto" data-testid="quick-add" @click="emit('quickAdd')">
          <span class="material-symbols-outlined text-[30px]" aria-hidden="true">add</span>
        </button>
      </div>

      <button type="button" class="flex flex-col items-center justify-center gap-0.5 relative" :class="currentTab === 'contacts' ? 'text-primary font-bold' : 'text-secondary'"
        data-mobile-tab="contacts" @click="emit('update:currentTab', 'contacts')">
        <span class="relative">
          <span class="material-symbols-outlined text-[24px]" aria-hidden="true">chat</span>
          <span v-if="(newContactsCount ?? 0) > 0" class="absolute -top-1 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-champagne-gold text-primary text-[11px] font-bold flex items-center justify-center">{{ newContactsCount }}</span>
        </span>
        <span class="text-[11px]">Contatos</span>
      </button>

      <button type="button" class="flex flex-col items-center justify-center gap-0.5" :class="isMore() ? 'text-primary font-bold' : 'text-secondary'" data-testid="mobile-more" @click="emit('more')">
        <span class="material-symbols-outlined text-[24px]" aria-hidden="true">menu</span>
        <span class="text-[11px]">Mais</span>
      </button>
    </div>
  </nav>
</template>
