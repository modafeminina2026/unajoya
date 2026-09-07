import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getExpirationDays,
  getExpirationText,
  isExpiringSoon,
  countActiveProducts,
  mapSupabaseProduct,
  formatCurrency
} from '../../app/composables/admin/useAdminProductExpiry'
import type { SupabaseProductRow } from '../../app/types/admin'

describe('useAdminProductExpiry - Paridade do Cálculo de Validade', () => {
  // Relógio fixo em 15 de Setembro de 2026 às 12:00:00 UTC
  const FIXED_NOW = new Date('2026-09-15T12:00:00.000Z')

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(FIXED_NOW)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('1. Produto ativo com data válida e prazo restante', () => {
    // Criado em 10/09/2026, com 15 dias de duração -> expira em 25/09/2026 (10 dias restantes)
    const row: SupabaseProductRow = {
      id: 1,
      name: 'Colar Aurora',
      description: 'Ouro 18k',
      price: 1500,
      stock: 3,
      promo: false,
      duration: 15,
      image: 'https://example.com/img1.jpg',
      created_at: '2026-09-10T12:00:00.000Z',
      category_id: 1
    }

    const product = mapSupabaseProduct(row, 'https://example.com/default.jpg')
    expect(product.createdAt.toISOString()).toBe('2026-09-10T12:00:00.000Z')

    const diffDays = getExpirationDays(product)
    expect(diffDays).toBe(10)
    expect(getExpirationText(product)).toBe('10 dias restantes')
    expect(isExpiringSoon(product)).toBe(false)
    expect(countActiveProducts([product])).toBe(1)
  })

  it('2. Produto ativo expirando em breve (24h restantes)', () => {
    // Criado em 01/09/2026, com 15 dias de duração -> expira em 16/09/2026 às 12:00 UTC
    // Em 15/09 às 12:00 UTC, resta exatamente 1 dia (24h)
    const row: SupabaseProductRow = {
      id: 2,
      name: 'Anel Solitário',
      description: 'Diamante',
      price: 2500,
      stock: 1,
      promo: true,
      duration: 15,
      image: 'https://example.com/img2.jpg',
      created_at: '2026-09-01T12:00:00.000Z',
      category_id: 2
    }

    const product = mapSupabaseProduct(row, 'https://example.com/default.jpg')
    const diffDays = getExpirationDays(product)
    expect(diffDays).toBe(1)
    expect(getExpirationText(product)).toBe('24h restantes')
    expect(isExpiringSoon(product)).toBe(true)
    expect(countActiveProducts([product])).toBe(1)
  })

  it('3. Produto expirado', () => {
    // Criado em 01/08/2026, com 15 dias de duração -> expirou em 16/08/2026
    const row: SupabaseProductRow = {
      id: 3,
      name: 'Brinco Pérola',
      description: 'Pérola barroca',
      price: 800,
      stock: 5,
      promo: false,
      duration: 15,
      image: 'https://example.com/img3.jpg',
      created_at: '2026-08-01T12:00:00.000Z',
      category_id: 3
    }

    const product = mapSupabaseProduct(row, 'https://example.com/default.jpg')
    const diffDays = getExpirationDays(product)
    expect(diffDays).toBeLessThanOrEqual(0)
    expect(getExpirationText(product)).toBe('Expirado')
    expect(isExpiringSoon(product)).toBe(true)
    expect(countActiveProducts([product])).toBe(0)
  })

  it('4. Produto com data nula (p.created_at = null)', () => {
    // No commit base: new Date(null) resulta em Epoch (1970-01-01), portanto expirado
    const row: SupabaseProductRow = {
      id: 4,
      name: 'Pulseira Rara',
      description: 'Sem data de criação',
      price: 3200,
      stock: 1,
      promo: false,
      duration: 15,
      image: 'https://example.com/img4.jpg',
      created_at: null,
      category_id: 1
    }

    const product = mapSupabaseProduct(row, 'https://example.com/default.jpg')
    expect(product.createdAt.getTime()).toBe(0) // Epoch 1970

    const diffDays = getExpirationDays(product)
    expect(diffDays).toBeLessThanOrEqual(0)
    expect(getExpirationText(product)).toBe('Expirado')
    expect(isExpiringSoon(product)).toBe(true)
    // NÃO pode ser classificado como ativo!
    expect(countActiveProducts([product])).toBe(0)
  })

  it('5. Produto com data ausente (p.created_at = undefined)', () => {
    // No commit base: new Date(undefined) resulta em Invalid Date (NaN)
    const row: SupabaseProductRow = {
      id: 5,
      name: 'Peça Sem Data',
      description: 'Data ausente',
      price: 1100,
      stock: 2,
      promo: false,
      duration: 15,
      image: 'https://example.com/img5.jpg',
      category_id: 1
    }

    const product = mapSupabaseProduct(row, 'https://example.com/default.jpg')
    expect(isNaN(product.createdAt.getTime())).toBe(true)

    // Comportamento canônico: diffTime é NaN, logo não é ativo
    expect(countActiveProducts([product])).toBe(0)
    expect(getExpirationText(product)).toBe('NaN dias restantes')
  })

  it('6. Produto com data inválida (string corrompida)', () => {
    const row: SupabaseProductRow = {
      id: 6,
      name: 'Peça Data Inválida',
      description: 'Data incorreta',
      price: 950,
      stock: 1,
      promo: false,
      duration: 15,
      image: 'https://example.com/img6.jpg',
      created_at: 'invalid-date-string',
      category_id: 1
    }

    const product = mapSupabaseProduct(row, 'https://example.com/default.jpg')
    expect(isNaN(product.createdAt.getTime())).toBe(true)
    expect(countActiveProducts([product])).toBe(0)
    expect(getExpirationText(product)).toBe('NaN dias restantes')
  })

  it('7. Formatação de moeda BRL', () => {
    const formatted = formatCurrency(1250.50)
    expect(formatted).toContain('1.250,50')
  })

  it('8. Propriedade excedente createdAt (camelCase) sem created_at NÃO torna o produto ativo', () => {
    // Objeto estrutural com propriedade adicional createdAt sem coerção de tipo
    const rowWithExtraProp = {
      id: 8,
      name: 'Peça Excedente CamelCase',
      description: 'Tentativa de burlar com createdAt',
      price: 1500,
      stock: 1,
      promo: false,
      duration: 15,
      image: 'https://example.com/img8.jpg',
      created_at: undefined,
      category_id: 1,
      createdAt: '2026-09-14T12:00:00.000Z'
    }

    const product = mapSupabaseProduct(rowWithExtraProp, 'https://example.com/default.jpg')
    expect(isNaN(product.createdAt.getTime())).toBe(true)
    expect(countActiveProducts([product])).toBe(0)
    expect(getExpirationText(product)).toBe('NaN dias restantes')
  })
})
