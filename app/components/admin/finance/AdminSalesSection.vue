<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  todayISO, monthOf, monthLabel, formatCents, formatDateBR, groupSales, searchCatalog, normalizeText,
  CHANNEL_LABELS, PAYMENT_LABELS, PAYMENT_OPTIONS, type SaleRow, type SaleGroup, type CatalogOption, type Channel, type PaymentMethod
} from '~/utils/finance'
import { parseMoneyToCents } from '~/utils/importer'
import type { SaleInput, WhatsAppOrder } from '~/composables/admin/useAdminFinance'

const props = defineProps<{
  sales: SaleRow[]
  catalog: CatalogOption[]
  whatsappOrders: WhatsAppOrder[]
  prefillOrderId?: number | null
  save: (input: SaleInput, group?: string) => Promise<string | null>
  remove: (group: string) => Promise<string | null>
  /** só o formulário (cadastro rápido pelo botão + do celular) */
  formOnly?: boolean
}>()
const emit = defineEmits<{ prefillConsumed: []; saved: [] }>()

interface LineState { key: number; productId: number | null; name: string; qty: string; price: string; discount: string; open: boolean }
let seq = 0
const newLine = (): LineState => ({ key: ++seq, productId: null, name: '', qty: '1', price: '', discount: '', open: false })
const centsToInput = (c: number) => (c / 100).toFixed(2).replace('.', ',')

const soldOn = ref(todayISO())
const channel = ref<Channel>('fora_da_loja')
const channelDetail = ref('')
const payment = ref<PaymentMethod | ''>('')
const customerName = ref('')
const customerContact = ref('')
const orderId = ref<number | null>(null)
const note = ref('')
const lines = ref<LineState[]>([newLine()])
const editingGroup = ref<string | null>(null)
const message = ref('')
const messageIsError = ref(false)
const saving = ref(false)

const reset = () => {
  soldOn.value = todayISO(); channel.value = 'fora_da_loja'; channelDetail.value = ''; payment.value = ''
  customerName.value = ''; customerContact.value = ''; orderId.value = null; note.value = ''
  lines.value = [newLine()]; editingGroup.value = null
}

const suggestions = (l: LineState) => (l.open && l.name.trim() ? searchCatalog(props.catalog, l.name) : [])
const pick = (l: LineState, p: CatalogOption) => {
  l.productId = p.id; l.name = p.name; l.price = centsToInput(Math.round(p.price * 100)); l.open = false
}
const onNameInput = (l: LineState) => { l.productId = null; l.open = true }
const closeLater = (l: LineState) => setTimeout(() => { l.open = false }, 150)

const parsedLines = computed(() => lines.value.map((l) => {
  const unit = parseMoneyToCents(l.price)
  const qty = Number.parseInt(l.qty, 10)
  const discount = l.discount.trim() ? parseMoneyToCents(l.discount) : 0
  return { l, unit, qty, discount }
}))
const total = computed(() => parsedLines.value.reduce((s, p) =>
  s + (p.unit !== null && p.qty > 0 ? p.qty * p.unit - (p.discount ?? 0) : 0), 0))

const applyOrder = (id: number | null) => {
  orderId.value = id
  const o = props.whatsappOrders.find(x => x.id === id)
  if (!o) return
  channel.value = 'whatsapp_site'
  if (o.customer_name && !customerName.value) customerName.value = o.customer_name
  lines.value = o.items.map(it => ({
    key: ++seq, productId: it.product_id, name: it.name, qty: String(it.quantity), price: centsToInput(it.unit_price_cents), discount: '', open: false
  }))
}
watch(() => props.prefillOrderId, (id) => {
  if (id) { reset(); applyOrder(id); emit('prefillConsumed') }
}, { immediate: true })

const openOrders = computed(() => props.whatsappOrders.filter(o => o.status !== 'perdido'))

