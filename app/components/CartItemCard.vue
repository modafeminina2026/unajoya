<script setup lang="ts">
const { 
  quantity, 
  giftWrap, 
  product, 
  increment, 
  decrement, 
  deleteItem 
} = useCart()

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}
</script>

<template>
  <div class="bg-white rounded-lg border border-soft-stone p-6 space-y-6 card-shadow">
    <!-- Product Row -->
    <div class="flex gap-4">
      <div class="w-20 h-20 bg-surface-container-low rounded overflow-hidden flex-shrink-0 border border-soft-stone shadow-sm">
        <img 
          :src="product.image" 
          :alt="product.name" 
          class="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        >
      </div>
      <div class="flex-1">
        <h2 class="font-headline-md text-body-lg text-primary leading-tight font-medium">
          {{ product.name }}
        </h2>
        <p class="font-bold text-primary text-lg mt-1">
          {{ formatCurrency(product.price) }}
        </p>
      </div>
    </div>

    <!-- Actions Row -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <!-- Delete Button -->
        <button 
          class="text-on-surface-variant hover:text-error transition-colors p-2 -ml-2 active:scale-90 flex items-center justify-center"
          @click="deleteItem"
          aria-label="Remover item"
        >
          <span class="material-symbols-outlined text-2xl">delete</span>
        </button>
        
        <!-- Quantity Selector -->
        <div class="flex items-center border border-soft-stone rounded overflow-hidden bg-surface-container-lowest">
          <button 
            class="px-4 py-2 hover:bg-surface-container transition-colors border-r border-soft-stone active:scale-95 duration-100 flex items-center justify-center"
            @click="decrement"
            aria-label="Diminuir quantidade"
          >
            <span class="material-symbols-outlined text-sm font-bold">remove</span>
          </button>
          <span class="px-6 py-2 font-body-md w-12 text-center select-none font-semibold">{{ quantity }}</span>
          <button 
            class="px-4 py-2 hover:bg-surface-container transition-colors border-l border-soft-stone active:scale-95 duration-100 flex items-center justify-center"
            @click="increment"
            aria-label="Aumentar quantidade"
          >
            <span class="material-symbols-outlined text-sm font-bold">add</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Gift Wrap Checkbox -->
    <label class="flex items-center gap-3 cursor-pointer group select-none">
      <input 
        v-model="giftWrap"
        type="checkbox" 
        class="w-5 h-5 border-soft-stone rounded text-primary focus:ring-primary focus:ring-offset-2 transition-all cursor-pointer"
      >
      <span class="font-body-md text-on-surface-variant group-hover:text-primary transition-colors">
        Embalar p/ presente
      </span>
    </label>
  </div>
</template>
