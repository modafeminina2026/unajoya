<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface LookbookPhoto {
  id: number
  image: string
  alt: string
  sort_order: number
}

const { client } = useSupabase()

// Fotos do marquee fallback - caso o banco ainda não responda
const fallbackPhotos: LookbookPhoto[] = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop',
    alt: 'Joias de Luxo Unajoya 1',
    sort_order: 0
  },
  {
    id: 2,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOhn5yadqgjU36oeIWkzqDIu72yoHbq9MN5vRfIlb6859fRfcC62g1dWPknrX0KV76j7PlnMb9U0HZ3-CR59N6Xr0AzHK6EEjYyHzJfYZHniTXhw--36xU32_vZyXNoTirn8eVaaZgLHoJ1gCu9qbJvWvh7Rw7X5ibJLiND5al2UXZH_6sEnzBX0WiUJv2NXhqmNYZ53MABQQ2sf1niQgbiK4LBcLBr2czJkn8ppTO8xy-U_131WVr2Hf1wuC53qVbjKpXCtGsR79l',
    alt: 'Joias de Luxo Unajoya 2',
    sort_order: 1
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop',
    alt: 'Joias de Luxo Unajoya 3',
    sort_order: 2
  },
  {
    id: 4,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-9m4aGr6v7EbQrlde3X6YKPxVqEwMqZ6tsH2QnqSklMa7YGMkk2d35KJqsLinz3B3UcukZLnOa7hAhuNb0V9jqMltN5tIboIdrNBYRIi8alicc0iM-aj4fQJvpkWH5GWf2VYw0jGUvYTxhQPuxGN_RO-D95eK6rLZIZjkbSbLPCSZ6aqlByVQMQlK1bfgCTeEx84yPFs-gCP9abvudVeLTfNc3wGPiPgvrUs4487v8E0SVuQeWLexznrxiHWZPamiuQ4uzcQL4Aye',
    alt: 'Joias de Luxo Unajoya 4',
    sort_order: 3
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop',
    alt: 'Joias de Luxo Unajoya 5',
    sort_order: 4
  },
  {
    id: 6,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBcjbHBYrD0eCsPDyqzE2DUcdTEB1Qjw11NnjxixO5hqQcVdr9YufYejTrViLwTZQimN4L2FgCKpwxARwUVfeOPX-F92-adpCIttVmJvGm-So4EhO04oMN72CkCwG6-W4n6CZUvKXkdHsoXLZipYaZwT_EYfczEspNDDtqO-6KQiRMlUn58S4VVg4oQ7V9ao3ID3s69SAkUfG6PCVXT_HE8tLOKg8yK6fF1SN4G0tEQDnK2ohrHe5IujFPWXJqItdd0NYZDTMptmkZ6',
    alt: 'Joias de Luxo Unajoya 6',
    sort_order: 5
  },
  {
    id: 7,
    image: 'https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?q=80&w=600&auto=format&fit=crop',
    alt: 'Joias de Luxo Unajoya 7',
    sort_order: 6
  },
  {
    id: 8,
    image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?q=80&w=600&auto=format&fit=crop',
    alt: 'Joias de Luxo Unajoya 8',
    sort_order: 7
  }
]

const photos = ref<LookbookPhoto[]>([])
const track = ref<LookbookPhoto[]>([])

const fetchLookbookPhotos = async () => {
  try {
    const { data, error } = await client
      .from('lookbook_photos')
      .select('*')
      .order('sort_order', { ascending: true })

    if (error) throw error
    photos.value = data && data.length > 0 ? data : fallbackPhotos
  } catch (err) {
    console.error('Erro ao buscar fotos do lookbook:', err)
    photos.value = fallbackPhotos
  } finally {
    // Duplica para criar o efeito infinito perfeito
    track.value = [...photos.value, ...photos.value]
  }
}

const { open: openImageModal } = useImageModal()

const handleOpenLookbook = (index: number) => {
  const allImages = photos.value.map(p => p.image)
  openImageModal({
    title: 'Lookbook Exclusivo | UNA JOYA',
    images: allImages,
    initialIndex: index % photos.value.length
  })
}

onMounted(() => {
  fetchLookbookPhotos()
})
</script>

