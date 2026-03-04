'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sparkles, Gem, Layout, Plus } from 'lucide-react'
import { SimpleDashboard } from './components/SimpleDashboard'
import SophisticatedDashboard from './sophisticated-dashboard'
import ClassicDashboard from './classic-dashboard'

export default function DashboardPage() {
  const [dashboardStyle, setDashboardStyle] = useState<'classic' | 'simple' | 'sophisticated'>('simple')
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('dashboardStyle') as 'classic' | 'simple' | 'sophisticated'
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

  const cycleDashboard = () => {
    const next = {
      'classic': 'simple',
      'simple': 'sophisticated',
      'sophisticated': 'classic'
    }[dashboardStyle] as 'classic' | 'simple' | 'sophisticated'
    
    setDashboardStyle(next)
    localStorage.setItem('dashboardStyle', next)
  }

  const getButtonInfo = () => {
    switch(dashboardStyle) {
      case 'classic': 
        return { 
          next: 'Simple', 
          icon: Layout, 
          color: 'from-blue-600 to-blue-700',
          label: 'Classic'
        }
      case 'simple': 
        return { 
          next: 'Sophisticated', 
          icon: Sparkles, 
          color: 'from-purple-600 to-pink-600',
          label: 'Simple'
        }
      case 'sophisticated': 
        return { 
          next: 'Classic', 
          icon: Gem, 
          color: 'from-green-600 to-emerald-600',
          label: 'Sophisticated'
        }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
      </div>
    )
  }

  const buttonInfo = getButtonInfo()

  return (
    <>
      {/* Top Bar with Add Product Button and Dashboard Switcher */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <Link
          href="/products/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Product
        </Link>
        
        <button
          onClick={cycleDashboard}
          className={`bg-gradient-to-r ${buttonInfo.color} hover:opacity-90 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all`}
        >
          <buttonInfo.icon className="h-5 w-5" />
          {buttonInfo.next}
        </button>
      </div>

      {/* Current Dashboard Label (for debugging) */}
      <div className="fixed top-4 left-4 z-50 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
        Current: {buttonInfo.label}
      </div>

      {/* Render the selected dashboard */}
      {dashboardStyle === 'classic' && <ClassicDashboard products={products} />}
      {dashboardStyle === 'simple' && <SimpleDashboard products={products} />}
      {dashboardStyle === 'sophisticated' && <SophisticatedDashboard products={products} />}
    </>
  )
}
