<script setup lang="ts">
import type { AdminProduct } from '~/types/admin'
import { formatCurrency } from '~/composables/admin/useAdminProductExpiry'

defineProps<{
  products: AdminProduct[]
  activeCount: number
  expiredCount: number
  getExpirationText: (p: AdminProduct) => string
  isExpiringSoon: (p: AdminProduct) => boolean
}>()

const emit = defineEmits<{
  openModal: [product: AdminProduct]
  edit: [product: AdminProduct]
  delete: [id: number]
}>()
</script>

<template>
  <section class="mt-20 fade-in" style="animation-delay: 0.3s">
    <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-8 border-b border-soft-stone pb-4 gap-4">
      <h3 class="font-display-lg text-2xl md:text-3xl text-primary italic">Status do Catálogo Ativo</h3>
      <div class="flex gap-6 pb-2">
        <span class="flex items-center gap-2 font-label-caps text-xs text-secondary font-bold">
          <span class="w-2.5 h-2.5 rounded-full bg-[#2D8A5B]"></span> {{ activeCount }} ATIVOS
        </span>
        <span class="flex items-center gap-2 font-label-caps text-xs text-secondary font-bold">
          <span class="w-2.5 h-2.5 rounded-full bg-error"></span> {{ expiredCount }} EXPIRADOS
        </span>
      </div>
    </div>

    <div class="overflow-x-auto bg-surface border border-soft-stone rounded-sm">
      <table class="w-full border-collapse min-w-[650px]">
        <thead>
          <tr class="text-left border-b border-soft-stone bg-surface-container-low">
            <th class="py-4 px-6 font-label-caps text-[10px] text-secondary tracking-widest font-bold">JOIA / PRODUTO</th>
            <th class="py-4 px-6 font-label-caps text-[10px] text-secondary tracking-widest font-bold">CATEGORIA</th>
            <th class="py-4 px-6 font-label-caps text-[10px] text-secondary tracking-widest font-bold">ESTOQUE</th>
            <th class="py-4 px-6 font-label-caps text-[10px] text-secondary tracking-widest font-bold">EXPIRAÇÃO</th>
            <th class="py-4 px-6 font-label-caps text-[10px] text-secondary tracking-widest font-bold">PREÇO</th>
            <th class="py-4 px-6 font-label-caps text-[10px] text-secondary tracking-widest font-bold">AÇÕES</th>
          </tr>
        </thead>
        <tbody class="text-on-surface font-body-md text-sm">
          <tr
            v-for="p in products"
            :key="p.id"
            class="border-b border-soft-stone/40 hover:bg-surface-container-low transition-colors"
          >
            <td class="py-4 px-6 flex items-center gap-4">
              <div
                class="w-12 h-12 bg-soft-stone flex-shrink-0 border border-soft-stone rounded overflow-hidden relative group/thumb cursor-pointer select-none"
                data-testid="product-thumbnail"
                @click="emit('openModal', p)"
                :title="`Clique para visualizar ${p.images?.length || 1} foto(s)`"
              >
                <img class="w-full h-full object-cover" :src="p.image" :alt="p.name"/>

                <!-- Overlay com a quantidade de fotos sobre a miniatura -->
                <div class="absolute inset-0 bg-black/25 flex items-center justify-center group-hover/thumb:bg-black/45 transition-colors">
                  <span class="text-pure-white font-bold text-sm sm:text-base tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                    {{ p.images?.length || 1 }}
                  </span>
                </div>
              </div>
              <div class="flex flex-col">
                <span class="font-label-caps font-bold tracking-wide text-primary">{{ p.name }}</span>
                <div class="flex items-center gap-2 mt-0.5">
                  <span v-if="p.promo" class="text-[9px] font-label-caps text-champagne-gold tracking-widest font-bold">DESTAQUE ATIVO</span>
                  <span v-if="p.images && p.images.length > 1" class="text-[9px] font-label-caps text-secondary font-semibold bg-soft-stone px-1.5 py-0.2 rounded-xs">
                    {{ p.images.length }} FOTOS
                  </span>
                </div>
              </div>
            </td>
            <td class="py-4 px-6 text-secondary font-semibold">{{ p.category_name || 'Nenhuma' }}</td>
            <td class="py-4 px-6 text-secondary font-semibold">{{ p.stock }} Unidades</td>
            <td class="py-4 px-6">
              <span
                class="font-bold text-xs"
                :class="isExpiringSoon(p) ? 'text-error animate-pulse' : 'text-primary'"
              >
                {{ getExpirationText(p) }}
              </span>
              <p class="text-[10px] text-secondary mt-0.5 uppercase tracking-wider">Deleção automática</p>
            </td>
            <td class="py-4 px-6 text-primary font-bold">{{ formatCurrency(p.price) }}</td>
            <td class="py-4 px-6">
              <div class="flex items-center gap-3">
                <button
                  @click="emit('edit', p)"
                  class="material-symbols-outlined text-secondary hover:text-primary transition-colors p-1"
                  aria-label="Editar"
                >
                  edit
                </button>
                <button
                  @click="emit('delete', p.id)"
                  class="material-symbols-outlined text-secondary hover:text-error transition-colors p-1"
                  aria-label="Excluir"
                >
                  delete
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="products.length === 0">
            <td colspan="6" class="py-12 text-center text-secondary font-body-md text-sm">
              Nenhuma joia publicada no catálogo ainda.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>