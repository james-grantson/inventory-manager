'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function ModernDashboard() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [greeting, setGreeting] = useState('')
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 18) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')
    
    setCurrentTime(new Date().toLocaleTimeString())
    fetchData()
    
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString())
    }, 1000)
    
    return () => clearInterval(timer)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white">{greeting}</h1>
          <p className="text-white/80 mt-2">{currentTime}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-white/60 text-sm mb-2">Total Products</h3>
            <p className="text-4xl font-bold text-white">{totalProducts}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-white/60 text-sm mb-2">Total Value</h3>
            <p className="text-4xl font-bold text-white">{formatCurrency(totalValue)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-white/60 text-sm mb-2">Low Stock</h3>
            <p className="text-4xl font-bold text-white">{lowStock}</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
          <h2 className="text-xl font-semibold text-white mb-4">Recent Products</h2>
          <div className="space-y-4">
            {products.slice(0, 5).map((product) => (
              <div
                key={product.id}
                onClick={() => router.push(`/products/edit/${product.id}`)}
                className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 cursor-pointer transition-colors"
              >
                <div>
                  <h3 className="font-medium text-white">{product.name}</h3>
                  <p className="text-sm text-white/70">{product.sku}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">{formatCurrency(product.price)}</p>
                  <p className="text-sm text-white/70">{product.quantity} units</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
