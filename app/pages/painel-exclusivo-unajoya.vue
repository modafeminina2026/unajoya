<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

definePageMeta({
  title: 'UNA JOYA - Painel Administrativo'
})

interface AdminProduct {
  id: number
  name: string
  description: string
  price: number
  stock: number
  promo: boolean
  duration: number // em dias
  image: string
  createdAt: Date
}

const { client } = useSupabase()
const products = ref<AdminProduct[]>([])
const loading = ref(true)

// Mock de imagens para facilitar testes rápidos
const mockImages = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBcjbHBYrD0eCsPDyqzE2DUcdTEB1Qjw11NnjxixO5hqQcVdr9YufYejTrViLwTZQimN4L2FgCKpwxARwUVfeOPX-F92-adpCIttVmJvGm-So4EhO04oMN72CkCwG6-W4n6CZUvKXkdHsoXLZipYaZwT_EYfczEspNDDtqO-6KQiRMlUn58S4VVg4oQ7V9ao3ID3s69SAkUfG6PCVXT_HE8tLOKg8yK6fF1SN4G0tEQDnK2ohrHe5IujFPWXJqItdd0NYZDTMptmkZ6',
  'https://lh3.googleusercontent.com/aida/AP1WRLvDq2-x30MCpcTRgKRQJDTaf15A_P7vGs32RxaCWnMXc88pl2utfO3Az4vWizC18Hip261_Fu4grr7GukWJ9IUXFR-eb-oDKuyhXCF3kmbxYVmB_Q_WdZg10KEVo_km_Ei5xBM5zxsxHYbfrI_UswNhEA5aaR_bCTi6NdcGfTd0gMV4BEgib36XSIcKBnkV-POlVeLeMiKMIDf2cgAk8oBTBWF-tLBYv_4jnyxsRuP4L7nlpkmyEjMNZ5M',
  'https://lh3.googleusercontent.com/aida/AP1WRLv32RCOxvnLt6F9GVk2xQB2SLlIZw-JJNeXrtBr-AbV3tEAsg7iBiFWAAHGQ2MgJpZjyg7UWvydCDyf6DzWZu1oi6ssAzBHor5h-AbIYfVyAHgaobl_bau3CYboabcP1ETLbyM_y_wsCC698GjwAnLa-OlFeJaeCim5QP0kbo8ebTNhvnCose7vqxvN_giMcm0wZ9pJWC5L_eiXK8Lh050yYOvUDqIdV_lqSO51l-QRvNlMLqGOgcTfON8'
]

// Estado do formulário
const form = ref({
  id: null as number | null,
  name: '',
  description: '',
  price: null as number | null,
  stock: null as number | null,
  promo: false,
  duration: 15,
  image: mockImages[0]
})

const isEditing = computed(() => form.value.id !== null)

// Upload de imagem simulado (permite digitar ou escolher uma das mockadas)
const imageInputUrl = ref('')
const showUrlInput = ref(false)

const selectMockImage = (url: string) => {
  form.value.image = url
  showUrlInput.value = false
}

const applyCustomUrl = () => {
  if (imageInputUrl.value.trim()) {
    form.value.image = imageInputUrl.value.trim()
    showUrlInput.value = false
    imageInputUrl.value = ''
  }
}

// Buscar produtos do banco
const fetchProducts = async () => {
  loading.value = true
  try {
    const { data, error } = await client
      .from('products')
      .select('*')
      .order('id', { ascending: false })
    
    if (error) throw error
    
    products.value = (data || []).map(p => ({
      id: p.id,
      name: p.name,
      description: p.description || '',
      price: Number(p.price),
      stock: Number(p.stock),
      promo: p.promo,
      duration: Number(p.duration),
      image: p.image || '',
      createdAt: new Date(p.created_at)
    }))
  } catch (err) {
    console.error('Erro ao buscar produtos:', err)
  } finally {
    loading.value = false
  }
}

// Lógica de cálculo de expiração baseada na data de criação
const getExpirationText = (product: AdminProduct) => {
  const diffTime = (product.createdAt.getTime() + product.duration * 24 * 60 * 60 * 1000) - Date.now()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays <= 0) {
    return 'Expirado'
  } else if (diffDays === 1) {
    return '24h restantes'
  } else if (diffDays === 2) {
    return '48h restantes'
  } else {
    return `${diffDays} dias restantes`
  }
}

