<script setup lang="ts">
const { toggleDrawer } = useDrawer()
</script>

<template>
  <header class="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-margin-mobile py-unit h-16 bg-surface border-b border-soft-stone">
    <button 
      class="text-primary hover:opacity-70 transition-opacity active:scale-95 duration-150 flex items-center justify-center p-2" 
      @click="toggleDrawer"
      aria-label="Abrir Menu"
    >
      <span class="material-symbols-outlined text-2xl">menu</span>
    </button>
    
    <div class="flex items-center">
      <NuxtLink to="/" class="flex items-center">
        <img 
          alt="UNA JOYA" 
          class="h-10 w-auto object-contain" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9glF-h10U3EKLc9s_Tuoc4vkAruhbL4hQffNpsIAux2zoX7LQcoUvD7fCrht5oLf-GCSVHadrbZOILsbDQM3cQwabxpdI-s5hKP1Tdu5q1xDKuQcn7Wku6YQWAeUJFsKFXU5bUqvVG2a-Q6vm6OsrnWq5c57MMZbvrRLDaUjo03Q0Rtye5ZLVF2wSzNs207dnfQNJCVZntrtDNjDggu5nEXe4zPZ7Q61lPfd1sIwXNBwO1z6O7uR-k7z7UyU-4vbK4yM6nDa_fz9R"
        >
      </NuxtLink>
    </div>
    
    <div class="flex items-center gap-2">
      <button class="text-primary hover:opacity-70 transition-opacity active:scale-95 duration-150 p-2" aria-label="Buscar">
        <span class="material-symbols-outlined text-2xl">search</span>
      </button>
      <button class="text-primary hover:opacity-70 transition-opacity active:scale-95 duration-150 p-2 relative" aria-label="Ver Sacola">
        <span class="material-symbols-outlined text-2xl">shopping_bag</span>
      </button>
    </div>
  </header>
</template>
