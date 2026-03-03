'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Moon, Sun } from 'lucide-react'

interface ModernDashboardProps {
  products?: any[]
}

export default function ModernDashboard({ products: externalProducts }: ModernDashboardProps) {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>(externalProducts || [])
  const [loading, setLoading] = useState(!externalProducts)
  const [greeting, setGreeting] = useState('')
  const [currentTime, setCurrentTime] = useState('')
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    if (!externalProducts) {
      fetchData()
    }

    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 18) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')
    
    setCurrentTime(new Date().toLocaleTimeString())
    
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString())
    }, 1000)

    const savedMode = localStorage.getItem('modernDarkMode')
    if (savedMode) setDarkMode(savedMode === 'true')
    
    return () => clearInterval(timer)
  }, [externalProducts])

  useEffect(() => {
    localStorage.setItem('modernDarkMode', darkMode.toString())
  }, [darkMode])

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
  const totalItems = products.reduce((sum, p) => sum + p.quantity, 0)
  const lowStock = products.filter(p => p.quantity <= (p.minstock || 10)).length
  const outOfStock = products.filter(p => p.quantity === 0).length
  const healthyStock = products.filter(p => p.quantity > (p.minstock || 10)).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-white/10 backdrop-blur-md border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Modern Dashboard</h1>
                <p className="text-white/80 text-sm mt-1">{greeting}  {currentTime}</p>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                {darkMode ? <Sun className="h-5 w-5 text-white" /> : <Moon className="h-5 w-5 text-white" />}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <p className="text-white/60 text-sm mb-2">Total Products</p>
              <p className="text-3xl font-bold text-white">{totalProducts}</p>
              <p className="text-white/40 text-xs mt-2">{totalItems} items in stock</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <p className="text-white/60 text-sm mb-2">Total Value</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(totalValue)}</p>
              <p className="text-white/40 text-xs mt-2">Current inventory value</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <p className="text-white/60 text-sm mb-2">Low Stock</p>
              <p className="text-3xl font-bold text-white">{lowStock}</p>
              <p className="text-white/40 text-xs mt-2">Items needing attention</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <p className="text-white/60 text-sm mb-2">Out of Stock</p>
              <p className="text-3xl font-bold text-white">{outOfStock}</p>
              <p className="text-white/40 text-xs mt-2">Immediate action</p>
            </div>
          </div>

          {/* Stock Health Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h2 className="text-lg font-semibold text-white mb-4">Stock Health</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-white/80 text-sm mb-1">
                    <span>Healthy</span>
                    <span>{healthyStock} products</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-green-400 rounded-full" style={{ width: `${(healthyStock / totalProducts) * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-white/80 text-sm mb-1">
                    <span>Low Stock</span>
                    <span>{lowStock} products</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${(lowStock / totalProducts) * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-white/80 text-sm mb-1">
                    <span>Out of Stock</span>
                    <span>{outOfStock} products</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400 rounded-full" style={{ width: `${(outOfStock / totalProducts) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link href="/products/add" className="block w-full py-3 px-4 bg-white/10 hover:bg-white/20 rounded-xl text-white text-center transition-colors">
                  Add Product
                </Link>
                <Link href="/products" className="block w-full py-3 px-4 bg-white/10 hover:bg-white/20 rounded-xl text-white text-center transition-colors">
                  View All
                </Link>
                <Link href="/reports" className="block w-full py-3 px-4 bg-white/10 hover:bg-white/20 rounded-xl text-white text-center transition-colors">
                  Reports
                </Link>
              </div>
            </div>
          </div>

          {/* Recent Products */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h2 className="text-lg font-semibold text-white mb-4">Recent Products</h2>
            <div className="space-y-3">
              {products.slice(0, 5).map((product) => (
                <div
                  key={product.id}
                  onClick={() => router.push(`/products/edit/${product.id}`)}
                  className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer transition-colors"
                >
                  <div>
                    <h3 className="font-medium text-white">{product.name}</h3>
                    <p className="text-sm text-white/60">SKU: {product.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-white">{formatCurrency(product.price)}</p>
                    <p className="text-sm text-white/60">{product.quantity} units</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
