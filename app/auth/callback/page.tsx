"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    // Handle Supabase auth callback
    const handleCallback = () => {
      const hash = window.location.hash.substring(1)
      const params = new URLSearchParams(hash)
      
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')
      const error = params.get('error')
      
      if (error) {
        console.error('Auth error:', error)
        router.push(`/login?error=${error}`)
        return
      }
      
      if (accessToken && refreshToken) {
        // Store the tokens
        localStorage.setItem('supabase.auth.token', JSON.stringify({
          access_token: accessToken,
          refresh_token: refreshToken,
          expires_at: Date.now() + 3600 * 1000
        }))
        
        // Get user info if available
        const userStr = params.get('user')
        if (userStr) {
          try {
            const user = JSON.parse(decodeURIComponent(userStr))
            localStorage.setItem('supabase.auth.user', JSON.stringify(user))
          } catch (err) {
            console.log('Could not parse user data:', err)
          }
        }
        
        // Redirect to home
        router.push('/')
      } else {
        // No tokens, go to login
        router.push('/login')
      }
    }
    
    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
        <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
      </div>
    </div>
  )
}
