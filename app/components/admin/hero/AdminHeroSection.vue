<script setup lang="ts">
import type { HeroSlide, HeroSlideFormState } from '~/types/admin'
import AdminHeroSlideForm from '~/components/admin/hero/AdminHeroSlideForm.vue'

defineProps<{
  slides: HeroSlide[]
  loadingSlides: boolean
  uploadingSlideImage: boolean
  slideForm: HeroSlideFormState
  isEditingSlide: boolean
  alignOptions: Array<{ label: string; value: string }>
  mockImages: string[]
}>()

const emit = defineEmits<{
  save: []
  upload: [event: Event]
  edit: [slide: HeroSlide]
  delete: [id: number]
  toggleActive: [slide: HeroSlide]
}>()
</script>

<template>
  <div class="space-y-12 fade-in">
    <!-- Form Data & Upload -->
    <AdminHeroSlideForm
      :form="slideForm"
      :is-editing="isEditingSlide"
      :uploading-image="uploadingSlideImage"
      :align-options="alignOptions"
      :mock-images="mockImages"
      @save="emit('save')"
      @upload="(e) => emit('upload', e)"
    />

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
                @click="emit('toggleActive', slide)"
                class="flex items-center gap-1.5 font-label-caps text-[10px] tracking-widest transition-colors"
                :class="slide.active ? 'text-error hover:text-error/80' : 'text-[#2D8A5B] hover:text-[#2D8A5B]/80'"
              >
                <span class="material-symbols-outlined text-sm">{{ slide.active ? 'visibility_off' : 'visibility' }}</span>
                {{ slide.active ? 'DESATIVAR' : 'ATIVAR' }}
              </button>
              <span class="text-soft-stone">|</span>
              <!-- Edit -->
              <button
                @click="emit('edit', slide)"
                class="flex items-center gap-1.5 font-label-caps text-[10px] tracking-widest text-secondary hover:text-primary transition-colors"
              >
                <span class="material-symbols-outlined text-sm">edit</span>
                EDITAR
              </button>
              <span class="text-soft-stone">|</span>
              <!-- Delete -->
              <button
                @click="emit('delete', slide.id)"
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
</template>