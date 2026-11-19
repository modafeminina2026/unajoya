<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import FinanceChart from './FinanceChart.vue'
import CumulativeChart from './CumulativeChart.vue'
import RankedBars from './RankedBars.vue'
import {
  todayISO, resolvePeriod, previousPeriod, shiftAnchor, isCalendarPreset, periodLabel, suggestGranularity,
  buildSeries, summarize, salesByChannel, salesByPayment, topProducts, expensesByCategory, pctChange,
  cumulativeRevenue, goalProgress, buildInsights, monthOf, monthLabel, daysBetween,
  formatCents, PRESET_LABELS, GRANULARITY_LABELS,
  type SaleRow, type ExpenseRow, type PeriodPreset, type Granularity
} from '~/utils/finance'
import { parseMoneyToCents } from '~/utils/importer'
import type { WhatsAppOrder } from '~/composables/admin/useAdminFinance'

const props = withDefaults(defineProps<{
  sales: SaleRow[]
  expenses: ExpenseRow[]
  whatsappOrders: WhatsAppOrder[]
  loading: boolean
  error?: string
  goals?: Record<string, number>
  saveGoal?: (month: string, cents: number | null) => Promise<string | null>
}>(), { goals: () => ({}) })

const emit = defineEmits<{ openContacts: [] }>()

const today = todayISO()
const preset = ref<PeriodPreset>('month')
const anchor = ref(today)
const customFrom = ref('')
const customTo = ref('')
const gran = ref<Granularity | null>(null)

// celular: telas estreitas agrupam o mês por semana (barras largas o bastante para o dedo)
const isNarrow = ref(false)
let mq: MediaQueryList | null = null
const onMq = () => { isNarrow.value = !!mq?.matches }
onMounted(() => {
  if (typeof window === 'undefined' || !window.matchMedia) return
  mq = window.matchMedia('(max-width: 639px)')
  onMq()
  mq.addEventListener?.('change', onMq)
})
onBeforeUnmount(() => mq?.removeEventListener?.('change', onMq))

const presets: PeriodPreset[] = ['today', 'week', '7d', '30d', 'month', 'quarter', 'year', 'custom']
const period = computed(() => resolvePeriod(preset.value, today, anchor.value, { from: customFrom.value, to: customTo.value }))
const previous = computed(() => previousPeriod(period.value, today))
const effGran = computed<Granularity>(() => {
  if (gran.value) return gran.value
  const g = suggestGranularity(period.value)
  const days = daysBetween(period.value.from, period.value.to) + 1
  return isNarrow.value && g === 'day' && days > 14 ? 'week' : g
})
watch(preset, () => { anchor.value = today; gran.value = null })

const current = computed(() => summarize(props.sales, props.expenses, period.value))
const before = computed(() => summarize(props.sales, props.expenses, previous.value))
const series = computed(() => buildSeries(props.sales, props.expenses, period.value, effGran.value))
const cumulative = computed(() => cumulativeRevenue(props.sales, period.value, previous.value, today))

// ---------- Indicadores com variação (verde = bom, vermelho = ruim)
type Better = 'up' | 'down'
const delta = (cur: number, prev: number, better: Better = 'up') => {
  const d = pctChange(cur, prev)
  if (d === null) return { text: 'novo', tone: 'neutral' as const, title: 'Sem base de comparação' }
  if (d === 0) return { text: '0%', tone: 'neutral' as const, title: 'Igual ao período anterior' }
  const good = better === 'up' ? d > 0 : d < 0
  return {
    text: `${d > 0 ? '▲' : '▼'} ${Math.abs(d).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`,
    tone: good ? ('good' as const) : ('bad' as const),
    title: 'Comparado com o período anterior'
  }
}
const toneClass = (t: 'good' | 'bad' | 'neutral') =>
  t === 'good' ? 'bg-[#e6f4ec] text-[#1f6b45]' : t === 'bad' ? 'bg-[#fbe9e7] text-[#a3341f]' : 'bg-soft-stone/60 text-secondary'

