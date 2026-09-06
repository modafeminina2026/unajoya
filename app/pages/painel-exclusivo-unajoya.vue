<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

definePageMeta({
  title: 'UNA JOYA - Painel Administrativo'
})

interface AdminProduct {
  id: number
  name: string
  description: string
  price: number
  stock: number
  promo: boolean
  duration: number // em dias
  image: string
  images: string[]
  createdAt: Date
  category_id: number | null
  category_name?: string
}

const { client } = useSupabase()
const { open: openImageModal } = useImageModal()
const products = ref<AdminProduct[]>([])
const loading = ref(true)
const isSidebarOpen = ref(false)

const handleOpenImageModal = (p: AdminProduct) => {
  openImageModal({
    title: p.name,
    images: p.images && p.images.length > 0 ? p.images : [p.image],
    initialIndex: 0,
    product: p
  })
}

// Mock de imagens para facilitar testes rápidos
const mockImages = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBcjbHBYrD0eCsPDyqzE2DUcdTEB1Qjw11NnjxixO5hqQcVdr9YufYejTrViLwTZQimN4L2FgCKpwxARwUVfeOPX-F92-adpCIttVmJvGm-So4EhO04oMN72CkCwG6-W4n6CZUvKXkdHsoXLZipYaZwT_EYfczEspNDDtqO-6KQiRMlUn58S4VVg4oQ7V9ao3ID3s69SAkUfG6PCVXT_HE8tLOKg8yK6fF1SN4G0tEQDnK2ohrHe5IujFPWXJqItdd0NYZDTMptmkZ6',
  'https://lh3.googleusercontent.com/aida/AP1WRLvDq2-x30MCpcTRgKRQJDTaf15A_P7vGs32RxaCWnMXc88pl2utfO3Az4vWizC18Hip261_Fu4grr7GukWJ9IUXFR-eb-oDKuyhXCF3kmbxYVmB_Q_WdZg10KEVo_km_Ei5xBM5zxsxHYbfrI_UswNhEA5aaR_bCTi6NdcGfTd0gMV4BEgib36XSIcKBnkV-POlVeLeMiKMIDf2cgAk8oBTBWF-tLBYv_4jnyxsRuP4L7nlpkmyEjMNZ5M',
  'https://lh3.googleusercontent.com/aida/AP1WRLv32RCOxvnLt6F9GVk2xQB2SLlIZw-JJNeXrtBr-AbV3tEAsg7iBiFWAAHGQ2MgJpZjyg7UWvydCDyf6DzWZu1oi6ssAzBHor5h-AbIYfVyAHgaobl_bau3CYboabcP1ETLbyM_y_wsCC698GjwAnLa-OlFeJaeCim5QP0kbo8ebTNhvnCose7vqxvN_giMcm0wZ9pJWC5L_eiXK8Lh050yYOvUDqIdV_lqSO51l-QRvNlMLqGOgcTfON8'
]

// Estado do formulário
const form = ref({
  id: null as number | null,
  name: '',
  description: '',
  price: null as number | null,
  stock: null as number | null,
  promo: false,
  duration: 15,
  image: mockImages[0],
  images: [mockImages[0]] as string[],
  category_id: null as number | null
})

const isEditing = computed(() => form.value.id !== null)
const activePreviewIndex = ref(0)

// Gerenciamento de imagens (máximo 5)
const imageInputUrl = ref('')
const showUrlInput = ref(false)
const uploading = ref(false)

const addImageToForm = (url: string) => {
  if (form.value.images.length >= 5) {
    alert('Você atingiu o limite máximo de 5 fotos por produto.')
    return
  }
  form.value.images.push(url)
  form.value.image = form.value.images[0]
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
  } catch (err: any) {
    console.error('Erro no upload:', err)
    alert(`Erro ao enviar imagem: ${err.data?.message || err.message || 'Erro desconhecido'}`)
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
  const [img] = form.value.images.splice(index, 1)
  form.value.images.unshift(img)
  form.value.image = form.value.images[0]
  activePreviewIndex.value = 0
}

const moveImage = (index: number, direction: 'left' | 'right') => {
  const targetIndex = direction === 'left' ? index - 1 : index + 1
  if (targetIndex < 0 || targetIndex >= form.value.images.length) return
  const temp = form.value.images[index]
  form.value.images[index] = form.value.images[targetIndex]
  form.value.images[targetIndex] = temp
  form.value.image = form.value.images[0]
  activePreviewIndex.value = targetIndex
}

// Buscar produtos do banco
const fetchProducts = async () => {
  loading.value = true
  try {
    const { data, error } = await client
      .from('products')
      .select('*, categories(name)')
      .order('id', { ascending: false })
    
    if (error) throw error
    
    products.value = (data || []).map(p => {
      let imgList: string[] = []
      if (Array.isArray(p.images) && p.images.length > 0) {
        imgList = p.images.map((img: any) => String(img)).filter(Boolean)
      } else if (p.images && typeof p.images === 'string') {
        try {
          const parsed = JSON.parse(p.images)
          if (Array.isArray(parsed)) imgList = parsed.filter(Boolean)
        } catch {
          imgList = [p.images]
        }
      }
      if (imgList.length === 0 && p.image) {
        imgList = [p.image]
      }
      if (imgList.length === 0) {
        imgList = [mockImages[0]]
      }

      return {
        id: p.id,
        name: p.name,
        description: p.description || '',
        price: Number(p.price),
        stock: Number(p.stock),
        promo: p.promo,
        duration: Number(p.duration),
        image: imgList[0] || p.image || '',
        images: imgList,
        createdAt: new Date(p.created_at),
        category_id: p.category_id,
        category_name: p.categories?.name || 'Nenhuma'
      }
    })
  } catch (err) {
    console.error('Erro ao buscar produtos:', err)
  } finally {
    loading.value = false
  }
}

// Lógica de cálculo de expiração baseada na data de criação
const getExpirationText = (product: AdminProduct) => {
  const diffTime = (product.createdAt.getTime() + product.duration * 24 * 60 * 60 * 1000) - Date.now()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays <= 0) {
    return 'Expirado'
  } else if (diffDays === 1) {
    return '24h restantes'
  } else if (diffDays === 2) {
    return '48h restantes'
  } else {
    return `${diffDays} dias restantes`
  }
}

const isExpiringSoon = (product: AdminProduct) => {
  const diffTime = (product.createdAt.getTime() + product.duration * 24 * 60 * 60 * 1000) - Date.now()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= 2
}

// Contagens para o cabeçalho do status do catálogo
const activeCount = computed(() => products.value.filter(p => {
  const diffTime = (p.createdAt.getTime() + p.duration * 24 * 60 * 60 * 1000) - Date.now()
  return diffTime > 0
}).length)

const expiredCount = computed(() => products.value.length - activeCount.value)

// Ações do painel (Salvar/Editar/Inserir no Supabase)
const handlePublish = async () => {
  if (!form.value.name.trim() || !form.value.price || !form.value.stock) {
    alert('Por favor, preencha o título, preço e estoque.')
    return
  }

  if (form.value.images.length === 0) {
    alert('Adicione pelo menos 1 foto para a joia.')
    return
  }

  const primaryImg = form.value.images[0] || form.value.image || ''
  const imagesArray = form.value.images.slice(0, 5)

  const payload: any = {
    name: form.value.name,
    description: form.value.description,
    price: Number(form.value.price),
    stock: Number(form.value.stock),
    promo: form.value.promo,
    duration: Number(form.value.duration),
    image: primaryImg,
    images: imagesArray,
    category_id: form.value.category_id ? Number(form.value.category_id) : null
  }

  try {
    if (isEditing.value) {
      const { error } = await client
        .from('products')
        .update(payload)
        .eq('id', form.value.id)
      
      if (error) {
        if (error.message?.includes('images') || error.code === 'PGRST204') {
          delete payload.images
          const { error: err2 } = await client.from('products').update(payload).eq('id', form.value.id)
          if (err2) throw err2
        } else {
          throw error
        }
      }
    } else {
      const { error } = await client
        .from('products')
        .insert([payload])
      
      if (error) {
        if (error.message?.includes('images') || error.code === 'PGRST204') {
          delete payload.images
          const { error: err2 } = await client.from('products').insert([payload])
          if (err2) throw err2
        } else {
          throw error
        }
      }
    }

    clearForm()
    await fetchProducts()
  } catch (err) {
    console.error('Erro ao salvar produto:', err)
    alert('Erro ao salvar produto no banco de dados.')
  }
}

const handleEdit = (product: AdminProduct) => {
  const imgList = (product.images && product.images.length > 0)
    ? [...product.images]
    : [product.image || mockImages[0]]

  form.value = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    promo: product.promo,
    duration: product.duration,
    image: imgList[0],
    images: imgList,
    category_id: product.category_id || null
  }
  activePreviewIndex.value = 0
}

const handleDelete = async (id: number) => {
  if (confirm('Tem certeza que deseja excluir esta peça do catálogo?')) {
    try {
      const { error } = await client
        .from('products')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      if (form.value.id === id) {
        clearForm()
      }
      await fetchProducts()
    } catch (err) {
      console.error('Erro ao deletar produto:', err)
      alert('Erro ao deletar produto do banco de dados.')
    }
  }
}

const clearForm = () => {
  form.value = {
    id: null,
    name: '',
    description: '',
    price: null,
    stock: null,
    promo: false,
    duration: 15,
    image: mockImages[0],
    images: [mockImages[0]],
    category_id: null
  }
  activePreviewIndex.value = 0
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

// Controle de abas do painel
const currentTab = ref('products') // 'products', 'categories', 'about', 'carousel', 'lookbook' ou 'orders'

// ============================================================
// ABA CATEGORIAS
// ============================================================
interface Category {
  id: number
  name: string
  slug: string
  sort_order: number
  active: boolean
  created_at?: string
}

const categories = ref<Category[]>([])
const loadingCategories = ref(false)

const categoryForm = ref({
  id: null as number | null,
  name: '',
  slug: '',
  sort_order: 0,
  active: true
})

const isEditingCategory = computed(() => categoryForm.value.id !== null)

const autoGenerateSlug = () => {
  categoryForm.value.slug = categoryForm.value.name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // remove caracteres especiais
    .replace(/\s+/g, '-') // substitui espaços por hífens
    .replace(/-+/g, '-') // remove hífens duplicados
    .trim()
}

const fetchCategories = async () => {
  loadingCategories.value = true
  try {
    const { data, error } = await client
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })
    
    if (error) throw error
    categories.value = data || []
  } catch (err) {
    console.error('Erro ao buscar categorias:', err)
  } finally {
    loadingCategories.value = false
  }
}

