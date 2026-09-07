<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

interface HeroSlide {
  id: number
  sort_order: number
  image: string
  subtitle: string
  title: string
  btn1: string
  btn2: string
  align: string
  active: boolean
}

const { client } = useSupabase()

// Fallback estático caso o banco ainda não tenha a tabela
const fallbackSlides: HeroSlide[] = [
  {
    id: 1,
    sort_order: 0,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbxECBrR28hV_p-R6hNN4nYcynHGmLBNlbLkiZclI6owxv175BzNBmaNqtnC7nUtn6GaT9vfOaqC0IcOoGK8j1QixUBW1UkdaQUydQ9lGOOqGIheFevA6T6yMkyDANPNu9nUuXXYX-JBCHC-1nTjBV3OuYRWQ8ZfBfekcc55VngFuJ2jqGQ2EPp7lKfXh0DxJ7PN35ipi1fAIb-iH4LP2jSyEYXBUY5kME0pgkZKJ0xVq_jl60r70DepR4P_bkljDsBTqVry-lkkVV',
    subtitle: 'COLEÇÃO 2026',
    title: 'A ENERGIA DA PEDRA<br>FEITA PARA VESTIR',
    btn1: 'VER COLEÇÃO',
    btn2: 'SOBRE NÓS',
    align: 'text-center lg:text-left items-center lg:items-start',
    active: true
  },
  {
    id: 2,
    sort_order: 1,
    image: '/about_us.png',
    subtitle: 'FEITO À MÃO',
    title: 'LAPIDADO COM ALMA<br>E INTENÇÃO',
    btn1: 'DESCUBRA',
    btn2: 'ATELIÊ',
    align: 'text-center lg:text-right items-center lg:items-end',
    active: true
  }
]

const slides = ref<HeroSlide[]>([])
const currentSlide = ref(0)
let timer: ReturnType<typeof setInterval> | null = null
const isTouchDevice = ref(false)

// Suporte a gestos de deslizar (swipe) em celular
const touchStartX = ref(0)
const touchEndX = ref(0)

const handleTouchStart = (e: TouchEvent) => {
  const touch = e.changedTouches[0]
  if (touch) {
    touchStartX.value = touch.screenX
  }
}

const handleTouchEnd = (e: TouchEvent) => {
  const touch = e.changedTouches[0]
  if (touch) {
    touchEndX.value = touch.screenX
    handleSwipe()
  }
}

const handleSwipe = () => {
  const diff = touchStartX.value - touchEndX.value
  const threshold = 50 // pixels mínimos para contar como deslize
  if (Math.abs(diff) > threshold) {
    if (diff > 0) {
      nextSlide() // deslizar para a esquerda -> próximo
    } else {
      prevSlide() // deslizar para a direita -> anterior
    }
  }
}

const fetchSlides = async () => {
  try {
    const { data, error } = await client
      .from('hero_slides')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })

    if (error) throw error
    slides.value = data && data.length > 0 ? data : fallbackSlides
  } catch {
    // Tabela pode não existir ainda, usa o fallback
    slides.value = fallbackSlides
  }
}

const startAutoplay = () => {
  stopAutoplay() // Evita timers duplicados
  timer = setInterval(() => {
    nextSlide()
  }, 4000) // Transição a cada 4 segundos
}

const stopAutoplay = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const nextSlide = () => {
  if (slides.value.length === 0) return
  currentSlide.value = (currentSlide.value + 1) % slides.value.length
}

const prevSlide = () => {
  if (slides.value.length === 0) return
  currentSlide.value = (currentSlide.value - 1 + slides.value.length) % slides.value.length
}

const setSlide = (idx: number) => {
  currentSlide.value = idx
}

onMounted(async () => {
  // Detecta se é dispositivo com suporte a toque
  isTouchDevice.value = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0)
  await fetchSlides()
  startAutoplay()
})

onUnmounted(() => {
  stopAutoplay()
})
</script>

