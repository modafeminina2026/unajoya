<script setup lang="ts">
import { ref, computed } from 'vue'
import { formatCents, formatDateBR, normalizeText, type SaleRow } from '~/utils/finance'
import type { WhatsAppOrder } from '~/composables/admin/useAdminFinance'

const props = defineProps<{
  orders: WhatsAppOrder[]
  sales: SaleRow[]
  update: (id: number, patch: Partial<Pick<WhatsAppOrder, 'status' | 'admin_note'>>) => Promise<string | null>
  remove: (id: number) => Promise<string | null>
}>()
const emit = defineEmits<{ registerSale: [orderId: number] }>()

const STATUS: Record<WhatsAppOrder['status'], string> = { novo: 'Novo', em_conversa: 'Em conversa', fechado: 'Fechado (vendido)', perdido: 'Não fechou' }
const filter = ref<'' | WhatsAppOrder['status']>('')
const search = ref('')
const notes = ref<Record<number, string>>({})
const message = ref('')

const linkedTotal = (id: number) => props.sales.filter(s => s.whatsapp_order_id === id)
  .reduce((sum, s) => sum + s.quantity * s.unit_price_cents - s.discount_cents, 0)
const hasSale = (id: number) => props.sales.some(s => s.whatsapp_order_id === id)

const list = computed(() => {
  const q = normalizeText(search.value)
  return props.orders
    .filter(o => !filter.value || o.status === filter.value)
    .filter(o => !q || normalizeText(`${o.code} ${o.customer_name ?? ''} ${o.items.map(i => i.name).join(' ')}`).includes(q))
})
const counts = computed(() => {
  const c: Record<string, number> = { novo: 0, em_conversa: 0, fechado: 0, perdido: 0 }
  for (const o of props.orders) c[o.status] = (c[o.status] ?? 0) + 1
  return c
})

const setStatus = async (o: WhatsAppOrder, status: WhatsAppOrder['status']) => {
  message.value = (await props.update(o.id, { status })) ?? ''
}
const saveNote = async (o: WhatsAppOrder) => {
  const err = await props.update(o.id, { admin_note: (notes.value[o.id] ?? '').slice(0, 1000) || null })
  message.value = err ?? 'Anotação salva.'
}
const del = async (o: WhatsAppOrder) => {
  if (!confirm(`Excluir o contato ${o.code}? As vendas ligadas a ele continuam registradas.`)) return
  message.value = (await props.remove(o.id)) ?? 'Contato excluído.'
}
const when = (iso: string) => {
  const d = new Date(iso)
  return `${formatDateBR(iso.slice(0, 10))} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>

<template>
  <section class="space-y-6">
    <p class="text-sm text-secondary max-w-2xl">
      Cada vez que alguém clica em "Finalizar pelo WhatsApp" no site, o pedido aparece aqui com um código (UJ-...), que também vai na mensagem.
      Procure o código na conversa do WhatsApp para saber de quem é. Quando fechar a venda, clique em "Registrar venda" para ela entrar nos dashboards.
    </p>

    <div class="flex flex-wrap items-center gap-2">
      <button type="button" class="px-3 py-2 text-xs border" :class="filter === '' ? 'bg-primary text-pure-white border-primary' : 'border-soft-stone text-secondary'" @click="filter = ''">Todos ({{ orders.length }})</button>
      <button v-for="(label, key) in STATUS" :key="key" type="button" class="px-3 py-2 text-xs border"
        :class="filter === key ? 'bg-primary text-pure-white border-primary' : 'border-soft-stone text-secondary'" @click="filter = key">{{ label }} ({{ counts[key] }})</button>
      <input v-model="search" type="search" placeholder="Buscar código, nome ou peça" class="md:ml-auto border border-soft-stone bg-transparent px-3 py-2 text-sm" aria-label="Buscar" />
    </div>
    <p v-if="message" class="text-sm text-secondary" role="status">{{ message }}</p>

    <p v-if="!list.length" class="text-sm text-secondary py-8 text-center border border-dashed border-soft-stone">Nenhum contato encontrado.</p>
    <ul v-else class="space-y-4">
      <li v-for="o in list" :key="o.id" class="border border-soft-stone p-5 space-y-3" data-testid="contact-row">
        <div class="flex flex-wrap items-center gap-3">
          <span class="font-bold text-primary tracking-wider">{{ o.code }}</span>
          <span class="text-sm text-secondary">{{ when(o.created_at) }}</span>
          <span v-if="o.customer_name" class="text-sm text-primary">· {{ o.customer_name }}</span>
          <select class="ml-auto border border-soft-stone bg-transparent px-2 py-2 text-sm" :value="o.status" aria-label="Situação"
            @change="setStatus(o, ($event.target as HTMLSelectElement).value as WhatsAppOrder['status'])">
            <option v-for="(label, key) in STATUS" :key="key" :value="key">{{ label }}</option>
          </select>
        </div>
        <ul class="text-sm text-primary">
          <li v-for="it in o.items" :key="it.product_id">{{ it.quantity }}× {{ it.name }} — {{ formatCents(it.line_total_cents) }}</li>
        </ul>
        <p class="text-sm text-secondary">Total pedido no site: {{ formatCents(o.subtotal_cents) }}
          <template v-if="hasSale(o.id)"> · venda registrada: {{ formatCents(linkedTotal(o.id)) }}</template></p>
        <p v-if="o.note" class="text-sm text-secondary">Obs. do cliente: {{ o.note }}</p>
        <div class="flex flex-wrap gap-2 items-center">
          <input type="text" maxlength="1000" placeholder="Anotação interna" class="flex-1 min-w-[200px] border border-soft-stone bg-transparent px-3 py-2 text-sm"
            :value="notes[o.id] ?? o.admin_note ?? ''" @input="notes[o.id] = ($event.target as HTMLInputElement).value" />
          <button type="button" class="text-xs underline text-secondary" @click="saveNote(o)">Salvar anotação</button>
          <button v-if="!hasSale(o.id)" type="button" class="bg-primary text-pure-white px-4 py-2 text-xs font-label-caps" @click="emit('registerSale', o.id)">REGISTRAR VENDA</button>
          <button type="button" class="text-xs underline text-secondary hover:text-error" @click="del(o)">Excluir</button>
        </div>
      </li>
    </ul>
  </section>
</template>
