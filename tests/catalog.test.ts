import { describe, it, expect } from 'vitest'
import {
  toStoreProducts, stockState, filterAndSort, productPath, productIdFromParam, responsiveImage, parseImages, type ProductRow
} from '../app/utils/catalog'

const now = Date.parse('2026-11-19T12:00:00Z')
const row = (o: Partial<ProductRow>): ProductRow => ({
  id: 1, name: 'Colar Pérola', price: '100', created_at: '2026-11-15T00:00:00Z', duration: 15, stock: 3, reserved_stock: 0, ...o
})

describe('catálogo', () => {
  it('esconde peças vencidas e calcula disponível = estoque − reservado', () => {
    const list = toStoreProducts([row({}), row({ id: 2, created_at: '2026-01-01T00:00:00Z' }), row({ id: 3, stock: 2, reserved_stock: 2 })], now)
    expect(list.map(p => p.id)).toEqual([1, 3])
    expect(list[1]!.available).toBe(0)
  })
  it('estado do estoque', () => {
    expect(stockState({ available: 0 })).toBe('sold_out')
    expect(stockState({ available: 2 })).toBe('low')
    expect(stockState({ available: 5 })).toBe('available')
  })
  it('lê imagens em array, JSON ou texto', () => {
    expect(parseImages({ images: ['a', ''], image: 'x' })).toEqual(['a'])
    expect(parseImages({ images: '["a","b"]' })).toEqual(['a', 'b'])
    expect(parseImages({ images: null, image: 'x' })).toEqual(['x'])
  })
  it('busca sem acento, ordena e manda esgotadas para o fim', () => {
    const list = toStoreProducts([
      row({ id: 1, name: 'Colar Pérola', price: 300 }),
      row({ id: 2, name: 'Anel', price: 50, stock: 0 }),
      row({ id: 3, name: 'Colar Ouro', price: 150 })
    ], now)
    expect(filterAndSort(list, { query: 'perola' }).map(p => p.id)).toEqual([1])
    expect(filterAndSort(list, { sort: 'price_asc' }).map(p => p.id)).toEqual([3, 1, 2])
    expect(filterAndSort(list, { onlyAvailable: true }).map(p => p.id)).toEqual([1, 3])
  })
  it('URL da peça', () => {
    expect(productPath({ id: 12, name: 'Colar Pérola Barroca!' })).toBe('/produto/12-colar-perola-barroca')
    expect(productIdFromParam('12-colar')).toBe(12)
    expect(productIdFromParam('abc')).toBeNull()
  })
  it('srcset só para fotos enviadas pelo painel', () => {
    expect(responsiveImage('https://cdn.x/uploads/2026/11/abc-1600.webp')).toEqual({
      src: 'https://cdn.x/uploads/2026/11/abc-800.webp',
      srcset: 'https://cdn.x/uploads/2026/11/abc-400.webp 400w, https://cdn.x/uploads/2026/11/abc-800.webp 800w, https://cdn.x/uploads/2026/11/abc-1600.webp 1600w'
    })
    expect(responsiveImage('https://lh3.googleusercontent.com/x')).toEqual({ src: 'https://lh3.googleusercontent.com/x' })
  })
})
