<script setup lang="ts">
import type { LookbookFormState } from '~/types/admin'

defineProps<{
  form: LookbookFormState
  isEditing: boolean
  uploadingImage: boolean
}>()

const emit = defineEmits<{
  'save': []
  'upload-image': [event: Event]
}>()
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
    <!-- Lookbook Photo Form -->
    <section class="lg:col-span-7 bg-surface-container-low p-6 sm:p-8 md:p-12 border border-soft-stone shadow-sm">
      <div class="flex items-center gap-3 mb-10 border-b border-soft-stone pb-4">
        <span class="material-symbols-outlined text-primary" style="font-variation-settings: 'FILL' 1;">
          {{ isEditing ? 'edit_note' : 'add_circle' }}
        </span>
        <h3 class="font-label-caps text-primary tracking-widest font-bold">
          {{ isEditing ? 'EDITAR FOTO DO LOOKBOOK' : 'NOVA FOTO DO LOOKBOOK' }}
        </h3>
      </div>

      <form @submit.prevent class="space-y-8">
        <!-- Alt / Description -->
        <div class="group relative border-b border-soft-stone focus-within:border-primary py-2 transition-colors">
          <label class="block font-label-caps text-[10px] text-secondary tracking-widest font-bold mb-1">DESCRIÇÃO DA IMAGEM (ALT TEXT)</label>
          <input
            v-model="form.alt"
            class="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-primary placeholder:opacity-30 placeholder:text-primary text-sm"
            placeholder="Ex: Detalhe do Colar de Esmeraldas Lookbook"
            type="text"
            required
          />
        </div>

        <!-- Order -->
        <div class="group relative border-b border-soft-stone focus-within:border-primary py-2 transition-colors font-bold">
          <label class="block font-label-caps text-[10px] text-secondary tracking-widest font-bold mb-1">ORDEM DE EXIBIÇÃO</label>
          <input
            v-model="form.sort_order"
            class="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-primary text-sm font-semibold"
            placeholder="0"
            type="number"
            min="0"
          />
        </div>

        <!-- Save Button -->
        <button
          type="button"
          @click="emit('save')"
          class="w-full bg-primary text-pure-white py-5 font-label-caps text-xs md:text-sm tracking-[0.2em] hover:bg-deep-onyx active:scale-[0.98] transition-all flex items-center justify-center gap-3 font-bold"
        >
          <span class="material-symbols-outlined text-sm">{{ isEditing ? 'save' : 'add_photo_alternate' }}</span>
          {{ isEditing ? 'SALVAR ALTERAÇÕES' : 'ADICIONAR FOTO AO LOOKBOOK' }}
        </button>
      </form>
    </section>

    <!-- Lookbook Media Card -->
    <section class="lg:col-span-5 space-y-8">
      <div class="bg-surface-container-low p-6 sm:p-8 border border-soft-stone">
        <h3 class="font-label-caps text-[11px] text-primary tracking-widest font-bold mb-6">FOTOGRAFIA</h3>

        <!-- Upload field -->
        <label
          class="aspect-[3/4] border-2 border-dashed border-outline-variant flex flex-col items-center justify-center p-6 text-center hover:bg-white transition-colors cursor-pointer relative overflow-hidden"
          :class="{ 'opacity-50 pointer-events-none': uploadingImage }"
        >
          <div v-if="form.image" class="absolute inset-0">
            <img :src="form.image" class="w-full h-full object-cover opacity-55" alt="preview" />
            <div class="absolute inset-0 flex flex-col items-center justify-center bg-black/10">
              <span class="material-symbols-outlined text-primary text-3xl mb-2" :class="{ 'animate-spin': uploadingImage }">
                {{ uploadingImage ? 'sync' : 'add_a_photo' }}
              </span>
              <p class="font-body-md text-primary text-sm font-bold">
                {{ uploadingImage ? 'Enviando...' : 'Clique para trocar' }}
              </p>
            </div>
          </div>
          <template v-else>
            <div class="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4 border border-soft-stone">
              <span class="material-symbols-outlined text-primary" :class="{ 'animate-spin': uploadingImage }">
                {{ uploadingImage ? 'sync' : 'add_a_photo' }}
              </span>
            </div>
            <p class="font-headline-md text-primary text-base mb-2">Clique para enviar imagem</p>
            <p class="text-secondary font-body-md text-xs">A foto deve estar em formato vertical</p>
          </template>
          <input
            type="file"
            accept="image/*"
            class="hidden"
            @change="emit('upload-image', $event)"
            :disabled="uploadingImage"
          />
        </label>

        <!-- URL manual input -->
        <div class="mt-4 group relative border-b border-soft-stone focus-within:border-primary py-2 transition-colors">
          <label class="block font-label-caps text-[10px] text-secondary tracking-widest font-bold mb-1">OU INSIRA O LINK DA IMAGEM</label>
          <input
            v-model="form.image"
            type="text"
            placeholder="https://..."
            class="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-primary text-xs"
          />
        </div>
      </div>
    </section>
  </div>
</template>
