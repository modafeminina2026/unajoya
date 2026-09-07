import { ref } from 'vue'
import type { AboutUsFormState } from '~/types/admin'
import { getErrorMessage } from '~/types/admin'

export const useAdminAbout = () => {
  const { client } = useSupabase()

  const aboutForm = ref<AboutUsFormState>({
    title: '',
    content: '',
    image: ''
  })
  const loadingAbout = ref(false)
  const uploadingAboutImage = ref(false)

  const fetchAboutAdmin = async () => {
    try {
      const { data, error } = await client
        .from('about_us')
        .select('*')
        .eq('id', 1)
        .single()

      if (error) throw error
      if (data) {
        aboutForm.value = {
          title: data.title,
          content: data.content,
          image: data.image
        }
      }
    } catch (err) {
      console.error('Erro ao buscar dados do Sobre Nós:', err)
    }
  }

  const handleSaveAbout = async () => {
    if (!aboutForm.value.title.trim() || !aboutForm.value.content.trim()) {
      alert('Por favor, preencha o título e o conteúdo.')
      return
    }

    loadingAbout.value = true
    try {
      const { error } = await client
        .from('about_us')
        .update({
          title: aboutForm.value.title,
          content: aboutForm.value.content,
          image: aboutForm.value.image
        })
        .eq('id', 1)

      if (error) throw error
      alert('Sobre Nós atualizado com sucesso!')
    } catch (err) {
      console.error('Erro ao salvar Sobre Nós:', err)
      alert('Erro ao salvar as alterações do Sobre Nós no banco de dados.')
    } finally {
      loadingAbout.value = false
    }
  }

  const handleAboutImageUpload = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return

    uploadingAboutImage.value = true
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await $fetch<{ success: boolean; url: string }>('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (response.success && response.url) {
        aboutForm.value.image = response.url
      } else {
        alert('Falha ao fazer upload da imagem.')
      }
    } catch (err: unknown) {
      console.error('Erro no upload da imagem do Sobre Nós:', err)
      alert(`Erro ao enviar imagem: ${getErrorMessage(err)}`)
    } finally {
      uploadingAboutImage.value = false
      target.value = ''
    }
  }

  return {
    aboutForm,
    loadingAbout,
    uploadingAboutImage,
    fetchAboutAdmin,
    handleSaveAbout,
    handleAboutImageUpload
  }
}