const isExpiringSoon = (product: AdminProduct) => {
  const diffTime = (product.createdAt.getTime() + product.duration * 24 * 60 * 60 * 1000) - Date.now()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= 2
}

// Contagens para o cabeçalho do status do catálogo
const activeCount = computed(() => products.value.filter(p => {
  const diffTime = (p.createdAt.getTime() + p.duration * 24 * 60 * 60 * 1000) - Date.now()
  return diffTime > 0
}).length)

const expiredCount = computed(() => products.value.length - activeCount.value)

// Ações do painel (Salvar/Editar/Inserir no Supabase)
const handlePublish = async () => {
  if (!form.value.name.trim() || !form.value.price || !form.value.stock) {
    alert('Por favor, preencha o título, preço e estoque.')
    return
  }

  try {
    if (isEditing.value) {
      // Editar existente no Supabase
      const { error } = await client
        .from('products')
        .update({
          name: form.value.name,
          description: form.value.description,
          price: Number(form.value.price),
          stock: Number(form.value.stock),
          promo: form.value.promo,
          duration: Number(form.value.duration),
          image: form.value.image
        })
        .eq('id', form.value.id)
      
      if (error) throw error
    } else {
      // Adicionar novo no Supabase
      const { error } = await client
        .from('products')
        .insert([{
          name: form.value.name,
          description: form.value.description,
          price: Number(form.value.price),
          stock: Number(form.value.stock),
          promo: form.value.promo,
          duration: Number(form.value.duration),
          image: form.value.image
        }])
      
      if (error) throw error
    }

    clearForm()
    await fetchProducts()
  } catch (err) {
    console.error('Erro ao salvar produto:', err)
    alert('Erro ao salvar produto no banco de dados.')
  }
}

const handleEdit = (product: AdminProduct) => {
  form.value = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    promo: product.promo,
    duration: product.duration,
    image: product.image
  }
}

const handleDelete = async (id: number) => {
  if (confirm('Tem certeza que deseja excluir esta peça do catálogo?')) {
    try {
      const { error } = await client
        .from('products')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      if (form.value.id === id) {
        clearForm()
      }
      await fetchProducts()
    } catch (err) {
      console.error('Erro ao deletar produto:', err)
      alert('Erro ao deletar produto do banco de dados.')
    }
  }
}

