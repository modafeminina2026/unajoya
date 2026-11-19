import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import type { StoreProduct } from '../app/utils/catalog'

const addToCart = vi.fn()
const sendProductToWhatsApp = vi.fn()
const openModal = vi.fn()
vi.stubGlobal('useCart', () => ({ addToCart }))
vi.stubGlobal('useWhatsAppCheckout', () => ({ sendProductToWhatsApp }))
vi.stubGlobal('useImageModal', () => ({ open: openModal }))

const { default: ProductCard } = await import('../app/components/ProductCard.vue')

const base: StoreProduct = {
  id: 7, name: 'Colar Pérola', description: '', price: 189.9, image: 'a.jpg', images: ['a.jpg', 'b.jpg'],
  promo: false, createdAt: '2026-11-01', available: 5, category: { name: 'Colares', slug: 'colares' }
}
const stubs = { NuxtLink: { props: ['to'], template: '<a :href="to"><slot /></a>' } }

describe('ProductCard', () => {
  beforeEach(() => vi.clearAllMocks())

  it('adiciona à sacola e pede pelo WhatsApp', async () => {
    const w = mount(ProductCard, { props: { product: base }, global: { stubs } })
    expect(w.text()).not.toContain('COMPRAS PAUSADAS')
    await w.find('[data-testid="add-to-cart"]').trigger('click')
    expect(addToCart).toHaveBeenCalledWith({ id: 7, name: 'Colar Pérola', price: 189.9, image: 'a.jpg' })
    await w.find('[data-testid="ask-whatsapp"]').trigger('click')
    expect(sendProductToWhatsApp).toHaveBeenCalledWith(base)
    expect(w.find('a[href="/produto/7-colar-perola"]').exists()).toBe(true)
  })

  it('peça esgotada não vai para a sacola', () => {
    const w = mount(ProductCard, { props: { product: { ...base, available: 0 } }, global: { stubs } })
    expect(w.find('[data-testid="badge-soldout"]').exists()).toBe(true)
    expect(w.find('[data-testid="add-to-cart"]').exists()).toBe(false)
    expect(w.find('[data-testid="ask-whatsapp"]').text()).toContain('Avise-me')
  })

  it('últimas unidades', () => {
    const w = mount(ProductCard, { props: { product: { ...base, available: 1 } }, global: { stubs } })
    expect(w.find('[data-testid="badge-low"]').exists()).toBe(true)
  })

  it('usa srcset nas fotos enviadas pelo painel', () => {
    const w = mount(ProductCard, { props: { product: { ...base, images: ['https://cdn/u/x-1600.webp'] } }, global: { stubs } })
    const img = w.find('img')
    expect(img.attributes('src')).toBe('https://cdn/u/x-800.webp')
    expect(img.attributes('srcset')).toContain('x-400.webp 400w')
  })
})
