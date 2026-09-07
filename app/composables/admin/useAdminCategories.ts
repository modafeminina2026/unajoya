import { ref, computed } from 'vue'
import type { Category, CategoryFormState } from '~/types/admin'

export const useAdminCategories = () => {
  const { client } = useSupabase()

  const categories = ref<Category[]>([])
  const loadingCategories = ref(false)

  const categoryForm = ref<CategoryFormState>({
    id: null,
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
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
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

  return {
    categories,
    loadingCategories,
    categoryForm,
    isEditingCategory,
    autoGenerateSlug,
    fetchCategories,
    handleSaveCategory,
    handleEditCategory,
    handleDeleteCategory,
    clearCategoryForm
  }
}