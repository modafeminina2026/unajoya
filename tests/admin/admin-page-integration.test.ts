import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'

// Suporte estrito e tipado ao macro definePageMeta do Nuxt via vi.stubGlobal
vi.stubGlobal('definePageMeta', () => {})

// Mocks dos composables e serviços antes de importar a página real
const mockOpenModal = vi.fn()
vi.mock('../../app/composables/useImageModal', () => ({
  useImageModal: () => ({
    open: mockOpenModal,
    isOpen: ref(false),
    images: ref<string[]>([]),
    title: ref(''),
    currentIndex: ref(0),
    currentProduct: ref(null),
    close: vi.fn(),
    next: vi.fn(),
    prev: vi.fn(),
    setIndex: vi.fn()
  })
}))

const mockFetchProducts = vi.fn()
const mockFetchHeroSlides = vi.fn()
const mockFetchLookbook = vi.fn()
const mockFetchOrders = vi.fn()
const mockFetchCategories = vi.fn()
const mockFetchAboutAdmin = vi.fn()
const mockHandleSaveSlide = vi.fn()
const mockHandlePublishProduct = vi.fn()
const mockHandleEditProduct = vi.fn()
const mockHandleDeleteProduct = vi.fn()
const mockClearProductForm = vi.fn()

import type { AdminProduct, AdminProductFormState, AdminTab } from '../../app/types/admin'

const fakeProduct: AdminProduct = {
  id: 88,
  name: 'Colar de Diamante Raro',
  description: 'Peça artesanal única.',
  price: 9800,
  stock: 1,
  promo: true,
  duration: 15,
  image: 'https://example.com/dia1.jpg',
  images: ['https://example.com/dia1.jpg', 'https://example.com/dia2.jpg'],
  createdAt: new Date('2026-09-01T12:00:00.000Z'),
  category_id: 1,
  category_name: 'Colares'
}

const mockProductsList = ref<AdminProduct[]>([fakeProduct])

const mockProductForm = ref<AdminProductFormState>({
  id: null,
  name: '',
  description: '',
  price: null,
  stock: null,
  promo: false,
  duration: 15,
  image: 'https://example.com/mock.jpg',
  images: ['https://example.com/mock.jpg'],
  category_id: null
})

vi.mock('../../app/composables/admin/useAdminProducts', () => ({
  useAdminProducts: () => ({
    products: mockProductsList,
    form: mockProductForm,
    isEditing: ref(false),
    activeCount: ref(1),
    expiredCount: ref(0),
    imageManager: {
      mockImages: [],
      activePreviewIndex: ref(0),
      imageInputUrl: ref(''),
      showUrlInput: ref(false),
      uploading: ref(false),
      addImageToForm: vi.fn(),
      selectMockImage: vi.fn(),
      applyCustomUrl: vi.fn(),
      handleFileUpload: vi.fn(),
      removeImageAt: vi.fn(),
      setPrimaryImage: vi.fn(),
      moveImage: vi.fn()
    },
    fetchProducts: mockFetchProducts,
    handlePublish: mockHandlePublishProduct,
    handleEdit: mockHandleEditProduct,
    handleDelete: mockHandleDeleteProduct,
    clearForm: mockClearProductForm,
    getExpirationText: () => '15 dias restantes',
    isExpiringSoon: () => false,
    formatCurrency: (val: number) => `R$ ${val.toFixed(2)}`
  })
}))

vi.mock('../../app/composables/admin/useAdminHeroSlides', () => ({
  useAdminHeroSlides: () => ({
    slides: ref([]),
    loadingSlides: ref(false),
    uploadingSlideImage: ref(false),
    slideForm: ref({ id: null, sort_order: 0, image: '', subtitle: '', title: '', btn1: '', btn2: '', align: 'text-center', active: true }),
    isEditingSlide: ref(false),
    alignOptions: [],
    fetchSlides: mockFetchHeroSlides,
    handleSlideImageUpload: vi.fn(),
    handleSaveSlide: mockHandleSaveSlide,
    handleEditSlide: vi.fn(),
    handleDeleteSlide: vi.fn(),
    handleToggleSlideActive: vi.fn(),
    clearSlideForm: vi.fn()
  })
}))

