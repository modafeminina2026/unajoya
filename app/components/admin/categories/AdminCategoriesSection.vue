<script setup lang="ts">
import type { Category, CategoryFormState } from '~/types/admin'
import AdminCategoryForm from '~/components/admin/categories/AdminCategoryForm.vue'

defineProps<{
  categories: Category[]
  categoryForm: CategoryFormState
  isEditingCategory: boolean
  loadingCategories: boolean
}>()

const emit = defineEmits<{
  save: []
  autoSlug: []
  edit: [category: Category]
  delete: [id: number]
}>()
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
    <!-- Form -->
    <AdminCategoryForm
      :form="categoryForm"
      :is-editing="isEditingCategory"
      @save="emit('save')"
      @auto-slug="emit('autoSlug')"
    />

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
                <button @click="emit('edit', cat)" class="text-primary hover:text-champagne-gold mr-3" aria-label="Editar categoria">
                  <span class="material-symbols-outlined text-lg">edit</span>
                </button>
                <button @click="emit('delete', cat.id)" class="text-error hover:opacity-85 text-red-600 hover:text-red-800" aria-label="Excluir categoria">
                  <span class="material-symbols-outlined text-lg">delete</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>