const handleSaveCategory = async () => {
  if (!categoryForm.value.name.trim() || !categoryForm.value.slug.trim()) {
    alert('Por favor, preencha o nome e o slug da categoria.')
    return
  }

  try {
    if (isEditingCategory.value) {
      const { error } = await client
        .from('categories')
        .update({
          name: categoryForm.value.name.trim(),
          slug: categoryForm.value.slug.trim(),
          sort_order: Number(categoryForm.value.sort_order),
          active: categoryForm.value.active
        })
        .eq('id', categoryForm.value.id)
      
      if (error) throw error
      alert('Categoria atualizada com sucesso!')
    } else {
      const { error } = await client
        .from('categories')
        .insert([{
          name: categoryForm.value.name.trim(),
          slug: categoryForm.value.slug.trim(),
          sort_order: Number(categoryForm.value.sort_order),
          active: categoryForm.value.active
        }])
      
      if (error) throw error
      alert('Categoria criada com sucesso!')
    }

    clearCategoryForm()
    await fetchCategories()
  } catch (err) {
    console.error('Erro ao salvar categoria:', err)
    alert('Erro ao salvar categoria no banco de dados. Verifique se o slug é único.')
  }
}

const handleEditCategory = (cat: Category) => {
  categoryForm.value = {
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    sort_order: cat.sort_order,
    active: cat.active
  }
}

const handleDeleteCategory = async (id: number) => {
  if (confirm('Tem certeza que deseja excluir esta categoria? Os produtos vinculados a ela não serão excluídos, apenas perderão o vínculo.')) {
    try {
      const { error } = await client
        .from('categories')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      if (categoryForm.value.id === id) {
        clearCategoryForm()
      }
      await fetchCategories()
      alert('Categoria excluída com sucesso!')
    } catch (err) {
      console.error('Erro ao deletar categoria:', err)
      alert('Erro ao deletar categoria do banco de dados.')
    }
  }
}

const clearCategoryForm = () => {
  categoryForm.value = {
    id: null,
    name: '',
    slug: '',
    sort_order: 0,
    active: true
  }
}

// Estado do formulário do Sobre Nós
const aboutForm = ref({
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
  } catch (err: any) {
    console.error('Erro no upload da imagem do Sobre Nós:', err)
    alert(`Erro ao enviar imagem: ${err.data?.message || err.message || 'Erro desconhecido'}`)
  } finally {
    uploadingAboutImage.value = false
    target.value = ''
  }
}

// ============================================================
// ABA CARROSSEL (hero_slides)
// ============================================================
interface HeroSlide {
  id: number
  sort_order: number
  image: string
  subtitle: string
  title: string
  btn1: string
  btn2: string
  align: string
  active: boolean
}

const slides = ref<HeroSlide[]>([])
const loadingSlides = ref(false)
const uploadingSlideImage = ref(false)

const slideForm = ref({
  id: null as number | null,
  sort_order: 0,
  image: mockImages[0],
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
  } catch (err: any) {
    console.error('Erro no upload do slide:', err)
    alert(`Erro ao enviar imagem: ${err.data?.message || err.message || 'Erro desconhecido'}`)
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
    image: mockImages[0],
    subtitle: '',
    title: '',
    btn1: 'VER COLEÇÃO',
    btn2: 'SOBRE NÓS',
    align: 'text-center lg:text-left items-center lg:items-start',
    active: true
  }
}

// ============================================================
// ABA LOOKBOOK (lookbook_photos)
// ============================================================
interface LookbookPhoto {
  id: number
  image: string
  alt: string
  sort_order: number
}

const lookbookPhotos = ref<LookbookPhoto[]>([])
const loadingLookbook = ref(false)
const uploadingLookbookImage = ref(false)

const lookbookForm = ref({
  id: null as number | null,
  image: mockImages[0],
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
  } catch (err: any) {
    console.error('Erro no upload do lookbook:', err)
    alert(`Erro ao enviar imagem: ${err.data?.message || err.message || 'Erro desconhecido'}`)
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
    image: mockImages[0],
    alt: '',
    sort_order: lookbookPhotos.value.length
  }
}

// ============================================================
// ABA PEDIDOS (orders)
// ============================================================
interface AdminOrder {
  id: number
  created_at: string
  stripe_session_id: string | null
  customer_email: string | null
  customer_name: string | null
  items: Array<{ name: string; price: number; quantity: number; image: string }>
  subtotal: number
  total: number
  status: string
  tracking_code: string | null
  notes: string | null
}

const orders = ref<AdminOrder[]>([])
const loadingOrders = ref(false)
const savingOrderId = ref<number | null>(null)

