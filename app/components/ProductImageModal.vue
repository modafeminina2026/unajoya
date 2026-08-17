<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useImageModal } from '~/composables/useImageModal'
import { useCart } from '~/composables/useCart'

const { isOpen, images, currentIndex, title, currentProduct, close, next, prev, setIndex } = useImageModal()
const { addToCart } = useCart()

// Touch swipe support for mobile carousel
const touchStartX = ref(0)
const touchEndX = ref(0)
const minSwipeDistance = 40

const onTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.changedTouches[0].screenX
}

const onTouchEnd = (e: TouchEvent) => {
  touchEndX.value = e.changedTouches[0].screenX
  handleSwipe()
}

const handleSwipe = () => {
  const diff = touchStartX.value - touchEndX.value
  if (Math.abs(diff) > minSwipeDistance) {
    if (diff > 0) {
      // Swiped left -> next image
      next()
    } else {
      // Swiped right -> prev image
      prev()
    }
  }
}

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

// Clean up body overflow when modal unmounts
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
        class="fixed inset-0 z-[999] flex flex-col justify-between bg-black/92 backdrop-blur-md select-none"
        role="dialog"
        aria-modal="true"
        @click.self="close"
      >
        <!-- Top Bar: Title, Counter & Close 'X' Button -->
        <header class="flex items-center justify-between px-4 sm:px-8 py-4 z-20 bg-gradient-to-b from-black/80 to-transparent">
          <div class="flex flex-col text-left pr-4">
            <h3 v-if="title" class="font-display-lg text-lg sm:text-xl md:text-2xl text-pure-white font-normal tracking-wide line-clamp-1">
              {{ title }}
            </h3>
            <span v-if="images.length > 1" class="text-xs sm:text-sm font-label-caps text-champagne-gold tracking-widest mt-0.5">
              Foto {{ currentIndex + 1 }} de {{ images.length }}
            </span>
          </div>

          <!-- Close 'X' Button (Canto Superior Direito) -->
          <button 
            type="button"
            aria-label="Fechar visualização de imagem" 
            class="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/25 text-pure-white hover:text-champagne-gold transition-all duration-200 border border-white/20 active:scale-90 flex-shrink-0 cursor-pointer shadow-lg"
            @click="close"
          >
            <span class="material-symbols-outlined text-2xl sm:text-3xl leading-none">close</span>
          </button>
        </header>

        <!-- Center: Image Display with Previous / Next Arrows -->
        <main 
          class="relative flex-1 flex items-center justify-center px-3 sm:px-16 overflow-hidden my-auto"
          @click.self="close"
          @touchstart="onTouchStart"
          @touchend="onTouchEnd"
        >
          <!-- Previous Arrow Button -->
          <button 
            v-if="images.length > 1"
            type="button"
            aria-label="Foto anterior" 
            class="absolute left-2 sm:left-6 z-10 flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-black/40 hover:bg-black/80 text-pure-white hover:text-champagne-gold border border-white/20 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-sm shadow-xl"
            @click.stop="prev"
          >
            <span class="material-symbols-outlined text-2xl sm:text-4xl">chevron_left</span>
          </button>

          <!-- Active Image Container -->
          <div 
            class="relative max-w-[92vw] sm:max-w-[80vw] lg:max-w-[70vw] max-h-[70vh] sm:max-h-[72vh] flex items-center justify-center"
            @click.self="close"
          >
            <Transition name="slide-image" mode="out-in">
              <img 
                :key="currentIndex"
                :src="images[currentIndex]" 
                :alt="`${title || 'Joia Una Joya'} - Foto ${currentIndex + 1}`" 
                class="max-w-full max-h-[68vh] sm:max-h-[72vh] object-contain rounded-sm shadow-2xl border border-white/10 cursor-default"
                draggable="false"
              />
            </Transition>
          </div>

          <!-- Next Arrow Button -->
          <button 
            v-if="images.length > 1"
            type="button"
            aria-label="Próxima foto" 
            class="absolute right-2 sm:right-6 z-10 flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-black/40 hover:bg-black/80 text-pure-white hover:text-champagne-gold border border-white/20 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer backdrop-blur-sm shadow-xl"
            @click.stop="next"
          >
            <span class="material-symbols-outlined text-2xl sm:text-4xl">chevron_right</span>
          </button>
        </main>

        <!-- Bottom Controls: Thumbnails Carousel & Buy CTA -->
        <footer class="flex flex-col items-center gap-3 px-4 py-4 z-20 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
          <!-- Thumbnail Carousel Bar (se houver mais de 1 imagem) -->
          <div 
            v-if="images.length > 1"
            class="flex items-center gap-2 sm:gap-3 overflow-x-auto max-w-full py-1 px-2 no-scrollbar"
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

          <!-- Optional CTA Button if product is passed -->
          <div v-if="currentProduct" class="flex items-center gap-4">
            <button 
              type="button"
              class="px-6 py-2.5 bg-champagne-gold text-primary font-label-caps text-xs tracking-widest uppercase font-bold hover:bg-pure-white hover:text-primary transition-all duration-300 rounded-xs shadow-lg active:scale-95 flex items-center gap-2"
              @click="handleBuyFromModal"
            >
              <span class="material-symbols-outlined text-base">shopping_bag</span>
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
