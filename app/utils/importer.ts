/**
 * UNA JOYA - Importação de planilhas (vendas e gastos)
 * Funções puras: convertem valores "do jeito brasileiro" em centavos/datas ISO,
 * sugerem o mapeamento de colunas e montam as linhas a inserir.
 */
import { isValidISODate, normalizeText, PAYMENT_LABELS, type PaymentMethod } from './finance'

export type ImportKind = 'sales' | 'expenses'
export type Cell = string | number | boolean | Date | null | undefined

export interface FieldDef { key: string; label: string; required: boolean; hints: string[] }

export const SALE_FIELDS: FieldDef[] = [
  { key: 'date', label: 'Data da venda', required: true, hints: ['data', 'dia', 'quando'] },
  { key: 'item', label: 'Produto / peça', required: true, hints: ['produto', 'peca', 'item', 'descricao', 'joia'] },
  { key: 'quantity', label: 'Quantidade', required: false, hints: ['quantidade', 'qtd', 'qtde', 'unid'] },
  { key: 'unit_price', label: 'Valor unitário', required: false, hints: ['valor unit', 'preco', 'unitario', 'valor'] },
  { key: 'total', label: 'Valor total', required: false, hints: ['total', 'valor total', 'recebido'] },
  { key: 'payment', label: 'Forma de pagamento', required: false, hints: ['pagamento', 'forma', 'pgto'] },
  { key: 'customer', label: 'Cliente', required: false, hints: ['cliente', 'nome', 'comprador'] },
  { key: 'contact', label: 'Contato / WhatsApp', required: false, hints: ['contato', 'telefone', 'whatsapp', 'celular'] },
  { key: 'note', label: 'Observação', required: false, hints: ['obs', 'observacao', 'nota'] }
]

export const EXPENSE_FIELDS: FieldDef[] = [
  { key: 'date', label: 'Data do gasto', required: true, hints: ['data', 'dia', 'vencimento'] },
  { key: 'amount', label: 'Valor', required: true, hints: ['valor', 'total', 'custo', 'preco'] },
  { key: 'category', label: 'Categoria', required: false, hints: ['categoria', 'tipo', 'grupo'] },
  { key: 'description', label: 'Descrição', required: false, hints: ['descricao', 'gasto', 'item', 'historico'] },
  { key: 'supplier', label: 'Fornecedor', required: false, hints: ['fornecedor', 'loja', 'favorecido'] },
  { key: 'payment', label: 'Forma de pagamento', required: false, hints: ['pagamento', 'forma', 'pgto'] },
  { key: 'note', label: 'Observação', required: false, hints: ['obs', 'observacao', 'nota'] }
]

export const fieldsFor = (kind: ImportKind): FieldDef[] => (kind === 'sales' ? SALE_FIELDS : EXPENSE_FIELDS)

/** "R$ 1.234,56" | "1234.56" | 12.5 -> centavos; null se não for número */
export const parseMoneyToCents = (value: Cell): number | null => {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'number') return Number.isFinite(value) ? Math.round((value + Number.EPSILON) * 100) : null
  if (typeof value !== 'string') return null
  let s = value.replace(/R\$|\s| /g, '')
  const negative = /^\(.*\)$/.test(s) || s.startsWith('-')
  s = s.replace(/[()\-]/g, '')
  if (!/^[\d.,]+$/.test(s) || !/\d/.test(s)) return null
  const lastComma = s.lastIndexOf(',')
  const lastDot = s.lastIndexOf('.')
  if (lastComma > -1 && lastDot > -1) {
    // o último separador é o decimal
    s = lastComma > lastDot ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '')
  } else if (lastComma > -1) {
    s = s.replace(/\./g, '').replace(',', '.')
  } else if (lastDot > -1) {
    // "1.234" (milhar) vs "12.5" (decimal)
    const decimals = s.length - lastDot - 1
    if (decimals === 3 && s.split('.').length >= 2 && !/^0\./.test(s)) s = s.replace(/\./g, '')
  }
  const n = Number(s)
  if (!Number.isFinite(n)) return null
  const cents = Math.round((n + Number.EPSILON) * 100)
  return negative ? -cents : cents
}

export const parseIntSafe = (value: Cell): number | null => {
  if (value === null || value === undefined || value === '') return null
  const n = typeof value === 'number' ? value : Number(String(value).replace(',', '.').trim())
  return Number.isFinite(n) ? Math.round(n) : null
}

