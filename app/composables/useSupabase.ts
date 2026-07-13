import { createClient } from '@supabase/supabase-js'

export const useSupabase = () => {
  const config = useRuntimeConfig()
  const client = createClient(config.public.supabaseUrl, config.public.supabaseKey)
  
  return {
    client
  }
}