vi.mock('../../app/composables/admin/useAdminLookbook', () => ({
  useAdminLookbook: () => ({
    lookbookPhotos: ref([]),
    loadingLookbook: ref(false),
    uploadingLookbookImage: ref(false),
    lookbookForm: ref({ id: null, image: '', alt: '', sort_order: 0 }),
    isEditingLookbook: ref(false),
    fetchLookbook: mockFetchLookbook,
    handleLookbookImageUpload: vi.fn(),
    handleSaveLookbook: vi.fn(),
    handleEditLookbook: vi.fn(),
    handleDeleteLookbook: vi.fn(),
    clearLookbookForm: vi.fn()
  })
}))

vi.mock('../../app/composables/admin/useAdminAbout', () => ({
  useAdminAbout: () => ({
    aboutForm: ref({ title: '', content: '', image: '' }),
    loadingAbout: ref(false),
    uploadingAboutImage: ref(false),
    fetchAboutAdmin: mockFetchAboutAdmin,
    handleSaveAbout: vi.fn(),
    handleAboutImageUpload: vi.fn()
  })
}))

vi.mock('../../app/composables/admin/useAdminCategories', () => ({
  useAdminCategories: () => ({
    categories: ref([]),
    categoryForm: ref({ id: null, name: '', slug: '', sort_order: 1, active: true }),
    isEditingCategory: ref(false),
    loadingCategories: ref(false),
    fetchCategories: mockFetchCategories,
    handleSaveCategory: vi.fn(),
    handleEditCategory: vi.fn(),
    handleDeleteCategory: vi.fn(),
    clearCategoryForm: vi.fn(),
    autoGenerateSlug: vi.fn()
  })
}))

vi.mock('../../app/composables/admin/useAdminOrders', () => ({
  useAdminOrders: () => ({
    orders: ref([]),
    loadingOrders: ref(false),
    savingOrderId: ref(null),
    orderStatusOptions: [],
    getStatusOption: vi.fn(),
    pendingOrdersCount: ref(0),
    fetchOrders: mockFetchOrders,
    handleUpdateOrderStatus: vi.fn(),
    handleSaveOrderTracking: vi.fn(),
    formatOrderDate: vi.fn(),
    orderTotalItems: vi.fn()
  })
}))

// Importação da página administrativa real e componentes relacionados
import AdminPage from '../../app/pages/painel-exclusivo-unajoya.vue'
import AdminSidebar from '../../app/components/admin/AdminSidebar.vue'
import AdminHeroSection from '../../app/components/admin/hero/AdminHeroSection.vue'