const clearForm = () => {
  form.value = {
    id: null,
    name: '',
    description: '',
    price: null,
    stock: null,
    promo: false,
    duration: 15,
    image: mockImages[0]
  }
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

onMounted(() => {
  fetchProducts()
})
</script>

<template>
  <div class="bg-surface font-body-md text-on-surface overflow-x-hidden min-h-screen">
    <!-- Top Bar (Mobile Only) -->
    <header class="md:hidden fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile h-16 bg-surface border-b border-soft-stone">
      <NuxtLink to="/" class="text-primary hover:opacity-75 flex items-center justify-center p-2">
        <span class="material-symbols-outlined text-2xl">arrow_back</span>
      </NuxtLink>
      <h1 class="font-display-lg text-[20px] tracking-widest text-primary font-bold">UNA JOYA</h1>
      <div class="w-10"></div>
    </header>

    <div class="flex min-h-screen pt-16 md:pt-0">
      <!-- Navigation Drawer (Sidebar) -->
      <aside class="fixed inset-y-0 left-0 z-50 w-64 md:w-72 bg-surface border-r border-soft-stone flex flex-col justify-between" id="sidebar">
        <div class="flex flex-col h-full px-8 pt-12 pb-8">
          <div class="mb-12">
            <NuxtLink to="/" class="font-display-lg text-headline-md tracking-[0.2em] text-primary hover:text-champagne-gold font-bold">UNA JOYA</NuxtLink>
            <p class="font-label-caps text-[10px] text-secondary mt-2 opacity-60">PAINEL ADMINISTRATIVO</p>
          </div>
          
          <nav class="flex-1 space-y-2">
            <p class="font-label-caps text-secondary mb-4 text-[11px] tracking-widest">GERENCIAR BOUTIQUE</p>
            <a class="flex items-center gap-4 text-primary font-bold border-b border-primary py-4 transition-all" href="#">
              <span class="material-symbols-outlined">diamond</span>
              <span class="font-label-caps">PRODUTOS</span>
            </a>
            <NuxtLink to="/" class="flex items-center gap-4 text-secondary hover:text-primary py-4 transition-all group">
              <span class="material-symbols-outlined group-hover:scale-110">home</span>
              <span class="font-label-caps">IR PARA A LOJA</span>
            </NuxtLink>
            <NuxtLink to="/checkout" class="flex items-center gap-4 text-secondary hover:text-primary py-4 transition-all group">
              <span class="material-symbols-outlined group-hover:scale-110">shopping_bag</span>
              <span class="font-label-caps">SACOLA/CHECKOUT</span>
            </NuxtLink>
          </nav>
          
          <div class="mt-auto pt-8 border-t border-soft-stone">
            <NuxtLink to="/" class="flex items-center gap-4 text-error opacity-70 hover:opacity-100 transition-opacity">
              <span class="material-symbols-outlined">logout</span>
              <span class="font-label-caps">VOLTAR</span>
            </NuxtLink>
          </div>
        </div>
      </aside>

      <!-- Main Content Canvas -->
      <main class="flex-1 md:ml-72 p-margin-mobile md:p-16">
        <!-- Header Section -->
        <div class="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-6 fade-in">
          <div>
            <h2 class="font-display-lg text-3xl md:text-4xl text-primary mb-2 italic">Gerenciamento do Catálogo</h2>
            <p class="text-on-surface-variant font-body-md max-w-xl text-secondary">
              Curadoria da experiência 'Una Joya'. Adicione novas peças artesanais exclusivas e gerencie seu tempo de exibição na vitrine pública.
            </p>
          </div>
          <div class="flex gap-4">
            <button 
              v-if="isEditing" 
              @click="clearForm"
              class="border border-soft-stone px-8 py-4 font-label-caps text-secondary hover:bg-soft-stone/20 active:scale-95 transition-all text-xs"
            >
              CANCELAR EDIÇÃO
            </button>
            <button 
              @click="handlePublish" 
              class="bg-primary text-pure-white px-8 py-4 font-label-caps hover:bg-deep-onyx active:scale-95 transition-all text-xs"
            >
              {{ isEditing ? 'SALVAR ALTERAÇÕES' : 'PUBLICAR PEÇA' }}
            </button>
          </div>
        </div>

        <!-- Dashboard Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <!-- New Product Form -->
          <section class="lg:col-span-7 bg-surface-container-low p-8 md:p-12 border border-soft-stone fade-in shadow-sm" style="animation-delay: 0.1s">
            <div class="flex items-center gap-3 mb-10 border-b border-soft-stone pb-4">
              <span class="material-symbols-outlined text-primary" style="font-variation-settings: 'FILL' 1;">
                {{ isEditing ? 'edit_note' : 'add_circle' }}
              </span>
              <h3 class="font-label-caps text-primary tracking-widest font-bold">
                {{ isEditing ? 'EDITAR PRODUTO' : 'NOVO PRODUTO' }}
              </h3>
            </div>
            
            <form @submit.prevent class="space-y-10">
              <!-- Product Title -->
              <div class="group relative border-b border-soft-stone focus-within:border-primary py-2 transition-colors">
                <label class="block font-label-caps text-[10px] text-secondary tracking-widest font-bold mb-1">TÍTULO DA JOIA</label>
                <input 
                  v-model="form.name"
                  class="w-full bg-transparent border-none p-0 focus:ring-0 font-headline-md text-primary placeholder:opacity-30 placeholder:text-primary text-lg" 
                  placeholder="Ex: Colar Aurora em Ouro 18k" 
                  type="text"
                  required
                />
              </div>

              <!-- Description -->
              <div class="group relative border-b border-soft-stone focus-within:border-primary py-2 transition-colors">
                <label class="block font-label-caps text-[10px] text-secondary tracking-widest font-bold mb-1 font-bold">DESCRIÇÃO E ARTESANATO</label>
                <textarea 
                  v-model="form.description"
                  class="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-primary placeholder:opacity-30 placeholder:text-primary resize-none text-sm leading-relaxed" 
                  placeholder="Descreva o processo de produção, as pedras naturais utilizadas e a inspiração da peça..." 
                  rows="3"
                ></textarea>
              </div>

              <!-- Price and Stock Row -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div class="group relative border-b border-soft-stone focus-within:border-primary py-2 transition-colors">
                  <label class="block font-label-caps text-[10px] text-secondary tracking-widest font-bold mb-1">VALOR (BRL)</label>
                  <div class="flex items-center">
                    <span class="font-body-md mr-2 text-secondary font-bold text-sm">R$</span>
                    <input 
                      v-model="form.price"
                      class="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-primary text-sm" 
                      placeholder="0,00" 
                      type="number"
                      required
                    />
                  </div>
                </div>
                <div class="group relative border-b border-soft-stone focus-within:border-primary py-2 transition-colors">
                  <label class="block font-label-caps text-[10px] text-secondary tracking-widest font-bold mb-1">ESTOQUE INICIAL</label>
                  <input 
                    v-model="form.stock"
                    class="w-full bg-transparent border-none p-0 focus:ring-0 font-body-md text-primary text-sm" 
                    placeholder="0" 
                    type="number"
                    required
                  />
                </div>
              </div>

              <!-- Promotion Toggle -->
              <div class="flex items-center justify-between py-4 border-b border-soft-stone">
                <div>
                  <span class="font-label-caps text-[11px] text-primary tracking-widest font-bold">DESTAQUE EM PROMOÇÃO</span>
                  <p class="text-[10px] text-secondary tracking-wider uppercase mt-1">Sinalizar como edição limitada ou oferta especial</p>
                </div>
                <button 
                  type="button" 
                  class="w-12 h-6 rounded-full p-1 transition-colors relative flex items-center"
                  :class="form.promo ? 'bg-[#202223]' : 'bg-soft-stone'"
                  @click="form.promo = !form.promo"
                >
                  <div 
                    class="w-4 h-4 bg-pure-white rounded-full transition-transform shadow-sm"
                    :class="form.promo ? 'translate-x-6' : 'translate-x-0'"
                  ></div>
                </button>
              </div>

              <!-- Catalog Duration Settings -->
              <div class="p-6 bg-surface border border-soft-stone space-y-4">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-champagne-gold text-sm">timer</span>
                  <span class="font-label-caps text-[11px] text-primary tracking-widest font-bold">PERÍODO DE EXCLUSIVIDADE</span>
                </div>
                <p class="text-xs text-secondary leading-relaxed">
                  Nota: Para manter a exclusividade das peças, os produtos serão **removidos automaticamente** da vitrine pública após o período selecionado.
                </p>
                <div class="flex gap-4">
                  <label 
                    v-for="days in [10, 15, 20]" 
                    :key="days" 
                    class="flex-1 cursor-pointer"
                  >
                    <input 
                      v-model="form.duration"
                      class="hidden" 
                      name="duration" 
                      type="radio" 
                      :value="days"
                    />
                    <div 
                      class="text-center py-4 border font-label-caps text-xs tracking-wider transition-all"
                      :class="form.duration === days ? 'border-primary bg-primary text-pure-white' : 'border-soft-stone bg-transparent text-secondary hover:border-primary/50'"
                    >
                      {{ days }} DIAS
                    </div>
                  </label>
                </div>
              </div>

              <!-- Publish Button -->
              <button 
                type="button"
                @click="handlePublish"
                class="w-full bg-primary text-pure-white py-5 font-label-caps text-xs md:text-sm tracking-[0.2em] hover:bg-deep-onyx active:scale-[0.98] transition-all flex items-center justify-center gap-3 font-bold"
              >
                <span class="material-symbols-outlined text-sm">publish</span>
                {{ isEditing ? 'SALVAR ALTERAÇÕES' : 'PUBLICAR JOIA NO CATÁLOGO' }}
              </button>
            </form>
          </section>

          <!-- Visual Assets & Preview -->
          <section class="lg:col-span-5 space-y-12 fade-in" style="animation-delay: 0.2s">
            <!-- Media Upload Card -->
            <div class="bg-surface-container-low p-8 border border-soft-stone">
              <div class="flex items-center justify-between mb-6">
                <h3 class="font-label-caps text-[11px] text-primary tracking-widest font-bold">FOTOGRAFIA DA JOIA</h3>
                <button 
                  @click="showUrlInput = !showUrlInput" 
                  class="text-[10px] font-label-caps text-champagne-gold tracking-widest hover:underline"
                >
                  USAR LINK PERSONALIZADO
                </button>
              </div>

              <!-- Custom URL Input -->
              <div v-if="showUrlInput" class="mb-6 space-y-3 p-4 border border-soft-stone bg-surface">
                <label class="block text-[10px] font-label-caps text-secondary font-bold">URL DA IMAGEM</label>
                <div class="flex gap-2">
                  <input 
                    v-model="imageInputUrl" 
                    type="text" 
                    placeholder="Cole o link da foto aqui..." 
                    class="flex-grow bg-white border border-soft-stone px-3 py-2 text-xs focus:outline-none focus:border-primary"
                  />
                  <button 
                    @click="applyCustomUrl" 
                    class="bg-primary text-white text-xs px-4 py-2 hover:bg-deep-onyx"
                  >
                    Aplicar
                  </button>
                </div>
              </div>

              <!-- Quick mock selection -->
              <div class="grid grid-cols-3 gap-2 mb-6">
                <button 
                  v-for="(img, idx) in mockImages" 
                  :key="idx" 
                  @click="selectMockImage(img)"
                  class="aspect-square bg-cover bg-center border-2 transition-all hover:opacity-85"
                  :class="form.image === img ? 'border-primary scale-95 shadow-sm' : 'border-transparent'"
                  :style="{ backgroundImage: `url('${img}')` }"
                  :aria-label="`Selecionar imagem ${idx + 1}`"
                ></button>
              </div>

              <div 
                @click="showUrlInput = true"
                class="aspect-[4/5] border-2 border-dashed border-outline-variant flex flex-col items-center justify-center p-8 text-center hover:bg-white transition-colors cursor-pointer"
              >
                <div class="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4 border border-soft-stone">
                  <span class="material-symbols-outlined text-primary">add_a_photo</span>
                </div>
                <p class="font-headline-md text-primary text-base mb-2">Clique para inserir URL</p>
                <p class="text-secondary font-body-md text-xs leading-relaxed">
                  Insira uma foto em alta resolução com fundo minimalista ou selecione as mockadas acima.
                </p>
              </div>
            </div>

            <!-- Lookbook Preview Card -->
            <div class="relative group overflow-hidden bg-pure-white border border-soft-stone luxury-shadow">
              <div class="absolute top-4 left-4 z-10">
                <span class="bg-primary text-pure-white font-label-caps px-3 py-1.5 text-[9px] font-bold tracking-widest">VITRINE PREVIEW</span>
              </div>
              <div class="aspect-[3/4] bg-soft-stone overflow-hidden">
                <img 
                  class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  :src="form.image || mockImages[0]"
                  alt="Preview da joia"
                />
              </div>
              <div class="p-8 text-center">
                <p class="font-label-caps text-secondary text-[10px] mb-2 tracking-widest font-semibold">PREVIEW CATEGORIA</p>
                <h4 class="font-headline-md text-primary text-xl mb-4 italic">
                  {{ form.name || 'Nome da Peça Exclusiva' }}
                </h4>
                <p class="font-body-md text-secondary mb-6 text-xs leading-relaxed max-w-sm mx-auto line-clamp-2">
                  {{ form.description || 'A descrição e os detalhes do acabamento artesanal da peça aparecerão aqui à medida que você escreve.' }}
                </p>
                <div class="flex justify-center items-center gap-4 text-primary font-body-md">
                  <span class="w-12 h-[1px] bg-soft-stone"></span>
                  <span class="font-label-caps tracking-widest font-bold">
                    {{ form.price ? formatCurrency(form.price) : 'R$ 0,00' }}
                  </span>
                  <span class="w-12 h-[1px] bg-soft-stone"></span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Bottom Table / Catalog Quick View -->
        <section class="mt-20 fade-in" style="animation-delay: 0.3s">
          <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-8 border-b border-soft-stone pb-4 gap-4">
            <h3 class="font-display-lg text-2xl md:text-3xl text-primary italic">Status do Catálogo Ativo</h3>
            <div class="flex gap-6 pb-2">
              <span class="flex items-center gap-2 font-label-caps text-xs text-secondary font-bold">
                <span class="w-2.5 h-2.5 rounded-full bg-[#2D8A5B]"></span> {{ activeCount }} ATIVOS
              </span>
              <span class="flex items-center gap-2 font-label-caps text-xs text-secondary font-bold">
                <span class="w-2.5 h-2.5 rounded-full bg-error"></span> {{ expiredCount }} EXPIRADOS
              </span>
            </div>
          </div>
          
          <div class="overflow-x-auto bg-surface border border-soft-stone rounded-sm">
            <table class="w-full border-collapse">
              <thead>
                <tr class="text-left border-b border-soft-stone bg-surface-container-low">
                  <th class="py-4 px-6 font-label-caps text-[10px] text-secondary tracking-widest font-bold">JOIA / PRODUTO</th>
                  <th class="py-4 px-6 font-label-caps text-[10px] text-secondary tracking-widest font-bold">ESTOQUE</th>
                  <th class="py-4 px-6 font-label-caps text-[10px] text-secondary tracking-widest font-bold">EXPIRAÇÃO</th>
                  <th class="py-4 px-6 font-label-caps text-[10px] text-secondary tracking-widest font-bold">PREÇO</th>
                  <th class="py-4 px-6 font-label-caps text-[10px] text-secondary tracking-widest font-bold">AÇÕES</th>
                </tr>
              </thead>
              <tbody class="text-on-surface font-body-md text-sm">
                <tr 
                  v-for="p in products" 
                  :key="p.id"
                  class="border-b border-soft-stone/40 hover:bg-surface-container-low transition-colors"
                >
                  <td class="py-4 px-6 flex items-center gap-4">
                    <div class="w-12 h-12 bg-soft-stone flex-shrink-0 border border-soft-stone rounded overflow-hidden">
                      <img class="w-full h-full object-cover" :src="p.image" :alt="p.name"/>
                    </div>
                    <div class="flex flex-col">
                      <span class="font-label-caps font-bold tracking-wide text-primary">{{ p.name }}</span>
                      <span v-if="p.promo" class="text-[9px] font-label-caps text-champagne-gold tracking-widest font-bold mt-0.5">DESTAQUE ATIVO</span>
                    </div>
                  </td>
                  <td class="py-4 px-6 text-secondary font-semibold">{{ p.stock }} Unidades</td>
                  <td class="py-4 px-6">
                    <span 
                      class="font-bold text-xs"
                      :class="isExpiringSoon(p) ? 'text-error animate-pulse' : 'text-primary'"
                    >
                      {{ getExpirationText(p) }}
                    </span>
                    <p class="text-[10px] text-secondary mt-0.5 uppercase tracking-wider">Deleção automática</p>
                  </td>
                  <td class="py-4 px-6 text-primary font-bold">{{ formatCurrency(p.price) }}</td>
                  <td class="py-4 px-6">
                    <div class="flex items-center gap-3">
                      <button 
                        @click="handleEdit(p)"
                        class="material-symbols-outlined text-secondary hover:text-primary transition-colors p-1"
                        aria-label="Editar"
                      >
                        edit
                      </button>
                      <button 
                        @click="handleDelete(p.id)"
                        class="material-symbols-outlined text-secondary hover:text-error transition-colors p-1"
                        aria-label="Excluir"
                      >
                        delete
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="products.length === 0">
                  <td colspan="5" class="py-12 text-center text-secondary font-body-md text-sm">
                    Nenhuma joia publicada no catálogo ainda.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.luxury-shadow {
  box-shadow: 0 10px 30px -15px rgba(0,0,0,0.05);
}

.fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
