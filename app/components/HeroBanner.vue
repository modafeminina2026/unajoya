<template>
  <section class="relative h-[80vh] w-full overflow-hidden">
    <!-- Background Image with elegant initial scale -->
    <div 
      class="absolute inset-0 bg-cover bg-center transition-transform duration-10000 ease-out scale-105 hover:scale-100" 
      style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuBbxECBrR28hV_p-R6hNN4nYcynHGmLBNlbLkiZclI6owxv175BzNBmaNqtnC7nUtn6GaT9vfOaqC0IcOoGK8j1QixUBW1UkdaQUydQ9lGOOqGIheFevA6T6yMkyDANPNu9nUuXXYX-JBCHC-1nTjBV3OuYRWQ8ZfBfekcc55VngFuJ2jqGQ2EPp7lKfXh0DxJ7PN35ipi1fAIb-iH4LP2jSyEYXBUY5kME0pgkZKJ0xVq_jl60r70DepR4P_bkljDsBTqVry-lkkVV')"
      role="img"
      aria-label="Editorial de moda sofisticado exibindo colares artesanais feitos de pedras e pérolas naturais"
    ></div>
    
    <!-- Contrast Overlay -->
    <div class="absolute inset-0 bg-black/15"></div>
    
    <!-- Hero Contents -->
    <div class="absolute bottom-20 left-0 w-full px-margin-mobile text-center flex flex-col items-center z-10 animate-fade-in">
      <h1 class="font-display-lg text-headline-lg-mobile text-pure-white mb-8 leading-tight tracking-wide uppercase drop-shadow-md">
        A ENERGIA DA PEDRA<br>FEITA PARA VESTIR
      </h1>
      <a 
        href="#" 
        class="inline-block bg-primary px-10 py-4 font-label-caps text-label-caps text-pure-white transition-all duration-300 hover:bg-deep-onyx hover:tracking-widest active:scale-95 shadow-md"
      >
        VER COLEÇÃO
      </a>
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
