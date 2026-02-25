import { createClient } from '@supabase/supabase-js'

// Use environment variables or fallbacks for testing
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Test connection function
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('_test').select('*').limit(1)
    if (error && error.code !== '42P01') { // Ignore "table doesn't exist" error
      console.error('Supabase connection test failed:', error)
      return false
    }
    console.log(' Supabase connection successful')
    return true
  } catch (error) {
    console.error('Supabase connection test failed:', error)
    return false
  }
}
