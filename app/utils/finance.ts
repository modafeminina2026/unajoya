/**
 * UNA JOYA - Cálculos financeiros do painel (vendas x gastos)
 * Funções puras, sem Vue/Nuxt, trabalhando com datas ISO "AAAA-MM-DD" (sem fuso horário)
 * e valores em centavos (inteiros) para não acumular erro de arredondamento.
 */

export type Channel = 'whatsapp_site' | 'fora_da_loja'
export type PaymentMethod = 'pix' | 'cartao_credito' | 'cartao_debito' | 'dinheiro' | 'transferencia' | 'boleto' | 'outro'

export const CHANNEL_LABELS: Record<Channel, string> = {
  whatsapp_site: 'WhatsApp (site)',
  fora_da_loja: 'Fora da loja'
}

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  pix: 'Pix',
  cartao_credito: 'Cartão de crédito',
  cartao_debito: 'Cartão de débito',
  dinheiro: 'Dinheiro',
  transferencia: 'Transferência',
  boleto: 'Boleto',
  outro: 'Outro'
}

export const PAYMENT_OPTIONS = Object.keys(PAYMENT_LABELS) as PaymentMethod[]

export interface SaleRow {
  id: number
  sale_group: string
  sold_on: string
  channel: Channel
  channel_detail: string | null
  product_id: number | null
  item_name: string
  quantity: number
  unit_price_cents: number
  discount_cents: number
  payment_method: PaymentMethod | null
  customer_name: string | null
  customer_contact: string | null
  whatsapp_order_id: number | null
  note: string | null
  import_batch?: string | null
  created_at?: string
}

export interface ExpenseRow {
  id: number
  spent_on: string
  category: string
  description: string | null
  amount_cents: number
  payment_method: PaymentMethod | null
  supplier: string | null
  note: string | null
  import_batch?: string | null
  created_at?: string
}

/* ------------------------------------------------------------------ valores */

export const saleLineTotalCents = (s: Pick<SaleRow, 'quantity' | 'unit_price_cents' | 'discount_cents'>): number =>
  s.quantity * s.unit_price_cents - s.discount_cents

/** Texto digitado ou número em reais -> centavos (inteiro) */
export const reaisToCents = (value: number): number => Math.round((value + Number.EPSILON) * 100)

