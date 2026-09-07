<script setup lang="ts">
import type { AdminOrder, OrderStatusOption } from '~/types/admin'
import AdminOrderCard from './AdminOrderCard.vue'

defineProps<{
  orders: AdminOrder[]
  loading: boolean
  savingOrderId: number | null
  statusOptions: OrderStatusOption[]
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
  <div class="fade-in">
    <!-- Counters -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      <div class="bg-white border border-soft-stone p-4 text-center">
        <p class="text-2xl font-bold text-primary">{{ orders.length }}</p>
        <p class="text-xs text-secondary font-label-caps tracking-wider">TOTAL</p>
      </div>
      <div class="bg-amber-50 border border-amber-200 p-4 text-center">
        <p class="text-2xl font-bold text-amber-700">{{ orders.filter(o => o.status === 'pendente').length }}</p>
        <p class="text-xs text-amber-600 font-label-caps tracking-wider">PENDENTES</p>
      </div>
      <div class="bg-blue-50 border border-blue-200 p-4 text-center">
        <p class="text-2xl font-bold text-blue-700">{{ orders.filter(o => o.status === 'preparando').length }}</p>
        <p class="text-xs text-blue-600 font-label-caps tracking-wider">PREPARANDO</p>
      </div>
      <div class="bg-green-50 border border-green-200 p-4 text-center">
        <p class="text-2xl font-bold text-green-700">{{ orders.filter(o => o.status === 'enviado' || o.status === 'entregue').length }}</p>
        <p class="text-xs text-green-600 font-label-caps tracking-wider">ENVIADOS</p>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-16">
      <span class="material-symbols-outlined animate-spin text-4xl text-secondary">sync</span>
      <p class="text-secondary mt-4">Carregando pedidos...</p>
    </div>

    <!-- Empty -->
    <div v-else-if="orders.length === 0" class="bg-white border border-soft-stone p-16 text-center space-y-4">
      <span class="material-symbols-outlined text-6xl text-secondary/30">inbox</span>
      <h3 class="font-headline-md text-xl text-primary">Nenhum pedido ainda</h3>
      <p class="text-secondary text-sm">Os pedidos realizados pelos clientes aparecerão aqui.</p>
    </div>

    <!-- Orders List -->
    <div v-else class="space-y-6">
      <AdminOrderCard
        v-for="order in orders"
        :key="order.id"
        :order="order"
        :status-options="statusOptions"
        :saving-order-id="savingOrderId"
        :format-currency="formatCurrency"
        :format-date="formatDate"
        :total-items="totalItems"
        :get-status-option="getStatusOption"
        @update-status="(ord, st) => emit('update-status', ord, st)"
        @save-tracking="(ord) => emit('save-tracking', ord)"
      />
    </div>
  </div>
</template>
