import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('Contratos Administrativos - 9 Verificações Estáticas Preservadas', () => {
  const root = path.resolve(__dirname, '../../')
  const page = fs.readFileSync(path.join(root, 'app/pages/painel-exclusivo-unajoya.vue'), 'utf8')
  const adminTypes = fs.readFileSync(path.join(root, 'app/types/admin.ts'), 'utf8')

  it('1. fetchHeroSlides é uma função / alias presente na desestruturação e chamada em onMounted', () => {
    expect(page).toContain('fetchSlides: fetchHeroSlides')
    expect(page).toContain('fetchHeroSlides()')
  })

  it('2. Aliases de useAdminProducts estão presentes e corretos', () => {
    expect(page).toContain('form: productForm')
    expect(page).toContain('isEditing: isEditingProduct')
    expect(page).toContain('activeCount: activeProductsCount')
    expect(page).toContain('expiredCount: expiredProductsCount')
    expect(page).toContain('handlePublish: handlePublishProduct')
    expect(page).toContain('handleEdit: handleEditProduct')
    expect(page).toContain('handleDelete: handleDeleteProduct')
    expect(page).toContain('clearForm: clearProductForm')
  })

  it('3. useAdminProducts é chamado sem argumentos', () => {
    expect(page).toMatch(/useAdminProducts\(\s*\)/)
  })

  it('4. handleOpenImageModal existe e integra useImageModal', () => {
    expect(page).toContain('handleOpenImageModal')
    expect(page).toContain('useImageModal')
    expect(page).toContain('openImageModal({')
  })

  it('5. alignOptions é enviado para AdminHeroSection', () => {
    expect(page).toContain(':align-options="alignOptions"')
  })

  it('6. handleToggleSlideActive está conectado ao evento toggle-active', () => {
    expect(page).toContain('@toggle-active="handleToggleSlideActive"')
  })

  it('7. Props obrigatórias de AdminHeroSection são enviadas pelo pai', () => {
    expect(page).toContain(':slides="heroSlides"')
    expect(page).toContain(':loading-slides="loadingSlides"')
    expect(page).toContain(':uploading-slide-image="uploadingSlideImage"')
    expect(page).toContain(':slide-form="slideForm"')
    expect(page).toContain(':is-editing-slide="isEditingSlide"')
    expect(page).toContain(':align-options="alignOptions"')
    expect(page).toContain(':mock-images="mockImages"')
  })

  it('8. Eventos do carrossel estão conectados com os nomes exatos esperados', () => {
    expect(page).toContain('@save="handleSaveSlide"')
    expect(page).toContain('@upload="handleSlideImageUpload"')
    expect(page).toContain('@edit="handleEditSlide"')
    expect(page).toContain('@delete="handleDeleteSlide"')
    expect(page).toContain('@toggle-active="handleToggleSlideActive"')
  })

  it('9. customer_phone está presente na interface AdminOrder', () => {
    expect(adminTypes).toContain('customer_phone: string | null')
  })
})
