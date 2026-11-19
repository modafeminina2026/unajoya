import { useSupabase } from '~/composables/useSupabase'

/** Cabeçalho com o token da sessão do admin, exigido pelo /api/upload */
export const getAdminAuthHeaders = async (): Promise<Record<string, string>> => {
  const { client } = useSupabase()
  const { data } = await client.auth.getSession()
  const token = data.session?.access_token
  return token ? { Authorization: `Bearer ${token}` } : {}
}