const resultDelta = computed(() => delta(current.value.resultCents, before.value.resultCents))
const revenueDelta = computed(() => delta(current.value.revenueCents, before.value.revenueCents))
const expensesDelta = computed(() => delta(current.value.expensesCents, before.value.expensesCents, 'down'))
const tiles = computed(() => [
  { key: 'sales', label: 'Vendas', value: String(current.value.salesCount), d: delta(current.value.salesCount, before.value.salesCount) },
  { key: 'items', label: 'Peças', value: String(current.value.itemsCount), d: delta(current.value.itemsCount, before.value.itemsCount) },
  { key: 'ticket', label: 'Ticket médio', value: formatCents(current.value.avgTicketCents), d: delta(current.value.avgTicketCents, before.value.avgTicketCents) }
])

// ---------- Meta do mês (aparece quando o período é um mês)
const goalMonth = computed(() => (preset.value === 'month' ? monthOf(period.value.from) : null))
const goalCents = computed(() => (goalMonth.value ? props.goals[goalMonth.value] ?? 0 : 0))
const goal = computed(() => (goalMonth.value && goalCents.value ? goalProgress(goalCents.value, current.value.revenueCents, goalMonth.value, today) : null))
const editingGoal = ref(false)
const goalInput = ref('')
const goalMsg = ref('')
const startGoal = () => {
  goalInput.value = goalCents.value ? (goalCents.value / 100).toFixed(2).replace('.', ',') : ''
  goalMsg.value = ''
  editingGoal.value = true
}
const submitGoal = async () => {
  if (!goalMonth.value || !props.saveGoal) return
  const cents = goalInput.value.trim() ? parseMoneyToCents(goalInput.value) : null
  if (goalInput.value.trim() && (cents === null || cents <= 0)) { goalMsg.value = 'Digite um valor válido.'; return }
  const err = await props.saveGoal(goalMonth.value, cents)
  if (err) { goalMsg.value = err; return }
  editingGoal.value = false
}

// ---------- Resumo escrito
const insights = computed(() => buildInsights({
  sales: props.sales,
  expenses: props.expenses,
  period: period.value,
  previous: previous.value,
  pendingContacts: props.whatsappOrders,
  goal: goal.value
}))

// ---------- Gráfico: por período ou acumulado
const chartMode = ref<'bars' | 'cumulative'>('bars')
const prevLabel = computed(() => (preset.value === 'month' ? 'Mês anterior' : preset.value === 'year' ? 'Ano anterior' : 'Período anterior'))
const curLabel = computed(() => (preset.value === 'month' ? 'Este mês' : preset.value === 'year' ? 'Este ano' : 'Este período'))

// ---------- Rankings em abas
type RankTab = 'products' | 'expenses' | 'channel' | 'payment'
const rankTab = ref<RankTab>('products')
const showAllRank = ref(false)
watch(rankTab, () => { showAllRank.value = false })
const RANK_TABS: { key: RankTab; label: string }[] = [
  { key: 'products', label: 'Peças' },
  { key: 'expenses', label: 'Gastos' },
  { key: 'channel', label: 'Canal' },
  { key: 'payment', label: 'Pagamento' }
]
const rankItems = computed(() => {
  switch (rankTab.value) {
    case 'expenses': return expensesByCategory(props.expenses, period.value)
    case 'channel': return salesByChannel(props.sales, period.value)
    case 'payment': return salesByPayment(props.sales, period.value)
    default: return topProducts(props.sales, period.value, 50)
  }
})
const rankVisible = computed(() => (showAllRank.value ? rankItems.value : rankItems.value.slice(0, 5)))