<template>
  <section class="relative overflow-hidden bg-primary py-0 border-y border-primary/20">
    <!-- Faixa de texto acima do marquee -->
    <div class="flex items-center justify-center gap-6 py-3 bg-primary overflow-hidden">
      <div class="marquee-text-track flex items-center gap-6 whitespace-nowrap">
        <template v-for="i in 12" :key="i">
          <span class="font-label-caps text-[11px] text-pure-white/60 tracking-[0.4em]">UNA JOYA</span>
          <span class="text-champagne-gold text-[8px]">◆</span>
          <span class="font-label-caps text-[11px] text-pure-white/60 tracking-[0.4em]">FEITO À MÃO</span>
          <span class="text-champagne-gold text-[8px]">◆</span>
          <span class="font-label-caps text-[11px] text-pure-white/60 tracking-[0.4em]">PEDRAS NATURAIS</span>
          <span class="text-champagne-gold text-[8px]">◆</span>
          <span class="font-label-caps text-[11px] text-pure-white/60 tracking-[0.4em]">EXCLUSIVO</span>
          <span class="text-champagne-gold text-[8px]">◆</span>
        </template>
      </div>
    </div>

    <!-- Faixa de fotos passando rápido (Clicável para abrir em tela cheia) -->
    <div class="photo-marquee-wrapper h-[220px] sm:h-[280px] lg:h-[340px] 3xl:h-[400px] flex items-stretch overflow-hidden">
      <div class="photo-marquee-track flex gap-[3px] items-stretch">
        <div
          v-for="(photo, idx) in track"
          :key="idx"
          class="photo-item flex-shrink-0 w-[160px] sm:w-[200px] lg:w-[240px] 3xl:w-[300px] overflow-hidden relative cursor-pointer select-none group touch-manipulation"
          @click="handleOpenLookbook(idx)"
          role="button"
          tabindex="0"
          :aria-label="`Ver foto ampliada: ${photo.alt}`"
        >
          <img
            :src="photo.image"
            :alt="photo.alt"
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            draggable="false"
          />
          <!-- Hover/Tap Overlay with Zoom icon -->
          <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
            <div class="w-10 h-10 rounded-full bg-black/60 text-pure-white flex items-center justify-center backdrop-blur-xs border border-white/20">
              <span class="material-symbols-outlined text-xl">zoom_in</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Linha de texto abaixo do marquee -->
    <div class="flex items-center justify-center gap-6 py-3 bg-primary overflow-hidden">
      <div class="marquee-text-track-reverse flex items-center gap-6 whitespace-nowrap">
        <template v-for="i in 12" :key="i">
          <span class="font-label-caps text-[11px] text-pure-white/60 tracking-[0.4em]">ARTESANAL</span>
          <span class="text-champagne-gold text-[8px]">◆</span>
          <span class="font-label-caps text-[11px] text-pure-white/60 tracking-[0.4em]">JOALHERIA</span>
          <span class="text-champagne-gold text-[8px]">◆</span>
          <span class="font-label-caps text-[11px] text-pure-white/60 tracking-[0.4em]">EXCLUSIVO</span>
          <span class="text-champagne-gold text-[8px]">◆</span>
          <span class="font-label-caps text-[11px] text-pure-white/60 tracking-[0.4em]">BRASIL</span>
          <span class="text-champagne-gold text-[8px]">◆</span>
        </template>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* ─── Marquee de FOTOS (rápido, ~25 segundos para voltar) ─── */
.photo-marquee-wrapper {
  position: relative;
}

.photo-marquee-track {
  animation: photo-scroll 50s linear infinite;
  will-change: transform;
}

@keyframes photo-scroll {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

/* ─── Marquee de TEXTO (lento, esquerda para direita) ─── */
.marquee-text-track {
  animation: text-scroll 20s linear infinite;
  will-change: transform;
}

@keyframes text-scroll {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

/* ─── Marquee de TEXTO reverso (direita para esquerda, mas lento) ─── */
.marquee-text-track-reverse {
  animation: text-scroll-reverse 18s linear infinite;
  will-change: transform;
}

@keyframes text-scroll-reverse {
  0%   { transform: translateX(-50%); }
  100% { transform: translateX(0); }
}

/* Pausar no hover */
.photo-marquee-wrapper:hover .photo-marquee-track {
  animation-play-state: paused;
}
</style>
