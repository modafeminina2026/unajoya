import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | null = null

/**
 * Lido assim que o app carrega, ANTES do Supabase processar e limpar a URL:
 * o link "redefinir senha" do e-mail chega com "#...type=recovery" (ou com um erro, se expirou).
 */
const urlFragment = typeof window !== 'undefined' ? `${window.location.hash}&${window.location.search}` : ''
export const openedFromRecoveryLink = /[#&?]type=recovery\b/.test(urlFragment)
export const authLinkError: string | null = /error_code=otp_expired/.test(urlFragment)
  ? 'Este link de redefinição expirou ou já foi usado. Peça um novo em "Esqueci minha senha".'
  : /[#&?]error=/.test(urlFragment)
    ? 'Não foi possível validar o link do e-mail. Peça um novo em "Esqueci minha senha".'
    : null

export const useSupabase = () => {
  const config = useRuntimeConfig()
  if (!supabaseClient) {
    supabaseClient = createClient(config.public.supabaseUrl, config.public.supabaseKey)
  }
  
  return {
    client: supabaseClient
  }
}

