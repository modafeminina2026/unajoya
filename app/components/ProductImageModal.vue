<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useImageModal } from '~/composables/useImageModal'
import { useCart } from '~/composables/useCart'

const { isOpen, images, currentIndex, title, currentProduct, close, next, prev, setIndex } = useImageModal()
const { addToCart } = useCart()

// Touch / Swipe & Zoom gesture state
const touchStartX = ref(0)
const touchStartY = ref(0)
const touchEndX = ref(0)
const touchEndY = ref(0)
const minSwipeDistance = 45
const minVerticalSwipeClose = 75

// Zoom state
const isZoomed = ref(false)
const lastTapTime = ref(0)

const onTouchStart = (e: TouchEvent) => {
  if (e.touches.length === 1) {
    touchStartX.value = e.touches[0].clientX
    touchStartY.value = e.touches[0].clientY
    touchEndX.value = e.touches[0].clientX
    touchEndY.value = e.touches[0].clientY
  }
}

const onTouchMove = (e: TouchEvent) => {
  if (e.touches.length === 1 && !isZoomed.value) {
    touchEndX.value = e.touches[0].clientX
    touchEndY.value = e.touches[0].clientY
  }
}

const onTouchEnd = (e: TouchEvent) => {
  if (isZoomed.value) return

  const diffX = touchStartX.value - touchEndX.value
  const diffY = touchEndY.value - touchStartY.value

  // Check for vertical swipe down to close modal
  if (diffY < -minVerticalSwipeClose && Math.abs(diffX) < 50) {
    close()
    return
  }

  // Check for horizontal swipe between images
  if (Math.abs(diffX) > minSwipeDistance && Math.abs(diffY) < 100) {
    if (diffX > 0) {
      next()
    } else {
      prev()
    }
  }
}

// Double tap to zoom on mobile
const handleImageDoubleTap = (e: MouseEvent | TouchEvent) => {
  const now = Date.now()
  if (now - lastTapTime.value < 300) {
    isZoomed.value = !isZoomed.value
  }
  lastTapTime.value = now
}

const resetZoom = () => {
  isZoomed.value = false
}

// Reset zoom whenever current image index changes or modal opens/closes
watch([currentIndex, isOpen], () => {
  isZoomed.value = false
})

// Keyboard navigation (Esc to close, Left/Right arrows to navigate)
const onKeyDown = (e: KeyboardEvent) => {
  if (!isOpen.value) return

  if (e.key === 'Escape') {
    close()
  } else if (e.key === 'ArrowRight') {
    next()
  } else if (e.key === 'ArrowLeft') {
    prev()
  }
}

const handleBuyFromModal = () => {
  if (currentProduct.value) {
    addToCart({
      name: currentProduct.value.name,
      price: currentProduct.value.price,
      image: images.value[0] || currentProduct.value.image
    })
    close()
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', onKeyDown)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', onKeyDown)
  }
})

