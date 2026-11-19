<script setup lang="ts">
import { computed } from 'vue'
import { formatCents, type RankedItem } from '~/utils/finance'

const props = defineProps<{ items: RankedItem[]; unit?: string; empty?: string }>()

// rampa sequencial de um só tom (azul): maior valor = mais escuro
const RAMP = ['#1d5fb4', '#2a78d6', '#4b8fe0', '#74a9e8', '#9bc0ee', '#bcd5f4']
const total = computed(() => props.items.reduce((s, i) => s + i.valueCents, 0))
const max = computed(() => Math.max(1, ...props.items.map(i => i.valueCents)))
const pct = (v: number) => (total.value ? Math.round((v / total.value) * 100) : 0)
</script>

<template>
  <p v-if="!items.length" class="text-sm text-secondary py-6">{{ empty || 'Sem dados neste período.' }}</p>
  <ul v-else class="space-y-3">
    <li v-for="(it, i) in items" :key="it.key">
      <div class="flex justify-between gap-3 text-sm mb-1">
        <span class="text-primary truncate" :title="it.label">{{ it.label }}</span>
        <span class="text-secondary whitespace-nowrap">{{ formatCents(it.valueCents) }} · {{ pct(it.valueCents) }}%<template v-if="unit"> · {{ it.count }} {{ unit }}</template></span>
      </div>
      <div class="h-3 bg-soft-stone/40 rounded-r-[4px]">
        <div class="h-3 rounded-r-[4px]" :style="{ width: Math.max(2, (it.valueCents / max) * 100) + '%', background: RAMP[Math.min(i, RAMP.length - 1)] }"></div>
      </div>
    </li>
  </ul>
</template>
