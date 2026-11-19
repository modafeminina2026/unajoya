<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  fieldsFor, suggestMapping, buildSalesRows, buildExpenseRows, distinctValues, parseCSV,
  type ImportKind, type Cell
} from '~/utils/importer'
import { formatCents, formatDateBR, normalizeText, CHANNEL_LABELS, PAYMENT_LABELS, type Channel, type PaymentMethod } from '~/utils/finance'
import type { ExpenseCategory } from '~/composables/admin/useAdminFinance'

const props = defineProps<{
  categories: ExpenseCategory[]
  importRows: (kind: ImportKind, rows: Record<string, unknown>[]) => Promise<{ batch: string; inserted: number; error: string | null }>
  undoImport: (kind: ImportKind, batch: string) => Promise<string | null>
  addCategory: (name: string) => Promise<string | null>
}>()

const kind = ref<ImportKind>('sales')
const fileName = ref('')
const sheets = ref<{ sheet: string; data: Cell[][] }[]>([])
const sheetIndex = ref(0)
const headerRow = ref(1)
const mapping = ref<Record<string, number | null>>({})
const channel = ref<Channel>('fora_da_loja')
const categoryMap = ref<Record<string, string>>({}) // valor normalizado -> categoria final
const busy = ref(false)
const message = ref('')
const isError = ref(false)
const lastImport = ref<{ kind: ImportKind; batch: string; inserted: number } | null>(null)

const fields = computed(() => fieldsFor(kind.value))
const data = computed<Cell[][]>(() => sheets.value[sheetIndex.value]?.data ?? [])
const headers = computed(() => (data.value[headerRow.value - 1] ?? []).map((h, i) => (h === null || h === undefined || h === '' ? `Coluna ${i + 1}` : String(h))))
const body = computed(() => data.value.slice(headerRow.value))

const autoMap = () => { mapping.value = suggestMapping(headers.value, fields.value) }
watch([kind, headers], autoMap)

const onFile = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  message.value = ''; isError.value = false; lastImport.value = null
  busy.value = true
  try {
    fileName.value = file.name
    if (/\.csv$|\.txt$/i.test(file.name)) {
      sheets.value = [{ sheet: 'CSV', data: parseCSV(await file.text()) }]
    } else if (/\.xlsx$/i.test(file.name)) {
      const { default: readExcel } = await import('read-excel-file/browser')
      const result = await readExcel(file)
      sheets.value = result.map((s: { sheet: string; data: Cell[][] }) => ({ sheet: s.sheet, data: s.data }))
    } else {
      throw new Error('formato')
    }
    sheetIndex.value = 0
    headerRow.value = 1
    autoMap()
  } catch (err) {
    console.error(err)
    sheets.value = []
    isError.value = true
    message.value = 'Não consegui ler o arquivo. Use .xlsx (Excel) ou .csv. Arquivos .xls antigos: abra no Excel e salve como .xlsx.'
  } finally {
    busy.value = false
  }
}

// categorias da planilha -> categorias do painel
const sheetCategories = computed(() => (kind.value === 'expenses' ? distinctValues(body.value, mapping.value.category) : []))
watch(sheetCategories, (vals) => {
  const next: Record<string, string> = {}
  for (const v of vals) {
    const n = normalizeText(v)
    const match = props.categories.find(c => normalizeText(c.name) === n || normalizeText(c.name).startsWith(n) || n.startsWith(normalizeText(c.name)))
    next[n] = categoryMap.value[n] ?? (match ? match.name : v)
  }
  categoryMap.value = next
}, { immediate: true })

const built = computed(() => {
  if (!body.value.length) return { rows: [], issues: [] }
  return kind.value === 'sales'
    ? buildSalesRows(body.value, mapping.value, { firstRowNumber: headerRow.value + 1, channel: channel.value })
    : buildExpenseRows(body.value, mapping.value, categoryMap.value, { firstRowNumber: headerRow.value + 1 })
})
const missingRequired = computed(() => fields.value.filter(f => f.required && (mapping.value[f.key] === null || mapping.value[f.key] === undefined)))
const salesNeedValue = computed(() => kind.value === 'sales' && mapping.value.unit_price == null && mapping.value.total == null)
const totalCents = computed(() => built.value.rows.reduce((s, r) => s + (kind.value === 'sales'
  ? (r.quantity as number) * (r.unit_price_cents as number) - (r.discount_cents as number)
  : (r.amount_cents as number)), 0))
const preview = computed(() => built.value.rows.slice(0, 8))

const runImport = async () => {
  if (!built.value.rows.length) return
  if (!confirm(`Importar ${built.value.rows.length} linha(s) de ${kind.value === 'sales' ? 'vendas' : 'gastos'}? ${built.value.issues.length ? `${built.value.issues.length} linha(s) com problema serão ignoradas.` : ''}`)) return
  busy.value = true; message.value = ''; isError.value = false
  try {
    if (kind.value === 'expenses') {
      const existing = new Set(props.categories.map(c => normalizeText(c.name)))
      const toCreate = [...new Set(built.value.rows.map(r => String(r.category)))].filter(n => !existing.has(normalizeText(n)))
      for (const name of toCreate) await props.addCategory(name)
    }
    const res = await props.importRows(kind.value, built.value.rows)
    lastImport.value = { kind: kind.value, batch: res.batch, inserted: res.inserted }
    isError.value = !!res.error
    message.value = res.error ?? `${res.inserted} linha(s) importadas. Elas já aparecem nos dashboards.`
  } finally {
    busy.value = false
  }
}

