<script setup lang="ts">
const { 
  subtotal,
  totalItemsCount
} = useCart()

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)
}
</script>

<template>
  <div class="bg-white rounded-lg border border-soft-stone p-6 space-y-6 card-shadow">
    <h3 class="font-headline-md text-headline-md border-b border-soft-stone pb-4 font-medium">Resumo da Sacola</h3>

    <!-- Valores Informativos -->
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <span class="text-on-surface-variant font-body-md">Quantidade</span>
        <span class="font-body-md font-semibold">{{ totalItemsCount }} {{ totalItemsCount === 1 ? 'item' : 'itens' }}</span>
      </div>

      <div class="flex justify-between items-center border-t border-soft-stone pt-4">
        <span class="text-on-surface-variant font-body-md font-medium">Subtotal dos itens</span>
        <span class="font-body-md font-bold text-lg text-primary">{{ formatCurrency(subtotal) }}</span>
      </div>
    </div>

    <!-- Caixa de Aviso de Manutenção -->
    <div class="p-4 bg-surface-container-low border border-soft-stone rounded-sm space-y-2">
      <div class="flex items-center gap-2 text-primary font-bold text-xs font-label-caps">
        <span class="material-symbols-outlined text-sm text-champagne-gold">info</span>
        <span>FINALIZAÇÃO PAUSADA</span>
      </div>
      <p class="text-secondary text-xs leading-relaxed">
        A finalização de pagamentos online está temporariamente indisponível para melhorias na plataforma. Agradecemos a compreensão.
      </p>
    </div>

    <!-- Botão de Retorno à Vitrine -->
    <NuxtLink
      to="/"
      class="w-full bg-primary text-white py-4 font-label-caps text-xs tracking-widest uppercase hover:bg-deep-onyx transition-all active:scale-[0.98] font-bold text-center block"
    >
      Continuar Navegando
    </NuxtLink>
  </div>
</template>

<style scoped>
.card-shadow {
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}
</style>
