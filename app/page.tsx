'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import BackendStatus from '@/app/components/BackendStatus'

export default function DashboardPage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile/tablet for conditional rendering
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`)
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `GH${amount.toFixed(2)}`
  }

  // Calculate stats
  const totalProducts = products.length
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0)
  const lowStock = products.filter(p => p.quantity <= (p.minStock || 10)).length

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-[clamp(3rem,8vw,4rem)] w-[clamp(3rem,8vw,4rem)] border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-base sm:text-lg">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Stats cards data
  const stats = [
    {
      title: 'Total Products',
      value: totalProducts,
      icon: (
        <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: 'blue',
      change: '+2 from last month'
    },
    {
      title: 'Total Value',
      value: formatCurrency(totalValue),
      icon: (
        <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'green',
      change: 'Based on current stock'
    },
    {
      title: 'Low Stock',
      value: lowStock,
      icon: (
        <svg className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      color: 'yellow',
      change: 'Need to reorder soon'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header - Responsive with stacked layout on mobile */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            {/* Logo and Title */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 sm:p-2.5 rounded-lg shadow-md">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Inventory Manager
                </h1>
                <p className="text-xs sm:text-sm text-gray-600">Welcome back, James</p>
              </div>
            </div>

            {/* Action Buttons - Stack on mobile, row on desktop */}
            <div className="flex flex-col xs:flex-row gap-2 sm:gap-3">
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all shadow-sm text-sm sm:text-base border border-gray-200"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span className="hidden xs:inline">View</span>
                <span>Products</span>
              </Link>
              <Link
                href="/products/add"
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden xs:inline">Add</span>
                <span>Product</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats Grid - Responsive columns */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 transform hover:scale-[1.02] transition-all border-l-4 border-${stat.color}-500`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">{stat.title}</p>
                  <p className={`text-xl sm:text-2xl lg:text-3xl font-bold text-${stat.color}-600 truncate`}>
                    {stat.value}
                  </p>
                  <p className="mt-2 text-[10px] sm:text-xs text-gray-500 truncate">{stat.change}</p>
                </div>
                <div className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-${stat.color}-100 rounded-lg sm:rounded-xl p-2 sm:p-2.5 ml-2`}>
                  <div className={`w-full h-full text-${stat.color}-600`}>
                    {stat.icon}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Products Preview - Responsive grid */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6">
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800">Recent Products</h2>
            <Link 
              href="/products" 
              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-xs sm:text-sm"
            >
              View all
              <svg className="w-3 h-3 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Product Cards - Responsive grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {products.slice(0, 3).map((product) => (
              <div
                key={product.id}
                className="group border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:shadow-md transition-all cursor-pointer"
                onClick={() => router.push(`/products/edit/${product.id}`)}
              >
                <h3 className="font-medium text-gray-800 mb-1 sm:mb-2 text-sm sm:text-base truncate">
                  {product.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-base sm:text-lg font-bold text-blue-600">
                    {formatCurrency(product.price)}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                    product.quantity < 10 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {product.quantity} units
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions - Touch-friendly grid */}
        <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {[
            { href: '/products/add', label: 'Add Product', icon: 'M12 4v16m8-8H4' },
            { href: '/products', label: 'View All', icon: 'M4 6h16M4 12h16M4 18h16' },
            { href: '/reports', label: 'Reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
            { href: '/barcode', label: 'Barcode', icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z' }
          ].map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="group bg-gradient-to-r from-blue-600 to-indigo-600 p-4 sm:p-5 rounded-xl sm:rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all text-white"
            >
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                  </svg>
                </div>
                <span className="text-xs sm:text-sm font-medium">{action.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Backend Status - Always visible but non-intrusive */}
      <div className="fixed bottom-4 right-4 z-50 scale-90 sm:scale-100 origin-bottom-right">
        <BackendStatus />
      </div>
    </div>
  )
}