const undo = async () => {
  if (!lastImport.value || !confirm('Desfazer a última importação? As linhas importadas serão apagadas.')) return
  busy.value = true
  const err = await props.undoImport(lastImport.value.kind, lastImport.value.batch)
  busy.value = false
  isError.value = !!err
  message.value = err ?? 'Importação desfeita.'
  if (!err) lastImport.value = null
}

const downloadTemplate = () => {
  const csv = kind.value === 'sales'
    ? 'Data;Peça;Quantidade;Valor unitário;Valor total;Pagamento;Cliente;Contato;Observação\n05/11/2026;Colar Pérola;1;189,90;189,90;Pix;Maria;11999999999;\n'
    : 'Data;Valor;Categoria;Descrição;Fornecedor;Pagamento;Observação\n05/11/2026;45,00;Embalagens;Caixinhas;Loja X;Pix;\n'
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url; a.download = kind.value === 'sales' ? 'modelo-vendas.csv' : 'modelo-gastos.csv'; a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <section class="space-y-8 max-w-5xl">
    <p class="text-sm text-secondary">Traga a planilha que você usa hoje. Você escolhe o que cada coluna significa, confere uma prévia e só então importa. Dá para desfazer.</p>

    <!-- 1. Tipo e arquivo -->
    <div class="border border-soft-stone p-5 space-y-4">
      <p class="font-label-caps text-[11px] text-secondary">1. O QUE VOCÊ VAI IMPORTAR?</p>
      <div class="flex flex-wrap gap-2">
        <button type="button" class="px-4 py-2 text-xs border" :class="kind === 'sales' ? 'bg-primary text-pure-white border-primary' : 'border-soft-stone text-secondary'" @click="kind = 'sales'">Vendas</button>
        <button type="button" class="px-4 py-2 text-xs border" :class="kind === 'expenses' ? 'bg-primary text-pure-white border-primary' : 'border-soft-stone text-secondary'" @click="kind = 'expenses'">Gastos</button>
        <button type="button" class="text-xs underline text-secondary ml-auto" @click="downloadTemplate">Baixar planilha modelo</button>
      </div>
      <label class="block">
        <span class="text-sm text-primary">Arquivo (.xlsx ou .csv)</span>
        <input type="file" accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" class="block mt-2 text-sm" @change="onFile" />
      </label>
      <p v-if="busy" class="text-sm text-secondary">Processando...</p>
    </div>

    <template v-if="sheets.length">
      <!-- 2. Aba e cabeçalho -->
      <div class="border border-soft-stone p-5 flex flex-wrap gap-6">
        <p class="font-label-caps text-[11px] text-secondary w-full">2. ONDE ESTÃO OS DADOS · {{ fileName }}</p>
        <label v-if="sheets.length > 1" class="text-sm">Aba
          <select v-model.number="sheetIndex" class="block border border-soft-stone bg-transparent px-3 py-2 mt-1">
            <option v-for="(s, i) in sheets" :key="s.sheet" :value="i">{{ s.sheet }}</option>
          </select></label>
        <label class="text-sm">Linha do cabeçalho
          <input v-model.number="headerRow" type="number" min="1" :max="Math.max(1, data.length)" class="block border border-soft-stone bg-transparent px-3 py-2 mt-1 w-24" /></label>
        <label v-if="kind === 'sales'" class="text-sm">Origem dessas vendas
          <select v-model="channel" class="block border border-soft-stone bg-transparent px-3 py-2 mt-1">
            <option v-for="(label, key) in CHANNEL_LABELS" :key="key" :value="key">{{ label }}</option>
          </select></label>
        <p class="text-sm text-secondary self-end">{{ body.length }} linha(s) abaixo do cabeçalho</p>
      </div>

      <!-- 3. Colunas -->
      <div class="border border-soft-stone p-5 space-y-4">
        <p class="font-label-caps text-[11px] text-secondary">3. O QUE É CADA COLUNA</p>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <label v-for="f in fields" :key="f.key" class="block text-sm">
            {{ f.label }}<span v-if="f.required" class="text-error"> *</span>
            <select v-model="mapping[f.key]" class="block w-full border border-soft-stone bg-transparent px-3 py-2 mt-1" :data-field="f.key">
              <option :value="null">— não tem —</option>
              <option v-for="(h, i) in headers" :key="i" :value="i">{{ h }}<template v-if="body[0] && body[0][i] !== null && body[0][i] !== undefined"> (ex.: {{ String(body[0][i]).slice(0, 24) }})</template></option>
            </select>
          </label>
        </div>
        <p v-if="missingRequired.length" class="text-sm text-error">Escolha a coluna de: {{ missingRequired.map(f => f.label).join(', ') }}.</p>
        <p v-if="salesNeedValue" class="text-sm text-error">Escolha a coluna de valor unitário ou de valor total.</p>
        <p v-if="kind === 'sales'" class="text-xs text-secondary">Sem coluna de quantidade, cada linha conta como 1 peça. Se só houver o total, o valor unitário é calculado.</p>
      </div>

      <!-- 4. Categorias (gastos) -->
      <div v-if="kind === 'expenses' && sheetCategories.length" class="border border-soft-stone p-5 space-y-3">
        <p class="font-label-caps text-[11px] text-secondary">4. CATEGORIAS DA PLANILHA → CATEGORIAS DO PAINEL</p>
        <div v-for="v in sheetCategories" :key="v" class="grid sm:grid-cols-2 gap-3 items-center text-sm">
          <span class="text-primary">{{ v }}</span>
          <select v-model="categoryMap[normalizeText(v)]" class="border border-soft-stone bg-transparent px-3 py-2">
            <option :value="v">Criar/usar "{{ v }}"</option>
            <option v-for="c in categories" :key="c.id" :value="c.name">{{ c.name }}</option>
          </select>
        </div>
        <p class="text-xs text-secondary">Linhas sem categoria vão para "Outros".</p>
      </div>

      <!-- 5. Prévia -->
      <div class="border border-soft-stone p-5 space-y-4">
        <p class="font-label-caps text-[11px] text-secondary">{{ kind === 'expenses' && sheetCategories.length ? '5' : '4' }}. PRÉVIA</p>
        <p class="text-sm text-primary" data-testid="import-summary">
          {{ built.rows.length }} linha(s) prontas · total {{ formatCents(totalCents) }}
          <template v-if="built.issues.length"> · <span class="text-error">{{ built.issues.length }} com problema (serão ignoradas)</span></template>
        </p>
        <div v-if="preview.length" class="overflow-x-auto border border-soft-stone">
          <table class="w-full text-sm">
            <thead class="bg-soft-stone/30 text-secondary text-left">
              <tr v-if="kind === 'sales'"><th class="p-2">Data</th><th class="p-2">Peça</th><th class="p-2 text-right">Qtd</th><th class="p-2 text-right">Unitário</th><th class="p-2 text-right">Desconto</th><th class="p-2">Pagamento</th><th class="p-2">Cliente</th></tr>
              <tr v-else><th class="p-2">Data</th><th class="p-2 text-right">Valor</th><th class="p-2">Categoria</th><th class="p-2">Descrição</th><th class="p-2">Fornecedor</th></tr>
            </thead>
            <tbody>
              <tr v-for="(r, i) in preview" :key="i" class="border-t border-soft-stone">
                <template v-if="kind === 'sales'">
                  <td class="p-2">{{ formatDateBR(String(r.sold_on)) }}</td><td class="p-2">{{ r.item_name }}</td><td class="p-2 text-right">{{ r.quantity }}</td>
                  <td class="p-2 text-right">{{ formatCents(r.unit_price_cents as number) }}</td><td class="p-2 text-right">{{ formatCents(r.discount_cents as number) }}</td>
                  <td class="p-2">{{ r.payment_method ? PAYMENT_LABELS[r.payment_method as PaymentMethod] : '—' }}</td><td class="p-2">{{ r.customer_name || '—' }}</td>
                </template>
                <template v-else>
                  <td class="p-2">{{ formatDateBR(String(r.spent_on)) }}</td><td class="p-2 text-right">{{ formatCents(r.amount_cents as number) }}</td>
                  <td class="p-2">{{ r.category }}</td><td class="p-2">{{ r.description || '—' }}</td><td class="p-2">{{ r.supplier || '—' }}</td>
                </template>
              </tr>
            </tbody>
          </table>
        </div>
        <details v-if="built.issues.length" class="text-sm">
          <summary class="cursor-pointer text-secondary">Ver linhas com problema</summary>
          <ul class="mt-2 max-h-48 overflow-auto text-secondary">
            <li v-for="iss in built.issues.slice(0, 200)" :key="iss.row">Linha {{ iss.row }}: {{ iss.message }}</li>
          </ul>
        </details>
        <button type="button" :disabled="busy || !built.rows.length || missingRequired.length > 0 || salesNeedValue"
          class="bg-primary text-pure-white px-8 py-4 font-label-caps text-xs hover:bg-deep-onyx active:scale-95 transition-all disabled:opacity-50" @click="runImport">
          IMPORTAR {{ built.rows.length }} LINHA(S)
        </button>
      </div>
    </template>

    <div v-if="message || lastImport" class="flex flex-wrap items-center gap-4">
      <p v-if="message" class="text-sm" :class="isError ? 'text-error' : 'text-primary'" role="status">{{ message }}</p>
      <button v-if="lastImport" type="button" class="text-sm underline text-secondary hover:text-error" @click="undo">Desfazer esta importação</button>
    </div>
  </section>
</template>
