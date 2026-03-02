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
  const totalItems = products.reduce((sum, p) => sum + p.quantity, 0)
  
  // Low stock calculation (threshold: <= minstock)
  const lowStock = products.filter(p => p.quantity <= (p.minstock || 10)).length
  
  // Category breakdown
  const categories = products.reduce((acc: any, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1
    return acc
  }, {})

  // Stock status color function
  const getStockStatus = (quantity: number, minstock: number = 10) => {
    if (quantity === 0) return { color: 'text-red-700 bg-red-50 border-red-200', label: 'Out of Stock', textColor: 'text-red-700' }
    if (quantity <= minstock) return { color: 'text-yellow-700 bg-yellow-50 border-yellow-200', label: 'Low Stock', textColor: 'text-yellow-700' }
    return { color: 'text-green-700 bg-green-50 border-green-200', label: 'In Stock', textColor: 'text-green-700' }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-ping"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full animate-pulse"></div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading your inventory...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header with greeting and date */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Inventory Dashboard
              </h1>
              <p className="text-gray-500 mt-1">
                {greeting}, James  {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/products"
                className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-all shadow-sm border border-gray-200 font-medium text-sm"
              >
                View All
              </Link>
              <Link
                href="/products/add"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md font-medium text-sm"
              >
                + Add Product
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Responsive grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Stats Cards - 4 column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Products Card */}
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-5 border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Products</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalProducts}</p>
                <p className="text-xs text-gray-400 mt-2">{totalItems} total items in stock</p>
              </div>
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-lg"></span>
              </div>
            </div>
          </div>

          {/* Total Value Card */}
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-5 border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{formatCurrency(totalValue)}</p>
                <p className="text-xs text-gray-400 mt-2">Current stock value</p>
              </div>
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-lg"></span>
              </div>
            </div>
          </div>

          {/* Low Stock Card */}
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-5 border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Low Stock</p>
                <p className={`text-2xl font-bold ${lowStock > 0 ? 'text-yellow-600' : 'text-green-600'} mt-1`}>
                  {lowStock}
                </p>
                <p className="text-xs text-gray-400 mt-2">Items below threshold</p>
              </div>
              <div className={`w-10 h-10 ${lowStock > 0 ? 'bg-yellow-50' : 'bg-green-50'} rounded-lg flex items-center justify-center`}>
                <span className={`${lowStock > 0 ? 'text-yellow-600' : 'text-green-600'} text-lg`}></span>
              </div>
            </div>
          </div>

          {/* Categories Card */}
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-5 border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Categories</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">{Object.keys(categories).length}</p>
                <p className="text-xs text-gray-400 mt-2">Unique categories</p>
              </div>
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-lg"></span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Category Distribution</h2>
          <div className="space-y-3">
            {Object.entries(categories).map(([category, count]: [string, any]) => (
              <div key={category}>
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-medium text-gray-700">{category}</span>
                  <span className="text-gray-500">{count} products</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                    style={{ width: `${(count / totalProducts) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Products - Color-coded stock levels */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-sm font-semibold text-gray-700">Recent Products</h2>
            <Link href="/products" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
              View all 
            </Link>
          </div>
          
          <div className="divide-y divide-gray-100">
            {products.slice(0, 5).map((product) => {
              const stockStatus = getStockStatus(product.quantity, product.minstock)
              return (
                <div
                  key={product.id}
                  onClick={() => router.push(`/products/edit/${product.id}`)}
                  className="px-5 py-4 hover:bg-gray-50 cursor-pointer transition-all group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {product.name}
                        </h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${stockStatus.color}`}>
                          {stockStatus.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                        <span>SKU: {product.sku}</span>
                        <span></span>
                        <span>{product.category}</span>
                        {product.supplier && (
                          <>
                            <span></span>
                            <span>{product.supplier}</span>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 sm:ml-4">
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{formatCurrency(product.price)}</div>
                        <div className={`text-xs ${stockStatus.textColor}`}>
                          {product.quantity} units
                        </div>
                      </div>
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Actions - Responsive grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/products/add"
            className="group bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all text-center"
          >
            <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">Add Product</div>
            <div className="text-xs text-gray-500 mt-1">Create new item</div>
          </Link>
          
          <Link
            href="/products"
            className="group bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all text-center"
          >
            <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">Manage</div>
            <div className="text-xs text-gray-500 mt-1">Edit & update</div>
          </Link>
          
          <Link
            href="/reports"
            className="group bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all text-center"
          >
            <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">Reports</div>
            <div className="text-xs text-gray-500 mt-1">Export data</div>
          </Link>
          
          <Link
            href="/barcode"
            className="group bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all text-center"
          >
            <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">Barcode</div>
            <div className="text-xs text-gray-500 mt-1">Generate codes</div>
          </Link>
        </div>

        {/* Stock Status Legend */}
        <div className="flex items-center justify-end gap-4 text-xs">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-gray-600">Healthy Stock</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
            <span className="text-gray-600">Low Stock</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            <span className="text-gray-600">Out of Stock</span>
          </div>
        </div>
      </main>
    </div>
  )
}
