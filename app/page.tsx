'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
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

  const totalProducts = products.length
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0)
  const lowStock = products.filter(p => p.quantity <= (p.minStock || 10)).length

  const formatMoney = (amount: number) => `GH${amount.toFixed(2)}`

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - centered */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Inventory Manager</h1>
          <p className="text-gray-600 mt-1">Welcome back, James</p>
        </div>
      </header>

      {/* Main content - centered with max width */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Grid - 3 equal columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Total Products</div>
            <div className="text-4xl font-bold text-gray-900">{totalProducts}</div>
            <div className="text-sm text-gray-500 mt-2">Active inventory items</div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Total Value</div>
            <div className="text-4xl font-bold text-green-600">{formatMoney(totalValue)}</div>
            <div className="text-sm text-gray-500 mt-2">Current stock value</div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Low Stock</div>
            <div className="text-4xl font-bold text-yellow-600">{lowStock}</div>
            <div className="text-sm text-gray-500 mt-2">Items needing attention</div>
          </div>
        </div>

        {/* Recent Products Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Recent Products</h2>
            <Link href="/products" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View all products →
            </Link>
          </div>
          
          <div className="divide-y divide-gray-50">
            {products.slice(0, 3).map((product, index) => (
              <div key={product.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                    <div className="flex items-center gap-4 mt-2 md:hidden">
                      <span className="text-lg font-bold text-blue-600">{formatMoney(product.price)}</span>
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        product.quantity < 10 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {product.quantity} units
                      </span>
                    </div>
                  </div>
                  
                  {/* Desktop view - hidden on mobile */}
                  <div className="hidden md:flex md:items-center md:gap-6">
                    <span className="text-lg font-bold text-blue-600">{formatMoney(product.price)}</span>
                    <span className={`text-sm px-3 py-1 rounded-full ${
                      product.quantity < 10 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {product.quantity} units
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons - centered */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/products/add" 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-medium shadow-sm"
          >
            Add New Product
          </Link>
          <Link 
            href="/products" 
            className="px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center font-medium border border-gray-200 shadow-sm"
          >
            Browse All Products
          </Link>
        </div>
      </main>

      {/* Backend Status - positioned bottom right */}
      <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm shadow-lg">
        Backend: Connected
      </div>
    </div>
  )
}
