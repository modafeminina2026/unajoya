<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import AdminSalesSection from './AdminSalesSection.vue'
import AdminExpensesSection from './AdminExpensesSection.vue'
import type { SaleRow, ExpenseRow, CatalogOption } from '~/utils/finance'
import type { SaleInput, ExpenseInput, ExpenseCategory, WhatsAppOrder } from '~/composables/admin/useAdminFinance'

const props = defineProps<{
  open: boolean
  catalog: CatalogOption[]
  whatsappOrders: WhatsAppOrder[]
  sales: SaleRow[]
  expenses: ExpenseRow[]
  categories: ExpenseCategory[]
  saveSale: (input: SaleInput, group?: string) => Promise<string | null>
  saveExpense: (input: ExpenseInput, id?: number) => Promise<string | null>
  addCategory: (name: string) => Promise<string | null>
  setCategoryActive: (id: number, active: boolean) => Promise<void>
}>()
const emit = defineEmits<{ close: [] }>()

const kind = ref<'sale' | 'expense'>('sale')
const done = ref('')
const noop = async () => null

// trava a rolagem da página enquanto a folha está aberta
watch(() => props.open, (o) => {
  if (typeof document !== 'undefined') document.body.style.overflow = o ? 'hidden' : ''
  if (o) done.value = ''
})
onBeforeUnmount(() => { if (typeof document !== 'undefined') document.body.style.overflow = '' })

const onSaved = (what: string) => {
  done.value = what
  setTimeout(() => emit('close'), 900)
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[60] flex items-end md:items-center justify-center" data-testid="quick-add-sheet">
      <div class="absolute inset-0 bg-black/40" @click="emit('close')"></div>
      <div class="relative bg-surface w-full md:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-2xl md:rounded-none shadow-2xl pb-[env(safe-area-inset-bottom)]"
        role="dialog" aria-modal="true" aria-label="Registrar">
        <div class="sticky top-0 bg-surface z-10 px-5 pt-3 pb-3 border-b border-soft-stone">
          <div class="w-10 h-1 rounded-full bg-soft-stone mx-auto mb-3 md:hidden"></div>
          <div class="flex items-center gap-2">
            <div class="flex flex-1 border border-soft-stone" role="tablist">
              <button type="button" role="tab" :aria-selected="kind === 'sale'" class="flex-1 min-h-[44px] text-sm" :class="kind === 'sale' ? 'bg-primary text-pure-white' : 'text-secondary'" @click="kind = 'sale'">Nova venda</button>
              <button type="button" role="tab" :aria-selected="kind === 'expense'" class="flex-1 min-h-[44px] text-sm" :class="kind === 'expense' ? 'bg-primary text-pure-white' : 'text-secondary'" data-testid="quick-expense" @click="kind = 'expense'">Novo gasto</button>
            </div>
            <button type="button" class="w-11 h-11 flex items-center justify-center text-primary" aria-label="Fechar" @click="emit('close')">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>
        <p v-if="done" class="m-5 p-4 bg-[#e6f4ec] text-[#1f6b45] text-sm" role="status">{{ done }}</p>
        <div v-else class="p-5">
          <AdminSalesSection v-if="kind === 'sale'" form-only :sales="sales" :catalog="catalog" :whatsapp-orders="whatsappOrders" :save="saveSale" :remove="noop" @saved="onSaved('Venda registrada!')" />
          <AdminExpensesSection v-else form-only :expenses="expenses" :categories="categories" :save="saveExpense" :remove="noop"
            :add-category="addCategory" :set-category-active="setCategoryActive" @saved="onSaved('Gasto registrado!')" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
