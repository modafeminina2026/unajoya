<script setup lang="ts">
import { computed } from 'vue'
import { responsiveImage, stockState, productPath, type StoreProduct } from '~/utils/catalog'
import { formatBRL } from '~/utils/whatsapp'

const props = withDefaults(defineProps<{
  product: StoreProduct
  /** Primeiras peças da tela carregam sem espera (melhora o tempo de exibição) */
  priority?: boolean
}>(), { priority: false })

const { addToCart } = useCart()
const { sendProductToWhatsApp } = useWhatsAppCheckout()
const { open: openImageModal } = useImageModal()

// Largura do card: 2 colunas no celular, 3 no tablet, 4 no desktop
const SIZES = '(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw'

const state = computed(() => stockState(props.product))
const main = computed(() => responsiveImage(props.product.images[0] || props.product.image))
const second = computed(() => (props.product.images[1] ? responsiveImage(props.product.images[1]) : null))
const link = computed(() => productPath(props.product))

const openPhotos = () => {
  openImageModal({
    title: props.product.name,
    images: props.product.images.length ? props.product.images : [props.product.image],
    initialIndex: 0,
    product: props.product
  })
}

const add = () => {
  if (state.value === 'sold_out') return
  addToCart({ id: props.product.id, name: props.product.name, price: props.product.price, image: props.product.image })
}
const askWhatsApp = () => sendProductToWhatsApp(props.product)
</script>

<template>
  <article class="flex flex-col group h-full" :data-product-id="product.id">
    <div
      class="aspect-[3/4] mb-3 overflow-hidden bg-pure-white shadow-sm relative cursor-zoom-in touch-manipulation select-none"
      role="button"
      tabindex="0"
      :aria-label="`Ampliar fotos de ${product.name}`"
      @click="openPhotos"
      @keydown.enter="openPhotos"
    >
      <img
        :alt="product.name"
        :src="main.src"
        :srcset="main.srcset"
        :sizes="main.srcset ? SIZES : undefined"
        width="600"
        height="800"
        :loading="priority ? 'eager' : 'lazy'"
        :fetchpriority="priority ? 'high' : 'auto'"
        decoding="async"
        class="w-full h-full object-cover transition-all duration-700 md:group-hover:scale-105"
        :class="[second ? 'md:group-hover:opacity-0' : '', state === 'sold_out' ? 'grayscale-[60%] opacity-80' : '']"
      >
      <img
        v-if="second"
        :alt="`${product.name} - foto 2`"
        :src="second.src"
        :srcset="second.srcset"
        :sizes="second.srcset ? SIZES : undefined"
        width="600"
        height="800"
        loading="lazy"
        decoding="async"
        class="hidden md:block absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
      >

      <!-- Selos -->
      <div class="absolute top-2 left-2 flex flex-col items-start gap-1 pointer-events-none">
        <span v-if="state === 'sold_out'" class="bg-primary text-pure-white font-label-caps text-[11px] px-2 py-1 tracking-wider" data-testid="badge-soldout">ESGOTADO</span>
        <span v-else-if="state === 'low'" class="bg-pure-white/95 text-primary font-label-caps text-[11px] px-2 py-1 tracking-wider" data-testid="badge-low">ÚLTIMAS UNIDADES</span>
        <span v-if="product.promo && state !== 'sold_out'" class="bg-champagne-gold text-primary font-label-caps text-[11px] px-2 py-1 tracking-wider">OFERTA</span>
      </div>

      <span v-if="product.images.length > 1" class="absolute bottom-2 right-2 bg-primary/85 text-pure-white font-label-caps text-[11px] px-2 py-1 tracking-wider flex items-center gap-1 pointer-events-none">
        <span class="material-symbols-outlined text-[14px]" aria-hidden="true">photo_library</span>
        +{{ product.images.length - 1 }}
      </span>
    </div>

    <NuxtLink
      v-if="product.category"
      :to="`/categoria/${product.category.slug}`"
      class="text-[11px] lg:text-xs font-label-caps tracking-[0.15em] text-champagne-gold hover:opacity-80 mb-1 self-start"
    >{{ product.category.name }}</NuxtLink>

    <NuxtLink :to="link" class="font-body-md text-sm lg:text-[15px] 3xl:text-base text-primary mb-1 line-clamp-2 leading-snug hover:text-champagne-gold transition-colors">
      {{ product.name }}
    </NuxtLink>

    <p class="font-bold text-primary text-base lg:text-lg 3xl:text-xl mb-3">
      {{ product.price > 0 ? formatBRL(product.price) : 'Consulte' }}
    </p>

    <div class="mt-auto flex flex-col gap-2">
      <button
        v-if="state !== 'sold_out'"
        type="button"
        class="w-full min-h-[44px] bg-primary text-pure-white font-label-caps text-xs lg:text-[13px] tracking-widest uppercase font-bold hover:bg-deep-onyx active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        data-testid="add-to-cart"
        @click="add"
      >
        <span class="material-symbols-outlined text-[18px]" aria-hidden="true">shopping_bag</span>
        Adicionar
      </button>
      <button
        type="button"
        class="w-full min-h-[44px] border border-primary/30 text-primary font-label-caps text-xs lg:text-[13px] tracking-widest uppercase hover:border-primary active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        data-testid="ask-whatsapp"
        @click="askWhatsApp"
      >
        <span class="material-symbols-outlined text-[18px]" aria-hidden="true">chat</span>
        {{ state === 'sold_out' ? 'Avise-me' : 'Pedir no WhatsApp' }}
      </button>
    </div>
  </article>
</template>
