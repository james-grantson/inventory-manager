'use client'

import { useState, useEffect } from 'react'

export default function BackendStatus() {
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    const check = async () => {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/health`)
        setStatus('connected')
      } catch {
        setStatus('offline')
      }
    }
    check()
    const interval = setInterval(check, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-1.5 text-sm rounded shadow-lg">
      {status === 'connected' ? ' Connected' : status === 'checking' ? ' Checking' : ' Offline'}
    </div>
  )
}
