<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { AdminProduct, AdminTab } from '~/types/admin'

import AdminSidebar from '~/components/admin/AdminSidebar.vue'
import AdminHeader from '~/components/admin/AdminHeader.vue'
import AdminProductsSection from '~/components/admin/products/AdminProductsSection.vue'
import AdminCategoriesSection from '~/components/admin/categories/AdminCategoriesSection.vue'
import AdminHeroSection from '~/components/admin/hero/AdminHeroSection.vue'
import AdminLookbookSection from '~/components/admin/lookbook/AdminLookbookSection.vue'
import AdminAboutSection from '~/components/admin/about/AdminAboutSection.vue'
import AdminOrdersSection from '~/components/admin/orders/AdminOrdersSection.vue'

import { useAdminCategories } from '~/composables/admin/useAdminCategories'
import { useAdminProducts } from '~/composables/admin/useAdminProducts'
import { mockImages } from '~/composables/admin/useAdminProductImages'
import { useAdminHeroSlides } from '~/composables/admin/useAdminHeroSlides'
import { useAdminLookbook } from '~/composables/admin/useAdminLookbook'
import { useAdminAbout } from '~/composables/admin/useAdminAbout'
import { useAdminOrders } from '~/composables/admin/useAdminOrders'
import { useImageModal } from '~/composables/useImageModal'

definePageMeta({
  title: 'UNA JOYA - Painel Administrativo'
})

const mockImageFallback: string = mockImages[0] ?? ''

const currentTab = ref<AdminTab>('products')
const isSidebarOpen = ref(false)

const { open: openImageModal } = useImageModal()

const handleOpenImageModal = (p: AdminProduct) => {
  openImageModal({
    title: p.name,
    images: p.images && p.images.length > 0 ? p.images : [p.image],
    initialIndex: 0,
    product: p
  })
}

// Composables
const {
  categories,
  categoryForm,
  isEditingCategory,
  loadingCategories,
  fetchCategories,
  handleSaveCategory,
  handleEditCategory,
  handleDeleteCategory,
  clearCategoryForm,
  autoGenerateSlug
} = useAdminCategories()

const {
  products,
  form: productForm,
  isEditing: isEditingProduct,
  activeCount: activeProductsCount,
  expiredCount: expiredProductsCount,
  imageManager,
  fetchProducts,
  handlePublish: handlePublishProduct,
  handleEdit: handleEditProduct,
  handleDelete: handleDeleteProduct,
  clearForm: clearProductForm,
  getExpirationText,
  isExpiringSoon,
  formatCurrency
} = useAdminProducts()

const {
  slides: heroSlides,
  loadingSlides,
  uploadingSlideImage,
  slideForm,
  isEditingSlide,
  alignOptions,
  fetchSlides: fetchHeroSlides,
  handleSlideImageUpload,
  handleSaveSlide,
  handleEditSlide,
  handleDeleteSlide,
  handleToggleSlideActive,
  clearSlideForm
} = useAdminHeroSlides(mockImageFallback)

const {
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
} = useAdminLookbook(mockImageFallback)

const {
  aboutForm,
  loadingAbout,
  uploadingAboutImage,
  fetchAboutAdmin,
  handleSaveAbout,
  handleAboutImageUpload
} = useAdminAbout()

const {
  orders,
  loadingOrders,
  savingOrderId,
  orderStatusOptions,
  getStatusOption,
  pendingOrdersCount,
  fetchOrders,
  handleUpdateOrderStatus,
  handleSaveOrderTracking,
  formatOrderDate,
  orderTotalItems
} = useAdminOrders()

onMounted(() => {
  fetchProducts()
  fetchHeroSlides()
  fetchLookbook()
  fetchOrders()
  fetchCategories()
  fetchAboutAdmin()
})
</script>

