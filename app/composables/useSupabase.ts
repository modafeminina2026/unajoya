import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | null = null

export const useSupabase = () => {
  const config = useRuntimeConfig()
  if (!supabaseClient) {
    supabaseClient = createClient(config.public.supabaseUrl, config.public.supabaseKey)
  }
  
  return {
    client: supabaseClient
  }
}

