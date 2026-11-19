<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  checking: boolean
  recovery: boolean
  signIn: (email: string, password: string) => Promise<string | null>
  sendReset: (email: string) => Promise<string | null>
  updatePassword: (password: string) => Promise<string | null>
  /** aviso vindo do link do e-mail (ex.: expirado) */
  notice?: string | null
}>()

const email = ref('')
const password = ref('')
const mode = ref<'login' | 'forgot'>(props.notice ? 'forgot' : 'login')
const busy = ref(false)
const error = ref('')
const info = ref('')

const submit = async () => {
  error.value = ''
  info.value = ''
  busy.value = true
  try {
    if (props.recovery) {
      const err = await props.updatePassword(password.value)
      if (err) error.value = err
      return
    }
    if (mode.value === 'forgot') {
      const err = await props.sendReset(email.value)
      if (err) error.value = err
      else info.value = 'Se o e-mail existir, enviamos um link para criar uma nova senha.'
      return
    }
    const err = await props.signIn(email.value, password.value)
    if (err) error.value = err
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-surface flex items-center justify-center px-6">
    <div class="w-full max-w-sm">
      <h1 class="font-display-lg text-3xl tracking-[0.2em] text-primary font-bold text-center">UNA JOYA</h1>
      <p class="font-label-caps text-[10px] text-secondary text-center mt-2 mb-10 opacity-60">PAINEL ADMINISTRATIVO</p>

      <p v-if="checking" class="text-center text-secondary text-sm" data-testid="login-checking">Verificando acesso...</p>

      <form v-else class="space-y-5" @submit.prevent="submit">
        <h2 class="font-display-lg text-xl text-primary italic">
          {{ recovery ? 'Crie uma nova senha' : mode === 'forgot' ? 'Recuperar senha' : 'Entrar' }}
        </h2>

        <label v-if="!recovery" class="block">
          <span class="font-label-caps text-[11px] text-secondary">E-MAIL</span>
          <input v-model="email" type="email" required autocomplete="username" class="mt-1 w-full border border-soft-stone bg-transparent px-4 py-3 text-primary focus:outline-none focus:border-primary" />
        </label>

        <label v-if="recovery || mode === 'login'" class="block">
          <span class="font-label-caps text-[11px] text-secondary">{{ recovery ? 'NOVA SENHA (MÍN. 8 CARACTERES)' : 'SENHA' }}</span>
          <input v-model="password" type="password" required :minlength="recovery ? 8 : undefined" :autocomplete="recovery ? 'new-password' : 'current-password'" class="mt-1 w-full border border-soft-stone bg-transparent px-4 py-3 text-primary focus:outline-none focus:border-primary" />
        </label>

        <p v-if="notice && !recovery" class="text-sm text-error" role="alert" data-testid="login-notice">{{ notice }}</p>
        <p v-if="error" class="text-sm text-error" role="alert" data-testid="login-error">{{ error }}</p>
        <p v-if="info" class="text-sm text-secondary" role="status">{{ info }}</p>

        <button type="submit" :disabled="busy" class="w-full bg-primary text-pure-white py-4 font-label-caps text-xs hover:bg-deep-onyx active:scale-95 transition-all disabled:opacity-60">
          {{ busy ? 'AGUARDE...' : recovery ? 'SALVAR NOVA SENHA' : mode === 'forgot' ? 'ENVIAR LINK' : 'ENTRAR' }}
        </button>

        <button v-if="!recovery" type="button" class="w-full text-secondary text-xs underline" @click="mode = mode === 'login' ? 'forgot' : 'login'; error = ''; info = ''">
          {{ mode === 'login' ? 'Esqueci minha senha' : 'Voltar ao login' }}
        </button>
      </form>
    </div>
  </div>
</template>
