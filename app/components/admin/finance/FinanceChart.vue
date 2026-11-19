<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { formatCents, formatCompactCents, type Bucket } from '~/utils/finance'

const props = defineProps<{ series: Bucket[] }>()

const REVENUE = '#2a78d6'
const EXPENSES = '#eb6834'
// largura real do contêiner (texto do eixo fica sempre em 11px, inclusive no celular)
const width = ref(720)
const box = ref<HTMLElement | null>(null)
let observer: ResizeObserver | null = null
watch(box, (el) => {
  observer?.disconnect()
  if (!el || typeof ResizeObserver === 'undefined') return
  observer = new ResizeObserver(([entry]) => { if (entry) width.value = Math.max(300, Math.round(entry.contentRect.width)) })
  observer.observe(el)
})
onBeforeUnmount(() => observer?.disconnect())
const H = 260
const M = computed(() => ({ top: 14, right: 8, bottom: 30, left: width.value < 480 ? 52 : 64 }))

const view = ref<'chart' | 'table'>('chart')
const hover = ref<number | null>(null)
// toque fixa a barra escolhida (no celular a janela flutuante ficaria embaixo do dedo)
const picked = ref<number | null>(null)
watch(() => props.series, () => { picked.value = null })

const niceMax = (v: number): number => {
  if (v <= 0) return 100
  const pow = 10 ** Math.floor(Math.log10(v))
  const n = v / pow
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow
}

const maxVal = computed(() => niceMax(Math.max(0, ...props.series.flatMap(b => [b.revenueCents, b.expensesCents]))))
const W = computed(() => width.value)
const innerW = computed(() => W.value - M.value.left - M.value.right)
const innerH = computed(() => H - M.value.top - M.value.bottom)
const slot = computed(() => innerW.value / Math.max(1, props.series.length))
// duas barras por período (receita e gastos), 2px de respiro entre elas
const barW = computed(() => Math.max(1.5, Math.min(24, (slot.value * 0.7 - 2) / 2)))
const x = (i: number) => M.value.left + slot.value * i + slot.value / 2
const y = (v: number) => M.value.top + innerH.value - (v / maxVal.value) * innerH.value

const ticks = computed(() => [0, 0.25, 0.5, 0.75, 1].map(t => ({ v: maxVal.value * t, y: y(maxVal.value * t) })))
const labelEvery = computed(() => Math.max(1, Math.ceil(props.series.length / Math.max(3, Math.floor(innerW.value / 56)))))

const barPath = (i: number, v: number, side: -1 | 1): string => {
  if (v <= 0) return ''
  const w = barW.value
  const x0 = side < 0 ? x(i) - 1 - w : x(i) + 1
  const top = y(v)
  const h = Math.max(1, M.value.top + innerH.value - top)
  const r = Math.min(4, w / 2, h)
  const base = M.value.top + innerH.value
  return `M${x0},${base} V${top + r} Q${x0},${top} ${x0 + r},${top} H${x0 + w - r} Q${x0 + w},${top} ${x0 + w},${top + r} V${base} Z`
}

const hasData = computed(() => props.series.some(b => b.revenueCents || b.expensesCents))

const indexAt = (e: MouseEvent | TouchEvent): number | null => {
  const svg = (e.currentTarget as SVGElement).getBoundingClientRect()
  const point = 'touches' in e ? (e.touches[0] ?? e.changedTouches[0]) : e
  if (!point) return null
  const px = ((point.clientX - svg.left) / svg.width) * W.value
  const i = Math.floor((px - M.value.left) / slot.value)
  return i >= 0 && i < props.series.length ? i : null
}
const onMove = (e: MouseEvent) => { hover.value = indexAt(e) }
const onTap = (e: MouseEvent | TouchEvent) => { const i = indexAt(e); if (i !== null) picked.value = i }

