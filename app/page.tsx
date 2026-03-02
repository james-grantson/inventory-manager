'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [greeting, setGreeting] = useState('')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 18) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')
    
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

  const formatCurrency = (amount: number) => `GH${amount.toFixed(2)}`

  // Calculate metrics
  const totalProducts = products.length
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0)
  const lowStock = products.filter(p => p.quantity <= (p.minstock || 10)).length
  const totalItems = products.reduce((sum, p) => sum + p.quantity, 0)
  const avgPrice = products.length ? (products.reduce((sum, p) => sum + p.price, 0) / products.length).toFixed(2) : 0

  // Category breakdown
  const categories = products.reduce((acc: any, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1
    return acc
  }, {})

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-200 rounded-full animate-ping"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full animate-pulse"></div>
          </div>
          <p className="text-gray-600 font-medium">Loading your inventory...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header with greeting */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Inventory Dashboard
              </h1>
              <p className="text-gray-500">
                {greeting}, James • {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/products"
                className="px-4 py-2.5 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-all shadow-sm border border-gray-200 font-medium text-sm sm:text-base"
              >
                View Products
              </Link>
              <Link
                href="/products/add"
                className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md font-medium text-sm sm:text-base"
              >
                Add Product
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Centered with max width */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Total Products */}
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100/50 hover:border-blue-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Products</span>
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">+12%</span>
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{totalProducts}</div>
            <div className="flex items-center text-sm text-gray-500">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              {totalItems} total items
            </div>
          </div>

          {/* Total Value */}
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100/50 hover:border-green-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Value</span>
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">+8%</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2 break-words">
              {formatCurrency(totalValue)}
            </div>
            <div className="text-sm text-gray-500">Avg {formatCurrency(Number(avgPrice))}/item</div>
          </div>

          {/* Low Stock */}
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100/50 hover:border-yellow-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Low Stock</span>
              <span className="text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">Alert</span>
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-yellow-600 mb-2">{lowStock}</div>
            <div className="text-sm text-gray-500">Items below threshold</div>
          </div>

          {/* Categories */}
          <div className="group bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 p-6 border border-gray-100/50 hover:border-purple-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Categories</span>
              <span className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded-full">Active</span>
            </div>
            <div className="text-3xl sm:text-4xl font-bold text-purple-600 mb-2">{Object.keys(categories).length}</div>
            <div className="text-sm text-gray-500">Unique categories</div>
          </div>
        </div>

        {/* Charts & Activity Section */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Category Distribution */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h2>
            <div className="space-y-3">
              {Object.entries(categories).map(([category, count]: [string, any]) => (
                <div key={category} className="group">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{category}</span>
                    <span className="text-gray-500">{count} products</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500 group-hover:from-blue-600 group-hover:to-blue-700"
                      style={{ width: `${(count / totalProducts) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {products.slice(0, 4).map((product, index) => (
                <div key={product.id} className="flex items-start space-x-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    index === 0 ? 'bg-green-100' : 
                    index === 1 ? 'bg-blue-100' : 
                    index === 2 ? 'bg-yellow-100' : 'bg-purple-100'
                  }`}>
                    <span className={`text-sm font-bold ${
                      index === 0 ? 'text-green-600' : 
                      index === 1 ? 'text-blue-600' : 
                      index === 2 ? 'text-yellow-600' : 'text-purple-600'
                    }`}>
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Updated {Math.floor(Math.random() * 24)}h ago
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">{formatCurrency(product.price)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Products Preview */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="font-semibold text-gray-900">Recent Products</h2>
            <Link href="/products" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All 
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {products.slice(0, 5).map((product) => (
              <div
                key={product.id}
                onClick={() => router.push(`/products/edit/${product.id}`)}
                className="px-6 py-4 hover:bg-blue-50/50 cursor-pointer transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                      <span>SKU: {product.sku}</span>
                      <span></span>
                      <span>{product.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {formatCurrency(product.price)}
                      </div>
                      <div className={`text-sm ${
                        product.quantity <= (product.minstock || 10) 
                          ? 'text-yellow-600 font-medium' 
                          : 'text-gray-500'
                      }`}>
                        {product.quantity} units
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { href: '/products/add', label: 'Add Product', desc: 'Create new item', color: 'blue' },
            { href: '/products', label: 'Manage', desc: 'Edit & update', color: 'green' },
            { href: '/reports', label: 'Reports', desc: 'Export data', color: 'purple' },
            { href: '/barcode', label: 'Barcode', desc: 'Generate codes', color: 'orange' }
          ].map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 p-4 border border-gray-100 hover:border-blue-100"
            >
              <div className="text-center">
                <div className={`text-sm font-medium text-${action.color}-600 group-hover:text-${action.color}-700 transition-colors mb-1`}>
                  {action.label}
                </div>
                <div className="text-xs text-gray-500">{action.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
