'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DashboardHeader from './components/DashboardHeader'
import { getAuthToken } from '@/lib/auth'
import { 
  Package, 
  DollarSign, 
  AlertTriangle, 
  Layers,
  ArrowRight,
  Plus,
  FileText,
  Barcode,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Clock,
  ShoppingBag,
  BarChart3,
  PieChart,
  Gem
} from 'lucide-react'

interface ClassicDashboardProps {
  products?: any[]
}

export default function ClassicDashboard({ products: externalProducts }: ClassicDashboardProps) {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>(externalProducts || [])
  const [loading, setLoading] = useState(!externalProducts)
  const [greeting, setGreeting] = useState('')
  const [currentTime, setCurrentTime] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

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

    const savedMode = localStorage.getItem('classicDarkMode')
    if (savedMode) setDarkMode(savedMode === 'true')
    
    return () => clearInterval(timer)
  }, [externalProducts])

  useEffect(() => {
    localStorage.setItem('classicDarkMode', darkMode.toString())
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const fetchData = async () => {
    try {
      const token = await getAuthToken()
      if (!token) {
        router.push('/login')
        return
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setProducts(data.products || [])
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => `GH₵${amount.toFixed(2)}`
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-GH', { year: 'numeric', month: 'short', day: 'numeric' })
    } catch {
      return 'Invalid date'
    }
  }

  const totalProducts = products.length
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0)
  const totalItems = products.reduce((sum, p) => sum + p.quantity, 0)
  const lowStock = products.filter(p => p.quantity <= (p.minstock || 10)).length
  const outOfStock = products.filter(p => p.quantity === 0).length
  const healthyStock = products.filter(p => p.quantity > (p.minstock || 10)).length

  const categories = products.reduce((acc: any, p) => {
    const catName = p.category?.name || 'Uncategorized'
    acc[catName] = (acc[catName] || 0) + 1
    return acc
  }, {})

  const getStockColor = (quantity: number, minstock: number = 10) => {
    if (quantity === 0) return 'from-red-500 to-red-600 dark:from-red-600 dark:to-red-700'
    if (quantity <= minstock) return 'from-yellow-500 to-yellow-600 dark:from-yellow-600 dark:to-yellow-700'
    return 'from-green-500 to-green-600 dark:from-green-600 dark:to-green-700'
  }

  const getStockIcon = (quantity: number, minstock: number = 10) => {
    if (quantity === 0) return <Minus className="h-3 w-3" />
    if (quantity <= minstock) return <TrendingDown className="h-3 w-3" />
    return <TrendingUp className="h-3 w-3" />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-light dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-light dark:bg-gray-900 transition-colors duration-300">
      <DashboardHeader 
        title="Classic Inventory" 
        icon={<Gem className="h-8 w-8 text-white" />}
        subtitle="Traditional & Reliable"
        currentDashboard="classic"
        lastUpdated={lastUpdated}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onRefresh={fetchData}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Products</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalProducts}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{totalItems} items in stock</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Total Value</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalValue)}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Current inventory value</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Low Stock</p>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{lowStock}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Items needing attention</p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Out of Stock</p>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">{outOfStock}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Immediate action</p>
          </div>
        </div>

        {/* Stock Health Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Stock Health
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Healthy</span>
                  <span className="text-gray-900 dark:text-white font-medium">{healthyStock}</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 dark:bg-green-600 rounded-full" style={{ width: `${(healthyStock / totalProducts) * 100}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Low Stock</span>
                  <span className="text-gray-900 dark:text-white font-medium">{lowStock}</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 dark:bg-yellow-600 rounded-full" style={{ width: `${(lowStock / totalProducts) * 100}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Out of Stock</span>
                  <span className="text-gray-900 dark:text-white font-medium">{outOfStock}</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 dark:bg-red-600 rounded-full" style={{ width: `${(outOfStock / totalProducts) * 100}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Category Distribution</h2>
            <div className="space-y-3">
              {Object.entries(categories).map(([category, count]: [string, any]) => (
                <div key={category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 dark:text-gray-400">{category}</span>
                    <span className="text-gray-900 dark:text-white">{count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 rounded-full" style={{ width: `${(count / totalProducts) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Products</h2>
            <Link href="/products" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
              View all
            </Link>
          </div>
          
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {products.slice(0, 5).map((product) => (
              <div
                key={product.id}
                onClick={() => router.push(`/products/edit/${product.id}`)}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">{product.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getStockColor(product.quantity, product.minstock)}`}>
                        {product.quantity === 0 ? 'Out' : product.quantity <= (product.minstock || 10) ? 'Low' : 'In'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{product.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400 dark:text-gray-500">
                      <span>SKU: {product.sku}</span>
                      <span>•</span>
                      <span>{product.category?.name || 'Uncategorized'}</span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="font-semibold text-gray-900 dark:text-white">{formatCurrency(product.price)}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{product.quantity} units</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}