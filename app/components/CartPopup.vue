<script setup lang="ts">
const { isPopupOpen } = useCart()

const closePopup = () => {
  isPopupOpen.value = false
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div 
        v-if="isPopupOpen" 
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        @click.self="closePopup"
      >
        <!-- Modal Card -->
        <div 
          class="bg-white w-full max-w-[500px] p-8 md:p-12 shadow-2xl relative border border-soft-stone flex flex-col items-center text-center animate-scale-up"
          role="dialog"
          aria-modal="true"
        >
          <!-- Close Button -->
          <button 
            class="absolute top-4 right-4 text-primary hover:opacity-75 transition-opacity" 
            @click="closePopup"
            aria-label="Fechar"
          >
            <span class="material-symbols-outlined text-2xl">close</span>
          </button>

          <!-- Cart Icon -->
          <div class="mb-6 text-primary">
            <span class="material-symbols-outlined text-5xl">shopping_cart</span>
          </div>

          <!-- Headline -->
          <h3 class="font-display-lg text-lg md:text-xl text-primary tracking-[0.15em] font-bold uppercase mb-6 leading-tight">
            PRODUTO ADICIONADO AO CARRINHO!
          </h3>

          <!-- Divider -->
          <div class="w-full h-[1px] bg-soft-stone mb-6"></div>

          <!-- Prompt Question -->
          <p class="font-body-md text-on-surface-variant mb-8 text-[15px] md:text-[16px]">
            O que você deseja fazer agora?
          </p>

          <!-- Action Buttons -->
          <div class="w-full flex flex-col gap-4">
            <button 
              class="w-full py-4 bg-primary text-pure-white font-label-caps text-xs md:text-sm tracking-[0.2em] font-bold uppercase transition-colors hover:bg-deep-onyx active:scale-[0.98] duration-150"
              @click="closePopup"
            >
              CONTINUAR COMPRANDO
            </button>
            
            <NuxtLink 
              to="/checkout" 
              class="w-full py-4 bg-[#202223] text-pure-white font-label-caps text-xs md:text-sm tracking-[0.2em] font-bold uppercase transition-colors hover:bg-neutral-800 active:scale-[0.98] duration-150 text-center block"
              @click="closePopup"
            >
              IR PARA O CARRINHO
            </NuxtLink>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes scaleUp {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scale-up {
  animation: scaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
