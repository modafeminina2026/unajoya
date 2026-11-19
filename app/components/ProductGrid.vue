<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import ProductCard from './ProductCard.vue'
import { filterAndSort, SORT_LABELS, type StoreProduct, type SortKey } from '~/utils/catalog'

const props = withDefaults(defineProps<{
  products: StoreProduct[]
  loading?: boolean
  toolbar?: boolean
  initialQuery?: string
  initialSort?: SortKey
  autofocus?: boolean
  skeletonCount?: number
}>(), { loading: false, toolbar: true, initialQuery: '', initialSort: 'featured', autofocus: false, skeletonCount: 8 })

const emit = defineEmits<{ queryChange: [q: string] }>()

const query = ref(props.initialQuery)
const sort = ref<SortKey>(props.initialSort)
const onlyAvailable = ref(false)
watch(() => props.initialQuery, (q) => { query.value = q })
watch(query, q => emit('queryChange', q))

const visible = computed(() => filterAndSort(props.products, { query: query.value, sort: sort.value, onlyAvailable: onlyAvailable.value }))
const sortKeys = Object.keys(SORT_LABELS) as SortKey[]

// Grade: 2 colunas no celular, 3 no tablet, 4 no desktop
const GRID = 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-3 sm:gap-x-4 lg:gap-x-6 xl:gap-x-8 3xl:gap-x-10 gap-y-10 lg:gap-y-12'
</script>

<template>
  <div>
    <div v-if="toolbar && !loading" class="flex flex-wrap items-center gap-3 mb-8">
      <label class="relative flex-1 min-w-[200px]">
        <span class="sr-only">Buscar peças</span>
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[20px]" aria-hidden="true">search</span>
        <input
          v-model="query"
          type="search"
          enterkeyhint="search"
          placeholder="Buscar peças"
          :autofocus="autofocus"
          class="w-full min-h-[44px] pl-10 pr-3 border border-soft-stone bg-pure-white text-primary text-base focus:outline-none focus:border-primary"
          data-testid="grid-search"
        >
      </label>
      <label class="flex items-center gap-2 text-sm text-secondary">
        <span class="sr-only">Ordenar por</span>
        <select v-model="sort" class="min-h-[44px] border border-soft-stone bg-pure-white px-3 text-primary text-sm" data-testid="grid-sort">
          <option v-for="k in sortKeys" :key="k" :value="k">{{ SORT_LABELS[k] }}</option>
        </select>
      </label>
      <label class="flex items-center gap-2 text-sm text-primary min-h-[44px] cursor-pointer">
        <input v-model="onlyAvailable" type="checkbox" class="w-4 h-4 accent-primary" data-testid="grid-available">
        Só disponíveis
      </label>
    </div>

    <div v-if="loading" :class="GRID" aria-busy="true">
      <div v-for="i in skeletonCount" :key="i" class="animate-pulse flex flex-col">
        <div class="aspect-[3/4] mb-3 bg-soft-stone"></div>
        <div class="h-3 bg-soft-stone w-1/3 mb-2"></div>
        <div class="h-4 bg-soft-stone w-3/4 mb-2"></div>
        <div class="h-5 bg-soft-stone w-1/3 mb-3"></div>
        <div class="h-11 bg-soft-stone w-full"></div>
      </div>
    </div>

    <template v-else>
      <p v-if="toolbar" class="text-sm text-secondary mb-4" aria-live="polite" data-testid="grid-count">
        {{ visible.length }} {{ visible.length === 1 ? 'peça' : 'peças' }}
      </p>
      <div v-if="visible.length" :class="GRID">
        <ProductCard v-for="(p, i) in visible" :key="p.id" :product="p" :priority="i < 4" />
      </div>
      <div v-else class="text-center py-16">
        <p class="font-headline-md text-primary text-lg mb-2">Nenhuma peça encontrada</p>
        <p class="text-secondary text-sm mb-6">Tente outra palavra ou fale com a gente no WhatsApp.</p>
        <button v-if="query || onlyAvailable" type="button" class="underline text-primary text-sm" @click="query = ''; onlyAvailable = false">Limpar busca</button>
      </div>
    </template>
  </div>
</template>
