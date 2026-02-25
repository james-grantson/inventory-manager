import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uqisohfzdoxmhsdxzcrg.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_O3BPZNAcNG3hojR3Gsk9iQ_73yCbPmn'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== '' && supabaseAnonKey !== '')
}

export const checkConnection = async () => {
  try {
    const { error } = await supabase.from('products').select('*').limit(1)
    return { connected: !error, error }
  } catch (error) {
    return { connected: false, error }
  }
}
