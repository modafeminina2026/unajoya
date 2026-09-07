<script setup lang="ts">
import type { AboutUsFormState } from '~/types/admin'

defineProps<{
  form: AboutUsFormState
  loading: boolean
  uploadingImage: boolean
}>()

const emit = defineEmits<{
  'save': []
  'upload-image': [event: Event]
}>()
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 fade-in">
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
            v-model="form.title"
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
            v-model="form.content"
            class="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-primary placeholder:opacity-30 placeholder:text-primary resize-none text-sm leading-relaxed"
            placeholder="Conte a história da sua marca..."
            rows="10"
            required
          ></textarea>
        </div>

        <button
          type="button"
          @click="emit('save')"
          :disabled="loading"
          class="w-full bg-primary text-pure-white py-5 font-label-caps text-xs md:text-sm tracking-[0.2em] hover:bg-deep-onyx active:scale-[0.98] transition-all flex items-center justify-center gap-3 font-bold"
        >
          <span class="material-symbols-outlined text-sm">{{ loading ? 'sync' : 'save' }}</span>
          {{ loading ? 'SALVANDO ALTERAÇÕES...' : 'SALVAR ALTERAÇÕES' }}
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
          :class="{ 'opacity-50 pointer-events-none': uploadingImage }"
        >
          <input
            type="file"
            accept="image/*"
            class="hidden"
            @change="emit('upload-image', $event)"
            :disabled="uploadingImage"
          />
          <div class="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4 border border-soft-stone">
            <span class="material-symbols-outlined text-primary" :class="{ 'animate-spin': uploadingImage }">
              {{ uploadingImage ? 'sync' : 'add_a_photo' }}
            </span>
          </div>
          <p class="font-headline-md text-primary text-base mb-2">
            {{ uploadingImage ? 'Enviando para o R2...' : 'Clique para alterar foto' }}
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
            :src="form.image || '/about_us.png'"
            alt="Preview do sobre nós"
          />
        </div>
        <div class="p-6 sm:p-8 text-center">
          <p class="font-label-caps text-secondary text-[10px] mb-2 tracking-widest font-semibold">SOBRE NÓS</p>
          <h4 class="font-headline-md text-primary text-xl mb-4 italic">
            {{ form.title || 'Título do Sobre Nós' }}
          </h4>
          <p class="font-body-md text-secondary mb-6 text-xs leading-relaxed max-w-sm mx-auto line-clamp-4 whitespace-pre-line text-left">
            {{ form.content || 'História da marca...' }}
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
