import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'

// Tipagem estrita para o stub global de Supabase
interface FakeQueryBuilder {
  select: () => FakeQueryBuilder
  order: () => Promise<{ data: never[]; error: null }>
}

interface FakeSupabaseClient {
  from: (table: string) => FakeQueryBuilder
}

const createFakeClient = (): FakeSupabaseClient => {
  const builder: FakeQueryBuilder = {
    select: () => builder,
    order: () => Promise.resolve({ data: [], error: null })
  }
  return {
    from: () => builder
  }
}

// Configuração do stub global tipado via vi.stubGlobal
vi.stubGlobal('useSupabase', () => ({
  client: createFakeClient()
}))

vi.mock('../../app/composables/useCart', () => ({
  useCart: () => ({
    addToCart: vi.fn(),
    items: ref([]),
    giftWrap: ref(false),
    isCartEmpty: ref(true),
    isPopupOpen: ref(false),
    hydrated: ref(true)
  })
}))

import AdminSidebar from '../../app/components/admin/AdminSidebar.vue'
import AdminProductForm from '../../app/components/admin/products/AdminProductForm.vue'
import AdminHeroSection from '../../app/components/admin/hero/AdminHeroSection.vue'
import AdminOrderCard from '../../app/components/admin/orders/AdminOrderCard.vue'
import HeroBanner from '../../app/components/HeroBanner.vue'
import ProductImageModal from '../../app/components/ProductImageModal.vue'
import { useAdminProductImages } from '../../app/composables/admin/useAdminProductImages'
import { useImageModal } from '../../app/composables/useImageModal'
import type {
  AdminProduct,
  AdminProductFormState,
  AdminOrder,
  OrderStatusOption,
  HeroSlide,
  HeroSlideFormState
} from '../../app/types/admin'

