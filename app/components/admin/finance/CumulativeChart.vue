<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { formatCents, formatCompactCents, type CumulativePoint } from '~/utils/finance'

const props = defineProps<{ points: CumulativePoint[]; currentLabel: string; previousLabel: string }>()

const CURRENT = '#2a78d6'
const PREVIOUS = '#9a9a9a'
const H = 240
const width = ref(720)
const box = ref<HTMLElement | null>(null)
let observer: ResizeObserver | null = null
watch(box, (el) => {
  observer?.disconnect()
  if (!el || typeof ResizeObserver === 'undefined') return
  observer = new ResizeObserver(([e]) => { if (e) width.value = Math.max(300, Math.round(e.contentRect.width)) })
  observer.observe(el)
})
onBeforeUnmount(() => observer?.disconnect())

const M = computed(() => ({ top: 12, right: 10, bottom: 28, left: width.value < 480 ? 52 : 64 }))
const innerW = computed(() => width.value - M.value.left - M.value.right)
const innerH = computed(() => H - M.value.top - M.value.bottom)
const niceMax = (v: number) => {
  if (v <= 0) return 100
  const pow = 10 ** Math.floor(Math.log10(v))
  const n = v / pow
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow
}
const maxVal = computed(() => niceMax(Math.max(0, ...props.points.flatMap(p => [p.currentCents ?? 0, p.previousCents ?? 0]))))
const x = (i: number) => M.value.left + (props.points.length > 1 ? (innerW.value * i) / (props.points.length - 1) : innerW.value / 2)
const y = (v: number) => M.value.top + innerH.value - (v / maxVal.value) * innerH.value
const path = (key: 'currentCents' | 'previousCents') => {
  let d = ''
  props.points.forEach((p, i) => {
    const v = p[key]
    if (v === null) return
    d += `${d ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`
  })
  return d
}
const ticks = computed(() => [0, 0.5, 1].map(t => ({ v: maxVal.value * t, y: y(maxVal.value * t) })))
const labelEvery = computed(() => Math.max(1, Math.ceil(props.points.length / Math.max(3, Math.floor(innerW.value / 56)))))

const hover = ref<number | null>(null)
const picked = ref<number | null>(null)
watch(() => props.points, () => { picked.value = null })
const lastCurrent = computed(() => {
  for (let i = props.points.length - 1; i >= 0; i--) if (props.points[i]!.currentCents !== null) return i
  return props.points.length - 1
})
const shown = computed(() => hover.value ?? picked.value ?? lastCurrent.value)
const pt = computed(() => props.points[shown.value] ?? null)
const indexAt = (e: MouseEvent) => {
  const r = (e.currentTarget as SVGElement).getBoundingClientRect()
  const px = ((e.clientX - r.left) / r.width) * width.value
  const i = Math.round(((px - M.value.left) / innerW.value) * (props.points.length - 1))
  return Math.max(0, Math.min(props.points.length - 1, i))
}
const diff = computed(() => {
  const p = pt.value
  if (!p || p.currentCents === null || p.previousCents === null || !p.previousCents) return null
  return Math.round(((p.currentCents - p.previousCents) / p.previousCents) * 100)
})
</script>

<template>
  <div ref="box">
    <ul class="flex gap-5 text-xs text-secondary mb-2" aria-label="Legenda">
      <li class="flex items-center gap-2"><span class="inline-block w-4 h-0.5" :style="{ background: CURRENT }"></span>{{ currentLabel }}</li>
      <li class="flex items-center gap-2"><span class="inline-block w-4 border-t-2 border-dashed" :style="{ borderColor: PREVIOUS }"></span>{{ previousLabel }}</li>
    </ul>
    <div v-if="pt" class="flex flex-wrap items-baseline gap-x-4 gap-y-1 mb-2 text-sm min-h-[44px]" aria-live="polite" data-testid="cumulative-readout">
      <span class="text-primary font-bold w-full sm:w-auto">Até o dia {{ pt.day }}</span>
      <span class="text-secondary">{{ currentLabel }} <b class="text-primary">{{ pt.currentCents === null ? '—' : formatCents(pt.currentCents) }}</b></span>
      <span class="text-secondary">{{ previousLabel }} <b class="text-primary">{{ pt.previousCents === null ? '—' : formatCents(pt.previousCents) }}</b></span>
      <span v-if="diff !== null" class="text-secondary">{{ diff >= 0 ? '▲' : '▼' }} <b class="text-primary">{{ Math.abs(diff) }}%</b></span>
    </div>
    <svg :viewBox="`0 0 ${width} ${H}`" class="w-full h-auto select-none touch-pan-y" role="img" aria-label="Receita acumulada"
      @mousemove="hover = indexAt($event)" @mouseleave="hover = null" @click="picked = indexAt($event)">
      <g v-for="t in ticks" :key="t.v">
        <line :x1="M.left" :x2="width - M.right" :y1="t.y" :y2="t.y" stroke="#EAEAEA" stroke-width="1" />
        <text :x="M.left - 6" :y="t.y + 4" text-anchor="end" font-size="11" fill="#6b6b6b">{{ formatCompactCents(t.v) }}</text>
      </g>
      <line :x1="x(shown)" :x2="x(shown)" :y1="M.top" :y2="M.top + innerH" stroke="#c9c9c9" stroke-width="1" />
      <path :d="path('previousCents')" fill="none" :stroke="PREVIOUS" stroke-width="2" stroke-dasharray="5 4" stroke-linejoin="round" />
      <path :d="path('currentCents')" fill="none" :stroke="CURRENT" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
      <circle v-if="pt && pt.currentCents !== null" :cx="x(shown)" :cy="y(pt.currentCents)" r="4.5" :fill="CURRENT" stroke="#fcf8f8" stroke-width="2" />
      <text v-for="(p, i) in points" v-show="i % labelEvery === 0" :key="p.day" :x="x(i)" :y="H - 8" text-anchor="middle" font-size="11" fill="#6b6b6b">{{ p.label }}</text>
    </svg>
  </div>
</template>
