<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  todayISO, monthOf, monthLabel, formatCents, formatDateBR, normalizeText, expensesByCategory,
  PAYMENT_LABELS, PAYMENT_OPTIONS, type ExpenseRow, type PaymentMethod
} from '~/utils/finance'
import { parseMoneyToCents } from '~/utils/importer'
import type { ExpenseCategory, ExpenseInput } from '~/composables/admin/useAdminFinance'
import RankedBars from './RankedBars.vue'

const props = defineProps<{
  expenses: ExpenseRow[]
  categories: ExpenseCategory[]
  save: (input: ExpenseInput, id?: number) => Promise<string | null>
  remove: (id: number) => Promise<string | null>
  addCategory: (name: string) => Promise<string | null>
  setCategoryActive: (id: number, active: boolean) => Promise<void>
  /** só o formulário (cadastro rápido pelo botão + do celular) */
  formOnly?: boolean
}>()
const emit = defineEmits<{ saved: [] }>()

const spentOn = ref(todayISO())
const category = ref('')
const description = ref('')
const amount = ref('')
const payment = ref<PaymentMethod | ''>('')
const supplier = ref('')
const note = ref('')
const editingId = ref<number | null>(null)
const message = ref('')
const isError = ref(false)
const saving = ref(false)
const newCategory = ref('')

const activeCategories = computed(() => props.categories.filter(c => c.active))

const reset = () => {
  spentOn.value = todayISO(); category.value = ''; description.value = ''; amount.value = ''
  payment.value = ''; supplier.value = ''; note.value = ''; editingId.value = null
}

const submit = async () => {
  message.value = ''; isError.value = true
  const cents = parseMoneyToCents(amount.value)
  if (!category.value) { message.value = 'Escolha a categoria.'; return }
  if (cents === null || cents <= 0) { message.value = 'Informe um valor maior que zero.'; return }
  saving.value = true
  const err = await props.save({
    spent_on: spentOn.value, category: category.value, description: description.value || null, amount_cents: cents,
    payment_method: payment.value || null, supplier: supplier.value || null, note: note.value || null
  }, editingId.value ?? undefined)
  saving.value = false
  if (err) { message.value = err; return }
  isError.value = false
  message.value = editingId.value ? 'Gasto atualizado.' : 'Gasto registrado.'
  reset()
  emit('saved')
}

const edit = (e: ExpenseRow) => {
  editingId.value = e.id; spentOn.value = e.spent_on; category.value = e.category
  description.value = e.description ?? ''; amount.value = (e.amount_cents / 100).toFixed(2).replace('.', ',')
  payment.value = e.payment_method ?? ''; supplier.value = e.supplier ?? ''; note.value = e.note ?? ''
  if (typeof window !== 'undefined') window.scrollTo?.({ top: 0, behavior: 'smooth' })
}
const del = async (e: ExpenseRow) => {
  if (!confirm('Excluir este gasto?')) return
  const err = await props.remove(e.id)
  isError.value = !!err; message.value = err ?? 'Gasto excluído.'
}
const createCategory = async () => {
  const err = await props.addCategory(newCategory.value)
  isError.value = !!err; message.value = err ?? 'Categoria criada.'
  if (!err) { category.value = newCategory.value.trim(); newCategory.value = '' }
}

const month = ref(monthOf(todayISO()))
const search = ref('')
const list = computed(() => {
  const q = normalizeText(search.value)
  return props.expenses
    .filter(e => !month.value || monthOf(e.spent_on) === month.value)
    .filter(e => !q || normalizeText(`${e.category} ${e.description ?? ''} ${e.supplier ?? ''}`).includes(q))
})
const listTotal = computed(() => list.value.reduce((s, e) => s + e.amount_cents, 0))
const monthRange = computed(() => month.value
  ? { from: `${month.value}-01`, to: `${month.value}-31` }
  : { from: '0000-01-01', to: '9999-12-31' })
const byCategory = computed(() => expensesByCategory(props.expenses, monthRange.value))
</script>

