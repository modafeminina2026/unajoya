import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { AdminProduct } from '../../app/types/admin'

// Tipagem estrita para o cliente falso local de Supabase
interface FakeQueryBuilder {
  select: () => FakeQueryBuilder
  order: () => Promise<{ data: never[]; error: null }>
  update: () => FakeQueryBuilder
  insert: () => FakeQueryBuilder
  delete: () => FakeQueryBuilder
  eq: () => Promise<{ error: null }>
}

interface FakeSupabaseClient {
  from: (table: string) => FakeQueryBuilder
}

const createFakeClient = (): FakeSupabaseClient => {
  const builder: FakeQueryBuilder = {
    select: () => builder,
    order: () => Promise.resolve({ data: [], error: null }),
    update: () => builder,
    insert: () => builder,
    delete: () => builder,
    eq: () => Promise.resolve({ error: null })
  }
  return {
    from: () => builder
  }
}

// Configura global tipado usando vi.stubGlobal
vi.stubGlobal('useSupabase', () => ({
  client: createFakeClient()
}))

// Importação do composable REAL
import { useAdminProducts } from '../../app/composables/admin/useAdminProducts'

describe('useAdminProducts - Composable Real e Vínculo Reativo do Formulário', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    // Restaura o stub para o próximo teste se necessário
    vi.stubGlobal('useSupabase', () => ({
      client: createFakeClient()
    }))
  })

  it('Valida ciclo de vida real: handleEdit, mutação via imageManager, clearForm e persistência de vínculo reativo', () => {
    // 1. Chamar useAdminProducts() real
    // 2. Obter form, imageManager, handleEdit e clearForm reais
    const { form, imageManager, handleEdit, clearForm } = useAdminProducts()

    // Estado inicial antes da edição
    expect(form.value.id).toBeNull()
    expect(form.value.name).toBe('')
    expect(form.value.images.length).toBeGreaterThanOrEqual(1)

    // Produto fictício para edição
    const fakeProduct: AdminProduct = {
      id: 42,
      name: 'Gargantilha Safira Imperial',
      description: 'Ouro branco 18k e safira birmanesa artesanal.',
      price: 7800,
      stock: 3,
      promo: true,
      duration: 30,
      image: 'https://example.com/safira-capa.jpg',
      images: [
        'https://example.com/safira-capa.jpg',
        'https://example.com/safira-verso.jpg'
      ],
      createdAt: new Date('2026-09-01T12:00:00.000Z'),
      category_id: 5,
      category_name: 'Gargantilhas'
    }

    // 3. Chamar handleEdit com produto fictício
    handleEdit(fakeProduct)

    // 4. Confirmar todos os campos transferidos
    expect(form.value.id).toBe(42)
    expect(form.value.name).toBe('Gargantilha Safira Imperial')
    expect(form.value.description).toBe('Ouro branco 18k e safira birmanesa artesanal.')
    expect(form.value.price).toBe(7800)
    expect(form.value.stock).toBe(3)
    expect(form.value.promo).toBe(true)
    expect(form.value.duration).toBe(30)
    expect(form.value.image).toBe('https://example.com/safira-capa.jpg')
    expect(form.value.images).toEqual([
      'https://example.com/safira-capa.jpg',
      'https://example.com/safira-verso.jpg'
    ])
    expect(form.value.category_id).toBe(5)
    expect(imageManager.activePreviewIndex.value).toBe(0)

    // 5. Adicionar uma imagem pelo imageManager
    imageManager.addImageToForm('https://example.com/safira-detalhe-3.jpg')

    // 6. Confirmar que a imagem entrou no mesmo form
    expect(form.value.images).toHaveLength(3)
    expect(form.value.images[2]).toBe('https://example.com/safira-detalhe-3.jpg')
    expect(imageManager.activePreviewIndex.value).toBe(2)

    // 7. Chamar clearForm
    clearForm()

    // 8. Confirmar os valores iniciais
    expect(form.value.id).toBeNull()
    expect(form.value.name).toBe('')
    expect(form.value.description).toBe('')
    expect(form.value.price).toBeNull()
    expect(form.value.stock).toBeNull()
    expect(form.value.promo).toBe(false)
    expect(form.value.duration).toBe(15)
    expect(form.value.category_id).toBeNull()
    expect(imageManager.activePreviewIndex.value).toBe(0)

    // 9. Adicionar outra imagem depois da limpeza
    imageManager.addImageToForm('https://example.com/nova-peca-foto1.jpg')

    // 10. Confirmar que o imageManager continua conectado ao mesmo ref
    expect(form.value.images).toContain('https://example.com/nova-peca-foto1.jpg')
    expect(form.value.image).toBe(form.value.images[0])
    expect(imageManager.activePreviewIndex.value).toBe(form.value.images.length - 1)
  })
})
