import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let supabaseClient: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('SUPABASE_CONFIG_MISSING')
  }

  try {
    const url = new URL(supabaseUrl)
    if (!['https:', 'http:'].includes(url.protocol) || !url.hostname) {
      throw new Error('SUPABASE_URL_INVALID')
    }
  } catch {
    throw new Error('SUPABASE_URL_INVALID')
  }

  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  }

  return supabaseClient
}
