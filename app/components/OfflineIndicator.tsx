'use client'

import { useState, useEffect } from 'react'

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)
    
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) return null

  return (
    <div className="fixed bottom-20 right-4 z-50 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg shadow-lg border border-yellow-200">
      <div className="flex items-center gap-2">
        <span className="text-xl"></span>
        <div>
          <p className="font-medium">You're offline</p>
          <p className="text-xs">Changes will sync when reconnected</p>
        </div>
      </div>
    </div>
  )
}
