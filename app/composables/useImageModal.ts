import { ref } from 'vue'

export interface ImageModalPayload {
  title?: string
  images: string[]
  initialIndex?: number
  price?: number
  product?: any
}

const isOpen = ref(false)
const images = ref<string[]>([])
const currentIndex = ref(0)
const title = ref('')
const currentProduct = ref<any>(null)

export const useImageModal = () => {
  const open = (payload: ImageModalPayload) => {
    const validImages = (payload.images || []).filter(img => typeof img === 'string' && img.trim() !== '')
    if (validImages.length === 0) return
    images.value = validImages
    currentIndex.value = Math.max(0, Math.min(payload.initialIndex || 0, validImages.length - 1))
    title.value = payload.title || ''
    currentProduct.value = payload.product || null
    isOpen.value = true
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden'
    }
  }

  const close = () => {
    isOpen.value = false
    if (typeof document !== 'undefined') {
      document.body.style.overflow = ''
    }
  }

  const next = () => {
    if (images.value.length <= 1) return
    currentIndex.value = (currentIndex.value + 1) % images.value.length
  }

  const prev = () => {
    if (images.value.length <= 1) return
    currentIndex.value = (currentIndex.value - 1 + images.value.length) % images.value.length
  }

  const setIndex = (index: number) => {
    if (index >= 0 && index < images.value.length) {
      currentIndex.value = index
    }
  }

  return {
    isOpen,
    images,
    currentIndex,
    title,
    currentProduct,
    open,
    close,
    next,
    prev,
    setIndex
  }
}
