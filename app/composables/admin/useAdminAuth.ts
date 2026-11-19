import { ref } from 'vue'
import type { Session } from '@supabase/supabase-js'
import { useSupabase, openedFromRecoveryLink, authLinkError } from '~/composables/useSupabase'

/**
 * Autenticação do painel por e-mail + senha (Supabase Auth).
 * O acesso só é liberado se a conta estiver ativa em admin_profiles
 * (checado pela função is_active_admin() do banco). As permissões reais
 * de escrita são garantidas pelo RLS, não por este código.
 */
const session = ref<Session | null>(null)
const isAdmin = ref(false)
const checking = ref(true)
const recovery = ref(openedFromRecoveryLink)
const linkError = ref<string | null>(authLinkError)
let initialized = false

const friendlyError = (message: string): string => {
  const m = (message || '').toLowerCase()
  if (m.includes('invalid login')) return 'E-mail ou senha incorretos.'
  if (m.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar.'
  if (m.includes('rate limit') || m.includes('too many')) return 'Muitas tentativas. Aguarde alguns minutos e tente de novo.'
  if (m.includes('password should be')) return 'A senha precisa ter pelo menos 8 caracteres.'
  if (m.includes('network') || m.includes('fetch')) return 'Sem conexão. Verifique a internet e tente de novo.'
  return 'Não foi possível concluir. Tente novamente.'
}

export const useAdminAuth = () => {
  const { client } = useSupabase()

  const verifyAdmin = async (): Promise<boolean> => {
    if (!session.value) {
      isAdmin.value = false
      return false
    }
    const { data, error } = await client.rpc('is_active_admin')
    isAdmin.value = !error && data === true
    return isAdmin.value
  }

  const init = async () => {
    if (initialized) return
    initialized = true
    client.auth.onAuthStateChange((event, next) => {
      session.value = next
      if (event === 'PASSWORD_RECOVERY') recovery.value = true
      if (event === 'SIGNED_OUT') isAdmin.value = false
      // não chamar o Supabase dentro do callback (risco de deadlock)
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') setTimeout(() => { void verifyAdmin() }, 0)
    })
    const { data } = await client.auth.getSession()
    session.value = data.session
    await verifyAdmin()
    checking.value = false
  }

  const signIn = async (email: string, password: string): Promise<string | null> => {
    const { data, error } = await client.auth.signInWithPassword({ email: email.trim(), password })
    if (error) return friendlyError(error.message)
    session.value = data.session
    const ok = await verifyAdmin()
    if (!ok) {
      await client.auth.signOut()
      return 'Esta conta não tem acesso ao painel.'
    }
    return null
  }

  const signOut = async () => {
    await client.auth.signOut()
    session.value = null
    isAdmin.value = false
  }

  const sendReset = async (email: string): Promise<string | null> => {
    const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/painel-exclusivo-unajoya` : undefined
    const { error } = await client.auth.resetPasswordForEmail(email.trim(), { redirectTo })
    return error ? friendlyError(error.message) : null
  }

  const updatePassword = async (password: string): Promise<string | null> => {
    if (password.length < 8) return 'A senha precisa ter pelo menos 8 caracteres.'
    const { error } = await client.auth.updateUser({ password })
    if (error) return friendlyError(error.message)
    recovery.value = false
    await verifyAdmin()
    return null
  }

  return { session, isAdmin, checking, recovery, linkError, init, signIn, signOut, sendReset, updatePassword }
}
