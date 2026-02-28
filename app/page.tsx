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
    return <div className="p-8 text-center text-gray-500">Loading...</div>
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Welcome back</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Products</div>
          <div className="text-2xl font-bold">{totalProducts}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Value</div>
          <div className="text-2xl font-bold text-green-600">{formatMoney(totalValue)}</div>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-sm text-gray-500">Low Stock</div>
          <div className="text-2xl font-bold text-yellow-600">{lowStock}</div>
        </div>
      </div>

      <div className="bg-white rounded shadow">
        <div className="p-4 border-b flex justify-between">
          <h2 className="font-semibold">Recent Products</h2>
          <Link href="/products" className="text-blue-600 text-sm">View all</Link>
        </div>
        <div>
          {products.slice(0, 3).map(p => (
            <div key={p.id} className="p-4 border-b last:border-0 hover:bg-gray-50">
              <div className="flex justify-between">
                <div>
                  <div className="font-medium">{p.name}</div>
                  <div className="text-sm text-gray-500">{p.description}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{formatMoney(p.price)}</div>
                  <div className="text-sm text-gray-500">{p.quantity} units</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <Link href="/products/add" className="px-4 py-2 bg-blue-600 text-white rounded text-sm">Add Product</Link>
        <Link href="/products" className="px-4 py-2 bg-gray-200 text-gray-800 rounded text-sm">View All</Link>
      </div>

      {/* Simple backend status - text only */}
      <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-1 text-sm rounded">
        Backend: Connected
      </div>
    </div>
  )
}
