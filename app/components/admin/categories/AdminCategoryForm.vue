<script setup lang="ts">
import type { CategoryFormState } from '~/types/admin'

defineProps<{
  form: CategoryFormState
  isEditing: boolean
}>()

const emit = defineEmits<{
  save: []
  autoSlug: []
}>()
</script>

<template>
  <section class="lg:col-span-5 bg-surface-container-low p-6 sm:p-8 md:p-12 border border-soft-stone fade-in shadow-sm">
    <div class="flex items-center gap-3 mb-10 border-b border-soft-stone pb-4">
      <span class="material-symbols-outlined text-primary">
        {{ isEditing ? 'edit_note' : 'add_circle' }}
      </span>
      <h3 class="font-label-caps text-primary tracking-widest font-bold">
        {{ isEditing ? 'EDITAR CATEGORIA' : 'NOVA CATEGORIA' }}
      </h3>
    </div>

    <form @submit.prevent class="space-y-10">
      <!-- Name -->
      <div class="group relative border-b border-soft-stone focus-within:border-primary py-2 transition-colors">
        <label class="block font-label-caps text-[10px] text-secondary tracking-widest font-bold mb-1">NOME DA CATEGORIA</label>
        <input
          v-model="form.name"
          @input="emit('autoSlug')"
          class="w-full bg-transparent border-none p-0 focus:ring-0 font-headline-md text-primary placeholder:opacity-30 placeholder:text-primary text-lg"
          placeholder="Ex: Colares"
          type="text"
          required
        />
      </div>

      <!-- Slug -->
      <div class="group relative border-b border-soft-stone focus-within:border-primary py-2 transition-colors">
        <label class="block font-label-caps text-[10px] text-secondary tracking-widest font-bold mb-1">SLUG (URL)</label>
        <input
          v-model="form.slug"
          class="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-primary text-sm"
          placeholder="ex-colares"
          type="text"
          required
        />
      </div>

      <!-- Sort Order -->
      <div class="group relative border-b border-soft-stone focus-within:border-primary py-2 transition-colors">
        <label class="block font-label-caps text-[10px] text-secondary tracking-widest font-bold mb-1">ORDEM DE EXIBIÇÃO</label>
        <input
          v-model.number="form.sort_order"
          class="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-primary text-sm"
          placeholder="0"
          type="number"
          required
        />
      </div>

      <!-- Active Toggle -->
      <div class="flex items-center justify-between py-4 border-b border-soft-stone">
        <div>
          <span class="font-label-caps text-[11px] text-primary tracking-widest font-bold">ATIVO</span>
          <p class="text-[10px] text-secondary tracking-wider uppercase mt-1">Exibir no menu de navegação da loja</p>
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
        {{ isEditing ? 'SALVAR ALTERAÇÕES' : 'CRIAR CATEGORIA' }}
      </button>
    </form>
  </section>
</template>