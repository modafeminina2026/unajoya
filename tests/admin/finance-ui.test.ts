import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import AdminLogin from '../../app/components/admin/auth/AdminLogin.vue'
import AdminSalesSection from '../../app/components/admin/finance/AdminSalesSection.vue'
import AdminDashboardSection from '../../app/components/admin/finance/AdminDashboardSection.vue'
import { todayISO, type SaleRow } from '../../app/utils/finance'

const baseLoginProps = () => ({
  checking: false,
  recovery: false,
  signIn: vi.fn().mockResolvedValue('E-mail ou senha incorretos.'),
  sendReset: vi.fn().mockResolvedValue(null),
  updatePassword: vi.fn().mockResolvedValue(null)
})

describe('AdminLogin', () => {
  it('envia e-mail e senha e mostra o erro', async () => {
    const props = baseLoginProps()
    const w = mount(AdminLogin, { props })
    await w.find('input[type="email"]').setValue('a@b.com')
    await w.find('input[type="password"]').setValue('segredo123')
    await w.find('form').trigger('submit')
    await flushPromises()
    expect(props.signIn).toHaveBeenCalledWith('a@b.com', 'segredo123')
    expect(w.find('[data-testid="login-error"]').text()).toContain('incorretos')
  })
  it('modo recuperação pede só a nova senha', async () => {
    const props = { ...baseLoginProps(), recovery: true }
    const w = mount(AdminLogin, { props })
    expect(w.find('input[type="email"]').exists()).toBe(false)
    await w.find('input[type="password"]').setValue('novasenha1')
    await w.find('form').trigger('submit')
    await flushPromises()
    expect(props.updatePassword).toHaveBeenCalledWith('novasenha1')
  })
})

describe('AdminSalesSection', () => {
  const catalog = [{ id: 7, name: 'Colar Pérola', price: 189.9, stock: 2, available: true }]
  const order = {
    id: 3, code: 'UJ-ABCDEFGH', created_at: '2026-11-18T10:00:00Z', customer_name: 'Ana', note: null,
    items: [{ product_id: 7, name: 'Colar Pérola', quantity: 2, unit_price_cents: 18990, line_total_cents: 37980 }],
    subtotal_cents: 37980, status: 'novo' as const, admin_note: null, origin: null
  }

  it('autocompleta do catálogo, permite mudar o preço e salva', async () => {
    const save = vi.fn().mockResolvedValue(null)
    const w = mount(AdminSalesSection, { props: { sales: [], catalog, whatsappOrders: [], save, remove: vi.fn() } })
    const input = w.find('[data-testid="sale-line"] input[aria-label="Item"]')
    await input.setValue('perola')
    await input.trigger('focus')
    const option = w.find('[role="option"]')
    expect(option.text()).toContain('Colar Pérola')
    await option.trigger('mousedown')
    const price = w.find('input[aria-label="Valor unitário"]')
    expect((price.element as HTMLInputElement).value).toBe('189,90')
    await price.setValue('150,00')
    await w.find('form').trigger('submit')
    await flushPromises()
    expect(save).toHaveBeenCalledTimes(1)
    const input0 = save.mock.calls[0]![0]
    expect(input0.lines).toEqual([{ product_id: 7, item_name: 'Colar Pérola', quantity: 1, unit_price_cents: 15000, discount_cents: 0 }])
    expect(input0.sold_on).toBe(todayISO())
  })

  it('aceita item fora do catálogo', async () => {
    const save = vi.fn().mockResolvedValue(null)
    const w = mount(AdminSalesSection, { props: { sales: [], catalog, whatsappOrders: [], save, remove: vi.fn() } })
    await w.find('input[aria-label="Item"]').setValue('Conserto de corrente')
    await w.find('input[aria-label="Valor unitário"]').setValue('40')
    await w.find('form').trigger('submit')
    await flushPromises()
    expect(save.mock.calls[0]![0].lines[0]).toMatchObject({ product_id: null, item_name: 'Conserto de corrente', unit_price_cents: 4000 })
  })

  it('pré-preenche a partir de um contato do WhatsApp', async () => {
    const save = vi.fn().mockResolvedValue(null)
    const w = mount(AdminSalesSection, { props: { sales: [], catalog, whatsappOrders: [order], prefillOrderId: 3, save, remove: vi.fn() } })
    expect(w.find('[data-testid="sale-total"]').text()).toContain('379,80')
    await w.find('form').trigger('submit')
    await flushPromises()
    expect(save.mock.calls[0]![0]).toMatchObject({ channel: 'whatsapp_site', whatsapp_order_id: 3, customer_name: 'Ana' })
    expect(w.emitted('prefillConsumed')).toBeTruthy()
  })

  it('filtra a lista pelo mês', async () => {
    const mk = (id: number, d: string): SaleRow => ({ id, sale_group: `g${id}`, sold_on: d, channel: 'fora_da_loja', channel_detail: null, product_id: null,
      item_name: 'Anel', quantity: 1, unit_price_cents: 1000, discount_cents: 0, payment_method: null, customer_name: null, customer_contact: null, whatsapp_order_id: null, note: null })
    const month = todayISO().slice(0, 7)
    const w = mount(AdminSalesSection, { props: { sales: [mk(1, `${month}-01`), mk(2, '2020-01-05')], catalog, whatsappOrders: [], save: vi.fn(), remove: vi.fn() } })
    expect(w.findAll('[data-testid="sale-row"]')).toHaveLength(1)
    await w.find('input[type="month"]').setValue('2020-01')
    expect(w.findAll('[data-testid="sale-row"]')).toHaveLength(1)
    expect(w.find('[data-testid="month-total"]').text()).toContain('janeiro de 2020')
  })
})