describe('AdminPage Integration - Teste Real de Integração e Orquestração da Página', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockProductsList.value = [fakeProduct]
    vi.stubGlobal('definePageMeta', () => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('1. Monta a página real sem exceções e executa as 6 funções em onMounted', () => {
    const wrapper = mount(AdminPage, {
      global: {
        stubs: {
          NuxtLink: { template: '<a><slot /></a>' },
          AdminHeader: { template: '<header data-testid="header" />' },
          AdminProductsSection: { template: '<div data-testid="products-sec" />' },
          AdminCategoriesSection: { template: '<div data-testid="categories-sec" />' },
          AdminHeroSection: { template: '<div data-testid="hero-sec" />' },
          AdminLookbookSection: { template: '<div data-testid="lookbook-sec" />' },
          AdminAboutSection: { template: '<div data-testid="about-sec" />' },
          AdminOrdersSection: { template: '<div data-testid="orders-sec" />' }
        }
      }
    })

    expect(wrapper.exists()).toBe(true)

    // Confirma execução das seis funções de carregamento disparadas no onMounted da página
    expect(mockFetchProducts).toHaveBeenCalledTimes(1)
    expect(mockFetchHeroSlides).toHaveBeenCalledTimes(1)
    expect(mockFetchLookbook).toHaveBeenCalledTimes(1)
    expect(mockFetchOrders).toHaveBeenCalledTimes(1)
    expect(mockFetchCategories).toHaveBeenCalledTimes(1)
    expect(mockFetchAboutAdmin).toHaveBeenCalledTimes(1)
  })

  it('2. Alterna realmente entre as 6 seções administrativas via AdminSidebar', async () => {
    const wrapper = mount(AdminPage, {
      global: {
        stubs: {
          NuxtLink: { template: '<a><slot /></a>' },
          AdminHeader: true,
          AdminProductsSection: { template: '<div id="sec-products">Produtos</div>' },
          AdminCategoriesSection: { template: '<div id="sec-categories">Categorias</div>' },
          AdminHeroSection: { template: '<div id="sec-hero">Hero</div>' },
          AdminLookbookSection: { template: '<div id="sec-lookbook">Lookbook</div>' },
          AdminAboutSection: { template: '<div id="sec-about">Sobre</div>' },
          AdminOrdersSection: { template: '<div id="sec-orders">Pedidos</div>' }
        }
      }
    })

    const sidebar = wrapper.findComponent(AdminSidebar)
    expect(sidebar.exists()).toBe(true)

    // 1. Inicialmente em 'products'
    expect(wrapper.find('#sec-products').exists()).toBe(true)
    expect(wrapper.find('#sec-categories').exists()).toBe(false)

    // 2. Troca para 'categories'
    sidebar.vm.$emit('update:currentTab', 'categories' as AdminTab)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('#sec-categories').exists()).toBe(true)
    expect(wrapper.find('#sec-products').exists()).toBe(false)

    // 3. Troca para 'carousel'
    sidebar.vm.$emit('update:currentTab', 'carousel' as AdminTab)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('#sec-hero').exists()).toBe(true)

    // 4. Troca para 'lookbook'
    sidebar.vm.$emit('update:currentTab', 'lookbook' as AdminTab)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('#sec-lookbook').exists()).toBe(true)

    // 5. Troca para 'about'
    sidebar.vm.$emit('update:currentTab', 'about' as AdminTab)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('#sec-about').exists()).toBe(true)

    // 6. Troca para 'orders'
    sidebar.vm.$emit('update:currentTab', 'orders' as AdminTab)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('#sec-orders').exists()).toBe(true)
  })

  it('3. Caminho real da miniatura: clique na miniatura dispara openModal através de AdminProductsSection até open() do modal', async () => {
    // Montagem da página real com AdminProductsSection e AdminProductsList reais (sem mocks das seções de produtos)
    const wrapper = mount(AdminPage, {
      global: {
        stubs: {
          NuxtLink: { template: '<a><slot /></a>' },
          AdminHeader: true,
          AdminProductForm: true, // stub do formulário para isolar a tabela
          AdminCategoriesSection: true,
          AdminHeroSection: true,
          AdminLookbookSection: true,
          AdminAboutSection: true,
          AdminOrdersSection: true
        }
      }
    })

    // 1. Localiza a miniatura real renderizada pelo AdminProductsList
    const thumbnail = wrapper.find('[data-testid="product-thumbnail"]')
    expect(thumbnail.exists()).toBe(true)

    // 2. Clica diretamente na miniatura real
    await thumbnail.trigger('click')

    // 3. Confirma que AdminProductsList emitiu openModal, AdminProductsSection encaminhou,
    // a página executou handleOpenImageModal e invocou o open mockado com o payload canônico
    expect(mockOpenModal).toHaveBeenCalledTimes(1)
    expect(mockOpenModal).toHaveBeenCalledWith({
      title: 'Colar de Diamante Raro',
      images: ['https://example.com/dia1.jpg', 'https://example.com/dia2.jpg'],
      initialIndex: 0,
      product: fakeProduct
    })
  })

  it('4. Evento do carrossel chega ao handler correspondente da página', async () => {
    const wrapper = mount(AdminPage, {
      global: {
        stubs: {
          NuxtLink: { template: '<a><slot /></a>' },
          AdminHeader: true,
          AdminProductsSection: true,
          AdminCategoriesSection: true,
          AdminLookbookSection: true,
          AdminAboutSection: true,
          AdminOrdersSection: true
        }
      }
    })

    // Troca para a aba de carrossel
    const sidebar = wrapper.findComponent(AdminSidebar)
    sidebar.vm.$emit('update:currentTab', 'carousel' as AdminTab)
    await wrapper.vm.$nextTick()

    const heroSection = wrapper.findComponent(AdminHeroSection)
    expect(heroSection.exists()).toBe(true)

    // Dispara evento save da seção
    heroSection.vm.$emit('save')
    await wrapper.vm.$nextTick()

    expect(mockHandleSaveSlide).toHaveBeenCalledTimes(1)
  })
})
