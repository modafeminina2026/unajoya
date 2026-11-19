<script setup lang="ts">
const { subtotal, totalItemsCount } = useCart()
const { sendToWhatsApp, copyMessage, lastCode, lastUrl, finishAndClear } = useWhatsAppCheckout()

const customerName = ref('')
const note = ref('')
const copied = ref(false)
const sending = ref(false)

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)
}

// Chamado direto no clique: o navegador só libera a nova aba se não houver "await" antes
const handleSend = () => {
  if (sending.value) return
  sending.value = true
  sendToWhatsApp({ customerName: customerName.value, note: note.value })
  setTimeout(() => { sending.value = false }, 2000)
}

const handleCopy = async () => {
  copied.value = await copyMessage({ customerName: customerName.value, note: note.value })
  setTimeout(() => { copied.value = false }, 3000)
}
</script>

<template>
  <div class="bg-white rounded-lg border border-soft-stone p-6 space-y-6 card-shadow">
    <h3 class="font-headline-md text-headline-md border-b border-soft-stone pb-4 font-medium">Resumo da Sacola</h3>

    <!-- Valores -->
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <span class="text-on-surface-variant font-body-md">Quantidade</span>
        <span class="font-body-md font-semibold">{{ totalItemsCount }} {{ totalItemsCount === 1 ? 'item' : 'itens' }}</span>
      </div>

      <div class="flex justify-between items-center border-t border-soft-stone pt-4">
        <span class="text-on-surface-variant font-body-md font-medium">Total estimado</span>
        <span class="font-body-md font-bold text-lg text-primary">{{ formatCurrency(subtotal) }}</span>
      </div>
    </div>

    <!-- Dados opcionais -->
    <div class="space-y-3">
      <label class="block">
        <span class="text-xs font-label-caps tracking-widest text-secondary">SEU NOME (OPCIONAL)</span>
        <input
          v-model="customerName"
          type="text"
          maxlength="80"
          autocomplete="name"
          class="mt-1 w-full border border-soft-stone rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-champagne-gold"
          placeholder="Como podemos te chamar?"
        >
      </label>
      <label class="block">
        <span class="text-xs font-label-caps tracking-widest text-secondary">OBSERVAÇÕES (OPCIONAL)</span>
        <textarea
          v-model="note"
          rows="2"
          maxlength="300"
          class="mt-1 w-full border border-soft-stone rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-champagne-gold resize-none"
          placeholder="Ex.: é para presente, preciso até sexta..."
        />
      </label>
    </div>

    <!-- Finalizar pelo WhatsApp -->
    <div class="space-y-3">
      <button
        type="button"
        :disabled="sending"
        class="w-full bg-[#25D366] text-white py-4 font-label-caps text-xs tracking-widest uppercase hover:bg-[#1ebe5b] transition-all active:scale-[0.98] font-bold flex items-center justify-center gap-2 disabled:opacity-70"
        @click="handleSend"
      >
        <span class="material-symbols-outlined text-lg">chat</span>
        Finalizar pelo WhatsApp
      </button>
      <p class="text-secondary text-xs leading-relaxed text-center">
        Você será direcionado ao nosso WhatsApp com os itens do pedido. Confirmamos valores, disponibilidade e entrega por lá.
      </p>

      <button
        type="button"
        class="w-full text-xs text-secondary underline underline-offset-4 hover:text-primary transition-colors"
        @click="handleCopy"
      >
        {{ copied ? 'Mensagem copiada!' : 'Copiar mensagem do pedido' }}
      </button>
    </div>

    <!-- Confirmação após o envio -->
    <div v-if="lastCode" class="p-4 bg-surface-container-low border border-soft-stone rounded-sm space-y-2 text-center">
      <p class="text-xs text-primary font-bold font-label-caps tracking-widest">PEDIDO {{ lastCode }}</p>
      <p class="text-secondary text-xs leading-relaxed">
        Se o WhatsApp não abriu,
        <a :href="lastUrl || '#'" target="_blank" rel="noopener" class="underline text-primary">toque aqui para abrir</a>.
        Depois de enviar a mensagem, você pode esvaziar a sacola.
      </p>
      <button type="button" class="text-xs underline text-secondary hover:text-primary" @click="finishAndClear">
        Já enviei, esvaziar sacola
      </button>
    </div>

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