const pad = (n: number) => String(n).padStart(2, '0')

/** dd/mm/aaaa, dd/mm/aa, aaaa-mm-dd, serial do Excel, Date -> "AAAA-MM-DD" */
export const parseDateToISO = (value: Cell): string | null => {
  if (value === null || value === undefined || value === '') return null
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`
  }
  if (typeof value === 'number') {
    if (value < 20000 || value > 80000) return null
    const d = new Date(Date.UTC(1899, 11, 30) + Math.floor(value) * 86_400_000)
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
  }
  if (typeof value !== 'string') return null
  const s = value.trim()
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  let iso: string | null = null
  if (m) iso = `${m[1]}-${pad(+m[2]!)}-${pad(+m[3]!)}`
  else if ((m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})/))) {
    const y = m[3]!.length === 2 ? 2000 + +m[3]! : +m[3]!
    iso = `${y}-${pad(+m[2]!)}-${pad(+m[1]!)}`
  }
  return iso && isValidISODate(iso) ? iso : null
}

export const guessPayment = (value: Cell): PaymentMethod | null => {
  if (value === null || value === undefined || value === '') return null
  const t = normalizeText(String(value))
  if (t.includes('pix')) return 'pix'
  if (t.includes('credito')) return 'cartao_credito'
  if (t.includes('debito')) return 'cartao_debito'
  if (t.includes('cartao')) return 'cartao_credito'
  if (t.includes('dinheiro') || t.includes('especie')) return 'dinheiro'
  if (t.includes('transf') || t.includes('ted') || t.includes('doc')) return 'transferencia'
  if (t.includes('boleto')) return 'boleto'
  const exact = (Object.keys(PAYMENT_LABELS) as PaymentMethod[]).find(k => normalizeText(PAYMENT_LABELS[k]) === t)
  return exact ?? 'outro'
}

/** Sugere coluna -> campo pelo nome do cabeçalho */
export const suggestMapping = (headers: string[], fields: FieldDef[]): Record<string, number | null> => {
  const norm = headers.map(h => normalizeText(String(h ?? '')))
  const used = new Set<number>()
  const mapping: Record<string, number | null> = {}
  for (const f of fields) {
    let found: number | null = null
    // dicas mais específicas (mais longas) primeiro
    for (const hint of [...f.hints].sort((a, b) => b.length - a.length)) {
      const idx = norm.findIndex((h, i) => !used.has(i) && h.includes(hint))
      if (idx > -1) { found = idx; break }
    }
    if (found !== null) used.add(found)
    mapping[f.key] = found
  }
  return mapping
}

export interface RowIssue { row: number; message: string }
export interface BuiltSales { rows: Record<string, unknown>[]; issues: RowIssue[] }
export interface BuiltExpenses { rows: Record<string, unknown>[]; issues: RowIssue[] }

const cellAt = (row: Cell[], idx: number | null | undefined): Cell => (idx === null || idx === undefined ? null : row[idx])
const text = (v: Cell): string | null => {
  if (v === null || v === undefined) return null
  const s = String(v).trim()
  return s ? s : null
}

/** `rows` são as linhas de dados (sem cabeçalho); `firstRowNumber` é o nº da linha na planilha */
export const buildSalesRows = (
  rows: Cell[][],
  mapping: Record<string, number | null>,
  opts: { firstRowNumber?: number; channel?: 'fora_da_loja' | 'whatsapp_site'; defaultQuantity?: number } = {}
): BuiltSales => {
  const first = opts.firstRowNumber ?? 2
  const out: Record<string, unknown>[] = []
  const issues: RowIssue[] = []
  rows.forEach((row, i) => {
    if (row.every(c => c === null || c === undefined || String(c).trim() === '')) return
    const n = first + i
    const sold_on = parseDateToISO(cellAt(row, mapping.date))
    const item = text(cellAt(row, mapping.item))
    if (!sold_on) return void issues.push({ row: n, message: 'Data inválida ou vazia' })
    if (!item) return void issues.push({ row: n, message: 'Produto vazio' })
    const quantity = parseIntSafe(cellAt(row, mapping.quantity)) ?? opts.defaultQuantity ?? 1
    if (quantity < 1 || quantity > 1000) return void issues.push({ row: n, message: 'Quantidade inválida' })
    let unit = parseMoneyToCents(cellAt(row, mapping.unit_price))
    const total = parseMoneyToCents(cellAt(row, mapping.total))
    if (unit === null && total !== null) unit = Math.round(total / quantity)
    if (unit === null || unit < 0) return void issues.push({ row: n, message: 'Valor inválido ou vazio' })
    let discount = 0
    if (total !== null && mapping.unit_price !== null && mapping.unit_price !== undefined) {
      const diff = quantity * unit - total
      if (diff > 0) discount = diff // total menor que qtd × unitário = desconto
    }
    out.push({
      sale_group: (typeof crypto !== 'undefined' && 'randomUUID' in crypto) ? crypto.randomUUID() : `${n}-${Date.now()}`,
      sold_on,
      channel: opts.channel ?? 'fora_da_loja',
      product_id: null,
      item_name: item.slice(0, 200),
      quantity,
      unit_price_cents: unit,
      discount_cents: discount,
      payment_method: guessPayment(cellAt(row, mapping.payment)),
      customer_name: text(cellAt(row, mapping.customer))?.slice(0, 120) ?? null,
      customer_contact: text(cellAt(row, mapping.contact))?.slice(0, 80) ?? null,
      note: text(cellAt(row, mapping.note))?.slice(0, 500) ?? null
    })
  })
  return { rows: out, issues }
}

export const buildExpenseRows = (
  rows: Cell[][],
  mapping: Record<string, number | null>,
  /** nome na planilha (normalizado) -> nome da categoria final */
  categoryMap: Record<string, string>,
  opts: { firstRowNumber?: number; fallbackCategory?: string } = {}
): BuiltExpenses => {
  const first = opts.firstRowNumber ?? 2
  const fallback = opts.fallbackCategory ?? 'Outros'
  const out: Record<string, unknown>[] = []
  const issues: RowIssue[] = []
  rows.forEach((row, i) => {
    if (row.every(c => c === null || c === undefined || String(c).trim() === '')) return
    const n = first + i
    const spent_on = parseDateToISO(cellAt(row, mapping.date))
    const amountRaw = parseMoneyToCents(cellAt(row, mapping.amount))
    if (!spent_on) return void issues.push({ row: n, message: 'Data inválida ou vazia' })
    if (amountRaw === null || amountRaw === 0) return void issues.push({ row: n, message: 'Valor inválido ou vazio' })
    const rawCat = text(cellAt(row, mapping.category))
    const category = rawCat ? (categoryMap[normalizeText(rawCat)] || rawCat) : fallback
    out.push({
      spent_on,
      category: category.slice(0, 80),
      description: text(cellAt(row, mapping.description))?.slice(0, 200) ?? null,
      amount_cents: Math.abs(amountRaw),
      payment_method: guessPayment(cellAt(row, mapping.payment)),
      supplier: text(cellAt(row, mapping.supplier))?.slice(0, 120) ?? null,
      note: text(cellAt(row, mapping.note))?.slice(0, 500) ?? null
    })
  })
  return { rows: out, issues }
}

/** Valores distintos de uma coluna (para mapear categorias da planilha) */
export const distinctValues = (rows: Cell[][], idx: number | null | undefined, limit = 60): string[] => {
  if (idx === null || idx === undefined) return []
  const seen = new Map<string, string>()
  for (const r of rows) {
    const t = text(r[idx])
    if (t && !seen.has(normalizeText(t))) seen.set(normalizeText(t), t)
    if (seen.size >= limit) break
  }
  return [...seen.values()]
}

/** CSV simples (aceita ; ou , e aspas) para quando não for .xlsx */
export const parseCSV = (input: string): string[][] => {
  const firstLine = input.split(/\r?\n/, 1)[0] ?? ''
  const delim = (firstLine.match(/;/g)?.length ?? 0) >= (firstLine.match(/,/g)?.length ?? 0) ? ';' : ','
  const rows: string[][] = []
  let row: string[] = []
  let cur = ''
  let inQ = false
  const text0 = input.replace(/^﻿/, '')
  for (let i = 0; i < text0.length; i++) {
    const c = text0[i]!
    if (inQ) {
      if (c === '"') { if (text0[i + 1] === '"') { cur += '"'; i++ } else inQ = false } else cur += c
    } else if (c === '"') inQ = true
    else if (c === delim) { row.push(cur); cur = '' }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text0[i + 1] === '\n') i++
      row.push(cur); cur = ''
      rows.push(row); row = []
    } else cur += c
  }
  if (cur !== '' || row.length) { row.push(cur); rows.push(row) }
  return rows.filter(r => r.some(c => c.trim() !== ''))
}
