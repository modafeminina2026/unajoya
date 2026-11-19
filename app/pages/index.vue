<template>
  <div class="bg-soft-stone min-h-screen">
    <!-- Fixed Top Header Navigation -->
    <AppHeader />

    <!-- Slide-over Drawer Navigation Menu -->
    <AppDrawer />

    <!-- Main Container: largura total em todas as telas (antes o tablet ficava numa coluna de 780px) -->
    <main class="pt-16 lg:pt-[116px] xl:pt-[126px] 3xl:pt-[134px] pb-safe-nav md:pb-0 bg-surface relative min-h-screen">
      <!-- Hero Key-Visual -->
      <HeroBanner />

      <!-- Fast Photo Marquee Strip (Editorial Lookbook) -->
      <PhotoStrip />

      <!-- Trust Badges Grid -->
      <TrustBadges />

      <!-- Category Collections Grid -->
      <CollectionsGrid />

      <!-- Featured Best Sellers Showcase -->
      <BestSellers />

      <!-- Client Reviews Testimonials -->
      <Testimonials />

      <!-- Heritage/Story Brand Section -->
      <AboutSection />

      <!-- Footer navigation, newsletter & legal info -->
      <AppFooter />
    </main>

    <!-- Sticky Bottom navigation on mobile viewports -->
    <BottomNavigation />
  </div>
</template>