const submit = async () => {
  message.value = ''
  messageIsError.value = true
  const built: SaleInput['lines'] = []
  for (const p of parsedLines.value) {
    if (!p.l.name.trim()) continue
    if (p.unit === null || p.unit < 0) { message.value = `Confira o valor de "${p.l.name}".`; return }
    if (!Number.isInteger(p.qty) || p.qty < 1) { message.value = `Confira a quantidade de "${p.l.name}".`; return }
    if ((p.discount ?? 0) > p.qty * p.unit) { message.value = `O desconto de "${p.l.name}" é maior que o valor.`; return }
    built.push({ product_id: p.l.productId, item_name: p.l.name, quantity: p.qty, unit_price_cents: p.unit, discount_cents: p.discount ?? 0 })
  }
  if (!built.length) { message.value = 'Informe pelo menos um item.'; return }
  saving.value = true
  const err = await props.save({
    sold_on: soldOn.value, channel: channel.value, channel_detail: channelDetail.value || null,
    payment_method: payment.value || null, customer_name: customerName.value || null,
    customer_contact: customerContact.value || null, whatsapp_order_id: orderId.value,
    note: note.value || null, lines: built
  }, editingGroup.value ?? undefined)
  saving.value = false
  if (err) { message.value = err; return }
  messageIsError.value = false
  message.value = editingGroup.value ? 'Venda atualizada.' : 'Venda registrada.'
  reset()
  emit('saved')
}

const edit = (g: SaleGroup) => {
  editingGroup.value = g.group; soldOn.value = g.sold_on; channel.value = g.channel
  channelDetail.value = g.channel_detail ?? ''; payment.value = g.payment_method ?? ''
  customerName.value = g.customer_name ?? ''; customerContact.value = g.customer_contact ?? ''
  orderId.value = g.whatsapp_order_id; note.value = g.lines[0]?.note ?? ''
  lines.value = g.lines.map(l => ({
    key: ++seq, productId: l.product_id, name: l.item_name, qty: String(l.quantity),
    price: centsToInput(l.unit_price_cents), discount: l.discount_cents ? centsToInput(l.discount_cents) : '', open: false
  }))
  if (typeof window !== 'undefined') window.scrollTo?.({ top: 0, behavior: 'smooth' })
}

const del = async (g: SaleGroup) => {
  if (!confirm('Excluir esta venda? Isso muda os dashboards.')) return
  const err = await props.remove(g.group)
  messageIsError.value = !!err
  message.value = err ?? 'Venda excluída.'
}

// Lista com filtro de mês
const month = ref(monthOf(todayISO()))
const search = ref('')
const groups = computed(() => {
  const q = normalizeText(search.value)
  return groupSales(props.sales.filter(s => (!month.value || monthOf(s.sold_on) === month.value)))
    .filter(g => !q || normalizeText(`${g.customer_name ?? ''} ${g.lines.map(l => l.item_name).join(' ')}`).includes(q))
})
const monthTotal = computed(() => groups.value.reduce((s, g) => s + g.totalCents, 0))
</script>