<template>
  <section
    class="relative h-[80vh] lg:h-[90vh] 3xl:h-screen w-full overflow-hidden bg-black"
    data-testid="hero-banner-section"
    @mouseenter="!isTouchDevice && stopAutoplay()"
    @mouseleave="!isTouchDevice && startAutoplay()"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <!-- Slides -->
    <div
      v-for="(slide, idx) in slides"
      :key="slide.id"
      class="absolute inset-0 transition-opacity duration-1000 ease-in-out"
      :class="currentSlide === idx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'"
    >
      <!-- Background Image with elegant scale effect -->
      <div
        class="absolute inset-0 bg-cover bg-center transition-transform duration-10000 ease-out"
        :class="currentSlide === idx ? 'scale-100' : 'scale-105'"
        :style="{ backgroundImage: `url('${slide.image}')` }"
        role="img"
        :aria-label="slide.title"
      ></div>

      <!-- Overlay -->
      <div class="absolute inset-0 bg-black/20 lg:bg-black/25"></div>

      <!-- Slide Contents -->
      <div
        class="absolute bottom-20 lg:bottom-28 3xl:bottom-40 left-0 w-full px-margin-mobile lg:px-margin-desktop xl:px-margin-desktop-xl 3xl:px-[160px] z-10 flex flex-col"
        :class="slide.align"
      >
        <div class="lg:max-w-2xl xl:max-w-3xl 3xl:max-w-5xl transition-all duration-700 delay-300 transform" :class="currentSlide === idx ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'">
          <p class="font-label-caps text-label-caps text-pure-white/80 tracking-[0.4em] mb-4 lg:mb-6 xl:mb-8">{{ slide.subtitle }}</p>
          <h1
            class="font-display-lg text-headline-lg-mobile lg:text-[48px] xl:text-[56px] 2xl:text-[64px] 3xl:text-[80px] 4xl:text-[96px] text-pure-white mb-8 lg:mb-10 leading-tight tracking-wide uppercase drop-shadow-md"
            v-html="slide.title"
          ></h1>
          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="#"
              class="inline-block bg-primary px-10 xl:px-14 3xl:px-16 py-4 xl:py-5 3xl:py-6 font-label-caps text-label-caps xl:text-[13px] 3xl:text-[15px] text-pure-white transition-all duration-300 hover:bg-deep-onyx hover:tracking-widest active:scale-95 shadow-md"
            >
              {{ slide.btn1 }}
            </a>
            <a
              href="#"
              class="border border-pure-white/60 px-10 xl:px-14 3xl:px-16 py-4 xl:py-5 3xl:py-6 font-label-caps text-label-caps xl:text-[13px] 3xl:text-[15px] text-pure-white transition-all duration-300 hover:border-pure-white hover:bg-white/10 active:scale-95"
            >
              {{ slide.btn2 }}
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Arrows -->
    <button
      class="hidden lg:flex absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full border border-pure-white/20 text-pure-white/60 hover:text-pure-white hover:border-pure-white transition-all active:scale-90"
      @click="prevSlide"
      aria-label="Anterior"
    >
      <span class="material-symbols-outlined text-2xl">chevron_left</span>
    </button>
    <button
      class="hidden lg:flex absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 items-center justify-center rounded-full border border-pure-white/20 text-pure-white/60 hover:text-pure-white hover:border-pure-white transition-all active:scale-90"
      @click="nextSlide"
      aria-label="Próximo"
    >
      <span class="material-symbols-outlined text-2xl">chevron_right</span>
    </button>

    <!-- Dot Indicators -->
    <div class="absolute bottom-6 lg:bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-3">
      <button
        v-for="(slide, idx) in slides"
        :key="slide.id"
        class="w-3 h-3 rounded-full border border-pure-white transition-all duration-300"
        :class="currentSlide === idx ? 'bg-pure-white scale-110' : 'bg-transparent hover:bg-white/20'"
        @click="setSlide(idx)"
        :aria-label="`Ir para o slide ${idx + 1}`"
      ></button>
    </div>
  </section>
</template>


<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 1.2s ease-out forwards;
}
</style>
