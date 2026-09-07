import { ref } from 'vue'
import type { AdminProductFormState } from '~/types/admin'
import { getErrorMessage } from '~/types/admin'

export const mockImages = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBcjbHBYrD0eCsPDyqzE2DUcdTEB1Qjw11NnjxixO5hqQcVdr9YufYejTrViLwTZQimN4L2FgCKpwxARwUVfeOPX-F92-adpCIttVmJvGm-So4EhO04oMN72CkCwG6-W4n6CZUvKXkdHsoXLZipYaZwT_EYfczEspNDDtqO-6KQiRMlUn58S4VVg4oQ7V9ao3ID3s69SAkUfG6PCVXT_HE8tLOKg8yK6fF1SN4G0tEQDnK2ohrHe5IujFPWXJqItdd0NYZDTMptmkZ6',
  'https://lh3.googleusercontent.com/aida/AP1WRLvDq2-x30MCpcTRgKRQJDTaf15A_P7vGs32RxaCWnMXc88pl2utfO3Az4vWizC18Hip261_Fu4grr7GukWJ9IUXFR-eb-oDKuyhXCF3kmbxYVmB_Q_WdZg10KEVo_km_Ei5xBM5zxsxHYbfrI_UswNhEA5aaR_bCTi6NdcGfTd0gMV4BEgib36XSIcKBnkV-POlVeLeMiKMIDf2cgAk8oBTBWF-tLBYv_4jnyxsRuP4L7nlpkmyEjMNZ5M',
  'https://lh3.googleusercontent.com/aida/AP1WRLv32RCOxvnLt6F9GVk2xQB2SLlIZw-JJNeXrtBr-AbV3tEAsg7iBiFWAAHGQ2MgJpZjyg7UWvydCDyf6DzWZu1oi6ssAzBHor5h-AbIYfVyAHgaobl_bau3CYboabcP1ETLbyM_y_wsCC698GjwAnLa-OlFeJaeCim5QP0kbo8ebTNhvnCose7vqxvN_giMcm0wZ9pJWC5L_eiXK8Lh050yYOvUDqIdV_lqSO51l-QRvNlMLqGOgcTfON8'
]

export const useAdminProductImages = (form: { value: AdminProductFormState }) => {
  const activePreviewIndex = ref(0)
  const imageInputUrl = ref('')
  const showUrlInput = ref(false)
  const uploading = ref(false)

  const addImageToForm = (url: string) => {
    if (form.value.images.length >= 5) {
      alert('Você atingiu o limite máximo de 5 fotos por produto.')
      return
    }
    form.value.images.push(url)
    form.value.image = form.value.images[0] ?? ''
    activePreviewIndex.value = form.value.images.length - 1
  }

  const selectMockImage = (url: string) => {
    addImageToForm(url)
    showUrlInput.value = false
  }

  const applyCustomUrl = () => {
    if (imageInputUrl.value.trim()) {
      addImageToForm(imageInputUrl.value.trim())
      showUrlInput.value = false
      imageInputUrl.value = ''
    }
  }

  const handleFileUpload = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return

    if (form.value.images.length >= 5) {
      alert('Você atingiu o limite máximo de 5 fotos por produto.')
      target.value = ''
      return
    }

    uploading.value = true
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await $fetch<{ success: boolean; url: string }>('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (response.success && response.url) {
        addImageToForm(response.url)
        showUrlInput.value = false
      } else {
        alert('Falha ao fazer upload da imagem.')
      }
    } catch (err: unknown) {
      console.error('Erro no upload:', err)
      alert(`Erro ao enviar imagem: ${getErrorMessage(err)}`)
    } finally {
      uploading.value = false
      target.value = ''
    }
  }

  const removeImageAt = (index: number) => {
    if (form.value.images.length <= 1) {
      alert('O produto precisa ter pelo menos 1 foto.')
      return
    }
    form.value.images.splice(index, 1)
    form.value.image = form.value.images[0] || ''
    if (activePreviewIndex.value >= form.value.images.length) {
      activePreviewIndex.value = Math.max(0, form.value.images.length - 1)
    }
  }

  const setPrimaryImage = (index: number) => {
    if (index === 0) return
    const removed = form.value.images.splice(index, 1)[0]
    if (!removed) return
    form.value.images.unshift(removed)
    form.value.image = form.value.images[0] ?? ''
    activePreviewIndex.value = 0
  }

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= form.value.images.length) return
    const temp = form.value.images[index]
    const target = form.value.images[targetIndex]
    if (!temp || !target) return
    form.value.images[index] = target
    form.value.images[targetIndex] = temp
    form.value.image = form.value.images[0] ?? ''
    activePreviewIndex.value = targetIndex
  }

  return {
    mockImages,
    activePreviewIndex,
    imageInputUrl,
    showUrlInput,
    uploading,
    addImageToForm,
    selectMockImage,
    applyCustomUrl,
    handleFileUpload,
    removeImageAt,
    setPrimaryImage,
    moveImage
  }
}

export type AdminImageManager = ReturnType<typeof useAdminProductImages>
