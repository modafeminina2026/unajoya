<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import type { AdminProduct, AdminTab } from '~/types/admin'

import AdminSidebar from '~/components/admin/AdminSidebar.vue'
import AdminHeader from '~/components/admin/AdminHeader.vue'
import AdminProductsSection from '~/components/admin/products/AdminProductsSection.vue'
import AdminCategoriesSection from '~/components/admin/categories/AdminCategoriesSection.vue'
import AdminHeroSection from '~/components/admin/hero/AdminHeroSection.vue'
import AdminLookbookSection from '~/components/admin/lookbook/AdminLookbookSection.vue'
import AdminAboutSection from '~/components/admin/about/AdminAboutSection.vue'
import AdminOrdersSection from '~/components/admin/orders/AdminOrdersSection.vue'
import AdminLogin from '~/components/admin/auth/AdminLogin.vue'
import AdminDashboardSection from '~/components/admin/finance/AdminDashboardSection.vue'
import AdminSalesSection from '~/components/admin/finance/AdminSalesSection.vue'
import AdminExpensesSection from '~/components/admin/finance/AdminExpensesSection.vue'
import AdminContactsSection from '~/components/admin/finance/AdminContactsSection.vue'
import AdminImportSection from '~/components/admin/finance/AdminImportSection.vue'
import AdminQuickAdd from '~/components/admin/finance/AdminQuickAdd.vue'
import AdminMobileNav from '~/components/admin/AdminMobileNav.vue'

import { useAdminCategories } from '~/composables/admin/useAdminCategories'
import { useAdminProducts } from '~/composables/admin/useAdminProducts'
import { mockImages } from '~/composables/admin/useAdminProductImages'
import { useAdminHeroSlides } from '~/composables/admin/useAdminHeroSlides'
import { useAdminLookbook } from '~/composables/admin/useAdminLookbook'
import { useAdminAbout } from '~/composables/admin/useAdminAbout'
import { useAdminOrders } from '~/composables/admin/useAdminOrders'
import { useImageModal } from '~/composables/useImageModal'
import { useAdminAuth } from '~/composables/admin/useAdminAuth'
import { useAdminFinance } from '~/composables/admin/useAdminFinance'
import type { CatalogOption } from '~/utils/finance'

definePageMeta({
  title: 'UNA JOYA - Painel Administrativo'
})

const mockImageFallback: string = mockImages[0] ?? ''

const currentTab = ref<AdminTab>('dashboard')
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

// Autenticação: o painel só carrega dados depois do login de uma conta admin ativa
const {
  session,
  isAdmin,
  checking: checkingAuth,
  recovery: passwordRecovery,
  init: initAuth,
  signIn,
  signOut,
  sendReset,
  updatePassword
} = useAdminAuth()

// Financeiro: vendas, gastos, contatos do WhatsApp e importação
const {
  sales,
  expenses,
  expenseCategories,
  whatsappOrders,
  goals,
  saveGoal,
  loading: loadingFinance,
  lastError: financeError,
  fetchAll: fetchFinance,
  saveSale,
  deleteSale,
  saveExpense,
  deleteExpense,
  addExpenseCategory,
  setExpenseCategoryActive,
  updateWhatsAppOrder,
  deleteWhatsAppOrder,
  importRows,
  undoImport
} = useAdminFinance()

const catalog = computed<CatalogOption[]>(() => products.value.map(p => ({
  id: p.id,
  name: p.name,
  price: Number(p.price) || 0,
  stock: Number(p.stock) || 0,
  available: (Number(p.stock) || 0) > 0
})))
const newContactsCount = computed(() => whatsappOrders.value.filter(o => o.status === 'novo').length)

const isQuickAddOpen = ref(false)
const saleFromOrderId = ref<number | null>(null)
const handleRegisterSaleFromContact = (orderId: number) => {
  saleFromOrderId.value = orderId
  currentTab.value = 'sales'
}