// Body overflow lock
watch(isOpen, (openVal) => {
  if (typeof document !== 'undefined') {
    if (openVal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div 
        v-if="isOpen" 
        class="fixed inset-0 z-[9999] flex flex-col justify-between bg-black/95 backdrop-blur-lg select-none touch-manipulation"
        role="dialog"
        aria-modal="true"
        @click.self="close"
      >
        <!-- Top Bar: Title, Counter & Close 'X' Button -->
        <header class="flex items-center justify-between px-4 sm:px-8 py-3.5 sm:py-4 z-30 bg-gradient-to-b from-black/90 via-black/60 to-transparent">
          <div class="flex flex-col text-left pr-4">
            <h3 v-if="title" class="font-display-lg text-base sm:text-xl md:text-2xl text-pure-white font-normal tracking-wide line-clamp-1">
              {{ title }}
            </h3>
            <div class="flex items-center gap-2 mt-0.5">
              <span v-if="images.length > 1" class="text-xs sm:text-sm font-label-caps text-champagne-gold tracking-widest">
                Foto {{ currentIndex + 1 }} de {{ images.length }}
              </span>
              <span v-if="isZoomed" class="text-[10px] text-pure-white/60 bg-white/10 px-2 py-0.5 rounded-xs">
                Toque 2x para diminuir
              </span>
            </div>
          </div>

          <!-- Close 'X' Button (Large touch target for phones) -->
          <button 
            type="button"
            aria-label="Fechar visualização de imagem" 
            class="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/15 hover:bg-white/30 text-pure-white hover:text-champagne-gold transition-all duration-200 border border-white/25 active:scale-90 flex-shrink-0 cursor-pointer shadow-lg"
            @click="close"
          >
            <span class="material-symbols-outlined text-2xl sm:text-3xl leading-none">close</span>
          </button>
        </header>

        <!-- Center: Image Display with Navigation Controls -->
        <main 
          class="relative flex-1 flex flex-col items-center justify-center px-2 sm:px-12 overflow-hidden my-auto w-full"
          @click.self="close"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
        >
          <!-- Previous Arrow Button -->
          <button 
            v-if="images.length > 1"
            type="button"
            aria-label="Foto anterior" 
            class="absolute left-2 sm:left-6 z-20 flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-black/50 hover:bg-black/80 text-pure-white hover:text-champagne-gold border border-white/20 transition-all duration-200 hover:scale-105 active:scale-90 cursor-pointer backdrop-blur-md shadow-xl"
            @click.stop="prev"
          >
            <span class="material-symbols-outlined text-2xl sm:text-4xl">chevron_left</span>
          </button>

          <!-- Active Image Container -->
          <div 
            class="relative max-w-[96vw] sm:max-w-[85vw] lg:max-w-[75vw] max-h-[72vh] sm:max-h-[75vh] flex items-center justify-center overflow-hidden transition-transform duration-300"
            :class="isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'"
            @click.stop="handleImageDoubleTap"
          >
            <Transition name="slide-image" mode="out-in">
              <img 
                :key="currentIndex"
                :src="images[currentIndex]" 
                :alt="`${title || 'Joia Una Joya'} - Foto ${currentIndex + 1}`" 
                class="max-w-full max-h-[70vh] sm:max-h-[74vh] object-contain rounded-sm shadow-2xl transition-transform duration-300 pointer-events-auto"
                :class="isZoomed ? 'scale-150 sm:scale-175' : 'scale-100'"
                draggable="false"
              />
            </Transition>
          </div>

          <!-- Next Arrow Button -->
          <button 
            v-if="images.length > 1"
            type="button"
            aria-label="Próxima foto" 
            class="absolute right-2 sm:right-6 z-20 flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-black/50 hover:bg-black/80 text-pure-white hover:text-champagne-gold border border-white/20 transition-all duration-200 hover:scale-105 active:scale-90 cursor-pointer backdrop-blur-md shadow-xl"
            @click.stop="next"
          >
            <span class="material-symbols-outlined text-2xl sm:text-4xl">chevron_right</span>
          </button>

          <!-- Mobile Pagination Dots (if multiple images) -->
          <div v-if="images.length > 1" class="flex md:hidden items-center gap-1.5 mt-3 z-20">
            <button
              v-for="(_, dotIdx) in images"
              :key="dotIdx"
              type="button"
              :aria-label="`Ir para foto ${dotIdx + 1}`"
              class="h-2 rounded-full transition-all duration-300 cursor-pointer"
              :class="dotIdx === currentIndex ? 'w-6 bg-champagne-gold' : 'w-2 bg-white/40 hover:bg-white/70'"
              @click.stop="setIndex(dotIdx)"
            />
          </div>
        </main>

        <!-- Bottom Controls: Thumbnails Carousel & Buy CTA -->
        <footer class="flex flex-col items-center gap-3 px-4 py-3 sm:py-4 z-30 bg-gradient-to-t from-black/95 via-black/70 to-transparent">
          <!-- Thumbnail Carousel Bar (se houver mais de 1 imagem) -->
          <div 
            v-if="images.length > 1"
            class="hidden sm:flex items-center gap-2 sm:gap-3 overflow-x-auto max-w-full py-1 px-2 no-scrollbar"
          >
            <button 
              v-for="(img, idx) in images" 
              :key="idx"
              type="button"
              :aria-label="`Ver foto ${idx + 1}`"
              class="relative w-12 h-12 sm:w-16 sm:h-16 rounded-xs overflow-hidden border-2 transition-all duration-200 flex-shrink-0 cursor-pointer"
              :class="idx === currentIndex ? 'border-champagne-gold ring-2 ring-champagne-gold/50 scale-105 opacity-100' : 'border-white/20 opacity-50 hover:opacity-90'"
              @click.stop="setIndex(idx)"
            >
              <img 
                :src="img" 
                :alt="`Miniatura ${idx + 1}`" 
                class="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          </div>

          <!-- CTA Button if product is passed -->
          <div v-if="currentProduct" class="flex items-center gap-4 w-full sm:w-auto justify-center">
            <button 
              type="button"
              class="w-full sm:w-auto px-8 py-3.5 bg-champagne-gold text-primary font-label-caps text-xs sm:text-sm tracking-widest uppercase font-bold hover:bg-pure-white hover:text-primary transition-all duration-300 rounded-xs shadow-xl active:scale-95 flex items-center justify-center gap-2"
              @click="handleBuyFromModal"
            >
              <span class="material-symbols-outlined text-lg">shopping_bag</span>
              <span>COMPRAR ESTA JOIA</span>
            </button>
          </div>
        </footer>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* Modal Fade Transitions */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* Image Slide Transitions */
.slide-image-enter-active,
.slide-image-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.slide-image-enter-from {
  opacity: 0;
  transform: scale(0.96);
}

.slide-image-leave-to {
  opacity: 0;
  transform: scale(1.02);
}

/* Hide scrollbar for thumbnail list */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
