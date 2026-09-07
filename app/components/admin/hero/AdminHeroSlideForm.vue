<script setup lang="ts">
import type { HeroSlideFormState } from '~/types/admin'

defineProps<{
  form: HeroSlideFormState
  isEditing: boolean
  uploadingImage: boolean
  alignOptions: Array<{ label: string; value: string }>
  mockImages: string[]
}>()

const emit = defineEmits<{
  save: []
  upload: [event: Event]
}>()
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
    <!-- Form Data -->
    <section class="lg:col-span-7 bg-surface-container-low p-6 sm:p-8 md:p-12 border border-soft-stone fade-in shadow-sm">
      <div class="flex items-center gap-3 mb-10 border-b border-soft-stone pb-4">
        <span class="material-symbols-outlined text-primary">
          {{ isEditing ? 'edit_note' : 'add_circle' }}
        </span>
        <h3 class="font-label-caps text-primary tracking-widest font-bold">
          {{ isEditing ? 'EDITAR SLIDE' : 'NOVO SLIDE' }}
        </h3>
      </div>

      <form @submit.prevent class="space-y-8">
        <!-- Subtitle/Legenda -->
        <div class="group relative border-b border-soft-stone focus-within:border-primary py-2 transition-colors">
          <label class="block font-label-caps text-[10px] text-secondary tracking-widest font-bold mb-1">LEGENDA (ex: COLEÇÃO 2026)</label>
          <input
            v-model="form.subtitle"
            class="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-primary placeholder:opacity-30 placeholder:text-primary text-sm"
            placeholder="COLEÇÃO 2026"
            type="text"
            required
          />
        </div>

        <!-- Title -->
        <div class="group relative border-b border-soft-stone focus-within:border-primary py-2 transition-colors">
          <label class="block font-label-caps text-[10px] text-secondary tracking-widest font-bold mb-1">TÍTULO PRINCIPAL (use &lt;br&gt; para quebrar linha)</label>
          <textarea
            v-model="form.title"
            class="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-primary placeholder:opacity-30 placeholder:text-primary resize-none text-sm leading-relaxed"
            placeholder="A ENERGIA DA PEDRA<br>FEITA PARA VESTIR"
            rows="2"
            required
          ></textarea>
        </div>

        <!-- Buttons Row -->
        <div class="grid grid-cols-2 gap-6">
          <div class="group relative border-b border-soft-stone focus-within:border-primary py-2 transition-colors">
            <label class="block font-label-caps text-[10px] text-secondary tracking-widest font-bold mb-1">BOTÃO PRIMÁRIO</label>
            <input
              v-model="form.btn1"
              class="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-primary text-sm"
              placeholder="VER COLEÇÃO"
              type="text"
            />
          </div>
          <div class="group relative border-b border-soft-stone focus-within:border-primary py-2 transition-colors">
            <label class="block font-label-caps text-[10px] text-secondary tracking-widest font-bold mb-1">BOTÃO SECUNDÁRIO</label>
            <input
              v-model="form.btn2"
              class="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-primary text-sm"
              placeholder="SOBRE NÓS"
              type="text"
            />
          </div>
        </div>

        <!-- Alignment + Order Row -->
        <div class="grid grid-cols-2 gap-6">
          <!-- Alignment -->
          <div>
            <label class="block font-label-caps text-[10px] text-secondary tracking-widest font-bold mb-3">ALINHAMENTO DO TEXTO</label>
            <div class="grid grid-cols-3 gap-2">
              <label v-for="opt in alignOptions" :key="opt.value" class="cursor-pointer">
                <input v-model="form.align" type="radio" :value="opt.value" class="hidden" />
                <div
                  class="text-center py-3 border font-label-caps text-[10px] tracking-wider transition-all"
                  :class="form.align === opt.value ? 'border-primary bg-primary text-pure-white' : 'border-soft-stone text-secondary hover:border-primary/50'"
                >
                  {{ opt.label }}
                </div>
              </label>
            </div>
          </div>
          <!-- Order -->
          <div class="group relative border-b border-soft-stone focus-within:border-primary py-2 transition-colors">
            <label class="block font-label-caps text-[10px] text-secondary tracking-widest font-bold mb-1">ORDEM DE EXIBIÇÃO</label>
            <input
              v-model="form.sort_order"
              class="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-primary text-sm"
              placeholder="0"
              type="number"
              min="0"
            />
          </div>
        </div>

        <!-- Active Toggle -->
        <div class="flex items-center justify-between py-4 border-b border-soft-stone">
          <div>
            <span class="font-label-caps text-[11px] text-primary tracking-widest font-bold">SLIDE ATIVO</span>
            <p class="text-[10px] text-secondary tracking-wider uppercase mt-1">Exibir este slide no carrossel da home</p>
          </div>
          <button
            type="button"
            class="w-12 h-6 rounded-full p-1 transition-colors relative flex items-center"
            :class="form.active ? 'bg-[#202223]' : 'bg-soft-stone'"
            @click="form.active = !form.active"
          >
            <div
              class="w-4 h-4 bg-pure-white rounded-full transition-transform shadow-sm"
              :class="form.active ? 'translate-x-6' : 'translate-x-0'"
            ></div>
          </button>
        </div>

        <!-- Save Button -->
        <button
          type="button"
          @click="emit('save')"
          class="w-full bg-primary text-pure-white py-5 font-label-caps text-xs md:text-sm tracking-[0.2em] hover:bg-deep-onyx active:scale-[0.98] transition-all flex items-center justify-center gap-3 font-bold"
        >
          <span class="material-symbols-outlined text-sm">{{ isEditing ? 'save' : 'add_photo_alternate' }}</span>
          {{ isEditing ? 'SALVAR ALTERAÇÕES DO SLIDE' : 'ADICIONAR SLIDE AO CARROSSEL' }}
        </button>
      </form>
    </section>

    <!-- Image Upload -->
    <section class="lg:col-span-5 space-y-8">
      <!-- Upload Card -->
      <div class="bg-surface-container-low p-6 sm:p-8 border border-soft-stone">
        <div class="flex items-center justify-between mb-6">
          <h3 class="font-label-caps text-[11px] text-primary tracking-widest font-bold">FOTO DO SLIDE</h3>
        </div>

        <!-- Mock image quick-select -->
        <div class="grid grid-cols-3 gap-2 mb-6">
          <button
            v-for="(img, idx) in mockImages"
            :key="idx"
            type="button"
            @click="form.image = img"
            class="aspect-square bg-cover bg-center border-2 transition-all hover:opacity-85"
            :class="form.image === img ? 'border-primary scale-95 shadow-sm' : 'border-transparent'"
            :style="{ backgroundImage: `url('${img}')` }"
            :aria-label="`Selecionar imagem ${idx + 1}`"
          ></button>
        </div>

        <!-- Upload field -->
        <label
          class="aspect-[16/9] border-2 border-dashed border-outline-variant flex flex-col items-center justify-center p-6 text-center hover:bg-white transition-colors cursor-pointer relative overflow-hidden"
          :class="{ 'opacity-50 pointer-events-none': uploadingImage }"
        >
          <!-- Preview if image set -->
          <div v-if="form.image" class="absolute inset-0">
            <img :src="form.image" class="w-full h-full object-cover" alt="Slide preview" />
            <div class="absolute inset-0 bg-black/30 hover:bg-black/10 transition-colors flex items-center justify-center">
              <span class="bg-surface/80 text-primary font-label-caps text-[10px] px-3 py-1.5 backdrop-blur-xs">
                CLIQUE PARA TROCAR
              </span>
            </div>
          </div>

          <div v-else class="space-y-2">
            <span class="material-symbols-outlined text-4xl text-secondary">add_photo_alternate</span>
            <p class="font-label-caps text-xs text-primary font-bold">CARREGAR NOVA FOTO</p>
            <p class="text-[10px] text-secondary">Dimensão ideal: 1920x1080 (16:9)</p>
          </div>

          <input
            type="file"
            accept="image/*"
            class="hidden"
            :disabled="uploadingImage"
            @change="(e) => emit('upload', e)"
          />
        </label>
        <p v-if="uploadingImage" class="text-xs text-champagne-gold mt-2 text-center animate-pulse">
          Enviando imagem...
        </p>

        <!-- URL input manual -->
        <div class="mt-4 group relative border-b border-soft-stone focus-within:border-primary py-2 transition-colors">
          <label class="block font-label-caps text-[10px] text-secondary tracking-widest font-bold mb-1">OU COLE UM LINK DE IMAGEM</label>
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