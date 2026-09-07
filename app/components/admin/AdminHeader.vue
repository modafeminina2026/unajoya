<script setup lang="ts">
import type { AdminTab } from '~/types/admin'

defineProps<{
  currentTab: AdminTab
  isEditingProduct?: boolean
  isEditingSlide?: boolean
  isEditingLookbook?: boolean
  isEditingCategory?: boolean
  loadingAbout?: boolean
}>()

const emit = defineEmits<{
  publishProduct: []
  cancelEditProduct: []
  saveSlide: []
  cancelEditSlide: []
  saveLookbook: []
  cancelEditLookbook: []
  saveAbout: []
  saveCategory: []
  cancelEditCategory: []
}>()
</script>

<template>
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
          v-if="isEditingProduct"
          @click="emit('cancelEditProduct')"
          class="w-full sm:w-auto border border-soft-stone px-8 py-4 font-label-caps text-secondary hover:bg-soft-stone/20 active:scale-95 transition-all text-xs text-center"
        >
          CANCELAR EDIÇÃO
        </button>
        <button
          @click="emit('publishProduct')"
          class="w-full sm:w-auto bg-primary text-pure-white px-8 py-4 font-label-caps hover:bg-deep-onyx active:scale-95 transition-all text-xs text-center"
        >
          {{ isEditingProduct ? 'SALVAR ALTERAÇÕES' : 'PUBLICAR PEÇA' }}
        </button>
      </template>
      <template v-else-if="currentTab === 'carousel'">
        <button
          v-if="isEditingSlide"
          @click="emit('cancelEditSlide')"
          class="w-full sm:w-auto border border-soft-stone px-8 py-4 font-label-caps text-secondary hover:bg-soft-stone/20 active:scale-95 transition-all text-xs text-center"
        >
          CANCELAR EDIÇÃO
        </button>
        <button
          @click="emit('saveSlide')"
          class="w-full sm:w-auto bg-primary text-pure-white px-8 py-4 font-label-caps hover:bg-deep-onyx active:scale-95 transition-all text-xs text-center"
        >
          {{ isEditingSlide ? 'SALVAR SLIDE' : 'ADICIONAR SLIDE' }}
        </button>
      </template>
      <template v-else-if="currentTab === 'lookbook'">
        <button
          v-if="isEditingLookbook"
          @click="emit('cancelEditLookbook')"
          class="w-full sm:w-auto border border-soft-stone px-8 py-4 font-label-caps text-secondary hover:bg-soft-stone/20 active:scale-95 transition-all text-xs text-center"
        >
          CANCELAR EDIÇÃO
        </button>
        <button
          @click="emit('saveLookbook')"
          class="w-full sm:w-auto bg-primary text-pure-white px-8 py-4 font-label-caps hover:bg-deep-onyx active:scale-95 transition-all text-xs text-center"
        >
          {{ isEditingLookbook ? 'SALVAR FOTO' : 'ADICIONAR FOTO' }}
        </button>
      </template>
      <template v-else-if="currentTab === 'about'">
        <button
          @click="emit('saveAbout')"
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
          @click="emit('cancelEditCategory')"
          class="w-full sm:w-auto border border-soft-stone px-8 py-4 font-label-caps text-secondary hover:bg-soft-stone/20 active:scale-95 transition-all text-xs text-center"
        >
          CANCELAR EDIÇÃO
        </button>
        <button
          @click="emit('saveCategory')"
          class="w-full sm:w-auto bg-primary text-pure-white px-8 py-4 font-label-caps hover:bg-deep-onyx active:scale-95 transition-all text-xs text-center"
        >
          {{ isEditingCategory ? 'SALVAR ALTERAÇÕES' : 'CRIAR CATEGORIA' }}
        </button>
      </template>
    </div>
  </div>
</template>