const orderStatusOptions = [
  { value: 'pendente', label: 'Pendente', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { value: 'preparando', label: 'Preparando', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'enviado', label: 'Enviado', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { value: 'entregue', label: 'Entregue', color: 'bg-green-100 text-green-800 border-green-200' }
]

const getStatusOption = (status: string) => {
  return orderStatusOptions.find(o => o.value === status) || orderStatusOptions[0]
}

const pendingOrdersCount = computed(() => orders.value.filter(o => o.status === 'pendente').length)

const fetchOrders = async () => {
  loadingOrders.value = true
  try {
    const { data, error } = await client
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    orders.value = data || []
  } catch (err) {
    console.error('Erro ao buscar pedidos:', err)
  } finally {
    loadingOrders.value = false
  }
}

const handleUpdateOrderStatus = async (order: AdminOrder, newStatus: string) => {
  savingOrderId.value = order.id
  try {
    const { error } = await client
      .from('orders')
      .update({ status: newStatus })
      .eq('id', order.id)
    if (error) throw error
    order.status = newStatus
  } catch (err) {
    console.error('Erro ao atualizar status do pedido:', err)
    alert('Erro ao atualizar status do pedido.')
  } finally {
    savingOrderId.value = null
  }
}

const handleSaveOrderTracking = async (order: AdminOrder) => {
  savingOrderId.value = order.id
  try {
    const { error } = await client
      .from('orders')
      .update({ 
        tracking_code: order.tracking_code,
        notes: order.notes
      })
      .eq('id', order.id)
    if (error) throw error
    alert('Informações do pedido salvas com sucesso!')
  } catch (err) {
    console.error('Erro ao salvar rastreio:', err)
    alert('Erro ao salvar informações do pedido.')
  } finally {
    savingOrderId.value = null
  }
}

const formatOrderDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const orderTotalItems = (order: AdminOrder) => {
  return order.items.reduce((sum, item) => sum + item.quantity, 0)
}

onMounted(() => {
  fetchProducts()
  fetchAboutAdmin()
  fetchSlides()
  fetchLookbook()
  fetchOrders()
  fetchCategories()
})
</script>

<template>
  <div class="bg-surface font-body-md text-on-surface overflow-x-hidden min-h-screen">
    <!-- Top Bar (Mobile Only) -->
    <header class="md:hidden fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile h-16 bg-surface border-b border-soft-stone">
      <button @click="isSidebarOpen = !isSidebarOpen" class="text-primary hover:opacity-75 flex items-center justify-center p-2" aria-label="Abrir menu">
        <span class="material-symbols-outlined text-2xl">menu</span>
      </button>
      <h1 class="font-display-lg text-[20px] tracking-widest text-primary font-bold">UNA JOYA</h1>
      <NuxtLink to="/" class="text-primary hover:opacity-75 flex items-center justify-center p-2" aria-label="Voltar para a loja">
        <span class="material-symbols-outlined text-2xl">home</span>
      </NuxtLink>
    </header>

    <div class="flex min-h-screen pt-16 md:pt-0">
      <!-- Sidebar Overlay (Mobile Only) -->
      <div 
        v-if="isSidebarOpen" 
        @click="isSidebarOpen = false" 
        class="fixed inset-0 bg-black/40 z-40 md:hidden"
      ></div>

      <!-- Navigation Drawer (Sidebar) -->
      <aside 
        class="fixed inset-y-0 left-0 z-50 w-64 md:w-72 bg-surface border-r border-soft-stone flex flex-col justify-between transition-transform duration-300 md:translate-x-0"
        :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
        id="sidebar"
      >
        <div class="flex flex-col h-full px-8 pt-12 pb-8 relative">
          <!-- Close Button (Mobile Only) -->
          <button 
            @click="isSidebarOpen = false" 
            class="absolute top-4 right-4 text-primary hover:opacity-75 md:hidden p-2 flex items-center justify-center"
            aria-label="Fechar menu"
          >
            <span class="material-symbols-outlined text-2xl">close</span>
          </button>

          <div class="mb-12">
            <NuxtLink to="/" class="font-display-lg text-headline-md tracking-[0.2em] text-primary hover:text-champagne-gold font-bold">UNA JOYA</NuxtLink>
            <p class="font-label-caps text-[10px] text-secondary mt-2 opacity-60">PAINEL ADMINISTRATIVO</p>
          </div>
          
          <nav class="flex-1 space-y-2">
            <p class="font-label-caps text-secondary mb-4 text-[11px] tracking-widest">GERENCIAR BOUTIQUE</p>
            <a 
              class="flex items-center gap-4 py-4 transition-all" 
              :class="currentTab === 'orders' ? 'text-primary font-bold border-b border-primary' : 'text-secondary hover:text-primary'"
              href="#" 
              @click="currentTab = 'orders'; isSidebarOpen = false"
            >
              <span class="material-symbols-outlined">shopping_bag</span>
              <span class="font-label-caps">PEDIDOS</span>
              <span v-if="pendingOrdersCount > 0" class="ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{{ pendingOrdersCount }}</span>
            </a>
            <a 
              class="flex items-center gap-4 py-4 transition-all" 
              :class="currentTab === 'products' ? 'text-primary font-bold border-b border-primary' : 'text-secondary hover:text-primary'"
              href="#" 
              @click="currentTab = 'products'; isSidebarOpen = false"
            >
              <span class="material-symbols-outlined">diamond</span>
              <span class="font-label-caps">PRODUTOS</span>
            </a>
            <a 
              class="flex items-center gap-4 py-4 transition-all" 
              :class="currentTab === 'categories' ? 'text-primary font-bold border-b border-primary' : 'text-secondary hover:text-primary'"
              href="#" 
              @click="currentTab = 'categories'; isSidebarOpen = false"
            >
              <span class="material-symbols-outlined">category</span>
              <span class="font-label-caps">CATEGORIAS</span>
            </a>
            <a 
              class="flex items-center gap-4 py-4 transition-all" 
              :class="currentTab === 'carousel' ? 'text-primary font-bold border-b border-primary' : 'text-secondary hover:text-primary'"
              href="#" 
              @click="currentTab = 'carousel'; isSidebarOpen = false"
            >
              <span class="material-symbols-outlined">view_carousel</span>
              <span class="font-label-caps">CARROSSEL</span>
            </a>
            <a 
              class="flex items-center gap-4 py-4 transition-all" 
              :class="currentTab === 'lookbook' ? 'text-primary font-bold border-b border-primary' : 'text-secondary hover:text-primary'"
              href="#" 
              @click="currentTab = 'lookbook'; isSidebarOpen = false"
            >
              <span class="material-symbols-outlined">photo_library</span>
              <span class="font-label-caps">LOOKBOOK (FAIXA)</span>
            </a>
            <a 
              class="flex items-center gap-4 py-4 transition-all" 
              :class="currentTab === 'about' ? 'text-primary font-bold border-b border-primary' : 'text-secondary hover:text-primary'"
              href="#" 
              @click="currentTab = 'about'; isSidebarOpen = false"
            >
              <span class="material-symbols-outlined">info</span>
              <span class="font-label-caps">SOBRE NÓS</span>
            </a>
            <NuxtLink to="/" class="flex items-center gap-4 text-secondary hover:text-primary py-4 transition-all group" @click="isSidebarOpen = false">
              <span class="material-symbols-outlined group-hover:scale-110">home</span>
              <span class="font-label-caps">IR PARA A LOJA</span>
            </NuxtLink>
            <NuxtLink to="/checkout" class="flex items-center gap-4 text-secondary hover:text-primary py-4 transition-all group" @click="isSidebarOpen = false">
              <span class="material-symbols-outlined group-hover:scale-110">shopping_bag</span>
              <span class="font-label-caps">SACOLA/CHECKOUT</span>
            </NuxtLink>
          </nav>
          
          <div class="mt-auto pt-8 border-t border-soft-stone">
            <NuxtLink to="/" class="flex items-center gap-4 text-error opacity-70 hover:opacity-100 transition-opacity" @click="isSidebarOpen = false">
              <span class="material-symbols-outlined">logout</span>
              <span class="font-label-caps">VOLTAR</span>
            </NuxtLink>
          </div>
        </div>
      </aside>

      <!-- Main Content Canvas -->
      <main class="flex-1 min-w-0 md:ml-72 p-margin-mobile md:p-16">
        <!-- Header Section -->
        <div class="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-6 fade-in">
          <div v-if="currentTab === 'products'">
            <h2 class="font-display-lg text-3xl md:text-4xl text-primary mb-2 italic">Gerenciamento do Catálogo</h2>
            <p class="text-on-surface-variant font-body-md max-w-xl text-secondary">
              Curadoria da experiência 'Una Joya'. Adicione novas peças artesanais exclusivas e gerencie seu tempo de exibição na vitrine pública.
            </p>
          </div>
          <div v-else-if="currentTab === 'categories'">
            <h2 class="font-display-lg text-3xl md:text-4xl text-primary mb-2 italic">Gerenciamento de Categorias</h2>
            <p class="text-on-surface-variant font-body-md max-w-xl text-secondary">
              Gerencie as categorias de produtos da sua vitrine pública. Defina a ordem e o status de exibição de cada uma.
            </p>
          </div>
          <div v-else-if="currentTab === 'carousel'">
            <h2 class="font-display-lg text-3xl md:text-4xl text-primary mb-2 italic">Editar Carrossel</h2>
            <p class="text-on-surface-variant font-body-md max-w-xl text-secondary">
              Gerencie as fotos e os textos do banner principal da home. Altere, adicione e reordene os slides do carrossel.
            </p>
          </div>
          <div v-else-if="currentTab === 'lookbook'">
            <h2 class="font-display-lg text-3xl md:text-4xl text-primary mb-2 italic">Editar Lookbook</h2>
            <p class="text-on-surface-variant font-body-md max-w-xl text-secondary">
              Gerencie a faixa rápida de fotos da home page. Faça upload de novas imagens de lifestyle e joias para passar no marquee infinito.
            </p>
          </div>
          <div v-else-if="currentTab === 'about'">
            <h2 class="font-display-lg text-3xl md:text-4xl text-primary mb-2 italic">Editar Sobre Nós</h2>
            <p class="text-on-surface-variant font-body-md max-w-xl text-secondary">
              Gerencie o texto institucional e a foto de apresentação da Una Joya exibidos na página inicial.
            </p>
          </div>
          <div v-else-if="currentTab === 'orders'">
            <h2 class="font-display-lg text-3xl md:text-4xl text-primary mb-2 italic">Gestão de Pedidos</h2>
            <p class="text-on-surface-variant font-body-md max-w-xl text-secondary">
              Acompanhe, atualize o status e adicione códigos de rastreio dos pedidos dos seus clientes.
            </p>
          </div>
          <div class="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <template v-if="currentTab === 'products'">
              <button 
                v-if="isEditing" 
                @click="clearForm"
                class="w-full sm:w-auto border border-soft-stone px-8 py-4 font-label-caps text-secondary hover:bg-soft-stone/20 active:scale-95 transition-all text-xs text-center"
              >
                CANCELAR EDIÇÃO
              </button>
              <button 
                @click="handlePublish" 
                class="w-full sm:w-auto bg-primary text-pure-white px-8 py-4 font-label-caps hover:bg-deep-onyx active:scale-95 transition-all text-xs text-center"
              >
                {{ isEditing ? 'SALVAR ALTERAÇÕES' : 'PUBLICAR PEÇA' }}
              </button>
            </template>
            <template v-else-if="currentTab === 'carousel'">
              <button 
                v-if="isEditingSlide" 
                @click="clearSlideForm"
                class="w-full sm:w-auto border border-soft-stone px-8 py-4 font-label-caps text-secondary hover:bg-soft-stone/20 active:scale-95 transition-all text-xs text-center"
              >
                CANCELAR EDIÇÃO
              </button>
              <button 
                @click="handleSaveSlide" 
                class="w-full sm:w-auto bg-primary text-pure-white px-8 py-4 font-label-caps hover:bg-deep-onyx active:scale-95 transition-all text-xs text-center"
              >
                {{ isEditingSlide ? 'SALVAR SLIDE' : 'ADICIONAR SLIDE' }}
              </button>
            </template>
            <template v-else-if="currentTab === 'lookbook'">
              <button 
                v-if="isEditingLookbook" 
                @click="clearLookbookForm"
                class="w-full sm:w-auto border border-soft-stone px-8 py-4 font-label-caps text-secondary hover:bg-soft-stone/20 active:scale-95 transition-all text-xs text-center"
              >
                CANCELAR EDIÇÃO
              </button>
              <button 
                @click="handleSaveLookbook" 
                class="w-full sm:w-auto bg-primary text-pure-white px-8 py-4 font-label-caps hover:bg-deep-onyx active:scale-95 transition-all text-xs text-center"
              >
                {{ isEditingLookbook ? 'SALVAR FOTO' : 'ADICIONAR FOTO' }}
              </button>
            </template>
            <template v-else-if="currentTab === 'about'">
              <button 
                @click="handleSaveAbout" 
                :disabled="loadingAbout"
                class="w-full sm:w-auto bg-primary text-pure-white px-8 py-4 font-label-caps hover:bg-deep-onyx active:scale-95 transition-all text-xs text-center flex items-center justify-center gap-2"
              >
                <span v-if="loadingAbout" class="material-symbols-outlined animate-spin text-sm">sync</span>
                {{ loadingAbout ? 'SALVANDO...' : 'SALVAR SOBRE NÓS' }}
              </button>
            </template>
            <template v-else-if="currentTab === 'categories'">
              <button 
                v-if="isEditingCategory" 
                @click="clearCategoryForm"
                class="w-full sm:w-auto border border-soft-stone px-8 py-4 font-label-caps text-secondary hover:bg-soft-stone/20 active:scale-95 transition-all text-xs text-center"
              >
                CANCELAR EDIÇÃO
              </button>
              <button 
                @click="handleSaveCategory" 
                class="w-full sm:w-auto bg-primary text-pure-white px-8 py-4 font-label-caps hover:bg-deep-onyx active:scale-95 transition-all text-xs text-center"
              >
                {{ isEditingCategory ? 'SALVAR ALTERAÇÕES' : 'CRIAR CATEGORIA' }}
              </button>
            </template>
          </div>
        </div>

        <!-- Products Tab Content -->
        <div v-if="currentTab === 'products'">
          <!-- Dashboard Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <!-- New Product Form -->
          <section class="lg:col-span-7 bg-surface-container-low p-6 sm:p-8 md:p-12 border border-soft-stone fade-in shadow-sm" style="animation-delay: 0.1s">
            <div class="flex items-center gap-3 mb-10 border-b border-soft-stone pb-4">
              <span class="material-symbols-outlined text-primary" style="font-variation-settings: 'FILL' 1;">
                {{ isEditing ? 'edit_note' : 'add_circle' }}
              </span>
              <h3 class="font-label-caps text-primary tracking-widest font-bold">
                {{ isEditing ? 'EDITAR PRODUTO' : 'NOVO PRODUTO' }}
              </h3>
            </div>
            
            <form @submit.prevent class="space-y-10">
              <!-- Product Title -->
              <div class="group relative border-b border-soft-stone focus-within:border-primary py-2 transition-colors">
                <label class="block font-label-caps text-[10px] text-secondary tracking-widest font-bold mb-1">TÍTULO DA JOIA</label>
                <input 
                  v-model="form.name"
                  class="w-full bg-transparent border-none p-0 focus:ring-0 font-headline-md text-primary placeholder:opacity-30 placeholder:text-primary text-lg" 
                  placeholder="Ex: Colar Aurora em Ouro 18k" 
                  type="text"
                  required
                />
              </div>

              <!-- Description -->
              <div class="group relative border-b border-soft-stone focus-within:border-primary py-2 transition-colors">
                <label class="block font-label-caps text-[10px] text-secondary tracking-widest font-bold mb-1 font-bold">DESCRIÇÃO E ARTESANATO</label>
                <textarea 
                  v-model="form.description"
                  class="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-primary placeholder:opacity-30 placeholder:text-primary resize-none text-sm leading-relaxed" 
                  placeholder="Descreva o processo de produção, as pedras naturais utilizadas e a inspiração da peça..." 
                  rows="3"
                ></textarea>
              </div>

              <!-- Category Selector -->
              <div class="group relative border-b border-soft-stone focus-within:border-primary py-2 transition-colors">
                <label class="block font-label-caps text-[10px] text-secondary tracking-widest font-bold mb-1">CATEGORIA</label>
                <select 
                  v-model="form.category_id"
                  class="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-primary text-sm focus:outline-none appearance-none"
                >
                  <option :value="null">Nenhuma Categoria</option>
                  <option 
                    v-for="cat in categories" 
                    :key="cat.id" 
                    :value="cat.id"
                  >
                    {{ cat.name }}
                  </option>
                </select>
              </div>

              <!-- Price and Stock Row -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div class="group relative border-b border-soft-stone focus-within:border-primary py-2 transition-colors">
                  <label class="block font-label-caps text-[10px] text-secondary tracking-widest font-bold mb-1">VALOR (BRL)</label>
                  <div class="flex items-center">
                    <span class="font-body-md mr-2 text-secondary font-bold text-sm">R$</span>
                    <input 
                      v-model="form.price"
                      class="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-primary text-sm" 
                      placeholder="0,00" 
                      type="number"
                      required
                    />
                  </div>
                </div>
                <div class="group relative border-b border-soft-stone focus-within:border-primary py-2 transition-colors">
                  <label class="block font-label-caps text-[10px] text-secondary tracking-widest font-bold mb-1">ESTOQUE INICIAL</label>
                  <input 
                    v-model="form.stock"
                    class="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-primary text-sm" 
                    placeholder="0" 
                    type="number"
                    required
                  />
                </div>
              </div>

              <!-- Promotion Toggle -->
              <div class="flex items-center justify-between py-4 border-b border-soft-stone">
                <div>
                  <span class="font-label-caps text-[11px] text-primary tracking-widest font-bold">DESTAQUE EM PROMOÇÃO</span>
                  <p class="text-[10px] text-secondary tracking-wider uppercase mt-1">Sinalizar como edição limitada ou oferta especial</p>
                </div>
                <button 
                  type="button" 
                  class="w-12 h-6 rounded-full p-1 transition-colors relative flex items-center"
                  :class="form.promo ? 'bg-[#202223]' : 'bg-soft-stone'"
                  @click="form.promo = !form.promo"
                >
                  <div 
                    class="w-4 h-4 bg-pure-white rounded-full transition-transform shadow-sm"
                    :class="form.promo ? 'translate-x-6' : 'translate-x-0'"
                  ></div>
                </button>
              </div>

              <!-- Catalog Duration Settings -->
              <div class="p-6 bg-surface border border-soft-stone space-y-4">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-champagne-gold text-sm">timer</span>
                  <span class="font-label-caps text-[11px] text-primary tracking-widest font-bold">PERÍODO DE EXCLUSIVIDADE</span>
                </div>
                <p class="text-xs text-secondary leading-relaxed">
                  Nota: Para manter a exclusividade das peças, os produtos serão **removidos automaticamente** da vitrine pública após o período selecionado.
                </p>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label 
                    v-for="days in [10, 15, 20]" 
                    :key="days" 
                    class="cursor-pointer"
                  >
                    <input 
                      v-model="form.duration"
                      class="hidden" 
                      name="duration" 
                      type="radio" 
                      :value="days"
                    />
                    <div 
                      class="text-center py-4 border font-label-caps text-xs tracking-wider transition-all"
                      :class="form.duration === days ? 'border-primary bg-primary text-pure-white' : 'border-soft-stone bg-transparent text-secondary hover:border-primary/50'"
                    >
                      {{ days }} DIAS
                    </div>
                  </label>
                </div>
              </div>

              <!-- Publish Button -->
              <button 
                type="button"
                @click="handlePublish"
                class="w-full bg-primary text-pure-white py-5 font-label-caps text-xs md:text-sm tracking-[0.2em] hover:bg-deep-onyx active:scale-[0.98] transition-all flex items-center justify-center gap-3 font-bold"
              >
                <span class="material-symbols-outlined text-sm">publish</span>
                {{ isEditing ? 'SALVAR ALTERAÇÕES' : 'PUBLICAR JOIA NO CATÁLOGO' }}
              </button>
            </form>
          </section>

          <!-- Visual Assets & Preview -->
          <section class="lg:col-span-5 space-y-12 fade-in" style="animation-delay: 0.2s">
            <!-- Media Upload Card -->
            <div class="bg-surface-container-low p-6 sm:p-8 border border-soft-stone">
              <div class="flex items-center justify-between mb-4">
                <div>
                  <h3 class="font-label-caps text-[11px] text-primary tracking-widest font-bold uppercase">FOTOGRAFIAS DA JOIA</h3>
                  <p class="text-[10px] text-secondary font-body-md mt-0.5">Adicione de 1 até 5 fotos ({{ form.images.length }}/5)</p>
                </div>
                <button 
                  v-if="form.images.length < 5"
                  type="button"
                  @click="showUrlInput = !showUrlInput" 
                  class="text-[10px] font-label-caps text-champagne-gold tracking-widest hover:underline uppercase font-bold"
                >
                  USAR LINK PERSONALIZADO
                </button>
              </div>

              <!-- Media Thumbnails List (Current product images) -->
              <div class="mb-6 space-y-2">
                <label class="block text-[10px] font-label-caps text-secondary font-bold tracking-wider uppercase mb-2">
                  FOTOS ADICIONADAS (FOTO 1 É A CAPA PRINCIPAL)
                </label>
                <div class="grid grid-cols-5 gap-2">
                  <div 
                    v-for="(imgUrl, idx) in form.images" 
                    :key="idx" 
                    class="relative group aspect-[4/5] bg-white border rounded-sm overflow-hidden flex flex-col justify-between"
                    :class="activePreviewIndex === idx ? 'border-primary ring-2 ring-champagne-gold' : 'border-soft-stone'"
                  >
                    <img 
                      :src="imgUrl" 
                      class="w-full h-full object-cover cursor-pointer"
                      @click="activePreviewIndex = idx" 
                      alt="Thumbnail produto" 
                    />
                    <!-- Cover badge -->
                    <span 
                      v-if="idx === 0" 
                      class="absolute top-1 left-1 bg-primary text-white text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wider rounded-xs shadow"
                    >
                      Capa
                    </span>
                    <span 
                      v-else 
                      class="absolute top-1 left-1 bg-black/60 text-white text-[8px] font-bold px-1 py-0.5 rounded-xs"
                    >
                      #{{ idx + 1 }}
                    </span>

                    <!-- Quick Actions Overlay -->
                    <div class="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1">
                      <button 
                        v-if="idx !== 0"
                        type="button"
                        @click.stop="setPrimaryImage(idx)" 
                        title="Definir como capa principal"
                        class="bg-champagne-gold text-primary text-[8px] font-bold px-1.5 py-1 rounded w-full hover:bg-white transition-colors uppercase tracking-wider"
                      >
                        Tornar Capa
                      </button>
                      <div class="flex items-center gap-1 w-full justify-center">
                        <button 
                          v-if="idx > 0" 
                          type="button"
                          @click.stop="moveImage(idx, 'left')" 
                          title="Mover para esquerda"
                          class="bg-white/90 hover:bg-white text-primary text-xs w-6 h-6 flex items-center justify-center rounded font-bold"
                        >
                          ‹
                        </button>
                        <button 
                          v-if="idx < form.images.length - 1" 
                          type="button"
                          @click.stop="moveImage(idx, 'right')" 
                          title="Mover para direita"
                          class="bg-white/90 hover:bg-white text-primary text-xs w-6 h-6 flex items-center justify-center rounded font-bold"
                        >
                          ›
                        </button>
                        <button 
                          type="button"
                          @click.stop="removeImageAt(idx)" 
                          title="Remover foto"
                          class="bg-red-600 hover:bg-red-700 text-white text-xs w-6 h-6 flex items-center justify-center rounded font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- Placeholder slots for remaining slots up to 5 -->
                  <div 
                    v-for="emptyIdx in (5 - form.images.length)" 
                    :key="'empty-' + emptyIdx"
                    class="aspect-[4/5] border border-dashed border-soft-stone flex flex-col items-center justify-center text-center p-1 opacity-40 bg-surface"
                  >
                    <span class="material-symbols-outlined text-secondary text-sm">add_photo_alternate</span>
                    <span class="text-[9px] text-secondary font-bold">Foto {{ form.images.length + emptyIdx }}</span>
                  </div>
                </div>
              </div>

              <!-- Custom URL Input -->
              <div v-if="showUrlInput && form.images.length < 5" class="mb-6 space-y-3 p-4 border border-soft-stone bg-surface">
                <label class="block text-[10px] font-label-caps text-secondary font-bold">ADICIONAR LINK DA IMAGEM</label>
                <div class="flex gap-2">
                  <input 
                    v-model="imageInputUrl" 
                    type="text" 
                    placeholder="Cole o link da foto aqui..." 
                    class="flex-grow bg-white border border-soft-stone px-3 py-2 text-xs focus:outline-none focus:border-primary"
                  />
                  <button 
                    type="button"
                    @click="applyCustomUrl" 
                    class="bg-primary text-white text-xs px-4 py-2 hover:bg-deep-onyx"
                  >
                    Adicionar
                  </button>
                </div>
              </div>

              <!-- Quick mock selection -->
              <div v-if="form.images.length < 5" class="mb-6">
                <label class="block text-[9px] font-label-caps text-secondary font-semibold uppercase mb-2">
                  Imagens sugeridas para teste (clique para adicionar):
                </label>
                <div class="grid grid-cols-3 gap-2">
                  <button 
                    v-for="(img, idx) in mockImages" 
                    :key="idx" 
                    type="button"
                    @click="selectMockImage(img)"
                    class="aspect-square bg-cover bg-center border transition-all hover:opacity-85"
                    :class="form.images.includes(img) ? 'border-primary opacity-40' : 'border-soft-stone'"
                    :style="{ backgroundImage: `url('${img}')` }"
                    :disabled="form.images.includes(img)"
                    :title="form.images.includes(img) ? 'Já adicionada' : 'Adicionar esta imagem'"
                  ></button>
                </div>
              </div>

              <!-- Upload Button -->
              <div v-if="form.images.length < 5">
                <label 
                  class="aspect-[4/5] border-2 border-dashed border-outline-variant flex flex-col items-center justify-center p-8 text-center hover:bg-white transition-colors cursor-pointer relative"
                  :class="{ 'opacity-50 pointer-events-none': uploading }"
                >
                  <input 
                    type="file" 
                    accept="image/*" 
                    class="hidden" 
                    @change="handleFileUpload" 
                    :disabled="uploading"
                  />
                  <div class="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4 border border-soft-stone">
                    <span class="material-symbols-outlined text-primary" :class="{ 'animate-spin': uploading }">
                      {{ uploading ? 'sync' : 'add_a_photo' }}
                    </span>
                  </div>
                  <p class="font-headline-md text-primary text-base mb-2">
                    {{ uploading ? 'Enviando para o R2...' : 'Clique para enviar imagem' }}
                  </p>
                  <p class="text-secondary font-body-md text-xs leading-relaxed">
                    {{ uploading ? 'Por favor, aguarde...' : 'Selecione uma foto do seu computador para salvar no Cloudflare R2 (máx 5 fotos).' }}
                  </p>
                </label>
              </div>
              <div v-else class="p-4 bg-surface border border-soft-stone text-center text-xs text-secondary font-body-md">
                ✓ Limite máximo de 5 fotos atingido para esta peça.
              </div>
            </div>

            <!-- Lookbook Preview Card -->
            <div class="relative group overflow-hidden bg-pure-white border border-soft-stone luxury-shadow">
              <div class="absolute top-4 left-4 z-10 flex gap-2">
                <span class="bg-primary text-pure-white font-label-caps px-3 py-1.5 text-[9px] font-bold tracking-widest">VITRINE PREVIEW</span>
                <span v-if="form.images.length > 1" class="bg-champagne-gold text-primary font-label-caps px-2 py-1.5 text-[9px] font-bold tracking-widest">
                  FOTO {{ activePreviewIndex + 1 }} DE {{ form.images.length }}
                </span>
              </div>
              <div class="aspect-[3/4] bg-soft-stone overflow-hidden relative">
                <img 
                  class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  :src="form.images[activePreviewIndex] || form.image || mockImages[0]"
                  alt="Preview da joia"
                />
                <!-- Indicator dots for preview gallery -->
                <div v-if="form.images.length > 1" class="absolute bottom-3 left-0 right-0 flex justify-center gap-2 px-4 z-10">
                  <button 
                    v-for="(img, pIdx) in form.images" 
                    :key="'prev-' + pIdx" 
                    type="button"
                    @click="activePreviewIndex = pIdx"
                    class="w-2.5 h-2.5 rounded-full transition-all border border-white"
                    :class="activePreviewIndex === pIdx ? 'bg-champagne-gold scale-125' : 'bg-white/60 hover:bg-white'"
                  ></button>
                </div>
              </div>
              <div class="p-6 sm:p-8 text-center">
                <p class="font-label-caps text-secondary text-[10px] mb-2 tracking-widest font-semibold">PREVIEW CATEGORIA</p>
                <h4 class="font-headline-md text-primary text-xl mb-4 italic">
                  {{ form.name || 'Nome da Peça Exclusiva' }}
                </h4>
                <p class="font-body-md text-secondary mb-6 text-xs leading-relaxed max-w-sm mx-auto line-clamp-2">
                  {{ form.description || 'A descrição e os detalhes do acabamento artesanal da peça aparecerão aqui à medida que você escreve.' }}
                </p>
                <div class="flex justify-center items-center gap-4 text-primary font-body-md">
                  <span class="w-12 h-[1px] bg-soft-stone"></span>
                  <span class="font-label-caps tracking-widest font-bold">
                    {{ form.price ? formatCurrency(form.price) : 'R$ 0,00' }}
                  </span>
                  <span class="w-12 h-[1px] bg-soft-stone"></span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Bottom Table / Catalog Quick View -->
        <section class="mt-20 fade-in" style="animation-delay: 0.3s">
          <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-8 border-b border-soft-stone pb-4 gap-4">
            <h3 class="font-display-lg text-2xl md:text-3xl text-primary italic">Status do Catálogo Ativo</h3>
            <div class="flex gap-6 pb-2">
              <span class="flex items-center gap-2 font-label-caps text-xs text-secondary font-bold">
                <span class="w-2.5 h-2.5 rounded-full bg-[#2D8A5B]"></span> {{ activeCount }} ATIVOS
              </span>
              <span class="flex items-center gap-2 font-label-caps text-xs text-secondary font-bold">
                <span class="w-2.5 h-2.5 rounded-full bg-error"></span> {{ expiredCount }} EXPIRADOS
              </span>
            </div>
          </div>
          
          <div class="overflow-x-auto bg-surface border border-soft-stone rounded-sm">
            <table class="w-full border-collapse min-w-[650px]">
              <thead>
                <tr class="text-left border-b border-soft-stone bg-surface-container-low">
                  <th class="py-4 px-6 font-label-caps text-[10px] text-secondary tracking-widest font-bold">JOIA / PRODUTO</th>
                  <th class="py-4 px-6 font-label-caps text-[10px] text-secondary tracking-widest font-bold">CATEGORIA</th>
                  <th class="py-4 px-6 font-label-caps text-[10px] text-secondary tracking-widest font-bold">ESTOQUE</th>
                  <th class="py-4 px-6 font-label-caps text-[10px] text-secondary tracking-widest font-bold">EXPIRAÇÃO</th>
                  <th class="py-4 px-6 font-label-caps text-[10px] text-secondary tracking-widest font-bold">PREÇO</th>
                  <th class="py-4 px-6 font-label-caps text-[10px] text-secondary tracking-widest font-bold">AÇÕES</th>
                </tr>
              </thead>
              <tbody class="text-on-surface font-body-md text-sm">
                <tr 
                  v-for="p in products" 
                  :key="p.id"
                  class="border-b border-soft-stone/40 hover:bg-surface-container-low transition-colors"
                >
                  <td class="py-4 px-6 flex items-center gap-4">
                    <div 
                      class="w-12 h-12 bg-soft-stone flex-shrink-0 border border-soft-stone rounded overflow-hidden relative group/thumb cursor-pointer select-none"
                      @click="handleOpenImageModal(p)"
                      :title="`Clique para visualizar ${p.images?.length || 1} foto(s)`"
                    >
                      <img class="w-full h-full object-cover" :src="p.image" :alt="p.name"/>
                      
                      <!-- Overlay com a quantidade de fotos sobre a miniatura (estilo solicitado) -->
                      <div class="absolute inset-0 bg-black/25 flex items-center justify-center group-hover/thumb:bg-black/45 transition-colors">
                        <span class="text-pure-white font-bold text-sm sm:text-base tracking-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                          {{ p.images?.length || 1 }}
                        </span>
                      </div>
                    </div>
                    <div class="flex flex-col">
                      <span class="font-label-caps font-bold tracking-wide text-primary">{{ p.name }}</span>
                      <div class="flex items-center gap-2 mt-0.5">
                        <span v-if="p.promo" class="text-[9px] font-label-caps text-champagne-gold tracking-widest font-bold">DESTAQUE ATIVO</span>
                        <span v-if="p.images && p.images.length > 1" class="text-[9px] font-label-caps text-secondary font-semibold bg-soft-stone px-1.5 py-0.2 rounded-xs">
                          {{ p.images.length }} FOTOS
                        </span>
                      </div>
                    </div>
                  </td>
                  <td class="py-4 px-6 text-secondary font-semibold">{{ p.category_name || 'Nenhuma' }}</td>
                  <td class="py-4 px-6 text-secondary font-semibold">{{ p.stock }} Unidades</td>
                  <td class="py-4 px-6">
                    <span 
                      class="font-bold text-xs"
                      :class="isExpiringSoon(p) ? 'text-error animate-pulse' : 'text-primary'"
                    >
                      {{ getExpirationText(p) }}
                    </span>
                    <p class="text-[10px] text-secondary mt-0.5 uppercase tracking-wider">Deleção automática</p>
                  </td>
                  <td class="py-4 px-6 text-primary font-bold">{{ formatCurrency(p.price) }}</td>
                  <td class="py-4 px-6">
                    <div class="flex items-center gap-3">
                      <button 
                        @click="handleEdit(p)"
                        class="material-symbols-outlined text-secondary hover:text-primary transition-colors p-1"
                        aria-label="Editar"
                      >
                        edit
                      </button>
                      <button 
                        @click="handleDelete(p.id)"
                        class="material-symbols-outlined text-secondary hover:text-error transition-colors p-1"
                        aria-label="Excluir"
                      >
                        delete
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="products.length === 0">
                  <td colspan="6" class="py-12 text-center text-secondary font-body-md text-sm">
                    Nenhuma joia publicada no catálogo ainda.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        </div>

        <!-- Categories Tab Content -->
        <div v-else-if="currentTab === 'categories'" class="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <!-- Form -->
          <section class="lg:col-span-5 bg-surface-container-low p-6 sm:p-8 md:p-12 border border-soft-stone fade-in shadow-sm">
            <div class="flex items-center gap-3 mb-10 border-b border-soft-stone pb-4">
              <span class="material-symbols-outlined text-primary">
                {{ isEditingCategory ? 'edit_note' : 'add_circle' }}
              </span>
              <h3 class="font-label-caps text-primary tracking-widest font-bold">
                {{ isEditingCategory ? 'EDITAR CATEGORIA' : 'NOVA CATEGORIA' }}
              </h3>
            </div>
            
            <form @submit.prevent class="space-y-10">
              <!-- Name -->
              <div class="group relative border-b border-soft-stone focus-within:border-primary py-2 transition-colors">
                <label class="block font-label-caps text-[10px] text-secondary tracking-widest font-bold mb-1">NOME DA CATEGORIA</label>
                <input 
                  v-model="categoryForm.name"
                  @input="autoGenerateSlug"
                  class="w-full bg-transparent border-none p-0 focus:ring-0 font-headline-md text-primary placeholder:opacity-30 placeholder:text-primary text-lg" 
                  placeholder="Ex: Colares" 
                  type="text"
                  required
                />
              </div>

              <!-- Slug -->
              <div class="group relative border-b border-soft-stone focus-within:border-primary py-2 transition-colors">
                <label class="block font-label-caps text-[10px] text-secondary tracking-widest font-bold mb-1">SLUG (URL)</label>
                <input 
                  v-model="categoryForm.slug"
                  class="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-primary text-sm" 
                  placeholder="ex-colares" 
                  type="text"
                  required
                />
              </div>

              <!-- Sort Order -->
              <div class="group relative border-b border-soft-stone focus-within:border-primary py-2 transition-colors">
                <label class="block font-label-caps text-[10px] text-secondary tracking-widest font-bold mb-1">ORDEM DE EXIBIÇÃO</label>
                <input 
                  v-model.number="categoryForm.sort_order"
                  class="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-primary text-sm" 
                  placeholder="0" 
                  type="number"
                  required
                />
              </div>

              <!-- Active Toggle -->
              <div class="flex items-center justify-between py-4 border-b border-soft-stone">
                <div>
                  <span class="font-label-caps text-[11px] text-primary tracking-widest font-bold">ATIVO</span>
                  <p class="text-[10px] text-secondary tracking-wider uppercase mt-1">Exibir no menu de navegação da loja</p>
                </div>
                <button 
                  type="button" 
                  class="w-12 h-6 rounded-full p-1 transition-colors relative flex items-center"
                  :class="categoryForm.active ? 'bg-[#202223]' : 'bg-soft-stone'"
                  @click="categoryForm.active = !categoryForm.active"
                >
                  <div 
                    class="w-4 h-4 bg-pure-white rounded-full transition-transform shadow-sm"
                    :class="categoryForm.active ? 'translate-x-6' : 'translate-x-0'"
                  ></div>
                </button>
              </div>

              <!-- Save Button -->
              <button 
                type="button"
                @click="handleSaveCategory"
                class="w-full bg-primary text-pure-white py-5 font-label-caps text-xs md:text-sm tracking-[0.2em] hover:bg-deep-onyx active:scale-[0.98] transition-all flex items-center justify-center gap-3 font-bold"
              >
                {{ isEditingCategory ? 'SALVAR ALTERAÇÕES' : 'CRIAR CATEGORIA' }}
              </button>
            </form>
          </section>

          <!-- List -->
          <section class="lg:col-span-7 bg-surface-container-low p-6 sm:p-8 border border-soft-stone fade-in shadow-sm">
            <h3 class="font-label-caps text-primary tracking-widest font-bold mb-6">CATEGORIAS CADASTRADAS</h3>
            
            <div v-if="loadingCategories" class="flex justify-center items-center py-12">
              <span class="material-symbols-outlined animate-spin text-3xl text-secondary">sync</span>
            </div>
            
            <div v-else-if="categories.length === 0" class="text-center py-12 text-secondary text-sm">
              Nenhuma categoria cadastrada.
            </div>
            
            <div v-else class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="border-b border-soft-stone font-label-caps text-[10px] text-secondary tracking-wider">
                    <th class="pb-4 font-bold">ORDEM</th>
                    <th class="pb-4 font-bold">NOME</th>
                    <th class="pb-4 font-bold">SLUG</th>
                    <th class="pb-4 font-bold">STATUS</th>
                    <th class="pb-4 font-bold text-right">AÇÕES</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-soft-stone/40">
                  <tr v-for="cat in categories" :key="cat.id" class="text-sm text-primary hover:bg-soft-stone/10 transition-colors">
                    <td class="py-4">{{ cat.sort_order }}</td>
                    <td class="py-4 font-semibold">{{ cat.name }}</td>
                    <td class="py-4 text-xs font-mono text-secondary">{{ cat.slug }}</td>
                    <td class="py-4">
                      <span class="px-2 py-1 text-[10px] font-bold rounded-full" :class="cat.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                        {{ cat.active ? 'ATIVO' : 'INATIVO' }}
                      </span>
                    </td>
                    <td class="py-4 text-right">
                      <button @click="handleEditCategory(cat)" class="text-primary hover:text-champagne-gold mr-3">
                        <span class="material-symbols-outlined text-lg">edit</span>
                      </button>
                      <button @click="handleDeleteCategory(cat.id)" class="text-error hover:opacity-85 text-red-600 hover:text-red-800">
                        <span class="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <!-- Carousel Tab Content -->
        <div v-else-if="currentTab === 'carousel'" class="space-y-12 fade-in">
          <!-- Form + Preview Grid -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <!-- Slide Form -->
            <section class="lg:col-span-7 bg-surface-container-low p-6 sm:p-8 md:p-12 border border-soft-stone shadow-sm">
              <div class="flex items-center gap-3 mb-10 border-b border-soft-stone pb-4">
                <span class="material-symbols-outlined text-primary" style="font-variation-settings: 'FILL' 1;">
                  {{ isEditingSlide ? 'edit_note' : 'add_circle' }}
                </span>
                <h3 class="font-label-caps text-primary tracking-widest font-bold">
                  {{ isEditingSlide ? 'EDITAR SLIDE' : 'NOVO SLIDE' }}
                </h3>
              </div>

              <form @submit.prevent class="space-y-8">
                <!-- Subtitle/Legenda -->
                <div class="group relative border-b border-soft-stone focus-within:border-primary py-2 transition-colors">
                  <label class="block font-label-caps text-[10px] text-secondary tracking-widest font-bold mb-1">LEGENDA (ex: COLEÇÃO 2026)</label>
                  <input
                    v-model="slideForm.subtitle"
                    class="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-primary placeholder:opacity-30 placeholder:text-primary text-sm"
                    placeholder="COLEÇÃO 2026"
                    type="text"
                    required
                  />
                </div>

                <!-- Title -->
                <div class="group relative border-b border-soft-stone focus-within:border-primary py-2 transition-colors">
                  <label class="block font-label-caps text-[10px] text-secondary tracking-widest font-bold mb-1">TÍTULO PRINCIPAL (use &lt;br&gt; para quebrar linha)</label>
                  <textarea
                    v-model="slideForm.title"
                    class="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-primary placeholder:opacity-30 placeholder:text-primary resize-none text-sm leading-relaxed"
                    placeholder="A ENERGIA DA PEDRA&lt;br&gt;FEITA PARA VESTIR"
                    rows="2"
                    required
                  ></textarea>
                </div>

                <!-- Buttons Row -->
                <div class="grid grid-cols-2 gap-6">
                  <div class="group relative border-b border-soft-stone focus-within:border-primary py-2 transition-colors">
                    <label class="block font-label-caps text-[10px] text-secondary tracking-widest font-bold mb-1">BOTÃO PRIMÁRIO</label>
                    <input
                      v-model="slideForm.btn1"
                      class="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-primary text-sm"
                      placeholder="VER COLEÇÃO"
                      type="text"
                    />
                  </div>
                  <div class="group relative border-b border-soft-stone focus-within:border-primary py-2 transition-colors">
                    <label class="block font-label-caps text-[10px] text-secondary tracking-widest font-bold mb-1">BOTÃO SECUNDÁRIO</label>
                    <input
                      v-model="slideForm.btn2"
                      class="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-primary text-sm"
                      placeholder="SOBRE NÓS"
                      type="text"
                    />
                  </div>
                </div>

                <!-- Alignment + Order Row -->
                <div class="grid grid-cols-2 gap-6">
                  <!-- Alignment -->
                  <div>
                    <label class="block font-label-caps text-[10px] text-secondary tracking-widest font-bold mb-3">ALINHAMENTO DO TEXTO</label>
                    <div class="grid grid-cols-3 gap-2">
                      <label v-for="opt in alignOptions" :key="opt.value" class="cursor-pointer">
                        <input v-model="slideForm.align" type="radio" :value="opt.value" class="hidden" />
                        <div
                          class="text-center py-3 border font-label-caps text-[10px] tracking-wider transition-all"
                          :class="slideForm.align === opt.value ? 'border-primary bg-primary text-pure-white' : 'border-soft-stone text-secondary hover:border-primary/50'"
                        >
                          {{ opt.label }}
                        </div>
                      </label>
                    </div>
                  </div>
                  <!-- Order -->
                  <div class="group relative border-b border-soft-stone focus-within:border-primary py-2 transition-colors">
                    <label class="block font-label-caps text-[10px] text-secondary tracking-widest font-bold mb-1">ORDEM DE EXIBIÇÃO</label>
                    <input
                      v-model="slideForm.sort_order"
                      class="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-primary text-sm"
                      placeholder="0"
                      type="number"
                      min="0"
                    />
                  </div>
                </div>

                <!-- Active Toggle -->
                <div class="flex items-center justify-between py-4 border-b border-soft-stone">
                  <div>
                    <span class="font-label-caps text-[11px] text-primary tracking-widest font-bold">SLIDE ATIVO</span>
                    <p class="text-[10px] text-secondary tracking-wider uppercase mt-1">Exibir este slide no carrossel da home</p>
                  </div>
                  <button
                    type="button"
                    class="w-12 h-6 rounded-full p-1 transition-colors relative flex items-center"
                    :class="slideForm.active ? 'bg-[#202223]' : 'bg-soft-stone'"
                    @click="slideForm.active = !slideForm.active"
                  >
                    <div
                      class="w-4 h-4 bg-pure-white rounded-full transition-transform shadow-sm"
                      :class="slideForm.active ? 'translate-x-6' : 'translate-x-0'"
                    ></div>
                  </button>
                </div>

                <!-- Save Button -->
                <button
                  type="button"
                  @click="handleSaveSlide"
                  class="w-full bg-primary text-pure-white py-5 font-label-caps text-xs md:text-sm tracking-[0.2em] hover:bg-deep-onyx active:scale-[0.98] transition-all flex items-center justify-center gap-3 font-bold"
                >
                  <span class="material-symbols-outlined text-sm">{{ isEditingSlide ? 'save' : 'add_photo_alternate' }}</span>
                  {{ isEditingSlide ? 'SALVAR ALTERAÇÕES DO SLIDE' : 'ADICIONAR SLIDE AO CARROSSEL' }}
                </button>
              </form>
            </section>

            <!-- Image Upload -->
            <section class="lg:col-span-5 space-y-8">
              <!-- Upload Card -->
              <div class="bg-surface-container-low p-6 sm:p-8 border border-soft-stone">
                <div class="flex items-center justify-between mb-6">
                  <h3 class="font-label-caps text-[11px] text-primary tracking-widest font-bold">FOTO DO SLIDE</h3>
                </div>

                <!-- Mock image quick-select -->
                <div class="grid grid-cols-3 gap-2 mb-6">
                  <button
                    v-for="(img, idx) in mockImages"
                    :key="idx"
                    @click="slideForm.image = img"
                    class="aspect-square bg-cover bg-center border-2 transition-all hover:opacity-85"
                    :class="slideForm.image === img ? 'border-primary scale-95 shadow-sm' : 'border-transparent'"
                    :style="{ backgroundImage: `url('${img}')` }"
                    :aria-label="`Selecionar imagem ${idx + 1}`"
                  ></button>
                </div>

                <!-- Upload field -->
                <label
                  class="aspect-[16/9] border-2 border-dashed border-outline-variant flex flex-col items-center justify-center p-6 text-center hover:bg-white transition-colors cursor-pointer relative overflow-hidden"
                  :class="{ 'opacity-50 pointer-events-none': uploadingSlideImage }"
                >
                  <!-- Preview if image set -->
                  <div v-if="slideForm.image" class="absolute inset-0">
                    <img :src="slideForm.image" class="w-full h-full object-cover opacity-40" alt="preview" />
                    <div class="absolute inset-0 flex flex-col items-center justify-center">
                      <span class="material-symbols-outlined text-primary text-3xl mb-2" :class="{ 'animate-spin': uploadingSlideImage }">
                        {{ uploadingSlideImage ? 'sync' : 'add_a_photo' }}
                      </span>
                      <p class="font-body-md text-primary text-sm font-bold">
                        {{ uploadingSlideImage ? 'Enviando...' : 'Clique para trocar a foto' }}
                      </p>
                    </div>
                  </div>
                  <template v-else>
                    <div class="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4 border border-soft-stone">
                      <span class="material-symbols-outlined text-primary" :class="{ 'animate-spin': uploadingSlideImage }">
                        {{ uploadingSlideImage ? 'sync' : 'add_a_photo' }}
                      </span>
                    </div>
                    <p class="font-headline-md text-primary text-base mb-2">Clique para enviar imagem</p>
                    <p class="text-secondary font-body-md text-xs">Foto de alta qualidade para o banner principal</p>
                  </template>
                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleSlideImageUpload"
                    :disabled="uploadingSlideImage"
                  />
                </label>

                <!-- URL input manual -->
                <div class="mt-4 group relative border-b border-soft-stone focus-within:border-primary py-2 transition-colors">
                  <label class="block font-label-caps text-[10px] text-secondary tracking-widest font-bold mb-1">OU COLE UM LINK DE IMAGEM</label>
                  <input
                    v-model="slideForm.image"
                    type="text"
                    placeholder="https://..."
                    class="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-primary text-xs"
                  />
                </div>
              </div>
            </section>
          </div>

          <!-- Slides List Table -->
          <section class="fade-in" style="animation-delay: 0.2s">
            <div class="flex items-end justify-between mb-6 border-b border-soft-stone pb-4">
              <h3 class="font-display-lg text-2xl md:text-3xl text-primary italic">Slides do Carrossel</h3>
              <span class="font-label-caps text-xs text-secondary font-bold">{{ slides.length }} SLIDE(S)</span>
            </div>

            <!-- Loading -->
            <div v-if="loadingSlides" class="flex items-center justify-center py-12">
              <span class="material-symbols-outlined animate-spin text-primary text-3xl">sync</span>
            </div>

            <!-- Grid of slides -->
            <div v-else class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              <div
                v-for="slide in slides"
                :key="slide.id"
                class="relative group overflow-hidden border border-soft-stone bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <!-- Slide image preview -->
                <div class="relative aspect-[16/9] overflow-hidden bg-soft-stone">
                  <img
                    :src="slide.image"
                    :alt="slide.subtitle"
                    class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <!-- Overlay de texto -->
                  <div class="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-4 text-center">
                    <p class="font-label-caps text-pure-white/80 text-[10px] tracking-[0.3em] mb-1">{{ slide.subtitle }}</p>
                    <h4 class="font-display-lg text-pure-white text-lg leading-tight" v-html="slide.title"></h4>
                  </div>
                  <!-- Status badge -->
                  <div class="absolute top-3 left-3">
                    <span
                      class="font-label-caps text-[9px] font-bold px-2 py-1 tracking-widest"
                      :class="slide.active ? 'bg-[#2D8A5B] text-white' : 'bg-error text-white'"
                    >
                      {{ slide.active ? 'ATIVO' : 'INATIVO' }}
                    </span>
                  </div>
                  <!-- Order badge -->
                  <div class="absolute top-3 right-3">
                    <span class="bg-primary text-pure-white font-label-caps text-[9px] px-2 py-1 font-bold">
                      Nº {{ slide.sort_order + 1 }}
                    </span>
                  </div>
                </div>

                <!-- Slide info & actions -->
                <div class="p-4">
                  <div class="flex items-center gap-2 mb-3">
                    <span class="font-label-caps text-[10px] text-secondary tracking-widest">BOTÕES:</span>
                    <span class="font-label-caps text-[10px] text-primary font-bold">{{ slide.btn1 }}</span>
                    <span class="text-soft-stone">|</span>
                    <span class="font-label-caps text-[10px] text-primary font-bold">{{ slide.btn2 }}</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <!-- Toggle Active -->
                    <button
                      @click="handleToggleSlideActive(slide)"
                      class="flex items-center gap-1.5 font-label-caps text-[10px] tracking-widest transition-colors"
                      :class="slide.active ? 'text-error hover:text-error/80' : 'text-[#2D8A5B] hover:text-[#2D8A5B]/80'"
                    >
                      <span class="material-symbols-outlined text-sm">{{ slide.active ? 'visibility_off' : 'visibility' }}</span>
                      {{ slide.active ? 'DESATIVAR' : 'ATIVAR' }}
                    </button>
                    <span class="text-soft-stone">|</span>
                    <!-- Edit -->
                    <button
                      @click="handleEditSlide(slide)"
                      class="flex items-center gap-1.5 font-label-caps text-[10px] tracking-widest text-secondary hover:text-primary transition-colors"
                    >
                      <span class="material-symbols-outlined text-sm">edit</span>
                      EDITAR
                    </button>
                    <span class="text-soft-stone">|</span>
                    <!-- Delete -->
                    <button
                      @click="handleDeleteSlide(slide.id)"
                      class="flex items-center gap-1.5 font-label-caps text-[10px] tracking-widest text-secondary hover:text-error transition-colors"
                    >
                      <span class="material-symbols-outlined text-sm">delete</span>
                      EXCLUIR
                    </button>
                  </div>
                </div>
              </div>

              <!-- Empty state -->
              <div v-if="slides.length === 0" class="col-span-full py-16 text-center text-secondary font-body-md text-sm">
                <span class="material-symbols-outlined text-4xl text-soft-stone mb-4 block">view_carousel</span>
                Nenhum slide cadastrado no carrossel ainda.
              </div>
            </div>
          </section>
        </div>

        <!-- Lookbook Tab Content -->
        <div v-else-if="currentTab === 'lookbook'" class="space-y-12 fade-in">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <!-- Lookbook Photo Form -->
            <section class="lg:col-span-7 bg-surface-container-low p-6 sm:p-8 md:p-12 border border-soft-stone shadow-sm">
              <div class="flex items-center gap-3 mb-10 border-b border-soft-stone pb-4">
                <span class="material-symbols-outlined text-primary" style="font-variation-settings: 'FILL' 1;">
                  {{ isEditingLookbook ? 'edit_note' : 'add_circle' }}
                </span>
                <h3 class="font-label-caps text-primary tracking-widest font-bold">
                  {{ isEditingLookbook ? 'EDITAR FOTO DO LOOKBOOK' : 'NOVA FOTO DO LOOKBOOK' }}
                </h3>
              </div>

              <form @submit.prevent class="space-y-8">
                <!-- Alt / Description -->
                <div class="group relative border-b border-soft-stone focus-within:border-primary py-2 transition-colors">
                  <label class="block font-label-caps text-[10px] text-secondary tracking-widest font-bold mb-1">DESCRIÇÃO DA IMAGEM (ALT TEXT)</label>
                  <input
                    v-model="lookbookForm.alt"
                    class="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-primary placeholder:opacity-30 placeholder:text-primary text-sm"
                    placeholder="Ex: Detalhe do Colar de Esmeraldas Lookbook"
                    type="text"
                    required
                  />
                </div>

                <!-- Order -->
                <div class="group relative border-b border-soft-stone focus-within:border-primary py-2 transition-colors font-bold">
                  <label class="block font-label-caps text-[10px] text-secondary tracking-widest font-bold mb-1">ORDEM DE EXIBIÇÃO</label>
                  <input
                    v-model="lookbookForm.sort_order"
                    class="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-primary text-sm font-semibold"
                    placeholder="0"
                    type="number"
                    min="0"
                  />
                </div>

                <!-- Save Button -->
                <button
                  type="button"
                  @click="handleSaveLookbook"
                  class="w-full bg-primary text-pure-white py-5 font-label-caps text-xs md:text-sm tracking-[0.2em] hover:bg-deep-onyx active:scale-[0.98] transition-all flex items-center justify-center gap-3 font-bold"
                >
                  <span class="material-symbols-outlined text-sm">{{ isEditingLookbook ? 'save' : 'add_photo_alternate' }}</span>
                  {{ isEditingLookbook ? 'SALVAR ALTERAÇÕES' : 'ADICIONAR FOTO AO LOOKBOOK' }}
                </button>
              </form>
            </section>

            <!-- Lookbook Media Card -->
            <section class="lg:col-span-5 space-y-8">
              <div class="bg-surface-container-low p-6 sm:p-8 border border-soft-stone">
                <h3 class="font-label-caps text-[11px] text-primary tracking-widest font-bold mb-6">FOTOGRAFIA</h3>

                <!-- Upload field -->
                <label
                  class="aspect-[3/4] border-2 border-dashed border-outline-variant flex flex-col items-center justify-center p-6 text-center hover:bg-white transition-colors cursor-pointer relative overflow-hidden"
                  :class="{ 'opacity-50 pointer-events-none': uploadingLookbookImage }"
                >
                  <div v-if="lookbookForm.image" class="absolute inset-0">
                    <img :src="lookbookForm.image" class="w-full h-full object-cover opacity-55" alt="preview" />
                    <div class="absolute inset-0 flex flex-col items-center justify-center bg-black/10">
                      <span class="material-symbols-outlined text-primary text-3xl mb-2" :class="{ 'animate-spin': uploadingLookbookImage }">
                        {{ uploadingLookbookImage ? 'sync' : 'add_a_photo' }}
                      </span>
                      <p class="font-body-md text-primary text-sm font-bold">
                        {{ uploadingLookbookImage ? 'Enviando...' : 'Clique para trocar' }}
                      </p>
                    </div>
                  </div>
                  <template v-else>
                    <div class="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4 border border-soft-stone">
                      <span class="material-symbols-outlined text-primary" :class="{ 'animate-spin': uploadingLookbookImage }">
                        {{ uploadingLookbookImage ? 'sync' : 'add_a_photo' }}
                      </span>
                    </div>
                    <p class="font-headline-md text-primary text-base mb-2">Clique para enviar imagem</p>
                    <p class="text-secondary font-body-md text-xs">A foto deve estar em formato vertical</p>
                  </template>
                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleLookbookImageUpload"
                    :disabled="uploadingLookbookImage"
                  />
                </label>

                <!-- URL manual input -->
                <div class="mt-4 group relative border-b border-soft-stone focus-within:border-primary py-2 transition-colors">
                  <label class="block font-label-caps text-[10px] text-secondary tracking-widest font-bold mb-1">OU INSIRA O LINK DA IMAGEM</label>
                  <input
                    v-model="lookbookForm.image"
                    type="text"
                    placeholder="https://..."
                    class="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-primary text-xs"
                  />
                </div>
              </div>
            </section>
          </div>

          <!-- Lookbook Photos List -->
          <section class="fade-in" style="animation-delay: 0.2s">
            <div class="flex items-end justify-between mb-6 border-b border-soft-stone pb-4">
              <h3 class="font-display-lg text-2xl md:text-3xl text-primary italic">Fotos na Faixa Lookbook</h3>
              <span class="font-label-caps text-xs text-secondary font-bold">{{ lookbookPhotos.length }} FOTO(S)</span>
            </div>

            <!-- Loading -->
            <div v-if="loadingLookbook" class="flex items-center justify-center py-12">
              <span class="material-symbols-outlined animate-spin text-primary text-3xl">sync</span>
            </div>

            <!-- Grid -->
            <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 3xl:grid-cols-6 gap-6">
              <div
                v-for="photo in lookbookPhotos"
                :key="photo.id"
                class="relative group overflow-hidden border border-soft-stone bg-white shadow-sm flex flex-col"
              >
                <!-- Aspect vertical image preview -->
                <div class="aspect-[3/4] overflow-hidden bg-soft-stone relative">
                  <img
                    :src="photo.image"
                    :alt="photo.alt"
                    class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <!-- Order badge -->
                  <div class="absolute top-3 right-3">
                    <span class="bg-primary text-pure-white font-label-caps text-[9px] px-2 py-1 font-bold">
                      Ordem: {{ photo.sort_order }}
                    </span>
                  </div>
                </div>

                <!-- Info and actions -->
                <div class="p-4 flex-grow flex flex-col justify-between">
                  <p class="font-body-md text-xs text-secondary line-clamp-2 mb-3 leading-snug">
                    {{ photo.alt }}
                  </p>
                  <div class="flex items-center justify-between border-t border-soft-stone pt-3">
                    <button
                      @click="handleEditLookbook(photo)"
                      class="flex items-center gap-1 font-label-caps text-[9px] text-secondary hover:text-primary transition-colors tracking-widest font-bold"
                    >
                      <span class="material-symbols-outlined text-xs">edit</span>
                      EDITAR
                    </button>
                    <button
                      @click="handleDeleteLookbook(photo.id)"
                      class="flex items-center gap-1 font-label-caps text-[9px] text-secondary hover:text-error transition-colors tracking-widest font-bold"
                    >
                      <span class="material-symbols-outlined text-xs">delete</span>
                      EXCLUIR
                    </button>
                  </div>
                </div>
              </div>

              <!-- Empty state -->
              <div v-if="lookbookPhotos.length === 0" class="col-span-full py-16 text-center text-secondary font-body-md text-sm">
                <span class="material-symbols-outlined text-4xl text-soft-stone mb-4 block">photo_library</span>
                Nenhuma foto cadastrada no lookbook ainda.
              </div>
            </div>
          </section>
        </div>

        <!-- About Us Tab Content -->
        <div v-else-if="currentTab === 'about'" class="grid grid-cols-1 lg:grid-cols-12 gap-12 fade-in">
          <!-- Editor Form -->
          <section class="lg:col-span-7 bg-surface-container-low p-6 sm:p-8 md:p-12 border border-soft-stone shadow-sm">
            <div class="flex items-center gap-3 mb-10 border-b border-soft-stone pb-4">
              <span class="material-symbols-outlined text-primary" style="font-variation-settings: 'FILL' 1;">
                info
              </span>
              <h3 class="font-label-caps text-primary tracking-widest font-bold">
                EDITAR CONTEÚDO INSTITUCIONAL
              </h3>
            </div>
            
            <form @submit.prevent class="space-y-10">
              <!-- Title -->
              <div class="group relative border-b border-soft-stone focus-within:border-primary py-2 transition-colors">
                <label class="block font-label-caps text-[10px] text-secondary tracking-widest font-bold mb-1">TÍTULO PRINCIPAL</label>
                <input 
                  v-model="aboutForm.title"
                  class="w-full bg-transparent border-none p-0 focus:ring-0 font-headline-md text-primary placeholder:opacity-30 placeholder:text-primary text-lg" 
                  placeholder="Ex: Uma jornada de afeto lapidada pelo tempo." 
                  type="text"
                  required
                />
              </div>

              <!-- Content -->
              <div class="group relative border-b border-soft-stone focus-within:border-primary py-2 transition-colors">
                <label class="block font-label-caps text-[10px] text-secondary tracking-widest font-bold mb-1 font-bold">HISTÓRIA / SOBRE NÓS</label>
                <textarea 
                  v-model="aboutForm.content"
                  class="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-primary placeholder:opacity-30 placeholder:text-primary resize-none text-sm leading-relaxed" 
                  placeholder="Conte a história da sua marca..." 
                  rows="10"
                  required
                ></textarea>
              </div>

              <button 
                type="button"
                @click="handleSaveAbout"
                :disabled="loadingAbout"
                class="w-full bg-primary text-pure-white py-5 font-label-caps text-xs md:text-sm tracking-[0.2em] hover:bg-deep-onyx active:scale-[0.98] transition-all flex items-center justify-center gap-3 font-bold"
              >
                <span class="material-symbols-outlined text-sm">{{ loadingAbout ? 'sync' : 'save' }}</span>
                {{ loadingAbout ? 'SALVANDO ALTERAÇÕES...' : 'SALVAR ALTERAÇÕES' }}
              </button>
            </form>
          </section>

          <!-- Visual Assets & Preview -->
          <section class="lg:col-span-5 space-y-12">
            <!-- Image Card -->
            <div class="bg-surface-container-low p-6 sm:p-8 border border-soft-stone">
              <h3 class="font-label-caps text-[11px] text-primary tracking-widest font-bold mb-6">FOTO DE APRESENTAÇÃO</h3>

              <!-- Upload field -->
              <label 
                class="aspect-[4/5] border-2 border-dashed border-outline-variant flex flex-col items-center justify-center p-8 text-center hover:bg-white transition-colors cursor-pointer relative"
                :class="{ 'opacity-50 pointer-events-none': uploadingAboutImage }"
              >
                <input 
                  type="file" 
                  accept="image/*" 
                  class="hidden" 
                  @change="handleAboutImageUpload" 
                  :disabled="uploadingAboutImage"
                />
                <div class="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4 border border-soft-stone">
                  <span class="material-symbols-outlined text-primary" :class="{ 'animate-spin': uploadingAboutImage }">
                    {{ uploadingAboutImage ? 'sync' : 'add_a_photo' }}
                  </span>
                </div>
                <p class="font-headline-md text-primary text-base mb-2">
                  {{ uploadingAboutImage ? 'Enviando para o R2...' : 'Clique para alterar foto' }}
                </p>
                <p class="text-secondary font-body-md text-xs leading-relaxed">
                  Selecione uma foto da sua história para salvar no Cloudflare R2.
                </p>
              </label>
            </div>

            <!-- Preview Card -->
            <div class="relative group overflow-hidden bg-pure-white border border-soft-stone luxury-shadow">
              <div class="absolute top-4 left-4 z-10">
                <span class="bg-primary text-pure-white font-label-caps px-3 py-1.5 text-[9px] font-bold tracking-widest">PREVIEW SITE</span>
              </div>
              <div class="aspect-[4/5] bg-soft-stone overflow-hidden">
                <img 
                  class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  :src="aboutForm.image || '/about_us.png'"
                  alt="Preview do sobre nós"
                />
              </div>
              <div class="p-6 sm:p-8 text-center">
                <p class="font-label-caps text-secondary text-[10px] mb-2 tracking-widest font-semibold">SOBRE NÓS</p>
                <h4 class="font-headline-md text-primary text-xl mb-4 italic">
                  {{ aboutForm.title || 'Título do Sobre Nós' }}
                </h4>
                <p class="font-body-md text-secondary mb-6 text-xs leading-relaxed max-w-sm mx-auto line-clamp-4 whitespace-pre-line text-left">
                  {{ aboutForm.content || 'História da marca...' }}
                </p>
              </div>
            </div>
          </section>
        </div>

        <!-- Orders Tab Content -->
        <div v-if="currentTab === 'orders'" class="fade-in">
          <!-- Counters -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div class="bg-white border border-soft-stone p-4 text-center">
              <p class="text-2xl font-bold text-primary">{{ orders.length }}</p>
              <p class="text-xs text-secondary font-label-caps tracking-wider">TOTAL</p>
            </div>
            <div class="bg-amber-50 border border-amber-200 p-4 text-center">
              <p class="text-2xl font-bold text-amber-700">{{ orders.filter(o => o.status === 'pendente').length }}</p>
              <p class="text-xs text-amber-600 font-label-caps tracking-wider">PENDENTES</p>
            </div>
            <div class="bg-blue-50 border border-blue-200 p-4 text-center">
              <p class="text-2xl font-bold text-blue-700">{{ orders.filter(o => o.status === 'preparando').length }}</p>
              <p class="text-xs text-blue-600 font-label-caps tracking-wider">PREPARANDO</p>
            </div>
            <div class="bg-green-50 border border-green-200 p-4 text-center">
              <p class="text-2xl font-bold text-green-700">{{ orders.filter(o => o.status === 'enviado' || o.status === 'entregue').length }}</p>
              <p class="text-xs text-green-600 font-label-caps tracking-wider">ENVIADOS</p>
            </div>
          </div>

          <!-- Loading -->
          <div v-if="loadingOrders" class="text-center py-16">
            <span class="material-symbols-outlined animate-spin text-4xl text-secondary">sync</span>
            <p class="text-secondary mt-4">Carregando pedidos...</p>
          </div>

          <!-- Empty -->
          <div v-else-if="orders.length === 0" class="bg-white border border-soft-stone p-16 text-center space-y-4">
            <span class="material-symbols-outlined text-6xl text-secondary/30">inbox</span>
            <h3 class="font-headline-md text-xl text-primary">Nenhum pedido ainda</h3>
            <p class="text-secondary text-sm">Os pedidos realizados pelos clientes aparecerão aqui.</p>
          </div>

          <!-- Orders List -->
          <div v-else class="space-y-6">
            <div 
              v-for="order in orders" 
              :key="order.id" 
              class="bg-white border border-soft-stone shadow-sm overflow-hidden"
            >
              <!-- Order Header -->
              <div class="p-5 border-b border-soft-stone flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div class="flex items-start gap-4">
                  <div>
                    <p class="font-bold text-primary text-lg">#{{ order.id }} (Código: {{ order.tracking_code }})</p>
                    <p class="text-xs text-secondary">{{ formatOrderDate(order.created_at) }}</p>
                    <div class="mt-2 text-xs text-secondary space-y-1">
                      <p v-if="order.customer_name"><strong>Cliente:</strong> {{ order.customer_name }}</p>
                      <p v-if="order.customer_email"><strong>E-mail:</strong> {{ order.customer_email }}</p>
                      <p v-if="order.customer_phone"><strong>WhatsApp/Tel:</strong> {{ order.customer_phone }}</p>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <span 
                    class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                    :class="getStatusOption(order.status).color"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
                    {{ getStatusOption(order.status).label }}
                  </span>
                  <p class="font-bold text-primary">{{ formatCurrency(order.total) }}</p>
                </div>
              </div>

              <!-- Order Items Preview -->
              <div class="p-5 border-b border-soft-stone/50">
                <div class="flex flex-wrap gap-3">
                  <div 
                    v-for="(item, idx) in order.items" 
                    :key="idx" 
                    class="flex items-center gap-3 bg-surface-container-low px-3 py-2 border border-soft-stone/50 rounded-sm"
                  >
                    <img 
                      v-if="item.image" 
                      :src="item.image" 
                      :alt="item.name" 
                      class="w-10 h-10 object-cover rounded-sm border border-soft-stone"
                    >
                    <div>
                      <p class="text-xs font-medium truncate max-w-[150px]">{{ item.name }}</p>
                      <p class="text-[10px] text-secondary">Qtd: {{ item.quantity }} · {{ formatCurrency(item.price) }}</p>
                    </div>
                  </div>
                </div>
                <p class="text-xs text-secondary mt-2">{{ orderTotalItems(order) }} {{ orderTotalItems(order) === 1 ? 'item' : 'itens' }} · Subtotal: {{ formatCurrency(order.subtotal) }}</p>
              </div>

              <!-- Order Actions -->
              <div class="p-5 space-y-4">
                <!-- Status Update -->
                <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <label class="text-xs font-label-caps text-secondary tracking-wider flex-shrink-0 w-32">ALTERAR STATUS</label>
                  <div class="flex flex-wrap gap-2">
                    <button 
                      v-for="option in orderStatusOptions" 
                      :key="option.value"
                      @click="handleUpdateOrderStatus(order, option.value)"
                      :disabled="savingOrderId === order.id"
                      class="px-4 py-2 text-[10px] font-bold uppercase tracking-wider border rounded-sm transition-all"
                      :class="[
                        order.status === option.value 
                          ? option.color + ' ring-2 ring-offset-1 ring-current/20' 
                          : 'bg-white border-soft-stone text-secondary hover:border-primary hover:text-primary',
                        savingOrderId === order.id ? 'opacity-50 pointer-events-none' : ''
                      ]"
                    >
                      {{ option.label }}
                    </button>
                  </div>
                </div>

                <!-- Tracking Code -->
                <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <label class="text-xs font-label-caps text-secondary tracking-wider flex-shrink-0 w-32">CÓD. RASTREIO</label>
                  <input 
                    v-model="order.tracking_code"
                    type="text" 
                    placeholder="Ex: BR123456789XX" 
                    class="flex-1 border border-soft-stone px-4 py-2.5 text-sm focus:outline-none focus:border-primary w-full sm:w-auto"
                  >
                </div>

                <!-- Notes -->
                <div class="flex flex-col sm:flex-row items-start gap-3">
                  <label class="text-xs font-label-caps text-secondary tracking-wider flex-shrink-0 w-32 pt-2">NOTAS</label>
                  <textarea 
                    v-model="order.notes"
                    placeholder="Notas internas sobre o pedido..." 
                    rows="2"
                    class="flex-1 border border-soft-stone px-4 py-2.5 text-sm focus:outline-none focus:border-primary resize-none w-full sm:w-auto"
                  ></textarea>
                </div>

                <!-- Save Button -->
                <div class="flex justify-end">
                  <button 
                    @click="handleSaveOrderTracking(order)"
                    :disabled="savingOrderId === order.id"
                    class="bg-primary text-white px-6 py-2.5 font-label-caps text-[10px] tracking-widest hover:bg-deep-onyx active:scale-95 transition-all flex items-center gap-2"
                    :class="{ 'opacity-50 pointer-events-none': savingOrderId === order.id }"
                  >
                    <span v-if="savingOrderId === order.id" class="material-symbols-outlined animate-spin text-sm">sync</span>
                    SALVAR RASTREIO E NOTAS
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.luxury-shadow {
  box-shadow: 0 10px 30px -15px rgba(0,0,0,0.05);
}

.fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
