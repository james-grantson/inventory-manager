'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAuthToken } from '@/lib/auth'
import ClassicDashboard from './classic-dashboard'
import SimpleDashboard from './simple-dashboard'
import SophisticatedDashboard from './sophisticated-dashboard'

export default function DashboardPage() {
  const router = useRouter()
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
      const token = await getAuthToken()
      if (!token) {
        router.push('/login')
        return
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
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
      {/* Debug label – optional */}
      <div className="fixed top-4 left-4 z-50 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
        Current: {dashboardStyle === 'classic' ? 'Classic' : dashboardStyle === 'simple' ? 'Simple' : 'Sophisticated'}
      </div>

      {/* Render the selected dashboard */}
      {dashboardStyle === 'classic' && <ClassicDashboard products={products} />}
      {dashboardStyle === 'simple' && <SimpleDashboard products={products} />}
      {dashboardStyle === 'sophisticated' && <SophisticatedDashboard products={products} />}
    </>
  )
}