<script setup lang="ts">
import { computed } from 'vue'
import { buildWhatsAppUrl } from '~/utils/whatsapp'

const { totalItemsCount, isCartEmpty } = useCart()
const route = useRoute()
const config = useRuntimeConfig()
const contactUrl = computed(() => buildWhatsAppUrl(String(config.public.whatsappNumber || ''), 'Olá, Una Joya! Gostaria de tirar uma dúvida.'))
const isActive = (path: string) => (path === '/' ? route.path === '/' : route.path.startsWith(path))
const cls = (path: string) => (isActive(path) ? 'text-primary' : 'text-secondary hover:text-champagne-gold')
</script>

<template>
  <!-- Menu inferior do celular; respeita a barra do iPhone (área segura) -->
  <nav class="fixed bottom-0 left-0 w-full z-50 bg-surface border-t border-soft-stone shadow-lg md:hidden pb-[env(safe-area-inset-bottom)]" aria-label="Navegação principal">
    <div class="flex justify-around items-stretch h-14">
      <NuxtLink to="/" :class="cls('/')" class="flex flex-col items-center justify-center flex-1 gap-0.5 active:scale-95 transition-transform" aria-label="Início">
        <span class="material-symbols-outlined text-2xl" :style="isActive('/') ? 'font-variation-settings: \'FILL\' 1' : ''">home</span>
        <span class="text-[11px]">Início</span>
      </NuxtLink>
      <NuxtLink to="/busca" :class="cls('/busca')" class="flex flex-col items-center justify-center flex-1 gap-0.5 active:scale-95 transition-transform" aria-label="Buscar peças">
        <span class="material-symbols-outlined text-2xl">search</span>
        <span class="text-[11px]">Buscar</span>
      </NuxtLink>
      <a :href="contactUrl" target="_blank" rel="noopener" class="text-secondary hover:text-champagne-gold flex flex-col items-center justify-center flex-1 gap-0.5 active:scale-95 transition-transform" aria-label="Falar no WhatsApp">
        <span class="material-symbols-outlined text-2xl">chat</span>
        <span class="text-[11px]">Contato</span>
      </a>
      <NuxtLink to="/checkout" :class="cls('/checkout')" class="flex flex-col items-center justify-center flex-1 gap-0.5 active:scale-95 transition-transform relative" aria-label="Sacola">
        <span class="relative">
          <span class="material-symbols-outlined text-2xl">shopping_bag</span>
          <span v-if="!isCartEmpty && totalItemsCount > 0" class="absolute -top-1 -right-2 flex h-[18px] min-w-[18px] px-1 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-pure-white" data-testid="nav-cart-count">
            {{ totalItemsCount }}
          </span>
        </span>
        <span class="text-[11px]">Sacola</span>
      </NuxtLink>
    </div>
  </nav>
</template>
