import { ref, computed } from 'vue'
import { useSupabase } from '~/composables/useSupabase'
import type { SaleRow, ExpenseRow, Channel, PaymentMethod } from '~/utils/finance'

export interface ExpenseCategory { id: number; name: string; active: boolean; sort_order: number }
export interface WhatsAppOrderItem { product_id: number; name: string; quantity: number; unit_price_cents: number; line_total_cents: number }
export interface WhatsAppOrder {
  id: number
  code: string
  created_at: string
  customer_name: string | null
  note: string | null
  items: WhatsAppOrderItem[]
  subtotal_cents: number
  status: 'novo' | 'em_conversa' | 'fechado' | 'perdido'
  admin_note: string | null
  origin: string | null
}

export interface SaleLineInput {
  product_id: number | null
  item_name: string
  quantity: number
  unit_price_cents: number
  discount_cents: number
}
export interface SaleInput {
  sold_on: string
  channel: Channel
  channel_detail: string | null
  payment_method: PaymentMethod | null
  customer_name: string | null
  customer_contact: string | null
  whatsapp_order_id: number | null
  note: string | null
  lines: SaleLineInput[]
}
export type ExpenseInput = Omit<ExpenseRow, 'id' | 'import_batch' | 'created_at'>

const PAGE = 1000
const CHUNK = 200

