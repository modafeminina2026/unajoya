<script setup lang="ts">
import type { AdminProduct, AdminProductFormState, Category } from '~/types/admin'
import type { AdminImageManager } from '~/composables/admin/useAdminProductImages'
import AdminProductForm from '~/components/admin/products/AdminProductForm.vue'
import AdminProductsList from '~/components/admin/products/AdminProductsList.vue'

defineProps<{
  products: AdminProduct[]
  categories: Category[]
  form: AdminProductFormState
  isEditing: boolean
  activeCount: number
  expiredCount: number
  imageManager: AdminImageManager
  getExpirationText: (p: AdminProduct) => string
  isExpiringSoon: (p: AdminProduct) => boolean
}>()

const emit = defineEmits<{
  publish: []
  openModal: [product: AdminProduct]
  edit: [product: AdminProduct]
  delete: [id: number]
}>()
</script>

<template>
  <div class="space-y-12 fade-in">
    <!-- Form & Media Preview -->
    <AdminProductForm
      :form="form"
      :categories="categories"
      :is-editing="isEditing"
      :image-manager="imageManager"
      @publish="emit('publish')"
    />

    <!-- Products Table -->
    <AdminProductsList
      :products="products"
      :active-count="activeCount"
      :expired-count="expiredCount"
      :get-expiration-text="getExpirationText"
      :is-expiring-soon="isExpiringSoon"
      @open-modal="(p) => emit('openModal', p)"
      @edit="(p) => emit('edit', p)"
      @delete="(id) => emit('delete', id)"
    />
  </div>
</template>