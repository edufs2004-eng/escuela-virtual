import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qjiwzkwkqovlvlumfkvw.supabase.co'
const supabaseAnonKey = 'sb_publishable_bIio-01JlY5IshZNdYxbHQ_oBEwpY_l'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)