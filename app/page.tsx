'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import BackendStatus from '@/app/components/BackendStatus'

export default function DashboardPage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const StatCard = ({ title, value, icon, color, subtitle }: any) => (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 mb-0.5">{title}</p>
          <p className={`text-lg font-semibold text-${color}-600 truncate`}>{value}</p>
          <p className="text-[10px] text-gray-400 mt-1 truncate">{subtitle}</p>
        </div>
        <div className={`flex-shrink-0 w-8 h-8 bg-${color}-50 rounded flex items-center justify-center ml-2`}>
          <div className={`w-4 h-4 text-${color}-500`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 text-white p-1.5 rounded">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <h1 className="text-base font-semibold text-gray-900">Inventory Manager</h1>
                <p className="text-xs text-gray-500">Welcome back, James</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href="/products"
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-xs"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span>Products</span>
              </Link>
              <Link
                href="/products/add"
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          <StatCard
            title="Total Products"
            value={totalProducts}
            subtitle="+2 from last month"
            color="blue"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            }
          />
          <StatCard
            title="Total Value"
            value={formatCurrency(totalValue)}
            subtitle="Based on current stock"
            color="green"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
          <StatCard
            title="Low Stock"
            value={lowStock}
            subtitle="Need to reorder soon"
            color="yellow"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            }
          />
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-gray-700">Recent Products</h2>
            <Link href="/products" className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {products.slice(0, 3).map((product) => (
              <div
                key={product.id}
                onClick={() => router.push(`/products/edit/${product.id}`)}
                className="border border-gray-100 rounded-lg p-3 hover:shadow-sm transition-all cursor-pointer"
              >
                <h3 className="font-medium text-gray-900 text-sm mb-1 truncate">{product.name}</h3>
                <p className="text-xs text-gray-500 mb-2 line-clamp-2">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-blue-600">{formatCurrency(product.price)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    product.quantity < 10 
                      ? 'bg-red-50 text-red-700' 
                      : 'bg-green-50 text-green-700'
                  }`}>
                    {product.quantity} units
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-4 gap-2">
          {[
            { href: '/products/add', label: 'Add', icon: 'M12 4v16m8-8H4' },
            { href: '/products', label: 'View', icon: 'M4 6h16M4 12h16M4 18h16' },
            { href: '/reports', label: 'Reports', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
            { href: '/barcode', label: 'Barcode', icon: 'M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z' }
          ].map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="bg-white border border-gray-200 rounded-lg p-2 hover:bg-gray-50 transition-all text-center"
            >
              <div className="flex flex-col items-center gap-1">
                <div className="w-5 h-5 text-gray-600">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                  </svg>
                </div>
                <span className="text-[10px] text-gray-600">{action.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* Backend Status */}
      <BackendStatus />
    </div>
  )
}
