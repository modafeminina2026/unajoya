import { describe, it, expect } from 'vitest'
import {
  parseMoneyToCents, parseDateToISO, suggestMapping, SALE_FIELDS, EXPENSE_FIELDS,
  buildSalesRows, buildExpenseRows, parseCSV, guessPayment, distinctValues
} from '../app/utils/importer'

describe('valores e datas brasileiros', () => {
  it('dinheiro', () => {
    expect(parseMoneyToCents('R$ 1.234,56')).toBe(123456)
    expect(parseMoneyToCents('89,9')).toBe(8990)
    expect(parseMoneyToCents('1,234.50')).toBe(123450)
    expect(parseMoneyToCents('1.234')).toBe(123400)
    expect(parseMoneyToCents('12.5')).toBe(1250)
    expect(parseMoneyToCents(45.9)).toBe(4590)
    expect(parseMoneyToCents('(50,00)')).toBe(-5000)
    expect(parseMoneyToCents('abc')).toBeNull()
    expect(parseMoneyToCents('')).toBeNull()
  })
  it('datas', () => {
    expect(parseDateToISO('05/11/2026')).toBe('2026-11-05')
    expect(parseDateToISO('5/1/26')).toBe('2026-01-05')
    expect(parseDateToISO('2026-11-05')).toBe('2026-11-05')
    expect(parseDateToISO(46331)).toBe('2026-11-05')
    expect(parseDateToISO('31/02/2026')).toBeNull()
    expect(parseDateToISO('lixo')).toBeNull()
  })
  it('forma de pagamento', () => {
    expect(guessPayment('PIX')).toBe('pix')
    expect(guessPayment('Cartão de Crédito')).toBe('cartao_credito')
    expect(guessPayment('')).toBeNull()
  })
})

describe('mapeamento e linhas', () => {
  it('sugere colunas pelo cabeçalho', () => {
    const m = suggestMapping(['Data', 'Peça', 'Qtd', 'Valor Unitário', 'Valor Total', 'Pagamento'], SALE_FIELDS)
    expect(m).toMatchObject({ date: 0, item: 1, quantity: 2, unit_price: 3, total: 4, payment: 5 })
  })
  it('vendas: calcula unitário pelo total e acusa linhas ruins', () => {
    const r = buildSalesRows(
      [['05/11/2026', 'Colar', 2, null, 'R$ 180,00'], ['xx', 'Anel', 1, '50', null], ['06/11/2026', '', 1, '10', null], [null, null, null, null, null]],
      { date: 0, item: 1, quantity: 2, unit_price: 3, total: 4 }
    )
    expect(r.rows).toHaveLength(1)
    expect(r.rows[0]).toMatchObject({ sold_on: '2026-11-05', unit_price_cents: 9000, quantity: 2, discount_cents: 0, channel: 'fora_da_loja' })
    expect(r.issues.map(i => i.row)).toEqual([3, 4])
  })
  it('vendas: total menor que qtd×unitário vira desconto', () => {
    const r = buildSalesRows([['05/11/2026', 'Colar', 2, '100', '180']], { date: 0, item: 1, quantity: 2, unit_price: 3, total: 4 })
    expect(r.rows[0]).toMatchObject({ unit_price_cents: 10000, discount_cents: 2000 })
  })
  it('gastos: usa mapa de categorias e valor absoluto', () => {
    const r = buildExpenseRows(
      [['01/11/2026', '-20,00', 'embalagem'], ['02/11/2026', '15', '']],
      { date: 0, amount: 1, category: 2 },
      { embalagem: 'Embalagens' }
    )
    expect(r.rows[0]).toMatchObject({ category: 'Embalagens', amount_cents: 2000 })
    expect(r.rows[1]).toMatchObject({ category: 'Outros', amount_cents: 1500 })
  })
  it('categorias distintas', () => {
    expect(distinctValues([['a'], ['A'], ['b']], 0)).toEqual(['a', 'b'])
  })
  it('csv com ; e aspas', () => {
    expect(parseCSV('Data;Peça;Valor\n05/11/2026;"Colar; ouro";"1.200,00"\n')).toEqual([['Data', 'Peça', 'Valor'], ['05/11/2026', 'Colar; ouro', '1.200,00']])
  })
})