export const useAdminFinance = () => {
  const { client } = useSupabase()

  const sales = ref<SaleRow[]>([])
  const expenses = ref<ExpenseRow[]>([])
  const expenseCategories = ref<ExpenseCategory[]>([])
  const whatsappOrders = ref<WhatsAppOrder[]>([])
  /** meta de receita por mês: { '2026-11': 500000 } (centavos) */
  const goals = ref<Record<string, number>>({})
  const loading = ref(false)
  const lastError = ref('')

  const fetchAllRows = async <T>(table: string, orderCol: string): Promise<T[]> => {
    const rows: T[] = []
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await client.from(table).select('*').order(orderCol, { ascending: false }).order('id', { ascending: false }).range(from, from + PAGE - 1)
      if (error) throw error
      rows.push(...((data || []) as T[]))
      if (!data || data.length < PAGE) break
    }
    return rows
  }

  const fetchAll = async () => {
    loading.value = true
    lastError.value = ''
    try {
      const [s, e, c, w, g] = await Promise.all([
        fetchAllRows<SaleRow>('sales', 'sold_on'),
        fetchAllRows<ExpenseRow>('expenses', 'spent_on'),
        client.from('expense_categories').select('*').order('sort_order').order('name'),
        fetchAllRows<WhatsAppOrder>('whatsapp_orders', 'created_at'),
        client.from('finance_goals').select('month, revenue_goal_cents')
      ])
      goals.value = Object.fromEntries(((g.data || []) as { month: string; revenue_goal_cents: number }[]).map(r => [r.month, Number(r.revenue_goal_cents)]))
      sales.value = s
      expenses.value = e
      if (c.error) throw c.error
      expenseCategories.value = (c.data || []) as ExpenseCategory[]
      whatsappOrders.value = w
    } catch (err) {
      console.error('Erro ao carregar dados financeiros:', err)
      lastError.value = 'Não foi possível carregar vendas e gastos.'
    } finally {
      loading.value = false
    }
  }

  const activeExpenseCategories = computed(() => expenseCategories.value.filter(c => c.active))

  const newUuid = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`)

  const clean = (v: string | null | undefined) => (v && v.trim() ? v.trim() : null)

  const saleToRows = (input: SaleInput, group: string) =>
    input.lines.map(l => ({
      sale_group: group,
      sold_on: input.sold_on,
      channel: input.channel,
      channel_detail: clean(input.channel_detail),
      product_id: l.product_id,
      item_name: l.item_name.trim(),
      quantity: l.quantity,
      unit_price_cents: l.unit_price_cents,
      discount_cents: l.discount_cents,
      payment_method: input.payment_method,
      customer_name: clean(input.customer_name),
      customer_contact: clean(input.customer_contact),
      whatsapp_order_id: input.whatsapp_order_id,
      note: clean(input.note)
    }))

  /** Cria (ou, com `group`, substitui) uma venda com várias linhas. Retorna mensagem de erro ou null. */
  const saveSale = async (input: SaleInput, group?: string): Promise<string | null> => {
    if (!input.lines.length) return 'Adicione pelo menos um item.'
    const g = group ?? newUuid()
    if (group) {
      const { error: delErr } = await client.from('sales').delete().eq('sale_group', group)
      if (delErr) return 'Não foi possível atualizar a venda.'
    }
    const { error } = await client.from('sales').insert(saleToRows(input, g))
    if (error) return 'Não foi possível salvar a venda. Confira os valores.'
    if (input.whatsapp_order_id) {
      await client.from('whatsapp_orders').update({ status: 'fechado' }).eq('id', input.whatsapp_order_id)
    }
    await fetchAll()
    return null
  }

  const deleteSale = async (group: string): Promise<string | null> => {
    const { error } = await client.from('sales').delete().eq('sale_group', group)
    if (error) return 'Não foi possível excluir a venda.'
    await fetchAll()
    return null
  }

  const saveExpense = async (input: ExpenseInput, id?: number): Promise<string | null> => {
    const payload = {
      spent_on: input.spent_on,
      category: input.category.trim(),
      description: clean(input.description),
      amount_cents: input.amount_cents,
      payment_method: input.payment_method,
      supplier: clean(input.supplier),
      note: clean(input.note)
    }
    const { error } = id
      ? await client.from('expenses').update(payload).eq('id', id)
      : await client.from('expenses').insert(payload)
    if (error) return 'Não foi possível salvar o gasto.'
    await fetchAll()
    return null
  }

  const deleteExpense = async (id: number): Promise<string | null> => {
    const { error } = await client.from('expenses').delete().eq('id', id)
    if (error) return 'Não foi possível excluir o gasto.'
    await fetchAll()
    return null
  }

  const addExpenseCategory = async (name: string): Promise<string | null> => {
    const n = name.trim()
    if (!n) return 'Digite o nome da categoria.'
    const { error } = await client.from('expense_categories').insert({ name: n, sort_order: expenseCategories.value.length + 1 })
    if (error) return error.code === '23505' ? 'Essa categoria já existe.' : 'Não foi possível criar a categoria.'
    await fetchAll()
    return null
  }

  const setExpenseCategoryActive = async (id: number, active: boolean) => {
    await client.from('expense_categories').update({ active }).eq('id', id)
    await fetchAll()
  }

  const updateWhatsAppOrder = async (id: number, patch: Partial<Pick<WhatsAppOrder, 'status' | 'admin_note'>>): Promise<string | null> => {
    const { error } = await client.from('whatsapp_orders').update(patch).eq('id', id)
    if (error) return 'Não foi possível atualizar o contato.'
    await fetchAll()
    return null
  }

  const deleteWhatsAppOrder = async (id: number): Promise<string | null> => {
    const { error } = await client.from('whatsapp_orders').delete().eq('id', id)
    if (error) return 'Não foi possível excluir o contato.'
    await fetchAll()
    return null
  }

  /** Define (ou apaga, com null) a meta de receita de um mês "AAAA-MM" */
  const saveGoal = async (month: string, cents: number | null): Promise<string | null> => {
    const { error } = cents && cents > 0
      ? await client.from('finance_goals').upsert({ month, revenue_goal_cents: cents, updated_at: new Date().toISOString() })
      : await client.from('finance_goals').delete().eq('month', month)
    if (error) return 'Não foi possível salvar a meta.'
    const next = { ...goals.value }
    if (cents && cents > 0) next[month] = cents
    else delete next[month]
    goals.value = next
    return null
  }

  /** Importação em lotes; retorna { inserted, error } */
  const importRows = async (kind: 'sales' | 'expenses', rows: Record<string, unknown>[]): Promise<{ batch: string; inserted: number; error: string | null }> => {
    const batch = newUuid()
    let inserted = 0
    for (let i = 0; i < rows.length; i += CHUNK) {
      const chunk = rows.slice(i, i + CHUNK).map(r => ({ ...r, import_batch: batch }))
      const { error } = await client.from(kind).insert(chunk)
      if (error) {
        await fetchAll()
        return { batch, inserted, error: `Falhou na linha ${i + 1}. As ${inserted} linhas anteriores foram importadas (dá para desfazer).` }
      }
      inserted += chunk.length
    }
    await fetchAll()
    return { batch, inserted, error: null }
  }

  const undoImport = async (kind: 'sales' | 'expenses', batch: string): Promise<string | null> => {
    const { error } = await client.from(kind).delete().eq('import_batch', batch)
    if (error) return 'Não foi possível desfazer a importação.'
    await fetchAll()
    return null
  }

  return {
    sales, expenses, expenseCategories, activeExpenseCategories, whatsappOrders, goals, loading, lastError, saveGoal,
    fetchAll, saveSale, deleteSale, saveExpense, deleteExpense, addExpenseCategory, setExpenseCategoryActive,
    updateWhatsAppOrder, deleteWhatsAppOrder, importRows, undoImport
  }
}
