import { ref, computed } from 'vue'
import type { HeroSlide, HeroSlideFormState } from '~/types/admin'
import { getErrorMessage } from '~/types/admin'

export const useAdminHeroSlides = (mockImageFallback: string) => {
  const { client } = useSupabase()

  const slides = ref<HeroSlide[]>([])
  const loadingSlides = ref(false)
  const uploadingSlideImage = ref(false)

  const slideForm = ref<HeroSlideFormState>({
    id: null,
    sort_order: 0,
    image: mockImageFallback,
    subtitle: '',
    title: '',
    btn1: 'VER COLEÇÃO',
    btn2: 'SOBRE NÓS',
    align: 'text-center lg:text-left items-center lg:items-start',
    active: true
  })

  const isEditingSlide = computed(() => slideForm.value.id !== null)

  const alignOptions = [
    { label: 'ESQUERDA', value: 'text-center lg:text-left items-center lg:items-start' },
    { label: 'CENTRO', value: 'text-center items-center' },
    { label: 'DIREITA', value: 'text-center lg:text-right items-center lg:items-end' }
  ]

  const fetchSlides = async () => {
    loadingSlides.value = true
    try {
      const { data, error } = await client
        .from('hero_slides')
        .select('*')
        .order('sort_order', { ascending: true })
      if (error) throw error
      slides.value = data || []
    } catch (err) {
      console.error('Erro ao buscar slides:', err)
    } finally {
      loadingSlides.value = false
    }
  }

  const handleSlideImageUpload = async (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return

    uploadingSlideImage.value = true
    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await $fetch<{ success: boolean; url: string }>('/api/upload', {
        method: 'POST',
        body: formData
      })
      if (response.success && response.url) {
        slideForm.value.image = response.url
      } else {
        alert('Falha ao fazer upload da imagem.')
      }
    } catch (err: unknown) {
      console.error('Erro no upload do slide:', err)
      alert(`Erro ao enviar imagem: ${getErrorMessage(err)}`)
    } finally {
      uploadingSlideImage.value = false
      target.value = ''
    }
  }

  const handleSaveSlide = async () => {
    if (!slideForm.value.image || !slideForm.value.subtitle || !slideForm.value.title) {
      alert('Por favor, preencha a imagem, legenda e título do slide.')
      return
    }

    try {
      if (isEditingSlide.value) {
        const { error } = await client
          .from('hero_slides')
          .update({
            sort_order: Number(slideForm.value.sort_order),
            image: slideForm.value.image,
            subtitle: slideForm.value.subtitle,
            title: slideForm.value.title,
            btn1: slideForm.value.btn1,
            btn2: slideForm.value.btn2,
            align: slideForm.value.align,
            active: slideForm.value.active
          })
          .eq('id', slideForm.value.id)
        if (error) throw error
      } else {
        const { error } = await client
          .from('hero_slides')
          .insert([{
            sort_order: Number(slideForm.value.sort_order),
            image: slideForm.value.image,
            subtitle: slideForm.value.subtitle,
            title: slideForm.value.title,
            btn1: slideForm.value.btn1,
            btn2: slideForm.value.btn2,
            align: slideForm.value.align,
            active: slideForm.value.active
          }])
        if (error) throw error
      }
      clearSlideForm()
      await fetchSlides()
    } catch (err) {
      console.error('Erro ao salvar slide:', err)
      alert('Erro ao salvar o slide no banco de dados.')
    }
  }

  const handleEditSlide = (slide: HeroSlide) => {
    slideForm.value = {
      id: slide.id,
      sort_order: slide.sort_order,
      image: slide.image,
      subtitle: slide.subtitle,
      title: slide.title,
      btn1: slide.btn1,
      btn2: slide.btn2,
      align: slide.align,
      active: slide.active
    }
  }

  const handleDeleteSlide = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este slide do carrossel?')) {
      try {
        const { error } = await client
          .from('hero_slides')
          .delete()
          .eq('id', id)
        if (error) throw error
        if (slideForm.value.id === id) clearSlideForm()
        await fetchSlides()
      } catch (err) {
        console.error('Erro ao deletar slide:', err)
        alert('Erro ao deletar o slide do banco de dados.')
      }
    }
  }

  const handleToggleSlideActive = async (slide: HeroSlide) => {
    try {
      const { error } = await client
        .from('hero_slides')
        .update({ active: !slide.active })
        .eq('id', slide.id)
      if (error) throw error
      await fetchSlides()
    } catch (err) {
      console.error('Erro ao alternar status do slide:', err)
    }
  }

  const clearSlideForm = () => {
    slideForm.value = {
      id: null,
      sort_order: slides.value.length,
      image: mockImageFallback,
      subtitle: '',
      title: '',
      btn1: 'VER COLEÇÃO',
      btn2: 'SOBRE NÓS',
      align: 'text-center lg:text-left items-center lg:items-start',
      active: true
    }
  }

  return {
    slides,
    loadingSlides,
    uploadingSlideImage,
    slideForm,
    isEditingSlide,
    alignOptions,
    fetchSlides,
    handleSlideImageUpload,
    handleSaveSlide,
    handleEditSlide,
    handleDeleteSlide,
    handleToggleSlideActive,
    clearSlideForm
  }
}
