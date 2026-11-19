import { describe, it, expect } from 'vitest'
import {
  resolvePeriod, previousPeriod, shiftAnchor, buildSeries, summarize, startOfWeek, addMonths,
  groupSales, searchCatalog, pctChange, saleLineTotalCents, topProducts, suggestGranularity, type SaleRow, type ExpenseRow
} from '../app/utils/finance'

const sale = (o: Partial<SaleRow>): SaleRow => ({
  id: 1, sale_group: 'g1', sold_on: '2026-11-05', channel: 'fora_da_loja', channel_detail: null, product_id: null,
  item_name: 'Colar', quantity: 1, unit_price_cents: 10000, discount_cents: 0, payment_method: 'pix',
  customer_name: null, customer_contact: null, whatsapp_order_id: null, note: null, ...o
})
const exp = (o: Partial<ExpenseRow>): ExpenseRow => ({
  id: 1, spent_on: '2026-11-06', category: 'Embalagens', description: null, amount_cents: 2500, payment_method: null, supplier: null, note: null, ...o
})

describe('datas e períodos', () => {
  it('semana começa na segunda', () => {
    expect(startOfWeek('2026-11-19')).toBe('2026-11-16') // quinta
    expect(startOfWeek('2026-11-22')).toBe('2026-11-16') // domingo
  })
  it('addMonths limita ao fim do mês', () => expect(addMonths('2026-03-31', 1)).toBe('2026-04-30'))
  it('mês, trimestre e ano', () => {
    expect(resolvePeriod('month', '2026-11-19')).toMatchObject({ from: '2026-11-01', to: '2026-11-30' })
    expect(resolvePeriod('quarter', '2026-11-19')).toMatchObject({ from: '2026-10-01', to: '2026-12-31' })
    expect(resolvePeriod('year', '2026-11-19')).toMatchObject({ from: '2026-01-01', to: '2026-12-31' })
  })
  it('setas de mês', () => expect(shiftAnchor('month', '2026-01-15', -1)).toBe('2025-12-01'))
  it('mês em andamento compara só os dias decorridos', () => {
    const p = resolvePeriod('month', '2026-11-19')
    expect(previousPeriod(p, '2026-11-19')).toMatchObject({ from: '2026-10-01', to: '2026-10-19' })
  })
  it('janela livre compara com a janela anterior de mesmo tamanho', () => {
    const p = resolvePeriod('7d', '2026-11-19')
    expect(previousPeriod(p, '2026-11-19')).toMatchObject({ from: '2026-11-06', to: '2026-11-12' })
  })
  it('granularidade sugerida', () => {
    expect(suggestGranularity(resolvePeriod('month', '2026-11-19'))).toBe('day')
    expect(suggestGranularity(resolvePeriod('year', '2026-11-19'))).toBe('month')
  })
})

