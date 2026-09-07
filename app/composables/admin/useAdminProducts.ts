import { ref, computed } from 'vue'
import type { AdminProduct, AdminProductFormState, AdminProductPayload, SupabaseProductRow } from '~/types/admin'
import { mockImages, useAdminProductImages } from '~/composables/admin/useAdminProductImages'
import {
  getExpirationText,
  isExpiringSoon,
  countActiveProducts,
  formatCurrency,
  mapSupabaseProduct
} from '~/composables/admin/useAdminProductExpiry'

export const useAdminProducts = () => {
  const { client } = useSupabase()

  const products = ref<AdminProduct[]>([])
  const loading = ref(true)

  const form = ref<AdminProductFormState>({
    id: null,
    name: '',
    description: '',
    price: null,
    stock: null,
    promo: false,
    duration: 15,
    image: mockImages[0] ?? '',
    images: [mockImages[0] ?? ''],
    category_id: null
  })

  const isEditing = computed(() => form.value.id !== null)
  const imageManager = useAdminProductImages(form)

  const fetchProducts = async () => {
    loading.value = true
    try {
      const { data, error } = await client
        .from('products')
        .select('*, categories(name)')
        .order('id', { ascending: false })

      if (error) throw error
      products.value = (data || []).map((p: SupabaseProductRow) => mapSupabaseProduct(p, mockImages[0] ?? ''))
    } catch (err) {
      console.error('Erro ao buscar produtos:', err)
    } finally {
      loading.value = false
    }
  }

  const activeCount = computed(() => countActiveProducts(products.value))
  const expiredCount = computed(() => products.value.length - activeCount.value)

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

    const payload: AdminProductPayload = {
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
    const fallback = product.image || mockImages[0] || ''
    const imgList = (product.images && product.images.length > 0)
      ? [...product.images]
      : [fallback]

    form.value = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      promo: product.promo,
      duration: product.duration,
      image: imgList[0] ?? (mockImages[0] ?? ''),
      images: imgList,
      category_id: product.category_id || null
    }
    imageManager.activePreviewIndex.value = 0
  }

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta peça do catálogo?')) {
      try {
        const { error } = await client
          .from('products')
          .delete()
          .eq('id', id)

        if (error) throw error
        if (form.value.id === id) clearForm()
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
      image: mockImages[0] ?? '',
      images: [mockImages[0] ?? ''],
      category_id: null
    }
    imageManager.activePreviewIndex.value = 0
  }

  return {
    products,
    loading,
    form,
    isEditing,
    imageManager,
    fetchProducts,
    getExpirationText,
    isExpiringSoon,
    activeCount,
    expiredCount,
    handlePublish,
    handleEdit,
    handleDelete,
    clearForm,
    formatCurrency
  }
}