<template>
  <section class="space-y-10">
    <form class="space-y-6" :class="formOnly ? '' : 'border border-soft-stone p-5 md:p-8'" @submit.prevent="submit">
      <h3 v-if="!formOnly" class="font-display-lg text-xl text-primary italic">{{ editingGroup ? 'Editar venda' : 'Registrar venda' }}</h3>

      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <label class="block"><span class="font-label-caps text-[11px] text-secondary">DATA</span>
          <input v-model="soldOn" type="date" required class="mt-1 w-full border border-soft-stone bg-transparent px-3 py-3" /></label>
        <label class="block"><span class="font-label-caps text-[11px] text-secondary">ORIGEM</span>
          <select v-model="channel" class="mt-1 w-full border border-soft-stone bg-transparent px-3 py-3">
            <option v-for="(label, key) in CHANNEL_LABELS" :key="key" :value="key">{{ label }}</option>
          </select></label>
        <label class="block"><span class="font-label-caps text-[11px] text-secondary">ONDE (OPCIONAL)</span>
          <input v-model="channelDetail" type="text" maxlength="80" placeholder="Ex.: feira, Instagram, presencial" class="mt-1 w-full border border-soft-stone bg-transparent px-3 py-3" /></label>
        <label class="block"><span class="font-label-caps text-[11px] text-secondary">PAGAMENTO</span>
          <select v-model="payment" class="mt-1 w-full border border-soft-stone bg-transparent px-3 py-3">
            <option value="">Não informado</option>
            <option v-for="p in PAYMENT_OPTIONS" :key="p" :value="p">{{ PAYMENT_LABELS[p] }}</option>
          </select></label>
      </div>

      <label class="block">
        <span class="font-label-caps text-[11px] text-secondary">CONECTAR A UM CONTATO DO WHATSAPP (OPCIONAL)</span>
        <select class="mt-1 w-full border border-soft-stone bg-transparent px-3 py-3" :value="orderId ?? ''" data-testid="order-select"
          @change="applyOrder(($event.target as HTMLSelectElement).value ? Number(($event.target as HTMLSelectElement).value) : null)">
          <option value="">Nenhum</option>
          <option v-for="o in openOrders" :key="o.id" :value="o.id">
            {{ o.code }} · {{ o.customer_name || 'sem nome' }} · {{ formatCents(o.subtotal_cents) }} · {{ formatDateBR(o.created_at.slice(0, 10)) }}
          </option>
        </select>
        <span class="text-xs text-secondary">Ao escolher, os itens do pedido são preenchidos (você pode ajustar preços) e o contato vira "fechado" ao salvar.</span>
      </label>

      <div class="space-y-4">
        <p class="font-label-caps text-[11px] text-secondary">ITENS VENDIDOS</p>
        <div v-for="(l, idx) in lines" :key="l.key" class="grid grid-cols-12 gap-3 items-start" data-testid="sale-line">
          <div class="col-span-12 md:col-span-5 relative">
            <input v-model="l.name" type="text" maxlength="200" placeholder="Digite para buscar no catálogo ou escreva um item livre"
              class="w-full border border-soft-stone bg-transparent px-3 py-3" autocomplete="off" aria-label="Item"
              @input="onNameInput(l)" @focus="l.open = true" @blur="closeLater(l)" />
            <ul v-if="suggestions(l).length" class="absolute z-20 left-0 right-0 bg-surface border border-soft-stone shadow-lg max-h-56 overflow-auto" role="listbox">
              <li v-for="p in suggestions(l)" :key="p.id" role="option" class="px-3 py-2 text-sm cursor-pointer hover:bg-soft-stone/40 flex justify-between gap-3" @mousedown.prevent="pick(l, p)">
                <span>{{ p.name }}</span>
                <span class="text-secondary whitespace-nowrap">R$ {{ centsToInput(Math.round(p.price * 100)) }} · {{ p.available ? `${p.stock} em estoque` : 'esgotado' }}</span>
              </li>
            </ul>
            <p v-if="l.name.trim() && !l.productId" class="text-[11px] text-secondary mt-1">Item fora do catálogo</p>
          </div>
          <input v-model="l.qty" type="number" min="1" step="1" class="col-span-3 md:col-span-1 border border-soft-stone bg-transparent px-3 py-3" aria-label="Quantidade" />
          <input v-model="l.price" type="text" inputmode="decimal" placeholder="Valor un. (R$)" class="col-span-5 md:col-span-3 border border-soft-stone bg-transparent px-3 py-3" aria-label="Valor unitário" />
          <input v-model="l.discount" type="text" inputmode="decimal" placeholder="Desconto" class="col-span-4 md:col-span-2 border border-soft-stone bg-transparent px-3 py-3" aria-label="Desconto" />
          <button type="button" class="col-span-12 md:col-span-1 text-secondary hover:text-error py-3 text-sm" :disabled="lines.length === 1" @click="lines.splice(idx, 1)">Remover</button>
        </div>
        <button type="button" class="text-sm underline text-secondary hover:text-primary" @click="lines.push(newLine())">+ Adicionar outro item</button>
      </div>

      <div class="grid sm:grid-cols-3 gap-4">
        <label class="block"><span class="font-label-caps text-[11px] text-secondary">CLIENTE</span>
          <input v-model="customerName" type="text" maxlength="120" class="mt-1 w-full border border-soft-stone bg-transparent px-3 py-3" /></label>
        <label class="block"><span class="font-label-caps text-[11px] text-secondary">CONTATO (TELEFONE/@)</span>
          <input v-model="customerContact" type="text" maxlength="80" class="mt-1 w-full border border-soft-stone bg-transparent px-3 py-3" /></label>
        <label class="block"><span class="font-label-caps text-[11px] text-secondary">OBSERVAÇÃO</span>
          <input v-model="note" type="text" maxlength="500" class="mt-1 w-full border border-soft-stone bg-transparent px-3 py-3" /></label>
      </div>

      <div class="flex flex-wrap items-center gap-4">
        <p class="text-primary text-lg" data-testid="sale-total">Total: {{ formatCents(total) }}</p>
        <button type="submit" :disabled="saving" class="bg-primary text-pure-white px-8 py-4 font-label-caps text-xs hover:bg-deep-onyx active:scale-95 transition-all disabled:opacity-60">
          {{ saving ? 'SALVANDO...' : editingGroup ? 'SALVAR ALTERAÇÕES' : 'REGISTRAR VENDA' }}
        </button>
        <button v-if="editingGroup" type="button" class="border border-soft-stone px-8 py-4 font-label-caps text-xs text-secondary" @click="reset">CANCELAR</button>
        <p v-if="message" class="text-sm" :class="messageIsError ? 'text-error' : 'text-secondary'" role="status">{{ message }}</p>
      </div>
      <p class="text-xs text-secondary">Registrar uma venda não altera o estoque do site. Ajuste o estoque na aba Produtos, se precisar.</p>
    </form>

    <div v-if="!formOnly">
      <div class="flex flex-wrap items-end gap-4 mb-4">
        <h3 class="font-display-lg text-xl text-primary italic mr-auto">Vendas registradas</h3>
        <label class="block text-xs text-secondary">Mês
          <input v-model="month" type="month" class="block border border-soft-stone bg-transparent px-3 py-2 text-primary" aria-label="Filtrar por mês" /></label>
        <button type="button" class="text-xs underline text-secondary" @click="month = ''">Ver todos</button>
        <input v-model="search" type="search" placeholder="Buscar cliente ou peça" class="border border-soft-stone bg-transparent px-3 py-2 text-sm" aria-label="Buscar" />
      </div>
      <p class="text-sm text-secondary mb-3" data-testid="month-total">
        {{ month ? monthLabel(month) : 'Todo o período' }}: {{ groups.length }} venda(s), {{ formatCents(monthTotal) }}
      </p>
      <p v-if="!groups.length" class="text-sm text-secondary py-8 text-center border border-dashed border-soft-stone">Nenhuma venda encontrada.</p>
      <ul v-else class="divide-y divide-soft-stone border border-soft-stone">
        <li v-for="g in groups" :key="g.group" class="p-4 flex flex-col md:flex-row md:items-center gap-3" data-testid="sale-row">
          <div class="md:w-28 text-sm text-secondary">{{ formatDateBR(g.sold_on) }}</div>
          <div class="flex-1 min-w-0">
            <p class="text-primary truncate">{{ g.lines.map(l => `${l.quantity}× ${l.item_name}`).join(', ') }}</p>
            <p class="text-xs text-secondary">
              {{ CHANNEL_LABELS[g.channel] }}<template v-if="g.channel_detail"> ({{ g.channel_detail }})</template>
              · {{ g.payment_method ? PAYMENT_LABELS[g.payment_method] : 'pagamento não informado' }}
              <template v-if="g.customer_name"> · {{ g.customer_name }}</template>
            </p>
          </div>
          <div class="text-primary md:text-right whitespace-nowrap">{{ formatCents(g.totalCents) }}</div>
          <div class="flex gap-3 text-sm">
            <button type="button" class="underline text-secondary hover:text-primary" @click="edit(g)">Editar</button>
            <button type="button" class="underline text-secondary hover:text-error" @click="del(g)">Excluir</button>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>