// ---------- Funil do WhatsApp no período
const funnel = computed(() => {
  const inRange = props.whatsappOrders.filter((o) => {
    const d = o.created_at.slice(0, 10)
    return d >= period.value.from && d <= period.value.to
  })
  const count = (s: string) => inRange.filter(o => o.status === s).length
  const total = inRange.length
  const closed = count('fechado')
  return { total, novo: count('novo'), em_conversa: count('em_conversa'), fechado: closed, rate: total ? Math.round((closed / total) * 100) : 0 }
})
</script>

<template>
  <section class="space-y-5 md:space-y-8">
    <p v-if="error" class="text-sm text-error" role="alert">{{ error }}</p>

    <!-- Filtros -->
    <div class="flex flex-wrap items-end gap-3">
      <label class="block text-xs text-secondary flex-1 sm:flex-none">
        <span class="font-label-caps text-[11px]">PERÍODO</span>
        <select v-model="preset" data-testid="preset-select" class="block mt-1 w-full sm:min-w-[160px] min-h-[44px] border border-soft-stone bg-transparent px-3 text-sm text-primary">
          <option v-for="p in presets" :key="p" :value="p">{{ PRESET_LABELS[p] }}</option>
        </select>
      </label>
      <div v-if="isCalendarPreset(preset)" class="flex items-center gap-2">
        <button type="button" class="border border-soft-stone w-11 h-11" aria-label="Período anterior" @click="anchor = shiftAnchor(preset, anchor, -1)">‹</button>
        <button type="button" class="border border-soft-stone w-11 h-11" aria-label="Próximo período" @click="anchor = shiftAnchor(preset, anchor, 1)">›</button>
      </div>
      <div v-if="preset === 'custom'" class="flex items-center gap-2 text-sm w-full sm:w-auto">
        <input v-model="customFrom" type="date" class="flex-1 min-h-[44px] border border-soft-stone px-2 bg-transparent" aria-label="De" />
        <span class="text-secondary">até</span>
        <input v-model="customTo" type="date" class="flex-1 min-h-[44px] border border-soft-stone px-2 bg-transparent" aria-label="Até" />
      </div>
      <label class="block text-xs text-secondary flex-1 sm:flex-none md:ml-auto">
        <span class="font-label-caps text-[11px]">AGRUPAR POR</span>
        <select :value="effGran" data-testid="gran-select" class="block mt-1 w-full sm:min-w-[140px] min-h-[44px] border border-soft-stone bg-transparent px-3 text-sm text-primary"
          @change="gran = ($event.target as HTMLSelectElement).value as Granularity">
          <option v-for="g in (['day', 'week', 'month', 'year'] as Granularity[])" :key="g" :value="g">{{ GRANULARITY_LABELS[g] }}</option>
        </select>
      </label>
    </div>

    <p class="text-secondary text-sm -mt-1" data-testid="period-label">
      {{ periodLabel(period) }}<span v-if="loading"> · carregando...</span>
    </p>

    <!-- Resumo escrito -->
    <ul v-if="insights.length" class="space-y-2" data-testid="insights">
      <li v-for="(it, i) in insights" :key="i" class="flex items-start gap-3 text-sm leading-snug border-l-4 bg-pure-white/60 px-3 py-2"
        :class="it.kind === 'warn' ? 'border-[#c2410c]' : it.kind === 'good' ? 'border-[#1f7a4d]' : 'border-soft-stone'">
        <span class="text-primary flex-1">{{ it.text }}</span>
        <button v-if="it.text.includes('sem resposta')" type="button" class="text-xs underline text-secondary whitespace-nowrap min-h-[32px]" @click="emit('openContacts')">Ver contatos</button>
      </li>
    </ul>

    <!-- Destaque: resultado + receita/gastos + meta -->
    <div class="border border-soft-stone bg-pure-white/40 p-5 md:p-6">
      <div class="flex flex-wrap items-start justify-between gap-2">
        <p class="font-label-caps text-[11px] text-secondary">RESULTADO (RECEITA − GASTOS)</p>
        <span class="text-xs px-2 py-0.5 rounded-full" :class="toneClass(resultDelta.tone)" :title="resultDelta.title">{{ resultDelta.text }}</span>
      </div>
      <p class="font-display-lg text-4xl md:text-5xl text-primary mt-1 break-words" data-kpi="result">{{ formatCents(current.resultCents) }}</p>

      <div class="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-soft-stone">
        <div data-kpi="revenue">
          <p class="text-xs text-secondary">Receita</p>
          <p class="text-lg md:text-2xl text-primary font-bold">{{ formatCents(current.revenueCents) }}</p>
          <span class="inline-block mt-1 text-xs px-2 py-0.5 rounded-full" :class="toneClass(revenueDelta.tone)">{{ revenueDelta.text }}</span>
        </div>
        <div data-kpi="expenses">
          <p class="text-xs text-secondary">Gastos</p>
          <p class="text-lg md:text-2xl text-primary font-bold">{{ formatCents(current.expensesCents) }}</p>
          <span class="inline-block mt-1 text-xs px-2 py-0.5 rounded-full" :class="toneClass(expensesDelta.tone)">{{ expensesDelta.text }}</span>
        </div>
      </div>

      <!-- Meta do mês -->
      <div v-if="goalMonth" class="mt-5 pt-4 border-t border-soft-stone" data-testid="goal">
        <form v-if="editingGoal" class="flex flex-wrap items-center gap-2" @submit.prevent="submitGoal">
          <label class="text-sm text-primary w-full">Meta de receita para {{ monthLabel(goalMonth) }}</label>
          <input v-model="goalInput" type="text" inputmode="decimal" placeholder="Ex.: 5.000,00" class="flex-1 min-w-[140px] min-h-[44px] border border-soft-stone bg-transparent px-3" data-testid="goal-input" />
          <button type="submit" class="min-h-[44px] bg-primary text-pure-white px-5 font-label-caps text-xs">SALVAR</button>
          <button type="button" class="min-h-[44px] px-3 text-xs underline text-secondary" @click="editingGoal = false">Cancelar</button>
          <p class="text-xs text-secondary w-full">Deixe em branco e salve para remover a meta.</p>
          <p v-if="goalMsg" class="text-xs text-error w-full">{{ goalMsg }}</p>
        </form>
        <template v-else-if="goal">
          <div class="flex items-baseline justify-between gap-2 text-sm">
            <span class="text-primary"><b>{{ formatCents(goal.doneCents) }}</b> de {{ formatCents(goal.goalCents) }}</span>
            <span class="text-secondary">{{ goal.pct }}%</span>
          </div>
          <div class="h-3 bg-soft-stone/60 mt-2 rounded-full overflow-hidden" role="progressbar" :aria-valuenow="goal.pct" aria-valuemin="0" aria-valuemax="100">
            <div class="h-3 rounded-full" :style="{ width: goal.pct + '%', background: '#2a78d6' }"></div>
          </div>
          <div class="flex items-center justify-between mt-2 text-xs text-secondary">
            <span>{{ goal.remainingCents ? `Faltam ${formatCents(goal.remainingCents)}` : 'Meta batida!' }}<template v-if="goal.daysLeft > 0"> · {{ goal.daysLeft }} dia(s) restantes</template></span>
            <button v-if="saveGoal" type="button" class="underline min-h-[32px]" @click="startGoal">Editar meta</button>
          </div>
        </template>
        <button v-else-if="saveGoal" type="button" class="text-sm underline text-secondary min-h-[44px]" data-testid="goal-set" @click="startGoal">+ Definir meta de receita para {{ monthLabel(goalMonth) }}</button>
      </div>
    </div>

    <!-- Indicadores menores -->
    <div class="grid grid-cols-3 gap-2 md:gap-4">
      <div v-for="k in tiles" :key="k.key" class="border border-soft-stone p-3 md:p-5" :data-kpi="k.key">
        <p class="text-[11px] md:text-xs text-secondary">{{ k.label }}</p>
        <p class="text-base md:text-2xl text-primary font-bold mt-1 break-words">{{ k.value }}</p>
        <span class="inline-block mt-1 text-[11px] px-1.5 py-0.5 rounded-full" :class="toneClass(k.d.tone)">{{ k.d.text }}</span>
      </div>
    </div>

    <!-- Gráfico -->
    <div class="border border-soft-stone p-4 md:p-6">
      <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h3 class="font-display-lg text-xl text-primary italic">
          {{ chartMode === 'bars' ? `Receita e gastos por ${GRANULARITY_LABELS[effGran].toLowerCase()}` : 'Receita acumulada' }}
        </h3>
        <div class="inline-flex border border-soft-stone" role="tablist" aria-label="Tipo de gráfico">
          <button type="button" role="tab" :aria-selected="chartMode === 'bars'" class="px-3 min-h-[40px] text-xs" :class="chartMode === 'bars' ? 'bg-primary text-pure-white' : 'text-secondary'" @click="chartMode = 'bars'">Por período</button>
          <button type="button" role="tab" :aria-selected="chartMode === 'cumulative'" class="px-3 min-h-[40px] text-xs" :class="chartMode === 'cumulative' ? 'bg-primary text-pure-white' : 'text-secondary'" data-testid="mode-cumulative" @click="chartMode = 'cumulative'">Acumulado</button>
        </div>
      </div>
      <FinanceChart v-if="chartMode === 'bars'" :series="series" />
      <CumulativeChart v-else :points="cumulative" :current-label="curLabel" :previous-label="prevLabel" />
    </div>

    <!-- Rankings em abas -->
    <div class="border border-soft-stone p-4 md:p-6">
      <div class="flex gap-1 overflow-x-auto no-scrollbar mb-5 -mx-1 px-1" role="tablist" aria-label="Ranking">
        <button v-for="t in RANK_TABS" :key="t.key" type="button" role="tab" :aria-selected="rankTab === t.key" :data-rank-tab="t.key"
          class="px-4 min-h-[40px] text-sm whitespace-nowrap border-b-2 transition-colors"
          :class="rankTab === t.key ? 'border-primary text-primary font-bold' : 'border-transparent text-secondary'"
          @click="rankTab = t.key">{{ t.label }}</button>
      </div>
      <RankedBars :items="rankVisible" :unit="rankTab === 'products' ? 'un.' : undefined" :empty="rankTab === 'expenses' ? 'Nenhum gasto neste período.' : 'Sem vendas neste período.'" />
      <button v-if="rankItems.length > 5" type="button" class="mt-4 text-sm underline text-secondary min-h-[44px]" @click="showAllRank = !showAllRank">
        {{ showAllRank ? 'Mostrar só os 5 primeiros' : `Ver todos (${rankItems.length})` }}
      </button>
    </div>

    <!-- WhatsApp -->
    <div class="border border-soft-stone p-4 md:p-6" data-testid="funnel">
      <h3 class="font-display-lg text-xl text-primary italic mb-4">Contatos do WhatsApp</h3>
      <p v-if="!funnel.total" class="text-sm text-secondary">Nenhum contato neste período.</p>
      <div v-else class="grid grid-cols-4 gap-2 text-center">
        <div><p class="text-xl md:text-2xl text-primary">{{ funnel.total }}</p><p class="text-[11px] md:text-xs text-secondary">Recebidos</p></div>
        <div><p class="text-xl md:text-2xl text-primary">{{ funnel.novo + funnel.em_conversa }}</p><p class="text-[11px] md:text-xs text-secondary">Em aberto</p></div>
        <div><p class="text-xl md:text-2xl text-primary">{{ funnel.fechado }}</p><p class="text-[11px] md:text-xs text-secondary">Fechados</p></div>
        <div><p class="text-xl md:text-2xl text-primary">{{ funnel.rate }}%</p><p class="text-[11px] md:text-xs text-secondary">Conversão</p></div>
      </div>
    </div>
  </section>
</template>