<template>
  <section class="space-y-10">
    <form class="space-y-6" :class="formOnly ? '' : 'border border-soft-stone p-5 md:p-8'" @submit.prevent="submit">
      <h3 v-if="!formOnly" class="font-display-lg text-xl text-primary italic">{{ editingId ? 'Editar gasto' : 'Registrar gasto' }}</h3>
      <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <label class="block"><span class="font-label-caps text-[11px] text-secondary">DATA</span>
          <input v-model="spentOn" type="date" required class="mt-1 w-full border border-soft-stone bg-transparent px-3 py-3" /></label>
        <label class="block"><span class="font-label-caps text-[11px] text-secondary">CATEGORIA</span>
          <select v-model="category" required class="mt-1 w-full border border-soft-stone bg-transparent px-3 py-3">
            <option value="" disabled>Escolha...</option>
            <option v-for="c in activeCategories" :key="c.id" :value="c.name">{{ c.name }}</option>
            <option v-if="category && !activeCategories.some(c => c.name === category)" :value="category">{{ category }}</option>
          </select></label>
        <label class="block"><span class="font-label-caps text-[11px] text-secondary">VALOR (R$)</span>
          <input v-model="amount" type="text" inputmode="decimal" required placeholder="0,00" class="mt-1 w-full border border-soft-stone bg-transparent px-3 py-3" /></label>
        <label class="block"><span class="font-label-caps text-[11px] text-secondary">PAGAMENTO</span>
          <select v-model="payment" class="mt-1 w-full border border-soft-stone bg-transparent px-3 py-3">
            <option value="">Não informado</option>
            <option v-for="p in PAYMENT_OPTIONS" :key="p" :value="p">{{ PAYMENT_LABELS[p] }}</option>
          </select></label>
      </div>
      <div class="grid sm:grid-cols-3 gap-4">
        <label class="block"><span class="font-label-caps text-[11px] text-secondary">DESCRIÇÃO</span>
          <input v-model="description" type="text" maxlength="200" class="mt-1 w-full border border-soft-stone bg-transparent px-3 py-3" /></label>
        <label class="block"><span class="font-label-caps text-[11px] text-secondary">FORNECEDOR</span>
          <input v-model="supplier" type="text" maxlength="120" class="mt-1 w-full border border-soft-stone bg-transparent px-3 py-3" /></label>
        <label class="block"><span class="font-label-caps text-[11px] text-secondary">OBSERVAÇÃO</span>
          <input v-model="note" type="text" maxlength="500" class="mt-1 w-full border border-soft-stone bg-transparent px-3 py-3" /></label>
      </div>
      <div class="flex flex-wrap items-center gap-4">
        <button type="submit" :disabled="saving" class="bg-primary text-pure-white px-8 py-4 font-label-caps text-xs hover:bg-deep-onyx active:scale-95 transition-all disabled:opacity-60">
          {{ saving ? 'SALVANDO...' : editingId ? 'SALVAR ALTERAÇÕES' : 'REGISTRAR GASTO' }}
        </button>
        <button v-if="editingId" type="button" class="border border-soft-stone px-8 py-4 font-label-caps text-xs text-secondary" @click="reset">CANCELAR</button>
        <p v-if="message" class="text-sm" :class="isError ? 'text-error' : 'text-secondary'" role="status">{{ message }}</p>
      </div>
    </form>

    <details v-if="!formOnly" class="border border-soft-stone p-5">
      <summary class="cursor-pointer font-label-caps text-xs text-secondary">CATEGORIAS DE GASTO</summary>
      <div class="mt-4 flex flex-wrap gap-2">
        <button v-for="c in categories" :key="c.id" type="button" class="px-3 py-2 text-xs border"
          :class="c.active ? 'border-primary text-primary' : 'border-soft-stone text-secondary line-through'"
          :title="c.active ? 'Clique para ocultar' : 'Clique para reativar'" @click="setCategoryActive(c.id, !c.active)">{{ c.name }}</button>
      </div>
      <div class="mt-4 flex gap-2">
        <input v-model="newCategory" type="text" maxlength="80" placeholder="Nova categoria" class="border border-soft-stone bg-transparent px-3 py-2 text-sm flex-1" @keydown.enter.prevent="createCategory" />
        <button type="button" class="bg-primary text-pure-white px-4 py-2 text-xs font-label-caps" @click="createCategory">ADICIONAR</button>
      </div>
      <p class="text-xs text-secondary mt-2">Categorias ocultas continuam nos gastos antigos e nos dashboards.</p>
    </details>

    <div v-if="!formOnly" class="grid lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <div class="flex flex-wrap items-end gap-4 mb-4">
          <h3 class="font-display-lg text-xl text-primary italic mr-auto">Gastos registrados</h3>
          <label class="block text-xs text-secondary">Mês
            <input v-model="month" type="month" class="block border border-soft-stone bg-transparent px-3 py-2 text-primary" aria-label="Filtrar por mês" /></label>
          <button type="button" class="text-xs underline text-secondary" @click="month = ''">Ver todos</button>
          <input v-model="search" type="search" placeholder="Buscar" class="border border-soft-stone bg-transparent px-3 py-2 text-sm" aria-label="Buscar" />
        </div>
        <p class="text-sm text-secondary mb-3">{{ month ? monthLabel(month) : 'Todo o período' }}: {{ list.length }} gasto(s), {{ formatCents(listTotal) }}</p>
        <p v-if="!list.length" class="text-sm text-secondary py-8 text-center border border-dashed border-soft-stone">Nenhum gasto encontrado.</p>
        <ul v-else class="divide-y divide-soft-stone border border-soft-stone">
          <li v-for="e in list" :key="e.id" class="p-4 flex flex-col md:flex-row md:items-center gap-3">
            <div class="md:w-28 text-sm text-secondary">{{ formatDateBR(e.spent_on) }}</div>
            <div class="flex-1 min-w-0">
              <p class="text-primary truncate">{{ e.description || e.category }}</p>
              <p class="text-xs text-secondary">{{ e.category }}<template v-if="e.supplier"> · {{ e.supplier }}</template><template v-if="e.payment_method"> · {{ PAYMENT_LABELS[e.payment_method] }}</template></p>
            </div>
            <div class="text-primary whitespace-nowrap">{{ formatCents(e.amount_cents) }}</div>
            <div class="flex gap-3 text-sm">
              <button type="button" class="underline text-secondary hover:text-primary" @click="edit(e)">Editar</button>
              <button type="button" class="underline text-secondary hover:text-error" @click="del(e)">Excluir</button>
            </div>
          </li>
        </ul>
      </div>
      <div class="border border-soft-stone p-5 h-fit">
        <h3 class="font-display-lg text-lg text-primary italic mb-4">Por categoria</h3>
        <RankedBars :items="byCategory" empty="Nenhum gasto." />
      </div>
    </div>
  </section>
</template>
