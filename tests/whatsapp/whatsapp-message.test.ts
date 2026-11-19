import { describe, it, expect } from 'vitest'
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  formatBRL,
  generateOrderCode,
  normalizeWhatsAppNumber
} from '~/utils/whatsapp'

describe('Pedido via WhatsApp', () => {
  it('normaliza o número para o formato do wa.me', () => {
    expect(normalizeWhatsAppNumber('+55 1195376-9317')).toBe('5511953769317')
    expect(normalizeWhatsAppNumber('(11) 95376-9317')).toBe('5511953769317')
    expect(normalizeWhatsAppNumber('5511953769317')).toBe('5511953769317')
  })

  it('gera códigos no formato aceito pelo banco', () => {
    for (let i = 0; i < 200; i++) {
      expect(generateOrderCode()).toMatch(/^UJ-[A-Z0-9]{8}$/)
    }
  })

  it('formata moeda sem espaço não separável', () => {
    expect(formatBRL(1234.5)).toBe('R$ 1.234,50')
  })

  it('monta mensagem com vários produtos, total, observação, nome e código', () => {
    const msg = buildWhatsAppMessage({
      code: 'UJ-ABCD2345',
      customerName: 'Maria',
      note: 'Para presente',
      items: [
        { name: 'Brinco Quartzo', price: 180, quantity: 1 },
        { name: 'Anel Ametista', price: 120, quantity: 2 }
      ]
    })
    expect(msg).toContain('1x Brinco Quartzo - R$ 180,00')
    expect(msg).toContain('2x Anel Ametista - R$ 240,00 (R$ 120,00 cada)')
    expect(msg).toContain('Total estimado: R$ 420,00')
    expect(msg).toContain('Observações: Para presente')
    expect(msg).toContain('Nome: Maria')
    expect(msg).toContain('Pedido: UJ-ABCD2345')
  })

  it('omite nome e observação quando vazios', () => {
    const msg = buildWhatsAppMessage({
      code: 'UJ-ABCD2345',
      items: [{ name: 'Colar', price: 99.9, quantity: 1 }]
    })
    expect(msg).not.toContain('Nome:')
    expect(msg).not.toContain('Observações:')
  })

  it('codifica acentos, quebras de linha e caracteres especiais no link', () => {
    const msg = buildWhatsAppMessage({
      code: 'UJ-ABCD2345',
      note: 'Cor #2 & tamanho 50%',
      items: [{ name: 'Pulseira "Lua" & Sol', price: 10, quantity: 1 }]
    })
    const url = buildWhatsAppUrl('+55 11 95376-9317', msg)
    expect(url.startsWith('https://wa.me/5511953769317?text=')).toBe(true)
    const decoded = decodeURIComponent(url.split('?text=')[1] as string)
    expect(decoded).toBe(msg)
    expect(url).not.toContain(' ')
    expect(url).not.toContain('\n')
  })

  it('encurta a lista quando a mensagem passa do limite do link', () => {
    const items = Array.from({ length: 60 }, (_, i) => ({
      name: `Peça artesanal com pedra natural número ${i + 1}`,
      price: 100 + i,
      quantity: 1
    }))
    const msg = buildWhatsAppMessage({ code: 'UJ-ABCD2345', items }, '5511953769317')
    const url = buildWhatsAppUrl('5511953769317', msg)
    expect(url.length).toBeLessThanOrEqual(1900)
    expect(msg).toContain('... e mais')
    expect(msg).toContain('Pedido: UJ-ABCD2345')
    expect(msg).toContain('Total estimado:')
  })
})
