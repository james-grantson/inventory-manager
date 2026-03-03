'use client'

import { useState, useEffect } from 'react'
import ModernDashboard from './page-modern'
import ClassicDashboard from './classic-dashboard'

export default function DashboardPage() {
  const [dashboardStyle, setDashboardStyle] = useState<'modern' | 'classic'>('modern')
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('dashboardStyle') as 'modern' | 'classic'
    if (saved) setDashboardStyle(saved)
    
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`)
      const data = await res.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleDashboard = () => {
    const newStyle = dashboardStyle === 'modern' ? 'classic' : 'modern'
    setDashboardStyle(newStyle)
    localStorage.setItem('dashboardStyle', newStyle)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <>
      <button
        onClick={toggleDashboard}
        className="fixed bottom-24 right-4 z-50 bg-white/10 backdrop-blur-lg text-white px-4 py-2 rounded-full shadow-lg hover:bg-white/20 transition-all border border-white/20 flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Switch to {dashboardStyle === 'modern' ? 'Classic' : 'Modern'} Dashboard
      </button>

      {dashboardStyle === 'modern' ? (
        <ModernDashboard products={products} />
      ) : (
        <ClassicDashboard products={products} />
      )}
    </>
  )
}

