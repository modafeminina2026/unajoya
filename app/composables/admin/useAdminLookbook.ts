import { ref, computed } from 'vue'
import type { LookbookPhoto, LookbookFormState } from '~/types/admin'
import { getErrorMessage } from '~/types/admin'

export const useAdminLookbook = (mockImageFallback: string) => {
  const { client } = useSupabase()

  const lookbookPhotos = ref<LookbookPhoto[]>([])
  const loadingLookbook = ref(false)
  const uploadingLookbookImage = ref(false)

  const lookbookForm = ref<LookbookFormState>({
    id: null,
    image: mockImageFallback,
    alt: '',
    sort_order: 0
  })

  const isEditingLookbook = computed(() => lookbookForm.value.id !== null)

  const fetchLookbook = async () => {
    loadingLookbook.value = true
    try {
      const { data, error } = await client
        .from('lookbook_photos')
        .select('*')
        .order('sort_order', { ascending: true })
      if (error) throw error
      lookbookPhotos.value = data || []
    } catch (err) {
      console.error('Erro ao buscar lookbook:', err)
    } finally {
      loadingLookbook.value = false
    }
  }

  const handleLookbookImageUpload = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return

    uploadingLookbookImage.value = true
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await $fetch<{ success: boolean; url: string }>('/api/upload', {
        method: 'POST',
        body: formData
      })
      if (response.success && response.url) {
        lookbookForm.value.image = response.url
      } else {
        alert('Falha ao fazer upload da imagem.')
      }
    } catch (err: unknown) {
      console.error('Erro no upload do lookbook:', err)
      alert(`Erro ao enviar imagem: ${getErrorMessage(err)}`)
    } finally {
      uploadingLookbookImage.value = false
      target.value = ''
    }
  }

  const handleSaveLookbook = async () => {
    if (!lookbookForm.value.image) {
      alert('Por favor, envie ou selecione uma imagem.')
      return
    }

    try {
      if (isEditingLookbook.value) {
        const { error } = await client
          .from('lookbook_photos')
          .update({
            image: lookbookForm.value.image,
            alt: lookbookForm.value.alt,
            sort_order: Number(lookbookForm.value.sort_order)
          })
          .eq('id', lookbookForm.value.id)
        if (error) throw error
      } else {
        const { error } = await client
          .from('lookbook_photos')
          .insert([{
            image: lookbookForm.value.image,
            alt: lookbookForm.value.alt || 'Una Joya Lookbook',
            sort_order: Number(lookbookForm.value.sort_order)
          }])
        if (error) throw error
      }
      clearLookbookForm()
      await fetchLookbook()
    } catch (err) {
      console.error('Erro ao salvar lookbook:', err)
      alert('Erro ao salvar no banco de dados.')
    }
  }

  const handleEditLookbook = (item: LookbookPhoto) => {
    lookbookForm.value = {
      id: item.id,
      image: item.image,
      alt: item.alt,
      sort_order: item.sort_order
    }
  }

  const handleDeleteLookbook = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta foto do lookbook?')) {
      try {
        const { error } = await client
          .from('lookbook_photos')
          .delete()
          .eq('id', id)
        if (error) throw error
        if (lookbookForm.value.id === id) clearLookbookForm()
        await fetchLookbook()
      } catch (err) {
        console.error('Erro ao deletar lookbook:', err)
        alert('Erro ao deletar do banco de dados.')
      }
    }
  }

  const clearLookbookForm = () => {
    lookbookForm.value = {
      id: null,
      image: mockImageFallback,
      alt: '',
      sort_order: lookbookPhotos.value.length
    }
  }

  return {
    lookbookPhotos,
    loadingLookbook,
    uploadingLookbookImage,
    lookbookForm,
    isEditingLookbook,
    fetchLookbook,
    handleLookbookImageUpload,
    handleSaveLookbook,
    handleEditLookbook,
    handleDeleteLookbook,
    clearLookbookForm
  }
}
