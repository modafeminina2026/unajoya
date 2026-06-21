<template>
  <div class="bg-soft-stone min-h-screen">
    <!-- Fixed Top Header Navigation -->
    <AppHeader />

    <!-- Slide-over Drawer Navigation Menu -->
    <AppDrawer />

    <!-- Main Container capped at 780px to preserve mobile editorial design scale -->
    <main class="pt-16 pb-14 md:pb-0 max-w-[780px] mx-auto bg-surface shadow-xl relative min-h-screen">
      <!-- Hero Key-Visual -->
      <HeroBanner />

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
