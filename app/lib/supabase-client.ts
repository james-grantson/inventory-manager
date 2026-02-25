// Simple mock supabase client since auth isn't needed
export const supabase = {
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null })
  }
}

export const checkAuth = async () => {
  return { user: null }
}
