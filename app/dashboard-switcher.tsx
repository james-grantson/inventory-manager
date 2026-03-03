'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Gem } from 'lucide-react'
import SimpleDashboard from './page'
import SophisticatedDashboard from './sophisticated-dashboard'

export default function DashboardPage() {
  const [dashboardStyle, setDashboardStyle] = useState<'simple' | 'sophisticated'>('simple')
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('dashboardStyle') as 'simple' | 'sophisticated'
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
    const newStyle = dashboardStyle === 'simple' ? 'sophisticated' : 'simple'
    setDashboardStyle(newStyle)
    localStorage.setItem('dashboardStyle', newStyle)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
      </div>
    )
  }

  return (
    <>
      {/* Switcher Button */}
      <button
        onClick={toggleDashboard}
        className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-full shadow-2xl transition-all flex items-center gap-2 border border-white/20 backdrop-blur-sm"
      >
        {dashboardStyle === 'simple' ? (
          <>
            <Sparkles className="h-5 w-5" />
            Switch to Sophisticated
          </>
        ) : (
          <>
            <Gem className="h-5 w-5" />
            Switch to Simple
          </>
        )}
      </button>

      {dashboardStyle === 'simple' ? (
        <SimpleDashboard products={products} />
      ) : (
        <SophisticatedDashboard products={products} />
      )}
    </>
  )
}
