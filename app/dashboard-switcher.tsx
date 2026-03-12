'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useApi } from '@/lib/api'
import ClassicDashboard from './classic-dashboard'
import SimpleDashboard from './simple-dashboard'
import SophisticatedDashboard from './sophisticated-dashboard'

export default function DashboardPage() {
  const router = useRouter()
  const { currentOrganization } = useOrganization()
  const { apiFetch } = useApi()
  const [dashboardStyle, setDashboardStyle] = useState<'classic' | 'simple' | 'sophisticated'>('simple')
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Load saved dashboard style
  useEffect(() => {
    const saved = localStorage.getItem('dashboardStyle') as 'classic' | 'simple' | 'sophisticated'
    if (saved) setDashboardStyle(saved)
  }, [])

  // Fetch products whenever the current organization changes
  useEffect(() => {
    if (currentOrganization) {
      fetchData()
    } else {
      setProducts([])
      setLoading(false)
    }
  }, [currentOrganization])

  const fetchData = async () => {
    try {
      setLoading(true)
      const res = await apiFetch('/api/products')
      const data = await res.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
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
        Current: {dashboardStyle === 'classic' ? 'Classic' : dashboardStyle === 'simple' ? 'Simple' : 'Sophisticated'} | Store: {currentOrganization?.name || 'None'}
      </div>

      {/* Render the selected dashboard with products and refresh callback */}
      {dashboardStyle === 'classic' && <ClassicDashboard products={products} onRefresh={fetchData} />}
      {dashboardStyle === 'simple' && <SimpleDashboard products={products} onRefresh={fetchData} />}
      {dashboardStyle === 'sophisticated' && <SophisticatedDashboard products={products} onRefresh={fetchData} />}
    </>
  )
}