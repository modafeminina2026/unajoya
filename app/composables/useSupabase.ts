import { createClient } from '@supabase/supabase-js'

export const useSupabase = () => {
  const supabaseUrl = 'https://hkczlyvzicoklbebhnfo.supabase.co'
  const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhrY3pseXZ6aWNva2xiZWJobmZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5NzAwMzYsImV4cCI6MjA5NDU0NjAzNn0.t8MalZsAlzcNbZu3kjvnpyS0IGO6oroNyXDg_cNgZO4'
  
  const client = createClient(supabaseUrl, supabaseKey)
  
  return {
    client
  }
}