export const formatCents = (cents: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
    .format((cents || 0) / 100)
    .replace(/ /g, ' ')

/** 12,5 mil / 1,2 mi para eixos e cartões estreitos */
export const formatCompactCents = (cents: number): string => {
  const reais = Math.abs(cents) / 100
  const sign = cents < 0 ? '-' : ''
  if (reais >= 1_000_000) return `${sign}R$ ${(reais / 1_000_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mi`
  if (reais >= 1_000) return `${sign}R$ ${(reais / 1_000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil`
  return `${sign}R$ ${reais.toLocaleString('pt-BR', { maximumFractionDigits: reais % 1 ? 2 : 0, minimumFractionDigits: reais % 1 ? 2 : 0 })}`
}

/** Variação percentual; null quando não há base de comparação */
export const pctChange = (current: number, previous: number): number | null => {
  if (!previous) return current ? null : 0
  return ((current - previous) / Math.abs(previous)) * 100
}

/* -------------------------------------------------------------------- datas */

const pad = (n: number) => String(n).padStart(2, '0')
const DAY_MS = 86_400_000

const parts = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number]
  return { y, m, d }
}
const toUTC = (iso: string) => {
  const { y, m, d } = parts(iso)
  return Date.UTC(y, m - 1, d)
}
const fromUTC = (ms: number) => {
  const dt = new Date(ms)
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`
}
const daysInMonth = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate()

export const isValidISODate = (iso: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false
  const { y, m, d } = parts(iso)
  return m >= 1 && m <= 12 && d >= 1 && d <= daysInMonth(y, m)
}

export const todayISO = (now: Date = new Date()): string =>
  `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`

export const addDays = (iso: string, n: number): string => fromUTC(toUTC(iso) + n * DAY_MS)
export const daysBetween = (a: string, b: string): number => Math.round((toUTC(b) - toUTC(a)) / DAY_MS)

/** Soma meses mantendo o dia (31/03 + 1 mês = 28/02) */
export const addMonths = (iso: string, n: number): string => {
  const { y, m, d } = parts(iso)
  const idx = y * 12 + (m - 1) + n
  const ny = Math.floor(idx / 12)
  const nm = (idx % 12) + 1
  return `${ny}-${pad(nm)}-${pad(Math.min(d, daysInMonth(ny, nm)))}`
}

/** Segunda-feira da semana da data */
export const startOfWeek = (iso: string): string => {
  const dow = new Date(toUTC(iso)).getUTCDay() // 0 = domingo
  return addDays(iso, -((dow + 6) % 7))
}

export const startOfMonth = (iso: string): string => `${iso.slice(0, 7)}-01`
export const endOfMonth = (iso: string): string => {
  const { y, m } = parts(iso)
  return `${y}-${pad(m)}-${pad(daysInMonth(y, m))}`
}
export const startOfQuarter = (iso: string): string => {
  const { y, m } = parts(iso)
  return `${y}-${pad(Math.floor((m - 1) / 3) * 3 + 1)}-01`
}
export const endOfQuarter = (iso: string): string => endOfMonth(addMonths(startOfQuarter(iso), 2))

const MONTHS_LONG = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']
const MONTHS_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

export const formatDateBR = (iso: string): string => {
  const { y, m, d } = parts(iso)
  return `${pad(d)}/${pad(m)}/${y}`
}
export const monthLabel = (ym: string): string => {
  const [y, m] = ym.split('-').map(Number) as [number, number]
  return `${MONTHS_LONG[m - 1]} de ${y}`
}
/** "AAAA-MM" de uma data ISO */
export const monthOf = (iso: string): string => iso.slice(0, 7)

/* ------------------------------------------------------------------ períodos */

export type PeriodPreset = 'today' | 'week' | '7d' | '30d' | 'month' | 'quarter' | 'year' | 'custom'
export type Granularity = 'day' | 'week' | 'month' | 'year'

export interface Period {
  from: string
  to: string
  preset: PeriodPreset
}

export const PRESET_LABELS: Record<PeriodPreset, string> = {
  today: 'Hoje',
  week: 'Esta semana',
  '7d': '7 dias',
  '30d': '30 dias',
  month: 'Mês',
  quarter: 'Trimestre',
  year: 'Ano',
  custom: 'Personalizado'
}

/** Presets que têm setas "anterior / próximo" (unidades de calendário) */
export const isCalendarPreset = (p: PeriodPreset): boolean => p === 'month' || p === 'quarter' || p === 'year'

export const resolvePeriod = (
  preset: PeriodPreset,
  today: string,
  anchor: string = today,
  custom?: { from: string; to: string }
): Period => {
  switch (preset) {
    case 'today': return { from: today, to: today, preset }
    case 'week': return { from: startOfWeek(today), to: today, preset }
    case '7d': return { from: addDays(today, -6), to: today, preset }
    case '30d': return { from: addDays(today, -29), to: today, preset }
    case 'month': return { from: startOfMonth(anchor), to: endOfMonth(anchor), preset }
    case 'quarter': return { from: startOfQuarter(anchor), to: endOfQuarter(anchor), preset }
    case 'year': return { from: `${anchor.slice(0, 4)}-01-01`, to: `${anchor.slice(0, 4)}-12-31`, preset }
    default: {
      const from = custom?.from && isValidISODate(custom.from) ? custom.from : addDays(today, -29)
      const to = custom?.to && isValidISODate(custom.to) ? custom.to : today
      return from <= to ? { from, to, preset: 'custom' } : { from: to, to: from, preset: 'custom' }
    }
  }
}

/** Move a âncora de um preset de calendário (mês/trimestre/ano) */
export const shiftAnchor = (preset: PeriodPreset, anchor: string, direction: -1 | 1): string => {
  if (preset === 'month') return addMonths(startOfMonth(anchor), direction)
  if (preset === 'quarter') return addMonths(startOfQuarter(anchor), direction * 3)
  if (preset === 'year') return addMonths(`${anchor.slice(0, 4)}-01-01`, direction * 12)
  return anchor
}

/**
 * Período de comparação: a mesma janela, imediatamente antes.
 * Mês/trimestre/ano em andamento comparam só os dias já decorridos (justo com o anterior).
 */
export const previousPeriod = (period: Period, today: string): Period => {
  const effTo = period.to > today && period.from <= today ? today : period.to
  switch (period.preset) {
    case 'month': return { preset: period.preset, from: addMonths(period.from, -1), to: addMonths(effTo, -1) }
    case 'quarter': return { preset: period.preset, from: addMonths(period.from, -3), to: addMonths(effTo, -3) }
    case 'year': return { preset: period.preset, from: addMonths(period.from, -12), to: addMonths(effTo, -12) }
    case 'week': return { preset: period.preset, from: addDays(period.from, -7), to: addDays(effTo, -7) }
    default: {
      const len = daysBetween(period.from, effTo) + 1
      return { preset: period.preset, from: addDays(period.from, -len), to: addDays(period.from, -1) }
    }
  }
}

export const periodLabel = (period: Period): string => {
  const { from, to, preset } = period
  if (preset === 'month') return monthLabel(monthOf(from))
  if (preset === 'quarter') return `${Math.floor((parts(from).m - 1) / 3) + 1}º trimestre de ${parts(from).y}`
  if (preset === 'year') return String(parts(from).y)
  return from === to ? formatDateBR(from) : `${formatDateBR(from)} a ${formatDateBR(to)}`
}

export const suggestGranularity = (period: Period): Granularity => {
  const days = daysBetween(period.from, period.to) + 1
  if (days <= 45) return 'day'
  if (days <= 120) return 'week'
  if (days <= 800) return 'month'
  return 'year'
}

export const GRANULARITY_LABELS: Record<Granularity, string> = { day: 'Dia', week: 'Semana', month: 'Mês', year: 'Ano' }

/* ----------------------------------------------------------------- agregação */

export const bucketKey = (iso: string, gran: Granularity): string => {
  if (gran === 'day') return iso
  if (gran === 'week') return startOfWeek(iso)
  if (gran === 'month') return iso.slice(0, 7)
  return iso.slice(0, 4)
}

export const bucketLabel = (key: string, gran: Granularity): string => {
  if (gran === 'year') return key
  if (gran === 'month') {
    const [y, m] = key.split('-').map(Number) as [number, number]
    return `${MONTHS_SHORT[m - 1]}/${String(y).slice(2)}`
  }
  const { m, d } = parts(key)
  return `${pad(d)}/${pad(m)}`
}

export const bucketTitle = (key: string, gran: Granularity): string => {
  if (gran === 'day') return formatDateBR(key)
  if (gran === 'week') return `Semana de ${formatDateBR(key)}`
  if (gran === 'month') return monthLabel(key)
  return key
}

export interface Bucket {
  key: string
  label: string
  title: string
  revenueCents: number
  expensesCents: number
  resultCents: number
  salesCount: number
  itemsCount: number
}

export const bucketKeysBetween = (from: string, to: string, gran: Granularity): string[] => {
  const keys: string[] = []
  let cursor = from
  let guard = 0
  while (cursor <= to && guard++ < 4000) {
    const key = bucketKey(cursor, gran)
    if (keys[keys.length - 1] !== key) keys.push(key)
    cursor = addDays(cursor, 1)
  }
  return keys
}

export const buildSeries = (
  sales: SaleRow[],
  expenses: ExpenseRow[],
  period: Pick<Period, 'from' | 'to'>,
  gran: Granularity
): Bucket[] => {
  const map = new Map<string, Bucket & { groups: Set<string> }>()
  for (const key of bucketKeysBetween(period.from, period.to, gran)) {
    map.set(key, {
      key,
      label: bucketLabel(key, gran),
      title: bucketTitle(key, gran),
      revenueCents: 0,
      expensesCents: 0,
      resultCents: 0,
      salesCount: 0,
      itemsCount: 0,
      groups: new Set()
    })
  }
  for (const s of sales) {
    if (s.sold_on < period.from || s.sold_on > period.to) continue
    const b = map.get(bucketKey(s.sold_on, gran))
    if (!b) continue
    b.revenueCents += saleLineTotalCents(s)
    b.itemsCount += s.quantity
    b.groups.add(s.sale_group)
  }
  for (const e of expenses) {
    if (e.spent_on < period.from || e.spent_on > period.to) continue
    const b = map.get(bucketKey(e.spent_on, gran))
    if (b) b.expensesCents += e.amount_cents
  }
  return [...map.values()].map(({ groups, ...b }) => ({
    ...b,
    salesCount: groups.size,
    resultCents: b.revenueCents - b.expensesCents
  }))
}

export interface Summary {
  revenueCents: number
  expensesCents: number
  resultCents: number
  salesCount: number
  itemsCount: number
  avgTicketCents: number
}

export const summarize = (
  sales: SaleRow[],
  expenses: ExpenseRow[],
  period: Pick<Period, 'from' | 'to'>
): Summary => {
  let revenueCents = 0
  let itemsCount = 0
  const groups = new Set<string>()
  for (const s of sales) {
    if (s.sold_on < period.from || s.sold_on > period.to) continue
    revenueCents += saleLineTotalCents(s)
    itemsCount += s.quantity
    groups.add(s.sale_group)
  }
  let expensesCents = 0
  for (const e of expenses) {
    if (e.spent_on >= period.from && e.spent_on <= period.to) expensesCents += e.amount_cents
  }
  const salesCount = groups.size
  return {
    revenueCents,
    expensesCents,
    resultCents: revenueCents - expensesCents,
    salesCount,
    itemsCount,
    avgTicketCents: salesCount ? Math.round(revenueCents / salesCount) : 0
  }
}

export interface RankedItem {
  key: string
  label: string
  valueCents: number
  count: number
}

const rank = (map: Map<string, RankedItem>): RankedItem[] =>
  [...map.values()].sort((a, b) => b.valueCents - a.valueCents || a.label.localeCompare(b.label, 'pt-BR'))

export const salesByChannel = (sales: SaleRow[], period: Pick<Period, 'from' | 'to'>): RankedItem[] => {
  const map = new Map<string, RankedItem>()
  for (const s of sales) {
    if (s.sold_on < period.from || s.sold_on > period.to) continue
    const item = map.get(s.channel) ?? { key: s.channel, label: CHANNEL_LABELS[s.channel] ?? s.channel, valueCents: 0, count: 0 }
    item.valueCents += saleLineTotalCents(s)
    item.count += s.quantity
    map.set(s.channel, item)
  }
  return rank(map)
}

export const salesByPayment = (sales: SaleRow[], period: Pick<Period, 'from' | 'to'>): RankedItem[] => {
  const map = new Map<string, RankedItem>()
  for (const s of sales) {
    if (s.sold_on < period.from || s.sold_on > period.to) continue
    const key = s.payment_method ?? 'nao_informado'
    const label = s.payment_method ? PAYMENT_LABELS[s.payment_method] : 'Não informado'
    const item = map.get(key) ?? { key, label, valueCents: 0, count: 0 }
    item.valueCents += saleLineTotalCents(s)
    item.count += s.quantity
    map.set(key, item)
  }
  return rank(map)
}

export const topProducts = (sales: SaleRow[], period: Pick<Period, 'from' | 'to'>, limit = 8): RankedItem[] => {
  const map = new Map<string, RankedItem>()
  for (const s of sales) {
    if (s.sold_on < period.from || s.sold_on > period.to) continue
    const name = s.item_name.trim()
    const key = s.product_id ? `p${s.product_id}` : `t${name.toLowerCase()}`
    const item = map.get(key) ?? { key, label: name, valueCents: 0, count: 0 }
    item.valueCents += saleLineTotalCents(s)
    item.count += s.quantity
    map.set(key, item)
  }
  return rank(map).slice(0, limit)
}

export const expensesByCategory = (expenses: ExpenseRow[], period: Pick<Period, 'from' | 'to'>): RankedItem[] => {
  const map = new Map<string, RankedItem>()
  for (const e of expenses) {
    if (e.spent_on < period.from || e.spent_on > period.to) continue
    const key = e.category.trim()
    const item = map.get(key) ?? { key, label: key, valueCents: 0, count: 0 }
    item.valueCents += e.amount_cents
    item.count += 1
    map.set(key, item)
  }
  return rank(map)
}

/** Agrupa as linhas de venda por venda (sale_group), mais recente primeiro */
export interface SaleGroup {
  group: string
  sold_on: string
  channel: Channel
  channel_detail: string | null
  payment_method: PaymentMethod | null
  customer_name: string | null
  customer_contact: string | null
  whatsapp_order_id: number | null
  lines: SaleRow[]
  totalCents: number
  itemsCount: number
}

export const groupSales = (sales: SaleRow[]): SaleGroup[] => {
  const map = new Map<string, SaleGroup>()
  for (const s of sales) {
    let g = map.get(s.sale_group)
    if (!g) {
      g = {
        group: s.sale_group,
        sold_on: s.sold_on,
        channel: s.channel,
        channel_detail: s.channel_detail,
        payment_method: s.payment_method,
        customer_name: s.customer_name,
        customer_contact: s.customer_contact,
        whatsapp_order_id: s.whatsapp_order_id,
        lines: [],
        totalCents: 0,
        itemsCount: 0
      }
      map.set(s.sale_group, g)
    }
    g.lines.push(s)
    g.totalCents += saleLineTotalCents(s)
    g.itemsCount += s.quantity
  }
  return [...map.values()].sort((a, b) => (a.sold_on < b.sold_on ? 1 : a.sold_on > b.sold_on ? -1 : 0))
}

/* ------------------------------------------------------------ catálogo/busca */

/** minúsculas e sem acentos, para buscar "colar" em "Cólar" */
export const normalizeText = (text: string): string =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

export interface CatalogOption {
  id: number
  name: string
  price: number
  stock: number
  available: boolean
}

/** Peças que contêm todas as palavras digitadas; disponíveis primeiro */
export const searchCatalog = (catalog: CatalogOption[], query: string, limit = 12): CatalogOption[] => {
  const words = normalizeText(query).split(/\s+/).filter(Boolean)
  const matches = catalog.filter((p) => {
    const name = normalizeText(p.name)
    return words.every(w => name.includes(w))
  })
  matches.sort((a, b) => Number(b.available) - Number(a.available) || a.name.localeCompare(b.name, 'pt-BR'))
  return matches.slice(0, limit)
}

/* ------------------------------------------------------------ acumulado */

export interface CumulativePoint {
  day: number // 1 = primeiro dia do período
  label: string
  currentCents: number | null // null depois de hoje
  previousCents: number | null
}

/**
 * Receita acumulada dia a dia no período atual x período anterior (alinhados pelo nº do dia).
 * Ex.: dia 19 deste mês contra dia 19 do mês passado.
 */
export const cumulativeRevenue = (
  sales: SaleRow[],
  period: Pick<Period, 'from' | 'to'>,
  previous: Pick<Period, 'from' | 'to'>,
  today: string
): CumulativePoint[] => {
  const daily = (from: string, to: string) => {
    const map = new Map<string, number>()
    for (const s of sales) if (s.sold_on >= from && s.sold_on <= to) map.set(s.sold_on, (map.get(s.sold_on) ?? 0) + saleLineTotalCents(s))
    return map
  }
  const cur = daily(period.from, period.to)
  const prevLen = daysBetween(previous.from, previous.to) + 1
  // período anterior completo (ex.: mês passado inteiro), para a linha cinza ir até o fim
  const prevFullTo = addDays(previous.from, Math.max(prevLen, daysBetween(period.from, period.to) + 1) - 1)
  const prev = daily(previous.from, prevFullTo)
  const total = daysBetween(period.from, period.to) + 1
  const points: CumulativePoint[] = []
  let c = 0
  let p = 0
  for (let i = 0; i < total; i++) {
    const d = addDays(period.from, i)
    const pd = addDays(previous.from, i)
    c += cur.get(d) ?? 0
    const prevExists = pd <= prevFullTo && monthOf(pd) <= monthOf(prevFullTo)
    p += prev.get(pd) ?? 0
    points.push({
      day: i + 1,
      label: bucketLabel(d, 'day'),
      currentCents: d <= today ? c : null,
      previousCents: prevExists ? p : null
    })
  }
  return points
}

/* ---------------------------------------------------------------- meta */

export interface GoalProgress {
  goalCents: number
  doneCents: number
  pct: number
  remainingCents: number
  daysLeft: number
  /** projeção para o fim do mês no ritmo atual */
  projectionCents: number
}

export const goalProgress = (goalCents: number, doneCents: number, month: string, today: string): GoalProgress => {
  const from = `${month}-01`
  const to = endOfMonth(from)
  const totalDays = daysBetween(from, to) + 1
  const elapsed = today < from ? 0 : today > to ? totalDays : daysBetween(from, today) + 1
  return {
    goalCents,
    doneCents,
    pct: goalCents ? Math.min(100, Math.round((doneCents / goalCents) * 100)) : 0,
    remainingCents: Math.max(0, goalCents - doneCents),
    daysLeft: totalDays - elapsed,
    projectionCents: elapsed ? Math.round((doneCents / elapsed) * totalDays) : 0
  }
}

/* ------------------------------------------------------------ resumo escrito */

const WEEKDAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']

export interface Insight { kind: 'info' | 'good' | 'warn'; text: string }

/** Frases automáticas sobre o período. Só diz algo quando há dados suficientes. */
export const buildInsights = (input: {
  sales: SaleRow[]
  expenses: ExpenseRow[]
  period: Pick<Period, 'from' | 'to'>
  previous: Pick<Period, 'from' | 'to'>
  pendingContacts?: { created_at: string; status: string }[]
  nowISO?: string
  goal?: GoalProgress | null
}): Insight[] => {
  const out: Insight[] = []
  const { sales, expenses, period, previous } = input
  const inP = sales.filter(s => s.sold_on >= period.from && s.sold_on <= period.to)
  const groups = new Set(inP.map(s => s.sale_group))

  // contatos esperando resposta
  const now = Date.parse(input.nowISO ?? new Date().toISOString())
  const waiting = (input.pendingContacts ?? []).filter(c => c.status === 'novo' && now - Date.parse(c.created_at) > 24 * 3_600_000).length
  if (waiting) out.push({ kind: 'warn', text: `${waiting} ${waiting === 1 ? 'contato do WhatsApp está' : 'contatos do WhatsApp estão'} sem resposta há mais de 24 h.` })

  // ritmo da meta
  const g = input.goal
  if (g && g.daysLeft > 0 && g.projectionCents) {
    out.push(g.projectionCents >= g.goalCents
      ? { kind: 'good', text: `No ritmo atual, o mês fecha em ${formatCents(g.projectionCents)}: acima da meta.` }
      : { kind: 'info', text: `No ritmo atual, o mês fecha em ${formatCents(g.projectionCents)}. Faltam ${formatCents(g.remainingCents)} em ${g.daysLeft} dia(s) para a meta.` })
  }

  if (groups.size >= 3) {
    // melhor dia da semana
    const byDow = new Array(7).fill(0) as number[]
    for (const s of inP) byDow[new Date(`${s.sold_on}T12:00:00Z`).getUTCDay()]! += saleLineTotalCents(s)
    const best = byDow.indexOf(Math.max(...byDow))
    if (byDow[best]! > 0) out.push({ kind: 'info', text: `O dia da semana que mais vende neste período é ${WEEKDAYS[best]}.` })

    // forma de pagamento dominante
    const pay = salesByPayment(sales, period)
    const total = pay.reduce((sum, i) => sum + i.valueCents, 0)
    const top = pay[0]
    if (top && top.key !== 'nao_informado' && total) {
      const share = Math.round((top.valueCents / total) * 100)
      if (share >= 40) out.push({ kind: 'info', text: `${top.label} representa ${share}% do que você recebeu.` })
    }

    // peça campeã
    const prod = topProducts(sales, period, 1)[0]
    if (prod && prod.count >= 2) out.push({ kind: 'good', text: `Peça mais vendida: ${prod.label} (${prod.count} un.).` })
  }

  // gasto que mais cresceu
  const cur = expensesByCategory(expenses, period)
  const prev = new Map(expensesByCategory(expenses, previous).map(i => [i.key, i.valueCents]))
  let worst: { label: string; pct: number; diff: number } | null = null
  for (const c of cur) {
    const before = prev.get(c.key) ?? 0
    const diff = c.valueCents - before
    if (before > 0 && diff >= 5000) {
      const pct = Math.round((diff / before) * 100)
      if (pct >= 30 && (!worst || diff > worst.diff)) worst = { label: c.label, pct, diff }
    }
  }
  if (worst) out.push({ kind: 'warn', text: `Gastos com ${worst.label} subiram ${worst.pct}% em relação ao período anterior.` })

  return out.slice(0, 4)
}