describe('AdminDashboardSection', () => {
  it('mostra os indicadores do mês e troca de período', async () => {
    const today = todayISO()
    const sales: SaleRow[] = [{ id: 1, sale_group: 'a', sold_on: today, channel: 'fora_da_loja', channel_detail: null, product_id: null,
      item_name: 'Anel', quantity: 2, unit_price_cents: 5000, discount_cents: 0, payment_method: 'pix', customer_name: null, customer_contact: null, whatsapp_order_id: null, note: null }]
    const w = mount(AdminDashboardSection, { props: { sales, expenses: [], whatsappOrders: [], loading: false } })
    expect(w.find('[data-kpi="revenue"]').text()).toContain('100,00')
    expect(w.find('[data-kpi="sales"]').text()).toContain('1')
    await w.find('[data-testid="preset-select"]').setValue('year')
    expect(w.find('[data-testid="period-label"]').text()).toContain(today.slice(0, 4))
  })
})

import AdminMobileNav from '../../app/components/admin/AdminMobileNav.vue'

describe('Painel no celular', () => {
  it('barra de abas troca de aba, abre o + e o Mais', async () => {
    const w = mount(AdminMobileNav, { props: { currentTab: 'dashboard', newContactsCount: 2 } })
    await w.find('[data-mobile-tab="sales"]').trigger('click')
    expect(w.emitted('update:currentTab')![0]).toEqual(['sales'])
    await w.find('[data-testid="quick-add"]').trigger('click')
    expect(w.emitted('quickAdd')).toBeTruthy()
    await w.find('[data-testid="mobile-more"]').trigger('click')
    expect(w.emitted('more')).toBeTruthy()
    expect(w.text()).toContain('2')
  })

  it('dashboard: meta do mês e gráfico acumulado', async () => {
    const today = todayISO()
    const saveGoal = vi.fn().mockResolvedValue(null)
    const sales: SaleRow[] = [{ id: 1, sale_group: 'a', sold_on: today, channel: 'fora_da_loja', channel_detail: null, product_id: null,
      item_name: 'Anel', quantity: 1, unit_price_cents: 20000, discount_cents: 0, payment_method: 'pix', customer_name: null, customer_contact: null, whatsapp_order_id: null, note: null }]
    const w = mount(AdminDashboardSection, { props: { sales, expenses: [], whatsappOrders: [], loading: false, goals: {}, saveGoal } })
    await w.find('[data-testid="goal-set"]').trigger('click')
    await w.find('[data-testid="goal-input"]').setValue('1.000,00')
    await w.find('[data-testid="goal"] form').trigger('submit')
    await flushPromises()
    expect(saveGoal).toHaveBeenCalledWith(today.slice(0, 7), 100000)
    await w.setProps({ goals: { [today.slice(0, 7)]: 100000 } })
    expect(w.find('[data-testid="goal"]').text()).toContain('20%')
    await w.find('[data-testid="mode-cumulative"]').trigger('click')
    expect(w.find('[data-testid="cumulative-readout"]').text()).toContain('200,00')
  })
})
