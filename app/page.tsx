'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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

  const formatCurrency = (amount: number) => {
    return `GH${amount.toFixed(2)}`
  }

  const totalProducts = products.length
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0)
  const lowStock = products.filter(p => p.quantity <= (p.minstock || 10)).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header skeleton */}
          <div className="space-y-2">
            <div className="skeleton-text w-48 h-8"></div>
            <div className="skeleton-text w-64 h-4"></div>
          </div>
          
          {/* Stats skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="dashboard-card h-32">
                <div className="skeleton-text w-20 h-4 mb-2"></div>
                <div className="skeleton-text w-24 h-8"></div>
              </div>
            ))}
          </div>
          
          {/* Products skeleton */}
          <div className="dashboard-card">
            <div className="skeleton-text w-32 h-6 mb-4"></div>
            {[1,2,3].map(i => (
              <div key={i} className="py-4 border-b border-gray-100 last:border-0">
                <div className="flex justify-between">
                  <div className="space-y-2 w-1/2">
                    <div className="skeleton-text w-3/4 h-4"></div>
                    <div className="skeleton-text w-1/2 h-3"></div>
                  </div>
                  <div className="skeleton-text w-20 h-8"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with strong typography */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
            Inventory Manager
          </h1>
          <p className="text-lg text-gray-500 mt-2 leading-relaxed">
            Welcome back, James  Your inventory is up to date
          </p>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats cards with beautiful typography */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Products */}
          <div className="dashboard-card group">
            <div className="label-small mb-2">Total Products</div>
            <div className="stat-value text-gray-900">{totalProducts}</div>
            <div className="text-sm text-gray-500 mt-2 flex items-center">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              +2 from last month
            </div>
          </div>

          {/* Total Value */}
          <div className="dashboard-card group">
            <div className="label-small mb-2">Total Value</div>
            <div className="stat-value text-green-600">{formatCurrency(totalValue)}</div>
            <div className="text-sm text-gray-500 mt-2">Based on current stock</div>
          </div>

          {/* Low Stock */}
          <div className="dashboard-card group">
            <div className="label-small mb-2">Low Stock Items</div>
            <div className="stat-value text-yellow-600">{lowStock}</div>
            <div className="text-sm text-gray-500 mt-2">Need to reorder soon</div>
          </div>
        </div>

        {/* Recent Products Section */}
        <div className="dashboard-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="card-title">Recent Products</h2>
            <Link 
              href="/products" 
              className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              View all 
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {products.slice(0, 3).map((product) => (
              <div
                key={product.id}
                onClick={() => router.push(`/products/edit/${product.id}`)}
                className="interactive-row py-4 px-2 -mx-2 rounded-lg cursor-pointer"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1 mb-2 md:mb-0">
                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{product.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-gray-400">SKU: {product.sku}</span>
                      {product.quantity <= (product.minstock || 10) && (
                        <span className="status-badge status-badge-warning text-xs">
                          Low Stock
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 md:ml-4">
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">
                        {formatCurrency(product.price)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.quantity} units
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions - Clean buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            href="/products/add"
            className="group bg-white px-4 py-3 rounded-xl text-center hover:bg-gray-50 transition-all duration-200 border border-gray-100"
          >
            <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
              Add Product
            </div>
            <div className="text-xs text-gray-500 mt-1">Create new item</div>
          </Link>
          
          <Link
            href="/products"
            className="group bg-white px-4 py-3 rounded-xl text-center hover:bg-gray-50 transition-all duration-200 border border-gray-100"
          >
            <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
              View All
            </div>
            <div className="text-xs text-gray-500 mt-1">Browse inventory</div>
          </Link>
          
          <Link
            href="/reports"
            className="group bg-white px-4 py-3 rounded-xl text-center hover:bg-gray-50 transition-all duration-200 border border-gray-100"
          >
            <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
              Reports
            </div>
            <div className="text-xs text-gray-500 mt-1">Export & analyze</div>
          </Link>
          
          <Link
            href="/barcode"
            className="group bg-white px-4 py-3 rounded-xl text-center hover:bg-gray-50 transition-all duration-200 border border-gray-100"
          >
            <div className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
              Barcode
            </div>
            <div className="text-xs text-gray-500 mt-1">Generate codes</div>
          </Link>
        </div>
      </main>
    </div>
  )
}
