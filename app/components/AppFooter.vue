<template>
  <footer class="bg-surface-container-low text-on-surface border-t border-soft-stone">
    <!-- Mobile Footer: stacked -->
    <div class="lg:hidden py-16 px-margin-mobile flex flex-col items-center space-y-12">
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
      <div class="w-full flex flex-col space-y-6">
        <h4 class="font-label-caps text-label-caps text-center font-bold">RECEBA NOVIDADES</h4>
        <form class="flex flex-col space-y-2" @submit.prevent>
          <input class="bg-pure-white border-b border-primary py-3 px-3 text-label-caps placeholder:text-secondary-fixed-dim focus:outline-none rounded-none text-sm transition-all focus:border-champagne-gold" placeholder="SEU NOME" type="text" required>
          <div class="flex">
            <input class="flex-grow bg-pure-white border-b border-primary py-3 px-3 text-label-caps placeholder:text-secondary-fixed-dim focus:outline-none rounded-none text-sm transition-all focus:border-champagne-gold" placeholder="SEU E-MAIL" type="email" required>
            <button class="bg-primary hover:bg-deep-onyx text-pure-white px-6 py-3 font-label-caps text-label-caps font-bold transition-all duration-300 active:scale-95" type="submit">OK</button>
          </div>
        </form>
      </div>
      <!-- Social Icons -->
      <div class="flex gap-8">
        <a class="hover:text-champagne-gold transition-colors" href="#" aria-label="Facebook"><span class="material-symbols-outlined text-2xl">face_nod</span></a>
        <a class="hover:text-champagne-gold transition-colors" href="#" aria-label="Instagram"><span class="material-symbols-outlined text-2xl">photo_camera</span></a>
        <a class="hover:text-champagne-gold transition-colors" href="#" aria-label="WhatsApp"><span class="material-symbols-outlined text-2xl">share</span></a>
      </div>
      <!-- Copyright -->
      <div class="text-center pt-8 border-t border-soft-stone w-full flex flex-col items-center space-y-4">
        <p class="text-[10px] text-secondary-fixed-dim uppercase tracking-widest leading-relaxed">
          © 2024 UNA JOYA | UNA COLLANA LTDA<br>
          CNPJ 24.040.865/0001-40<br>
          JUNDIAÍ/SP - BRASIL
        </p>
        <NuxtLink to="/painel-exclusivo-unajoya" class="text-[9px] text-secondary-fixed-dim/30 hover:text-champagne-gold uppercase tracking-widest transition-colors font-bold">
          [ Painel ]
        </NuxtLink>
      </div>
    </div>

    <!-- Desktop Footer: multi-column horizontal layout -->
    <div class="hidden lg:block">
      <!-- Main grid -->
      <div class="px-margin-desktop xl:px-margin-desktop-xl 3xl:px-[160px] py-20 xl:py-24 3xl:py-32 grid grid-cols-4 xl:grid-cols-4 gap-12 xl:gap-16 3xl:gap-24 border-b border-soft-stone">
        <!-- Col 1: Logo + tagline -->
        <div class="flex flex-col space-y-6">
          <img 
            alt="UNA JOYA Logo" 
            class="h-14 xl:h-16 3xl:h-20 w-auto object-contain object-left" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9glF-h10U3EKLc9s_Tuoc4vkAruhbL4hQffNpsIAux2zoX7LQcoUvD7fCrht5oLf-GCSVHadrbZOILsbDQM3cQwabxpdI-s5hKP1Tdu5q1xDKuQcn7Wku6YQWAeUJFsKFXU5bUqvVG2a-Q6vm6OsrnWq5c57MMZbvrRLDaUjo03Q0Rtye5ZLVF2wSzNs207dnfQNJCVZntrtDNjDggu5nEXe4zPZ7Q61lPfd1sIwXNBwO1z6O7uR-k7z7UyU-4vbK4yM6nDa_fz9R"
          >
          <p class="text-[12px] xl:text-[13px] 3xl:text-[15px] text-secondary leading-relaxed">
            Joias artesanais feitas à mão com pedras naturais. Cada peça conta uma história única.
          </p>
          <div class="flex gap-5">
            <a class="hover:text-champagne-gold transition-colors" href="#" aria-label="Facebook"><span class="material-symbols-outlined text-xl 3xl:text-2xl">face_nod</span></a>
            <a class="hover:text-champagne-gold transition-colors" href="#" aria-label="Instagram"><span class="material-symbols-outlined text-xl 3xl:text-2xl">photo_camera</span></a>
            <a class="hover:text-champagne-gold transition-colors" href="#" aria-label="WhatsApp"><span class="material-symbols-outlined text-xl 3xl:text-2xl">share</span></a>
          </div>
        </div>

        <!-- Col 2: Navigation Links -->
        <div class="flex flex-col space-y-5">
          <h4 class="font-label-caps text-label-caps xl:text-[13px] 3xl:text-[15px] text-primary font-bold tracking-widest mb-2">NAVEGAÇÃO</h4>
          <ul class="flex flex-col space-y-3 font-label-caps text-[11px] xl:text-[12px] 3xl:text-[14px] tracking-widest font-bold">
            <li><a class="hover:text-champagne-gold transition-colors" href="#">CONTATO</a></li>
            <li><a class="hover:text-champagne-gold transition-colors" href="#">PROMOÇÕES</a></li>
            <li><a class="hover:text-champagne-gold transition-colors" href="#">TROCAS E DEVOLUÇÕES</a></li>
            <li><a class="hover:text-champagne-gold transition-colors underline" href="#">SOBRE NÓS</a></li>
            <li><a class="hover:text-champagne-gold transition-colors" href="#">POLÍTICA DE PRIVACIDADE</a></li>
          </ul>
        </div>

        <!-- Col 3: Central de Atendimento -->
        <div class="flex flex-col space-y-5">
          <h4 class="font-label-caps text-label-caps xl:text-[13px] 3xl:text-[15px] text-primary font-bold tracking-widest mb-2">CENTRAL DE ATENDIMENTO</h4>
          <div class="space-y-4">
            <a class="flex items-center gap-2 font-bold text-[13px] xl:text-[14px] 3xl:text-[16px] hover:text-champagne-gold transition-colors" href="tel:5511953769317">
              <span class="material-symbols-outlined text-lg 3xl:text-xl">phone</span>
              (11) 95376-9317
            </a>
            <a class="flex items-center gap-2 text-[13px] xl:text-[14px] 3xl:text-[16px] hover:text-champagne-gold transition-colors" href="mailto:contato@unajoya.com">
              <span class="material-symbols-outlined text-lg 3xl:text-xl">mail</span>
              contato@unajoya.com
            </a>
          </div>
        </div>

        <!-- Col 4: Newsletter -->
        <div class="flex flex-col space-y-5">
          <h4 class="font-label-caps text-label-caps xl:text-[13px] 3xl:text-[15px] text-primary font-bold tracking-widest mb-2">RECEBA NOVIDADES</h4>
          <form class="flex flex-col space-y-3" @submit.prevent>
            <input class="bg-pure-white border-b border-primary py-3 px-3 text-label-caps placeholder:text-secondary-fixed-dim focus:outline-none rounded-none text-sm 3xl:text-[15px] transition-all focus:border-champagne-gold" placeholder="SEU NOME" type="text" required>
            <div class="flex">
              <input class="flex-grow bg-pure-white border-b border-primary py-3 px-3 text-label-caps placeholder:text-secondary-fixed-dim focus:outline-none rounded-none text-sm 3xl:text-[15px] transition-all focus:border-champagne-gold" placeholder="SEU E-MAIL" type="email" required>
              <button class="bg-primary hover:bg-deep-onyx text-pure-white px-6 py-3 font-label-caps text-label-caps 3xl:text-[14px] font-bold transition-all duration-300 active:scale-95" type="submit">OK</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Copyright bar -->
      <div class="px-margin-desktop xl:px-margin-desktop-xl 3xl:px-[160px] py-6 xl:py-8 flex justify-between items-center">
        <p class="text-[10px] xl:text-[11px] 3xl:text-[13px] text-secondary-fixed-dim uppercase tracking-widest">
          © 2024 UNA JOYA | UNA COLLANA LTDA — CNPJ 24.040.865/0001-40 — JUNDIAÍ/SP - BRASIL
        </p>
        <NuxtLink to="/painel-exclusivo-unajoya" class="text-[9px] text-secondary-fixed-dim/30 hover:text-champagne-gold uppercase tracking-widest transition-colors font-bold">
          [ Painel ]
        </NuxtLink>
      </div>
    </div>
  </footer>
</template>

