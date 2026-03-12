'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DashboardHeader from './components/DashboardHeader'
import { useApi } from '@/lib/api'
import { Package, DollarSign, AlertTriangle, TrendingUp, TrendingDown, Minus, Layout } from 'lucide-react'

interface SimpleDashboardProps {
  products?: any[]
  onRefresh?: () => void
}

export default function SimpleDashboard({ products: externalProducts, onRefresh }: SimpleDashboardProps) {
  const router = useRouter()
  const { apiFetch } = useApi()
  const [products, setProducts] = useState<any[]>(externalProducts || [])
  const [darkMode, setDarkMode] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    const savedMode = localStorage.getItem('simpleDarkMode')
    if (savedMode) setDarkMode(savedMode === 'true')
  }, [])

  useEffect(() => {
    localStorage.setItem('simpleDarkMode', darkMode.toString())
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  useEffect(() => {
    if (externalProducts) {
      setProducts(externalProducts)
      setLastUpdated(new Date())
    }
  }, [externalProducts])

  const formatCurrency = (amount: number) => `GH₵${amount.toFixed(2)}`

  const totalProducts = products.length
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0)
  const totalItems = products.reduce((sum, p) => sum + p.quantity, 0)
  const lowStock = products.filter(p => p.quantity <= (p.minstock || 10)).length
  const outOfStock = products.filter(p => p.quantity === 0).length

  const getStockIcon = (quantity: number, minstock: number = 10) => {
    if (quantity === 0) return <Minus className="h-4 w-4 text-red-500" />
    if (quantity <= minstock) return <TrendingDown className="h-4 w-4 text-yellow-500" />
    return <TrendingUp className="h-4 w-4 text-green-500" />
  }

  return (
    <div className="min-h-screen bg-gradient-light dark:bg-gray-900 transition-colors duration-300">
      <DashboardHeader 
        title="Simple Inventory" 
        icon={<Layout className="h-8 w-8 text-white" />}
        subtitle="Clean & Minimal"
        currentDashboard="simple"
        lastUpdated={lastUpdated}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onRefresh={onRefresh}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <Package className="h-8 w-8 text-purple-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalProducts}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Products</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <DollarSign className="h-8 w-8 text-green-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalValue)}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Inventory Value</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <AlertTriangle className="h-8 w-8 text-yellow-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{lowStock}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Low Stock Items</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <Minus className="h-8 w-8 text-red-500 mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{outOfStock}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Out of Stock</p>
          </div>
        </div>

        {/* Product List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Products</h2>
            <Link href="/products" className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400">
              View All
            </Link>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {products.slice(0, 5).map((product) => (
              <div
                key={product.id}
                onClick={() => router.push(`/products/edit/${product.id}`)}
                className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    {getStockIcon(product.quantity, product.minstock)}
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{product.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        SKU: {product.sku} • {product.category?.name || 'Uncategorized'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(product.price)}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{product.quantity} units</p>
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