<template>
  <div class="admin-panel bg-surface font-body-md text-on-surface overflow-x-hidden min-h-screen">
    <AdminSidebar
      v-model:current-tab="currentTab"
      v-model:is-sidebar-open="isSidebarOpen"
      :pending-orders-count="pendingOrdersCount"
    />

    <div class="flex min-h-screen pt-16 md:pt-0">
      <!-- Main Content Canvas -->
      <main class="flex-1 min-w-0 md:ml-72 p-margin-mobile md:p-16">
        <!-- Header Section -->
        <AdminHeader
          :current-tab="currentTab"
          :is-editing-product="isEditingProduct"
          :is-editing-slide="isEditingSlide"
          :is-editing-lookbook="isEditingLookbook"
          :is-editing-category="isEditingCategory"
          :loading-about="loadingAbout"
          @publish-product="handlePublishProduct"
          @cancel-edit-product="clearProductForm"
          @save-slide="handleSaveSlide"
          @cancel-edit-slide="clearSlideForm"
          @save-lookbook="handleSaveLookbook"
          @cancel-edit-lookbook="clearLookbookForm"
          @save-about="handleSaveAbout"
          @save-category="handleSaveCategory"
          @cancel-edit-category="clearCategoryForm"
        />

        <!-- Tab Contents -->
        <AdminProductsSection
          v-if="currentTab === 'products'"
          :products="products"
          :categories="categories"
          :form="productForm"
          :is-editing="isEditingProduct"
          :active-count="activeProductsCount"
          :expired-count="expiredProductsCount"
          :image-manager="imageManager"
          :get-expiration-text="getExpirationText"
          :is-expiring-soon="isExpiringSoon"
          @publish="handlePublishProduct"
          @open-modal="handleOpenImageModal"
          @edit="handleEditProduct"
          @delete="handleDeleteProduct"
        />

        <AdminCategoriesSection
          v-else-if="currentTab === 'categories'"
          :categories="categories"
          :category-form="categoryForm"
          :is-editing-category="isEditingCategory"
          :loading-categories="loadingCategories"
          @save="handleSaveCategory"
          @auto-slug="autoGenerateSlug"
          @edit="handleEditCategory"
          @delete="handleDeleteCategory"
        />

        <AdminHeroSection
          v-else-if="currentTab === 'carousel'"
          :slides="heroSlides"
          :loading-slides="loadingSlides"
          :uploading-slide-image="uploadingSlideImage"
          :slide-form="slideForm"
          :is-editing-slide="isEditingSlide"
          :align-options="alignOptions"
          :mock-images="mockImages"
          @save="handleSaveSlide"
          @upload="handleSlideImageUpload"
          @edit="handleEditSlide"
          @delete="handleDeleteSlide"
          @toggle-active="handleToggleSlideActive"
        />

        <AdminLookbookSection
          v-else-if="currentTab === 'lookbook'"
          :photos="lookbookPhotos"
          :loading="loadingLookbook"
          :form="lookbookForm"
          :is-editing="isEditingLookbook"
          :uploading-image="uploadingLookbookImage"
          @save="handleSaveLookbook"
          @upload-image="handleLookbookImageUpload"
          @edit="handleEditLookbook"
          @delete="handleDeleteLookbook"
        />

        <AdminAboutSection
          v-else-if="currentTab === 'about'"
          :form="aboutForm"
          :loading="loadingAbout"
          :uploading-image="uploadingAboutImage"
          @save="handleSaveAbout"
          @upload-image="handleAboutImageUpload"
        />

        <AdminOrdersSection
          v-else-if="currentTab === 'orders'"
          :orders="orders"
          :loading="loadingOrders"
          :saving-order-id="savingOrderId"
          :status-options="orderStatusOptions"
          :format-currency="formatCurrency"
          :format-date="formatOrderDate"
          :total-items="orderTotalItems"
          :get-status-option="getStatusOption"
          @update-status="handleUpdateOrderStatus"
          @save-tracking="handleSaveOrderTracking"
        />
      </main>
    </div>
  </div>
</template>

<style>
@import '~/assets/css/admin/admin-panel.css';
</style>
