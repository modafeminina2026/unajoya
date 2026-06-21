<template>
  <footer class="bg-surface-container-low text-on-surface py-16 px-margin-mobile flex flex-col items-center space-y-12">
    <!-- Logo and Navigation Links -->
    <div class="flex flex-col items-center text-center space-y-6">
      <img 
        alt="UNA JOYA Logo" 
        class="h-12 w-auto mb-4" 
        src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9glF-h10U3EKLc9s_Tuoc4vkAruhbL4hQffNpsIAux2zoX7LQcoUvD7fCrht5oLf-GCSVHadrbZOILsbDQM3cQwabxpdI-s5hKP1Tdu5q1xDKuQcn7Wku6YQWAeUJFsKFXU5bUqvVG2a-Q6vm6OsrnWq5c57MMZbvrRLDaUjo03Q0Rtye5ZLVF2wSzNs207dnfQNJCVZntrtDNjDggu5nEXe4zPZ7Q61lPfd1sIwXNBwO1z6O7uR-k7z7UyU-4vbK4yM6nDa_fz9R"
      >
      <ul class="flex flex-col space-y-4 font-label-caps text-label-caps tracking-widest font-bold">
        <li><a class="hover:text-champagne-gold transition-colors" href="#">CONTATO</a></li>
        <li><a class="hover:text-champagne-gold transition-colors" href="#">PROMOÇÕES</a></li>
        <li><a class="hover:text-champagne-gold transition-colors" href="#">TROCAS E DEVOLUÇÕES</a></li>
        <li><a class="hover:text-champagne-gold transition-colors underline" href="#">SOBRE NÓS</a></li>
        <li><a class="hover:text-champagne-gold transition-colors" href="#">POLÍTICA DE PRIVACIDADE</a></li>
      </ul>
    </div>
    
    <!-- Customer Service Contacts -->
    <div class="w-full flex flex-col items-center space-y-6 text-center">
      <h4 class="font-label-caps text-label-caps text-secondary font-bold">CENTRAL DE ATENDIMENTO</h4>
      <div class="space-y-3">
        <a class="flex items-center justify-center gap-2 font-bold hover:text-champagne-gold transition-colors" href="tel:5511953769317">
          <span class="material-symbols-outlined text-xl">phone</span>
          (11) 95376-9317
        </a>
        <a class="flex items-center justify-center gap-2 font-body-md hover:text-champagne-gold transition-colors" href="mailto:contato@unajoya.com">
          <span class="material-symbols-outlined text-xl">mail</span>
          contato@unajoya.com
        </a>
      </div>
    </div>
    
    <!-- Newsletter Form -->
    <div class="w-full flex flex-col space-y-6 animate-pulse-once">
      <h4 class="font-label-caps text-label-caps text-center font-bold">RECEBA NOVIDADES</h4>
      <form class="flex flex-col space-y-2" @submit.prevent>
        <input 
          class="bg-pure-white border-b border-primary py-3 px-3 text-label-caps placeholder:text-secondary-fixed-dim focus:outline-none rounded-none text-sm transition-all focus:border-champagne-gold" 
          placeholder="SEU NOME" 
          type="text"
          required
        >
        <div class="flex">
          <input 
            class="flex-grow bg-pure-white border-b border-primary py-3 px-3 text-label-caps placeholder:text-secondary-fixed-dim focus:outline-none rounded-none text-sm transition-all focus:border-champagne-gold" 
            placeholder="SEU E-MAIL" 
            type="email"
            required
          >
          <button 
            class="bg-primary hover:bg-deep-onyx text-pure-white px-6 py-3 font-label-caps text-label-caps font-bold transition-all duration-300 active:scale-95" 
            type="submit"
          >
            OK
          </button>
        </div>
      </form>
    </div>
    
    <!-- Social Icons -->
    <div class="flex gap-8">
      <a class="hover:text-champagne-gold transition-colors" href="#" aria-label="Facebook"><span class="material-symbols-outlined text-2xl">face_nod</span></a>
      <a class="hover:text-champagne-gold transition-colors" href="#" aria-label="Instagram"><span class="material-symbols-outlined text-2xl">photo_camera</span></a>
      <a class="hover:text-champagne-gold transition-colors" href="#" aria-label="WhatsApp"><span class="material-symbols-outlined text-2xl">share</span></a>
    </div>
    
    <!-- Copyright Details -->
    <div class="text-center pt-8 border-t border-soft-stone w-full flex flex-col items-center space-y-4">
      <p class="text-[10px] text-secondary-fixed-dim uppercase tracking-widest leading-relaxed">
        © 2024 UNA JOYA | UNA COLLANA LTDA<br>
        CNPJ 24.040.865/0001-40<br>
        JUNDIAÍ/SP - BRASIL
      </p>
    </div>
  </footer>
</template>