describe('Componentes Administrativos - Testes de Comportamento Isolados', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('useSupabase', () => ({
      client: createFakeClient()
    }))
  })

  afterEach(() => {
    const { close } = useImageModal()
    close()
    vi.unstubAllGlobals()
  })

  it('1. AdminSidebar - Validação obrigatória das 6 abas, ordem e payload exato sem condicionais', async () => {
    const wrapper = mount(AdminSidebar, {
      props: {
        currentTab: 'products',
        pendingOrdersCount: 4,
        isSidebarOpen: true
      },
      global: {
        stubs: {
          NuxtLink: {
            template: '<a><slot /></a>'
          }
        }
      }
    })

    expect(wrapper.text()).toContain('UNA JOYA')
    expect(wrapper.text()).toContain('PAINEL ADMINISTRATIVO')
    expect(wrapper.text()).toContain('4') // Badge de 4 pedidos pendentes

    // Ordem canônica completa das 6 abas na interface com seus rótulos em português
    const expectedTabs = [
      { id: 'orders', label: 'PEDIDOS' },
      { id: 'products', label: 'PRODUTOS' },
      { id: 'categories', label: 'CATEGORIAS' },
      { id: 'carousel', label: 'CARROSSEL' },
      { id: 'lookbook', label: 'LOOKBOOK (FAIXA)' },
      { id: 'about', label: 'SOBRE NÓS' }
    ] as const

    const tabLinks = wrapper.findAll('a[data-admin-tab]')
    expect(tabLinks).toHaveLength(6)

    // Validação estrita sem if: todas as 6 abas devem existir na ordem exata e emitir os eventos corretos
    for (let i = 0; i < expectedTabs.length; i++) {
      const expected = expectedTabs[i]!
      const link = tabLinks[i]!

      expect(link.attributes('data-admin-tab')).toBe(expected.id)
      expect(link.text()).toContain(expected.label)

      await link.trigger('click')

      // Validação do payload exato emitido
      const currentTabEmits = wrapper.emitted('update:currentTab')
      const isSidebarOpenEmits = wrapper.emitted('update:isSidebarOpen')

      expect(currentTabEmits).toBeDefined()
      expect(currentTabEmits?.[i]).toEqual([expected.id])

      expect(isSidebarOpenEmits).toBeDefined()
      expect(isSidebarOpenEmits?.[i]).toEqual([false])
    }
  })

  it('2. AdminProductForm - Textos corretos, integridade de UTF-8 e disparo do evento publish (sem payload)', async () => {
    const form = ref<AdminProductFormState>({
      id: null,
      name: 'Nome da Peça Exclusiva',
      description: 'Acabamento artesanal exclusivo em ouro.',
      price: 1850,
      stock: 2,
      promo: false,
      duration: 15,
      image: 'https://example.com/cover.jpg',
      images: ['https://example.com/cover.jpg', 'https://example.com/detail.jpg'],
      category_id: null
    })

    const manager = useAdminProductImages(form)

    const wrapper = mount(AdminProductForm, {
      props: {
        form: form.value,
        categories: [{ id: 1, name: 'Colares', slug: 'colares', sort_order: 1, active: true }],
        isEditing: false,
        imageManager: manager
      }
    })

    // Verificação estrita de textos em português sem corrupção
    const text = wrapper.text()
    expect(text).toContain('TÍTULO DA JOIA')
    expect(text).toContain('DESCRIÇÃO E ARTESANATO')
    expect(text).toContain('TEMPO DE EXPOSIÇÃO DA PEÇA')
    expect(text).toContain('PUBLICAR JOIA NO CATÁLOGO')
    expect(text).toContain('FOTOS ADICIONADAS (FOTO 1 É A CAPA PRINCIPAL)')
    expect(text).toContain('Nome da Peça Exclusiva')

    // Botões de reordenação com símbolos intactos
    const html = wrapper.html()
    expect(html).toContain('‹')
    expect(html).toContain('›')
    expect(html).toContain('✕')

    // Evento publish: confirmação de que NÃO possui payload (emite apenas [])
    const publishBtn = wrapper.get('button[type="button"]')
    await publishBtn.trigger('click')
    expect(wrapper.emitted('publish')).toHaveLength(1)
    expect(wrapper.emitted('publish')?.[0]).toEqual([])
  })

  it('3. AdminHeroSection - Props recebidas e eventos emitidos sem guards condicionais', async () => {
    const mockSlides: HeroSlide[] = [
      {
        id: 10,
        sort_order: 0,
        image: 'https://example.com/hero1.jpg',
        subtitle: 'ALTA JOALHERIA',
        title: 'Coleção Afeto',
        btn1: 'VER COLEÇÃO',
        btn2: 'SOBRE NÓS',
        align: 'text-center items-center',
        active: true
      }
    ]

    const slideForm: HeroSlideFormState = {
      id: 10,
      sort_order: 0,
      image: 'https://example.com/hero1.jpg',
      subtitle: 'ALTA JOALHERIA',
      title: 'Coleção Afeto',
      btn1: 'VER COLEÇÃO',
      btn2: 'SOBRE NÓS',
      align: 'text-center items-center',
      active: true
    }

    const wrapper = mount(AdminHeroSection, {
      props: {
        slides: mockSlides,
        loadingSlides: false,
        uploadingSlideImage: false,
        slideForm,
        isEditingSlide: true,
        alignOptions: [
          { label: 'ESQUERDA', value: 'text-left' },
          { label: 'CENTRO', value: 'text-center' },
          { label: 'DIREITA', value: 'text-right' }
        ],
        mockImages: ['https://example.com/mock.jpg']
      }
    })

    expect(wrapper.text()).toContain('Slides do Carrossel')
    expect(wrapper.text()).toContain('Coleção Afeto')
    expect(wrapper.text()).toContain('ALTA JOALHERIA')

    // Botão de alternar status (toggleActive)
    const toggleBtn = wrapper.findAll('button').find(b => b.text().includes('DESATIVAR') || b.text().includes('ATIVAR'))
    expect(toggleBtn).toBeDefined()
    await toggleBtn!.trigger('click')
    expect(wrapper.emitted('toggleActive')?.[0]?.[0]).toEqual(mockSlides[0])

    // Botão de editar
    const editBtn = wrapper.findAll('button').find(b => b.text().includes('EDITAR'))
    expect(editBtn).toBeDefined()
    await editBtn!.trigger('click')
    expect(wrapper.emitted('edit')?.[0]?.[0]).toEqual(mockSlides[0])

    // Botão de excluir
    const deleteBtn = wrapper.findAll('button').find(b => b.text().includes('EXCLUIR'))
    expect(deleteBtn).toBeDefined()
    await deleteBtn!.trigger('click')
    expect(wrapper.emitted('delete')?.[0]?.[0]).toBe(10)
  })

  it('4. AdminOrderCard - Renderização do telefone fictício e emissão de eventos sem condicionais', async () => {
    const fakeOrder: AdminOrder = {
      id: 101,
      created_at: '2026-09-12T14:30:00Z',
      stripe_session_id: 'sess_123',
      customer_email: 'cliente@exemplo.com',
      customer_name: 'Maria Antônia',
      customer_phone: '+55 11 98765-4321', // Telefone fictício
      items: [
        {
          name: 'Brinco Esmeralda',
          price: 1200,
          quantity: 1,
          image: 'https://example.com/brinco.jpg'
        }
      ],
      subtotal: 1200,
      total: 1200,
      status: 'pendente',
      tracking_code: 'BR987654321XX',
      notes: 'Entregar com embalagem para presente.'
    }

    const statusOptions: OrderStatusOption[] = [
      { value: 'pendente', label: 'Pendente', color: 'bg-amber-100 text-amber-800 border-amber-200' },
      { value: 'preparando', label: 'Preparando', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      { value: 'enviado', label: 'Enviado', color: 'bg-purple-100 text-purple-800 border-purple-200' },
      { value: 'entregue', label: 'Entregue', color: 'bg-green-100 text-green-800 border-green-200' }
    ]

    const wrapper = mount(AdminOrderCard, {
      props: {
        order: fakeOrder,
        statusOptions,
        savingOrderId: null,
        formatCurrency: (val: number) => `R$ ${val.toFixed(2)}`,
        formatDate: () => '12/09/2026 14:30',
        totalItems: () => 1,
        getStatusOption: () => statusOptions[0]!
      }
    })

    const text = wrapper.text()
    expect(text).toContain('#101')
    expect(text).toContain('Maria Antônia')
    expect(text).toContain('cliente@exemplo.com')
    expect(text).toContain('WhatsApp/Tel: +55 11 98765-4321')
    expect(text).toContain('Brinco Esmeralda')

    // Disparar alteração de status
    const statusBtn = wrapper.findAll('button').find(b => b.text().toLowerCase().includes('preparando'))
    expect(statusBtn).toBeDefined()
    await statusBtn!.trigger('click')
    expect(wrapper.emitted('update-status')?.[0]).toEqual([fakeOrder, 'preparando'])

    // Disparar salvar rastreio e notas
    const saveBtn = wrapper.findAll('button').find(b => b.text().toLowerCase().includes('salvar rastreio'))
    expect(saveBtn).toBeDefined()
    await saveBtn!.trigger('click')
    expect(wrapper.emitted('save-tracking')?.[0]).toEqual([fakeOrder])
  })

  it('5. useImageModal - Contrato e assinatura open(payload)', () => {
    const { open, isOpen, images, title, currentIndex, currentProduct } = useImageModal()

    const fakeProduct: AdminProduct = {
      id: 55,
      name: 'Anel Aurora Solitário',
      description: 'Ouro 18k e diamante artesanal.',
      price: 4900,
      stock: 1,
      promo: true,
      duration: 15,
      image: 'https://example.com/capa.jpg',
      images: ['https://example.com/capa.jpg', 'https://example.com/foto2.jpg'],
      createdAt: new Date('2026-09-01T10:00:00Z'),
      category_id: 2,
      category_name: 'Anéis'
    }

    // Assinatura real: open(payload)
    open({
      title: fakeProduct.name,
      images: fakeProduct.images,
      initialIndex: 0,
      product: fakeProduct
    })

    expect(isOpen.value).toBe(true)
    expect(title.value).toBe('Anel Aurora Solitário')
    expect(images.value).toEqual(['https://example.com/capa.jpg', 'https://example.com/foto2.jpg'])
    expect(currentIndex.value).toBe(0)
    expect(currentProduct.value).toEqual(fakeProduct)
  })

  it('6. HeroBanner & ProductImageModal - Guards estritos de toque assíncronos nos elementos reais', async () => {
    // 1. HeroBanner - Disparo assíncrono diretamente no <section> que possui os listeners
    const heroWrapper = mount(HeroBanner, {
      global: {
        stubs: {
          NuxtLink: { template: '<a><slot /></a>' }
        }
      }
    })
    expect(heroWrapper.exists()).toBe(true)

    const heroSection = heroWrapper.get('[data-testid="hero-banner-section"]')

    // Toque com changedTouches vazio (não deve lançar exceção)
    await heroSection.trigger('touchstart', { changedTouches: [] })
    await heroSection.trigger('touchend', { changedTouches: [] })

    // Toque válido com coordenadas reais
    await heroSection.trigger('touchstart', {
      changedTouches: [{ screenX: 180 }]
    })
    await heroSection.trigger('touchend', {
      changedTouches: [{ screenX: 70 }]
    })

    // 2. ProductImageModal - Abre o modal previamente para renderizar o <main>
    const { open, close, isOpen } = useImageModal()
    open({
      title: 'Joia Modal Toque',
      images: ['https://example.com/foto1.jpg', 'https://example.com/foto2.jpg'],
      initialIndex: 0
    })
    expect(isOpen.value).toBe(true)

    const modalWrapper = mount(ProductImageModal, {
      global: {
        stubs: {
          NuxtLink: { template: '<a><slot /></a>' },
          teleport: true
        }
      }
    })

    const modalMain = modalWrapper.get('[data-testid="modal-touch-container"]')

    // Toques com touches vazio
    await modalMain.trigger('touchstart', { touches: [] })
    await modalMain.trigger('touchmove', { touches: [] })
    await modalMain.trigger('touchend', { touches: [] })

    // Toque válido com 1 toque único
    await modalMain.trigger('touchstart', {
      touches: [{ clientX: 250, clientY: 350 }]
    })
    await modalMain.trigger('touchmove', {
      touches: [{ clientX: 150, clientY: 350 }]
    })
    await modalMain.trigger('touchend', { touches: [] })

    // Limpeza final do estado do modal
    close()
    expect(isOpen.value).toBe(false)
    modalWrapper.unmount()
    heroWrapper.unmount()
  })
})