// barra mostrada na linha de valores: a sob o mouse, a tocada, ou a última com movimento
const lastWithData = computed(() => {
  for (let i = props.series.length - 1; i >= 0; i--) if (props.series[i]!.revenueCents || props.series[i]!.expensesCents) return i
  return props.series.length - 1
})
const shown = computed(() => hover.value ?? picked.value ?? lastWithData.value)
const tip = computed(() => props.series[shown.value] ?? null)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
      <ul class="flex gap-5 text-xs text-secondary" aria-label="Legenda">
        <li class="flex items-center gap-2"><span class="inline-block w-3 h-3 rounded-sm" :style="{ background: REVENUE }"></span>Receita</li>
        <li class="flex items-center gap-2"><span class="inline-block w-3 h-3 rounded-sm" :style="{ background: EXPENSES }"></span>Gastos</li>
      </ul>
      <button type="button" class="text-xs underline text-secondary" @click="view = view === 'chart' ? 'table' : 'chart'">
        {{ view === 'chart' ? 'Ver como tabela' : 'Ver gráfico' }}
      </button>
    </div>

    <p v-if="!hasData" class="text-sm text-secondary py-16 text-center border border-dashed border-soft-stone">Sem vendas ou gastos neste período.</p>

    <div v-else-if="view === 'chart'" ref="box" class="relative">
      <!-- Linha de valores fixa (toque numa barra para trocar) -->
      <div v-if="tip" class="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-2 text-sm min-h-[44px]" aria-live="polite" data-testid="chart-readout">
        <span class="text-primary font-bold w-full sm:w-auto">{{ tip.title }}</span>
        <span class="text-secondary"><span class="inline-block w-2.5 h-2.5 rounded-sm mr-1 align-middle" :style="{ background: REVENUE }"></span>Receita <b class="text-primary">{{ formatCents(tip.revenueCents) }}</b></span>
        <span class="text-secondary"><span class="inline-block w-2.5 h-2.5 rounded-sm mr-1 align-middle" :style="{ background: EXPENSES }"></span>Gastos <b class="text-primary">{{ formatCents(tip.expensesCents) }}</b></span>
        <span class="text-secondary">Resultado <b class="text-primary">{{ formatCents(tip.resultCents) }}</b></span>
      </div>
      <svg :viewBox="`0 0 ${W} ${H}`" class="w-full h-auto select-none touch-pan-y" role="img" aria-label="Receita e gastos por período"
        @mousemove="onMove" @mouseleave="hover = null" @click="onTap">
        <g v-for="t in ticks" :key="t.v">
          <line :x1="M.left" :x2="W - M.right" :y1="t.y" :y2="t.y" stroke="#EAEAEA" stroke-width="1" />
          <text :x="M.left - 6" :y="t.y + 4" text-anchor="end" font-size="11" fill="#6b6b6b">{{ formatCompactCents(t.v) }}</text>
        </g>
        <rect :x="M.left + slot * shown" :y="M.top" :width="slot" :height="innerH" fill="#000" opacity="0.05" />
        <g v-for="(b, i) in series" :key="b.key">
          <path :d="barPath(i, b.revenueCents, -1)" :fill="REVENUE" />
          <path :d="barPath(i, b.expensesCents, 1)" :fill="EXPENSES" />
        </g>
        <text v-for="(b, i) in series" v-show="i % labelEvery === 0" :key="'l' + b.key" :x="x(i)" :y="H - 10" text-anchor="middle" font-size="11" fill="#6b6b6b">{{ b.label }}</text>
      </svg>
    </div>

    <div v-else class="overflow-x-auto max-h-80 border border-soft-stone">
      <table class="w-full text-sm">
        <thead class="bg-soft-stone/30 text-secondary text-left sticky top-0">
          <tr><th class="p-2">Período</th><th class="p-2 text-right">Receita</th><th class="p-2 text-right">Gastos</th><th class="p-2 text-right">Resultado</th><th class="p-2 text-right">Vendas</th></tr>
        </thead>
        <tbody>
          <tr v-for="b in series" :key="b.key" class="border-t border-soft-stone">
            <td class="p-2">{{ b.title }}</td>
            <td class="p-2 text-right">{{ formatCents(b.revenueCents) }}</td>
            <td class="p-2 text-right">{{ formatCents(b.expensesCents) }}</td>
            <td class="p-2 text-right">{{ formatCents(b.resultCents) }}</td>
            <td class="p-2 text-right">{{ b.salesCount }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