describe('agregações', () => {
  const sales = [
    sale({ id: 1, sale_group: 'a', quantity: 2, unit_price_cents: 5000, discount_cents: 1000 }),
    sale({ id: 2, sale_group: 'a', item_name: 'Anel', unit_price_cents: 3000 }),
    sale({ id: 3, sale_group: 'b', sold_on: '2026-11-20', unit_price_cents: 7000 }),
    sale({ id: 4, sale_group: 'c', sold_on: '2026-10-01', unit_price_cents: 99999 })
  ]
  const expenses = [exp({}), exp({ id: 2, spent_on: '2026-10-01', amount_cents: 777 })]
  const period = { from: '2026-11-01', to: '2026-11-30' }

  it('total da linha considera desconto', () => expect(saleLineTotalCents(sales[0]!)).toBe(9000))
  it('resumo: vendas agrupadas por sale_group', () => {
    const s = summarize(sales, expenses, period)
    expect(s.revenueCents).toBe(9000 + 3000 + 7000)
    expect(s.salesCount).toBe(2)
    expect(s.itemsCount).toBe(4)
    expect(s.expensesCents).toBe(2500)
    expect(s.resultCents).toBe(19000 - 2500)
    expect(s.avgTicketCents).toBe(9500)
  })
  it('série diária cobre todos os dias, inclusive vazios', () => {
    const series = buildSeries(sales, expenses, period, 'day')
    expect(series).toHaveLength(30)
    expect(series.find(b => b.key === '2026-11-05')!.revenueCents).toBe(12000)
    expect(series.find(b => b.key === '2026-11-06')!.expensesCents).toBe(2500)
    expect(series.find(b => b.key === '2026-11-07')!.revenueCents).toBe(0)
  })
  it('série mensal de um ano tem 12 pontos', () => {
    expect(buildSeries(sales, expenses, { from: '2026-01-01', to: '2026-12-31' }, 'month')).toHaveLength(12)
  })
  it('ranking de produtos', () => {
    expect(topProducts(sales, period)[0]).toMatchObject({ label: 'Colar', valueCents: 16000 })
  })
  it('agrupa linhas por venda', () => {
    const g = groupSales(sales.slice(0, 3))
    expect(g).toHaveLength(2)
    expect(g[0]!.group).toBe('b')
  })
  it('variação percentual', () => {
    expect(pctChange(150, 100)).toBe(50)
    expect(pctChange(5, 0)).toBeNull()
    expect(pctChange(0, 0)).toBe(0)
  })
})

describe('busca no catálogo', () => {
  const catalog = [
    { id: 1, name: 'Cólar Pérola', price: 100, stock: 0, available: false },
    { id: 2, name: 'Colar Ouro', price: 200, stock: 3, available: true },
    { id: 3, name: 'Anel', price: 50, stock: 1, available: true }
  ]
  it('ignora acentos e prioriza disponíveis', () => {
    expect(searchCatalog(catalog, 'colar').map(p => p.id)).toEqual([2, 1])
    expect(searchCatalog(catalog, 'col per').map(p => p.id)).toEqual([1])
  })
})

import { cumulativeRevenue, goalProgress, buildInsights } from '../app/utils/finance'

describe('acumulado, meta e resumo escrito', () => {
  const s = (id: number, d: string, v: number) => sale({ id, sale_group: `g${id}`, sold_on: d, unit_price_cents: v })
  const sales = [s(1, '2026-11-01', 1000), s(2, '2026-11-07', 2000), s(3, '2026-11-14', 3000), s(4, '2026-10-02', 500)]
  const p = resolvePeriod('month', '2026-11-19')
  const prev = previousPeriod(p, '2026-11-19')

  it('acumula por dia e para no dia de hoje', () => {
    const c = cumulativeRevenue(sales, p, prev, '2026-11-19')
    expect(c).toHaveLength(30)
    expect(c[18]).toMatchObject({ day: 19, currentCents: 6000, previousCents: 500 })
    expect(c[19]!.currentCents).toBeNull()
  })
  it('progresso da meta com projeção', () => {
    expect(goalProgress(10000, 6000, '2026-11', '2026-11-19')).toMatchObject({ pct: 60, remainingCents: 4000, daysLeft: 11, projectionCents: 9474 })
  })
  it('frases: contatos parados, ritmo da meta, dia da semana', () => {
    const texts = buildInsights({
      sales, expenses: [], period: p, previous: prev,
      goal: goalProgress(10000, 6000, '2026-11', '2026-11-19'),
      pendingContacts: [{ created_at: '2026-11-17T00:00:00Z', status: 'novo' }, { created_at: '2026-11-19T11:00:00Z', status: 'novo' }],
      nowISO: '2026-11-19T12:00:00Z'
    }).map(i => i.text)
    expect(texts[0]).toContain('1 contato do WhatsApp')
    expect(texts.some(t => t.includes('No ritmo atual'))).toBe(true)
    expect(texts.some(t => t.includes('sábado'))).toBe(true)
  })
  it('não inventa frases sem dados', () => {
    expect(buildInsights({ sales: [], expenses: [], period: p, previous: prev })).toEqual([])
  })
})
