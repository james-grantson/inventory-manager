"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AuthStatus() {
  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')
  const [userEmail, setUserEmail] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check multiple possible storage locations for Supabase auth
        const possibleKeys = [
          'supabase.auth.token',
          'supabase.auth.user',
          'sb-uqisohfzdoxmhsdxzcrg-auth-token', // Your project ID
          'supabase.auth'
        ]
        
        let foundAuth = false
        
        for (const key of possibleKeys) {
          const data = localStorage.getItem(key)
          if (data) {
            try {
              const parsed = JSON.parse(data)
              // Check for user email in various possible locations
              const email = 
                parsed?.currentSession?.user?.email ||
                parsed?.user?.email ||
                parsed?.email
              
              if (email) {
                setUserEmail(email)
                setAuthState('authenticated')
                foundAuth = true
                break
              }
            } catch (err) {
              console.log(`Could not parse ${key}:`, err)
            }
          }
        }
        
        if (!foundAuth) {
          setAuthState('unauthenticated')
        }
      } catch (error) {
        console.error('Auth check error:', error)
        setAuthState('unauthenticated')
      }
    }

    checkAuth()

    // Check auth every 3 seconds
    const interval = setInterval(checkAuth, 3000)
    
    return () => clearInterval(interval)
  }, [])

  const handleLogin = () => {
    router.push('/login')
  }

  const handleSignUp = () => {
    router.push('/signup')
  }

  const handleLogout = () => {
    // Clear all possible Supabase auth keys
    const keysToRemove = [
      'supabase.auth.token',
      'supabase.auth.user', 
      'sb-uqisohfzdoxmhsdxzcrg-auth-token',
      'supabase.auth'
    ]
    
    keysToRemove.forEach(key => localStorage.removeItem(key))
    
    setAuthState('unauthenticated')
    setUserEmail('')
    router.refresh()
  }

  if (authState === 'loading') {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-500">Checking auth...</span>
      </div>
    )
  }

  if (authState === 'authenticated') {
    return (
      <div className="flex items-center space-x-4">
        <div className="text-sm">
          <div className="font-medium text-gray-700">
            {userEmail ? userEmail.split('@')[0] : 'User'}
          </div>
          <div className="text-xs text-green-600 flex items-center">
            <span className="mr-1"></span> Signed in
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
        >
          Logout
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-3">
      <div className="text-sm">
        <div className="text-gray-600">Not signed in</div>
        <div className="text-xs text-blue-600">Supabase ready</div>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={handleSignUp}
          className="px-3 py-1 text-sm border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
        >
          Sign Up
        </button>
        <button
          onClick={handleLogin}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Login
        </button>
      </div>
    </div>
  )
}