let loaded = false
const loadAll = () => {
  if (loaded) return
  loaded = true
  fetchProducts()
  fetchHeroSlides()
  fetchLookbook()
  fetchOrders()
  fetchCategories()
  fetchAboutAdmin()
  fetchFinance()
}

watch(isAdmin, (ok) => {
  if (ok) loadAll()
  else loaded = false
})

const handleSignOut = async () => {
  await signOut()
  currentTab.value = 'dashboard'
}

onMounted(async () => {
  if (isAdmin.value) loadAll()
  await initAuth()
  if (isAdmin.value) loadAll()
})
</script>

<template>
  <AdminLogin
    v-if="!isAdmin || passwordRecovery"
    :checking="checkingAuth"
    :recovery="passwordRecovery"
    :sign-in="signIn"
    :send-reset="sendReset"
    :update-password="updatePassword"
  />
  <div v-else class="admin-panel bg-surface font-body-md text-on-surface overflow-x-hidden min-h-screen">
    <AdminSidebar
      v-model:current-tab="currentTab"
      v-model:is-sidebar-open="isSidebarOpen"
      :pending-orders-count="pendingOrdersCount"
      :new-contacts-count="newContactsCount"
      :user-email="session?.user?.email ?? null"
      @sign-out="handleSignOut"
    />

    <div class="flex min-h-screen pt-16 md:pt-0">
      <!-- Main Content Canvas -->
      <main class="flex-1 min-w-0 md:ml-72 p-margin-mobile pb-28 md:p-16">
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
        <AdminDashboardSection
          v-if="currentTab === 'dashboard'"
          :sales="sales"
          :expenses="expenses"
          :whatsapp-orders="whatsappOrders"
          :loading="loadingFinance"
          :error="financeError"
          :goals="goals"
          :save-goal="saveGoal"
          @open-contacts="currentTab = 'contacts'"
        />

        <AdminSalesSection
          v-else-if="currentTab === 'sales'"
          :sales="sales"
          :catalog="catalog"
          :whatsapp-orders="whatsappOrders"
          :prefill-order-id="saleFromOrderId"
          :save="saveSale"
          :remove="deleteSale"
          @prefill-consumed="saleFromOrderId = null"
        />

        <AdminContactsSection
          v-else-if="currentTab === 'contacts'"
          :orders="whatsappOrders"
          :sales="sales"
          :update="updateWhatsAppOrder"
          :remove="deleteWhatsAppOrder"
          @register-sale="handleRegisterSaleFromContact"
        />

        <AdminExpensesSection
          v-else-if="currentTab === 'expenses'"
          :expenses="expenses"
          :categories="expenseCategories"
          :save="saveExpense"
          :remove="deleteExpense"
          :add-category="addExpenseCategory"
          :set-category-active="setExpenseCategoryActive"
        />

        <AdminImportSection
          v-else-if="currentTab === 'import'"
          :categories="expenseCategories"
          :import-rows="importRows"
          :undo-import="undoImport"
          :add-category="addExpenseCategory"
        />

        <AdminProductsSection
          v-else-if="currentTab === 'products'"
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

    <!-- Celular: barra de abas + botão "+" para registrar venda/gasto de qualquer tela -->
    <AdminMobileNav
      v-model:current-tab="currentTab"
      :new-contacts-count="newContactsCount"
      @quick-add="isQuickAddOpen = true"
      @more="isSidebarOpen = true"
    />
    <AdminQuickAdd
      :open="isQuickAddOpen"
      :catalog="catalog"
      :whatsapp-orders="whatsappOrders"
      :sales="sales"
      :expenses="expenses"
      :categories="expenseCategories"
      :save-sale="saveSale"
      :save-expense="saveExpense"
      :add-category="addExpenseCategory"
      :set-category-active="setExpenseCategoryActive"
      @close="isQuickAddOpen = false"
    />
  </div>
</template>

<style>
@import '~/assets/css/admin/admin-panel.css';
</style>
