<script setup lang="ts">
import type { LookbookPhoto, LookbookFormState } from '~/types/admin'
import AdminLookbookForm from './AdminLookbookForm.vue'

defineProps<{
  photos: LookbookPhoto[]
  loading: boolean
  form: LookbookFormState
  isEditing: boolean
  uploadingImage: boolean
}>()

const emit = defineEmits<{
  'save': []
  'upload-image': [event: Event]
  'edit': [photo: LookbookPhoto]
  'delete': [id: number]
}>()
</script>

<template>
  <div class="space-y-12 fade-in">
    <!-- Form + Media Card -->
    <AdminLookbookForm
      :form="form"
      :is-editing="isEditing"
      :uploading-image="uploadingImage"
      @save="emit('save')"
      @upload-image="emit('upload-image', $event)"
    />

    <!-- Lookbook Photos List -->
    <section class="fade-in" style="animation-delay: 0.2s">
      <div class="flex items-end justify-between mb-6 border-b border-soft-stone pb-4">
        <h3 class="font-display-lg text-2xl md:text-3xl text-primary italic">Fotos na Faixa Lookbook</h3>
        <span class="font-label-caps text-xs text-secondary font-bold">{{ photos.length }} FOTO(S)</span>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <span class="material-symbols-outlined animate-spin text-primary text-3xl">sync</span>
      </div>

      <!-- Grid -->
      <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 3xl:grid-cols-6 gap-6">
        <div
          v-for="photo in photos"
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
                @click="emit('edit', photo)"
                class="flex items-center gap-1 font-label-caps text-[9px] text-secondary hover:text-primary transition-colors tracking-widest font-bold"
              >
                <span class="material-symbols-outlined text-xs">edit</span>
                EDITAR
              </button>
              <button
                @click="emit('delete', photo.id)"
                class="flex items-center gap-1 font-label-caps text-[9px] text-secondary hover:text-error transition-colors tracking-widest font-bold"
              >
                <span class="material-symbols-outlined text-xs">delete</span>
                EXCLUIR
              </button>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="photos.length === 0" class="col-span-full py-16 text-center text-secondary font-body-md text-sm">
          <span class="material-symbols-outlined text-4xl text-soft-stone mb-4 block">photo_library</span>
          Nenhuma foto cadastrada no lookbook ainda.
        </div>
      </div>
    </section>
  </div>
</template>
