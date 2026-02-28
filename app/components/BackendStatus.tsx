'use client'

import { useState, useEffect } from 'react'

export default function BackendStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [apiInfo, setApiInfo] = useState<any>(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    checkBackendStatus()
    const interval = setInterval(checkBackendStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const checkBackendStatus = async () => {
    try {
      const healthRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/health`)
      const healthData = await healthRes.json()
      
      const productsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`)
      const productsData = await productsRes.json()
      
      setApiInfo({
        health: healthData,
        products: productsData,
        timestamp: new Date().toISOString()
      })
      setStatus('connected')
    } catch (error) {
      console.error('Backend connection error:', error)
      setStatus('error')
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div 
        onClick={() => setExpanded(!expanded)}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg cursor-pointer
          ${status === 'checking' ? 'bg-yellow-100 text-yellow-800' : ''}
          ${status === 'connected' ? 'bg-green-100 text-green-800' : ''}
          ${status === 'error' ? 'bg-red-100 text-red-800' : ''}
        `}
      >
        <div className={`
          w-3 h-3 rounded-full animate-pulse
          ${status === 'checking' ? 'bg-yellow-500' : ''}
          ${status === 'connected' ? 'bg-green-500' : ''}
          ${status === 'error' ? 'bg-red-500' : ''}
        `} />
        <span className="font-medium">
          {status === 'checking' && 'Checking Backend...'}
          {status === 'connected' && ' Backend Connected'}
          {status === 'error' && ' Backend Offline'}
        </span>
        <span className="text-xs ml-2">{expanded ? '' : ''}</span>
      </div>

      {expanded && apiInfo && (
        <div className="absolute bottom-12 right-0 w-96 bg-white rounded-lg shadow-xl border p-4 mb-2">
          <h3 className="font-bold text-gray-800 mb-3"> System Status</h3>
          
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-blue-800">Frontend</span>
                <span className="text-green-600 text-sm"> Running</span>
              </div>
              <p className="text-xs text-blue-600 mt-1 break-all">
                {typeof window !== 'undefined' ? window.location.origin : ''}
              </p>
            </div>

            <div className="p-3 bg-green-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-green-800">Backend API</span>
                <span className="text-green-600 text-sm">✅ Connected</span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                {process.env.NEXT_PUBLIC_API_URL}
              </p>
            </div>

            {apiInfo.health && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="text-sm">
                  <p><span className="font-medium">API Version:</span> {apiInfo.health.version || '3.0.0'}</p>
                  <p><span className="font-medium">Environment:</span> {apiInfo.health.environment || 'production'}</p>
                  <p><span className="font-medium">Products Count:</span> {apiInfo.products?.count || 0}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Last checked: {new Date(apiInfo.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-2">
              <a
                href="/products"
                className="flex-1 px-3 py-2 bg-blue-600 text-white text-center text-sm rounded hover:bg-blue-700"
              >
                View Products
              </a>
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL}/api/health`}
                target="_blank"
                className="flex-1 px-3 py-2 bg-gray-600 text-white text-center text-sm rounded hover:bg-gray-700"
              >
                Test API
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
