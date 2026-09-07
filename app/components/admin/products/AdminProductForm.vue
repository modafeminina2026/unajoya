<script setup lang="ts">
import type { AdminProductFormState, Category } from '~/types/admin'
import type { AdminImageManager } from '~/composables/admin/useAdminProductImages'
import { formatCurrency } from '~/composables/admin/useAdminProductExpiry'

defineProps<{
  form: AdminProductFormState
  categories: Category[]
  isEditing: boolean
  imageManager: AdminImageManager
}>()

const emit = defineEmits<{
  publish: []
}>()
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
    <!-- New Product Form -->
    <section class="lg:col-span-7 bg-surface-container-low p-6 sm:p-8 md:p-12 border border-soft-stone fade-in shadow-sm" style="animation-delay: 0.1s">
      <div class="flex items-center gap-3 mb-10 border-b border-soft-stone pb-4">
        <span class="material-symbols-outlined text-primary" style="font-variation-settings: 'FILL' 1;">
          {{ isEditing ? 'SALVAR ALTERAÇÕES' : 'PUBLICAR JOIA NO CATÁLOGO' }}
        </span>
        <h3 class="font-label-caps text-primary tracking-widest font-bold">
          {{ isEditing ? 'EDITAR PRODUTO' : 'NOVO PRODUTO' }}
        </h3>
      </div>

      <form @submit.prevent class="space-y-10">
        <!-- Product Title -->
        <div class="group relative border-b border-soft-stone focus-within:border-primary py-2 transition-colors">
          <label class="block font-label-caps text-[10px] text-secondary tracking-widest font-bold mb-1">TÍTULO DA JOIA</label>
          <input
            v-model="form.name"
            class="w-full bg-transparent border-none p-0 focus:ring-0 font-headline-md text-primary placeholder:opacity-30 placeholder:text-primary text-lg"
            placeholder="Ex: Colar Aurora em Ouro 18k"
            type="text"
            required
          />
        </div>

        <!-- Description -->
        <div class="group relative border-b border-soft-stone focus-within:border-primary py-2 transition-colors">
          <label class="block font-label-caps text-[10px] text-secondary tracking-widest font-bold mb-1 font-bold">DESCRIÇÃO E ARTESANATO</label>
          <textarea
            v-model="form.description"
            class="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-primary placeholder:opacity-30 placeholder:text-primary resize-none text-sm leading-relaxed"
            placeholder="Descreva o processo de produção, as pedras naturais utilizadas e a inspiração da peça..."
            rows="3"
          ></textarea>
        </div>

        <!-- Category Selector -->
        <div class="group relative border-b border-soft-stone focus-within:border-primary py-2 transition-colors">
          <label class="block font-label-caps text-[10px] text-secondary tracking-widest font-bold mb-1">CATEGORIA</label>
          <select
            v-model="form.category_id"
            class="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-primary text-sm focus:outline-none appearance-none"
          >
            <option :value="null">Nenhuma Categoria</option>
            <option
              v-for="cat in categories"
              :key="cat.id"
              :value="cat.id"
            >
              {{ cat.name }}
            </option>
          </select>
        </div>

        <!-- Price and Stock Row -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div class="group relative border-b border-soft-stone focus-within:border-primary py-2 transition-colors">
            <label class="block font-label-caps text-[10px] text-secondary tracking-widest font-bold mb-1">VALOR (BRL)</label>
            <div class="flex items-center">
              <span class="font-body-md mr-2 text-secondary font-bold text-sm">R$</span>
              <input
                v-model="form.price"
                class="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-primary text-sm"
                placeholder="0,00"
                type="number"
                required
              />
            </div>
          </div>

          <div class="group relative border-b border-soft-stone focus-within:border-primary py-2 transition-colors">
            <label class="block font-label-caps text-[10px] text-secondary tracking-widest font-bold mb-1">UNIDADES EXCLUSIVAS</label>
            <input
              v-model="form.stock"
              class="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-primary text-sm"
              placeholder="Ex: 1"
              type="number"
              required
            />
          </div>
        </div>

        <!-- Promo Switch -->
        <div class="flex items-center justify-between py-2 border-b border-soft-stone">
          <div>
            <span class="block font-label-caps text-xs text-primary font-bold">DESTAQUE NA HOME</span>
            <span class="text-xs text-secondary">Exibir com selo de exclusividade no topo</span>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input v-model="form.promo" type="checkbox" class="sr-only peer" />
            <div class="w-11 h-6 bg-soft-stone peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        <!-- Duration / Shelf Life Selection -->
        <div class="space-y-4">
          <label class="block font-label-caps text-[10px] text-secondary tracking-widest font-bold">
            TEMPO DE EXPOSIÇÃO DA PEÇA
          </label>
          <p class="text-xs text-secondary">
            Após este período, a peça é retirada automaticamente da vitrine se não houver renovação.
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label
              v-for="days in [10, 15, 20]"
              :key="days"
              class="cursor-pointer"
            >
              <input
                v-model="form.duration"
                class="hidden"
                name="duration"
                type="radio"
                :value="days"
              />
              <div
                class="text-center py-4 border font-label-caps text-xs tracking-wider transition-all"
                :class="form.duration === days ? 'border-primary bg-primary text-pure-white' : 'border-soft-stone bg-transparent text-secondary hover:border-primary/50'"
              >
                {{ days }} DIAS
              </div>
            </label>
          </div>
        </div>

        <!-- Publish Button -->
        <button
          type="button"
          @click="emit('publish')"
          class="w-full bg-primary text-pure-white py-5 font-label-caps text-xs md:text-sm tracking-[0.2em] hover:bg-deep-onyx active:scale-[0.98] transition-all flex items-center justify-center gap-3 font-bold"
        >
          <span class="material-symbols-outlined text-sm">publish</span>
          {{ isEditing ? 'SALVAR ALTERAÇÕES' : 'PUBLICAR JOIA NO CATÁLOGO' }}
        </button>
      </form>
    </section>

    <!-- Visual Assets & Preview -->
    <section class="lg:col-span-5 space-y-12 fade-in" style="animation-delay: 0.2s">
      <!-- Media Upload Card -->
      <div class="bg-surface-container-low p-6 sm:p-8 border border-soft-stone">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="font-label-caps text-[11px] text-primary tracking-widest font-bold uppercase">FOTOGRAFIAS DA JOIA</h3>
            <p class="text-[10px] text-secondary font-body-md mt-0.5">Adicione de 1 até 5 fotos ({{ form.images.length }}/5)</p>
          </div>
          <button
            v-if="form.images.length < 5"
            type="button"
            @click="imageManager.showUrlInput.value = !imageManager.showUrlInput.value"
            class="text-[10px] font-label-caps text-champagne-gold tracking-widest hover:underline uppercase font-bold"
          >
            USAR LINK PERSONALIZADO
          </button>
        </div>

        <!-- Media Thumbnails List -->
        <div class="mb-6 space-y-2">
          <label class="block text-[10px] font-label-caps text-secondary font-bold tracking-wider uppercase mb-2">
            FOTOS ADICIONADAS (FOTO 1 É A CAPA PRINCIPAL)
          </label>
          <div class="grid grid-cols-5 gap-2">
            <div
              v-for="(imgUrl, idx) in form.images"
              :key="idx"
              class="relative group aspect-[4/5] bg-white border rounded-sm overflow-hidden flex flex-col justify-between"
              :class="imageManager.activePreviewIndex.value === idx ? 'border-primary ring-2 ring-champagne-gold' : 'border-soft-stone'"
            >
              <img
                :src="imgUrl"
                class="w-full h-full object-cover cursor-pointer"
                @click="imageManager.activePreviewIndex.value = idx"
                alt="Thumbnail produto"
              />
              <span
                v-if="idx === 0"
                class="absolute top-1 left-1 bg-primary text-white text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wider rounded-xs shadow"
              >
                Capa
              </span>
              <span
                v-else
                class="absolute top-1 left-1 bg-black/60 text-white text-[8px] font-bold px-1 py-0.5 rounded-xs"
              >
                #{{ idx + 1 }}
              </span>

              <!-- Quick Actions Overlay -->
              <div class="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1">
                <button
                  v-if="idx !== 0"
                  type="button"
                  @click.stop="imageManager.setPrimaryImage(idx)"
                  title="Definir como capa principal"
                  class="bg-champagne-gold text-primary text-[8px] font-bold px-1.5 py-1 rounded w-full hover:bg-white transition-colors uppercase tracking-wider"
                >
                  Tornar Capa
                </button>
                <div class="flex items-center gap-1 w-full justify-center">
                  <button
                    v-if="idx > 0"
                    type="button"
                    @click.stop="imageManager.moveImage(idx, 'left')"
                    title="Mover para esquerda"
                    class="bg-white/90 hover:bg-white text-primary text-xs w-6 h-6 flex items-center justify-center rounded font-bold"
                  >
                    ‹
                  </button>
                  <button
                    v-if="idx < form.images.length - 1"
                    type="button"
                    @click.stop="imageManager.moveImage(idx, 'right')"
                    title="Mover para direita"
                    class="bg-white/90 hover:bg-white text-primary text-xs w-6 h-6 flex items-center justify-center rounded font-bold"
                  >
                    ›
                  </button>
                  <button
                    type="button"
                    @click.stop="imageManager.removeImageAt(idx)"
                    title="Remover foto"
                    class="bg-red-600 hover:bg-red-700 text-white text-xs w-6 h-6 flex items-center justify-center rounded font-bold"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>

            <!-- Placeholder slots -->
            <div
              v-for="emptyIdx in (5 - form.images.length)"
              :key="'empty-' + emptyIdx"
              class="aspect-[4/5] border border-dashed border-soft-stone flex flex-col items-center justify-center text-center p-1 opacity-40 bg-surface"
            >
              <span class="material-symbols-outlined text-secondary text-sm">add_photo_alternate</span>
              <span class="text-[9px] text-secondary font-bold">Foto {{ form.images.length + emptyIdx }}</span>
            </div>
          </div>
        </div>

        <!-- Custom URL Input -->
        <div v-if="imageManager.showUrlInput.value && form.images.length < 5" class="mb-6 space-y-3 p-4 border border-soft-stone bg-surface">
          <label class="block text-[10px] font-label-caps text-secondary font-bold">ADICIONAR LINK DA IMAGEM</label>
          <div class="flex gap-2">
            <input
              v-model="imageManager.imageInputUrl.value"
              type="text"
              placeholder="Cole o link da foto aqui..."
              class="flex-grow bg-white border border-soft-stone px-3 py-2 text-xs focus:outline-none focus:border-primary"
            />
            <button
              type="button"
              @click="imageManager.applyCustomUrl"
              class="bg-primary text-white text-xs px-4 py-2 hover:bg-deep-onyx"
            >
              Adicionar
            </button>
          </div>
        </div>

        <!-- File Upload Area -->
        <div class="space-y-4">
          <div class="border-2 border-dashed border-soft-stone p-6 text-center hover:border-primary/50 transition-colors bg-surface">
            <input
              type="file"
              id="file-upload"
              class="hidden"
              accept="image/*"
              :disabled="imageManager.uploading.value || form.images.length >= 5"
              @change="imageManager.handleFileUpload"
            />
            <label
              for="file-upload"
              class="cursor-pointer flex flex-col items-center justify-center"
              :class="{ 'opacity-50 cursor-not-allowed': form.images.length >= 5 }"
            >
              <span class="material-symbols-outlined text-secondary text-3xl mb-2">
                {{ imageManager.uploading.value ? 'hourglass_top' : 'cloud_upload' }}
              </span>
              <span class="font-label-caps text-xs text-primary font-bold">
                {{ imageManager.uploading.value ? 'ENVIANDO FOTO...' : (form.images.length >= 5 ? 'LIMITE DE 5 FOTOS ATINGIDO' : 'FAZER UPLOAD DO DISPOSITIVO') }}
              </span>
              <span class="text-[10px] text-secondary mt-1">PNG, JPG ou WEBP até 5MB</span>
            </label>
          </div>

          <!-- Mock Image Options -->
          <div v-if="form.images.length < 5" class="pt-2">
            <p class="text-[10px] font-label-caps text-secondary font-bold mb-2 uppercase">OU ESCOLHA UMA DAS AMOSTRAS:</p>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="(img, idx) in imageManager.mockImages"
                :key="idx"
                type="button"
                @click="imageManager.selectMockImage(img)"
                class="border border-soft-stone aspect-square overflow-hidden hover:border-primary transition-all relative group"
              >
                <img :src="img" class="w-full h-full object-cover" alt="Mock" />
                <span class="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold">
                  + Adicionar
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Live Preview Card -->
      <div class="bg-surface border border-soft-stone relative group overflow-hidden">
        <div class="aspect-[4/5] bg-surface-container-low overflow-hidden relative">
          <img
            :src="form.images[imageManager.activePreviewIndex.value] || form.image"
            class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            alt="Preview do produto"
          />
          <div class="absolute top-4 right-4 bg-primary text-pure-white px-3 py-1 font-label-caps text-[10px] tracking-widest font-bold">
            PREVIEW
          </div>
          <div v-if="form.promo" class="absolute top-4 left-4 bg-champagne-gold text-primary px-3 py-1 font-label-caps text-[10px] tracking-widest font-bold">
            DESTAQUE
          </div>

          <!-- Carousel Dots (Preview) -->
          <div v-if="form.images.length > 1" class="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
            <button
              v-for="(_, pIdx) in form.images"
              :key="'prev-' + pIdx"
              type="button"
              @click="imageManager.activePreviewIndex.value = pIdx"
              class="w-2.5 h-2.5 rounded-full transition-all border border-white"
              :class="imageManager.activePreviewIndex.value === pIdx ? 'bg-champagne-gold scale-125' : 'bg-white/60 hover:bg-white'"
            ></button>
          </div>
        </div>
        <div class="p-6 sm:p-8 text-center">
          <p class="font-label-caps text-secondary text-[10px] mb-2 tracking-widest font-semibold">PREVIEW CATEGORIA</p>
          <h4 class="font-headline-md text-primary text-xl mb-4 italic">
            {{ form.name || 'Nome da Peça Exclusiva' }}
          </h4>
          <p class="font-body-md text-secondary mb-6 text-xs leading-relaxed max-w-sm mx-auto line-clamp-2">
            {{ form.description || 'A descrição e os detalhes do acabamento artesanal da peça aparecerão aqui à medida que você escreve.' }}
          </p>
          <div class="flex justify-center items-center gap-4 text-primary font-body-md">
            <span class="w-12 h-[1px] bg-soft-stone"></span>
            <span class="font-label-caps tracking-widest font-bold">
              {{ form.price ? formatCurrency(form.price) : 'R$ 0,00' }}
            </span>
            <span class="w-12 h-[1px] bg-soft-stone"></span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>