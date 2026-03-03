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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <>
      {/* Switcher Button - Fixed at bottom right */}
      <button
        onClick={toggleDashboard}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-lg transition-all flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        Switch to {dashboardStyle === 'modern' ? 'Classic' : 'Modern'}
      </button>

      {dashboardStyle === 'modern' ? (
        <ModernDashboard products={products} />
      ) : (
        <ClassicDashboard products={products} />
      )}
    </>
  )
}
