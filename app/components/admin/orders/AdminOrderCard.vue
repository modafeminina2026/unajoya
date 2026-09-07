<script setup lang="ts">
import type { AdminOrder, OrderStatusOption } from '~/types/admin'

defineProps<{
  order: AdminOrder
  statusOptions: OrderStatusOption[]
  savingOrderId: number | null
  formatCurrency: (val: number) => string
  formatDate: (dateStr: string) => string
  totalItems: (order: AdminOrder) => number
  getStatusOption: (status: string) => OrderStatusOption
}>()

const emit = defineEmits<{
  'update-status': [order: AdminOrder, status: string]
  'save-tracking': [order: AdminOrder]
}>()
</script>

<template>
  <div class="bg-white border border-soft-stone shadow-sm overflow-hidden">
    <!-- Order Header -->
    <div class="p-5 border-b border-soft-stone flex flex-col sm:flex-row sm:items-start justify-between gap-3">
      <div class="flex items-start gap-4">
        <div>
          <p class="font-bold text-primary text-lg">#{{ order.id }} (Código: {{ order.tracking_code }})</p>
          <p class="text-xs text-secondary">{{ formatDate(order.created_at) }}</p>
          <div class="mt-2 text-xs text-secondary space-y-1">
            <p v-if="order.customer_name"><strong>Cliente:</strong> {{ order.customer_name }}</p>
            <p v-if="order.customer_email"><strong>E-mail:</strong> {{ order.customer_email }}</p>
            <p v-if="order.customer_phone"><strong>WhatsApp/Tel:</strong> {{ order.customer_phone }}</p>
          </div>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <span
          class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border"
          :class="getStatusOption(order.status).color"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
          {{ getStatusOption(order.status).label }}
        </span>
        <p class="font-bold text-primary">{{ formatCurrency(order.total) }}</p>
      </div>
    </div>

    <!-- Order Items Preview -->
    <div class="p-5 border-b border-soft-stone/50">
      <div class="flex flex-wrap gap-3">
        <div
          v-for="(item, idx) in order.items"
          :key="idx"
          class="flex items-center gap-3 bg-surface-container-low px-3 py-2 border border-soft-stone/50 rounded-sm"
        >
          <img
            v-if="item.image"
            :src="item.image"
            :alt="item.name"
            class="w-10 h-10 object-cover rounded-sm border border-soft-stone"
          >
          <div>
            <p class="text-xs font-medium truncate max-w-[150px]">{{ item.name }}</p>
            <p class="text-[10px] text-secondary">Qtd: {{ item.quantity }} · {{ formatCurrency(item.price) }}</p>
          </div>
        </div>
      </div>
      <p class="text-xs text-secondary mt-2">{{ totalItems(order) }} {{ totalItems(order) === 1 ? 'item' : 'itens' }} · Subtotal: {{ formatCurrency(order.subtotal) }}</p>
    </div>

    <!-- Order Actions -->
    <div class="p-5 space-y-4">
      <!-- Status Update -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <label class="text-xs font-label-caps text-secondary tracking-wider flex-shrink-0 w-32">ALTERAR STATUS</label>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="option in statusOptions"
            :key="option.value"
            @click="emit('update-status', order, option.value)"
            :disabled="savingOrderId === order.id"
            class="px-4 py-2 text-[10px] font-bold uppercase tracking-wider border rounded-sm transition-all"
            :class="[
              order.status === option.value
                ? option.color + ' ring-2 ring-offset-1 ring-current/20'
                : 'bg-white border-soft-stone text-secondary hover:border-primary hover:text-primary',
              savingOrderId === order.id ? 'opacity-50 pointer-events-none' : ''
            ]"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <!-- Tracking Code -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <label class="text-xs font-label-caps text-secondary tracking-wider flex-shrink-0 w-32">CÓD. RASTREIO</label>
        <input
          v-model="order.tracking_code"
          type="text"
          placeholder="Ex: BR123456789XX"
          class="flex-1 border border-soft-stone px-4 py-2.5 text-sm focus:outline-none focus:border-primary w-full sm:w-auto"
        >
      </div>

      <!-- Notes -->
      <div class="flex flex-col sm:flex-row items-start gap-3">
        <label class="text-xs font-label-caps text-secondary tracking-wider flex-shrink-0 w-32 pt-2">NOTAS</label>
        <textarea
          v-model="order.notes"
          placeholder="Notas internas sobre o pedido..."
          rows="2"
          class="flex-1 border border-soft-stone px-4 py-2.5 text-sm focus:outline-none focus:border-primary resize-none w-full sm:w-auto"
        ></textarea>
      </div>

      <!-- Save Button -->
      <div class="flex justify-end">
        <button
          @click="emit('save-tracking', order)"
          :disabled="savingOrderId === order.id"
          class="bg-primary text-white px-6 py-2.5 font-label-caps text-[10px] tracking-widest hover:bg-deep-onyx active:scale-95 transition-all flex items-center gap-2"
          :class="{ 'opacity-50 pointer-events-none': savingOrderId === order.id }"
        >
          <span v-if="savingOrderId === order.id" class="material-symbols-outlined animate-spin text-sm">sync</span>
          SALVAR RASTREIO E NOTAS
        </button>
      </div>
    </div>
  </div>
</template>
