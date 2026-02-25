import { createClient } from '@supabase/supabase-js'

// Fallback values for development - won't break build
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Create Supabase client with error handling
let supabase: any = null

try {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  })
} catch (error) {
  console.warn('Supabase client initialization failed:', error)
  // Create a mock client for development
  supabase = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      signInWithPassword: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      signUp: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } })
    }
  }
}

export { supabase }

// Helper functions with error handling
export async function checkAuth() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  } catch (err) {
    return { session: null, error: err }
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    return { data, error }
  } catch (err) {
    return { data: null, error: err }
  }
}

export async function signUp(email: string, password: string) {
  try {
    // Safely get origin - only works in browser
    let redirectTo = 'http://localhost:3000/auth/callback'
    if (typeof window !== 'undefined') {
      redirectTo = `${window.location.origin}/auth/callback`
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo
      }
    })
    return { data, error }
  } catch (err) {
    return { data: null, error: err }
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (err) {
    return { error: err }
  }
}
