import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { useAdminProductImages } from '../../app/composables/admin/useAdminProductImages'
import type { AdminProductFormState } from '../../app/types/admin'

describe('useAdminProductImages - Comportamento e Gerenciamento de Imagens', () => {
  beforeEach(() => {
    window.alert = vi.fn()
  })

  it('1. Adiciona mock e sincroniza capa', () => {
    const form = ref<AdminProductFormState>({
      id: null,
      name: 'Joia Teste',
      description: 'Desc',
      price: 100,
      stock: 1,
      promo: false,
      duration: 15,
      image: 'https://example.com/img1.jpg',
      images: ['https://example.com/img1.jpg'],
      category_id: null
    })

    const manager = useAdminProductImages(form)
    manager.selectMockImage('https://example.com/mock2.jpg')

    expect(form.value.images.length).toBe(2)
    expect(form.value.images[1]).toBe('https://example.com/mock2.jpg')
    expect(form.value.image).toBe('https://example.com/img1.jpg')
    expect(manager.activePreviewIndex.value).toBe(1)
  })

  it('2. Adiciona URL customizada e fecha input', () => {
    const form = ref<AdminProductFormState>({
      id: null,
      name: 'Joia Teste',
      description: 'Desc',
      price: 100,
      stock: 1,
      promo: false,
      duration: 15,
      image: 'https://example.com/img1.jpg',
      images: ['https://example.com/img1.jpg'],
      category_id: null
    })

    const manager = useAdminProductImages(form)
    manager.showUrlInput.value = true
    manager.imageInputUrl.value = 'https://example.com/custom.jpg'
    manager.applyCustomUrl()

    expect(form.value.images.length).toBe(2)
    expect(form.value.images[1]).toBe('https://example.com/custom.jpg')
    expect(manager.showUrlInput.value).toBe(false)
    expect(manager.imageInputUrl.value).toBe('')
  })

  it('3. Respeita o limite máximo de 5 fotos', () => {
    const form = ref<AdminProductFormState>({
      id: null,
      name: 'Joia Teste',
      description: 'Desc',
      price: 100,
      stock: 1,
      promo: false,
      duration: 15,
      image: 'https://example.com/1.jpg',
      images: [
        'https://example.com/1.jpg',
        'https://example.com/2.jpg',
        'https://example.com/3.jpg',
        'https://example.com/4.jpg',
        'https://example.com/5.jpg'
      ],
      category_id: null
    })

    const manager = useAdminProductImages(form)
    const alertSpy = vi.spyOn(window, 'alert')

    manager.selectMockImage('https://example.com/6.jpg')
    expect(alertSpy).toHaveBeenCalledWith('Você atingiu o limite máximo de 5 fotos por produto.')
    expect(form.value.images.length).toBe(5)
  })

  it('4. Define imagem como capa principal (setPrimaryImage)', () => {
    const form = ref<AdminProductFormState>({
      id: null,
      name: 'Joia Teste',
      description: 'Desc',
      price: 100,
      stock: 1,
      promo: false,
      duration: 15,
      image: 'https://example.com/1.jpg',
      images: [
        'https://example.com/1.jpg',
        'https://example.com/2.jpg',
        'https://example.com/3.jpg'
      ],
      category_id: null
    })

    const manager = useAdminProductImages(form)
    manager.setPrimaryImage(2) // Tornar '3.jpg' capa

    expect(form.value.images[0]).toBe('https://example.com/3.jpg')
    expect(form.value.image).toBe('https://example.com/3.jpg')
    expect(manager.activePreviewIndex.value).toBe(0)
  })

  it('5. Reordena imagens para esquerda e direita', () => {
    const form = ref<AdminProductFormState>({
      id: null,
      name: 'Joia Teste',
      description: 'Desc',
      price: 100,
      stock: 1,
      promo: false,
      duration: 15,
      image: 'https://example.com/A.jpg',
      images: [
        'https://example.com/A.jpg',
        'https://example.com/B.jpg',
        'https://example.com/C.jpg'
      ],
      category_id: null
    })

    const manager = useAdminProductImages(form)

    // Move B (índice 1) para esquerda (índice 0)
    manager.moveImage(1, 'left')
    expect(form.value.images[0]).toBe('https://example.com/B.jpg')
    expect(form.value.images[1]).toBe('https://example.com/A.jpg')
    expect(form.value.image).toBe('https://example.com/B.jpg')

    // Move B (índice 0) para direita (índice 1)
    manager.moveImage(0, 'right')
    expect(form.value.images[0]).toBe('https://example.com/A.jpg')
    expect(form.value.images[1]).toBe('https://example.com/B.jpg')
  })

  it('6. Remove foto e impede exclusão quando resta apenas 1', () => {
    const form = ref<AdminProductFormState>({
      id: null,
      name: 'Joia Teste',
      description: 'Desc',
      price: 100,
      stock: 1,
      promo: false,
      duration: 15,
      image: 'https://example.com/1.jpg',
      images: [
        'https://example.com/1.jpg',
        'https://example.com/2.jpg'
      ],
      category_id: null
    })

    const manager = useAdminProductImages(form)
    manager.removeImageAt(0)

    expect(form.value.images.length).toBe(1)
    expect(form.value.images[0]).toBe('https://example.com/2.jpg')
    expect(form.value.image).toBe('https://example.com/2.jpg')

    // Tentar remover a única foto restante
    const alertSpy = vi.spyOn(window, 'alert')
    manager.removeImageAt(0)
    expect(alertSpy).toHaveBeenCalledWith('O produto precisa ter pelo menos 1 foto.')
    expect(form.value.images.length).toBe(1)
  })
})
