import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      'Configuration Supabase manquante. Définissez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans .env',
    )
  }
  if (!client) {
    client = createClient(supabaseUrl, supabaseKey)
  }
  return client
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseKey)
}
