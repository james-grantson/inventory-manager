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

  const totalProducts = products.length
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0)
  const lowStock = products.filter(p => p.quantity <= (p.minstock || 10)).length
  const totalItems = products.reduce((sum, p) => sum + p.quantity, 0)

  // Category breakdown
  const categories = products.reduce((acc: any, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1
    return acc
  }, {})

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Inventory Manager</h1>
          <p className="text-gray-500 mt-1">{greeting}, James</p>
        </div>
      </header>

      {/* Main Content - Centered */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid - Text Only */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total Products</p>
            <p className="text-2xl font-bold text-gray-900">{totalProducts}</p>
            <p className="text-xs text-gray-400 mt-1">{totalItems} total items</p>
          </div>
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total Value</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalValue)}</p>
            <p className="text-xs text-gray-400 mt-1">Current stock</p>
          </div>
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Low Stock</p>
            <p className="text-2xl font-bold text-yellow-600">{lowStock}</p>
            <p className="text-xs text-gray-400 mt-1">Items to reorder</p>
          </div>
          
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Categories</p>
            <p className="text-2xl font-bold text-purple-600">{Object.keys(categories).length}</p>
            <p className="text-xs text-gray-400 mt-1">Unique categories</p>
          </div>
        </div>

        {/* Category Distribution - Text Only */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-8">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Category Distribution</h2>
          <div className="space-y-2">
            {Object.entries(categories).map(([category, count]: [string, any]) => (
              <div key={category}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">{category}</span>
                  <span className="text-gray-500">{count} products</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${(count / totalProducts) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Products - Simple List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-sm font-semibold text-gray-700">Recent Products</h2>
            <Link href="/products" className="text-xs text-blue-600 hover:text-blue-700">
              View all →
            </Link>
          </div>
          
          <div className="divide-y divide-gray-100">
            {products.slice(0, 5).map((product) => (
              <div
                key={product.id}
                onClick={() => router.push(`/products/edit/${product.id}`)}
                className="px-5 py-3 hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">{product.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                      <span>SKU: {product.sku}</span>
                      <span>•</span>
                      <span>{product.category}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900 text-sm">{formatCurrency(product.price)}</div>
                    <div className={`text-xs ${product.quantity <= (product.minstock || 10) ? 'text-yellow-600' : 'text-gray-500'}`}>
                      {product.quantity} units
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions - Text Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
          <Link href="/products/add" className="text-center py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            Add Product
          </Link>
          <Link href="/products" className="text-center py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            Manage
          </Link>
          <Link href="/reports" className="text-center py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            Reports
          </Link>
          <Link href="/barcode" className="text-center py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
            Barcode
          </Link>
        </div>
      </main>
    </div>
  )
}
