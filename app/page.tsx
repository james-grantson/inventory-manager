'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Package, 
  DollarSign, 
  AlertTriangle, 
  Layers,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  TrendingUp,
  Clock,
  ShoppingBag,
  X,
  CheckCircle,
  AlertCircle,
  Plus
} from 'lucide-react'

interface SimpleDashboardProps {
  products?: any[]
}

export default function SimpleDashboard({ products: externalProducts }: SimpleDashboardProps) {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>(externalProducts || [])
  const [filteredProducts, setFilteredProducts] = useState<any[]>(externalProducts || [])
  const [loading, setLoading] = useState(!externalProducts)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [darkMode, setDarkMode] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    totalProfit: 0,
    lowStock: 0,
    outOfStock: 0,
    categories: 0
  })

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      filterProducts()
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, products, categoryFilter, stockFilter])

  // Auto-refresh every 2 minutes
  useEffect(() => {
    if (!externalProducts) {
      fetchData()
    }
    const interval = setInterval(() => {
      if (!externalProducts) {
        fetchData()
      }
    }, 120000)
    return () => clearInterval(interval)
  }, [externalProducts])

  // Keyboard shortcut: Ctrl+R to refresh
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'r') {
        e.preventDefault()
        if (!externalProducts) {
          fetchData()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [externalProducts])

  // Load dark mode preference
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

  const fetchData = async () => {
    try {
      setError('')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`)
      if (!res.ok) throw new Error('Failed to fetch')
      
      const data = await res.json()
      const productList = data.products || []
      setProducts(productList)
      setFilteredProducts(productList)
      setLastUpdated(new Date())
      
      // Calculate stats
      const totalValue = productList.reduce((sum: number, p: any) => sum + (p.price * p.quantity), 0)
      const totalProfit = productList.reduce((sum: number, p: any) => sum + ((p.price - p.cost) * p.quantity), 0)
      const lowStock = productList.filter((p: any) => p.quantity <= p.minstock && p.quantity > 0).length
      const outOfStock = productList.filter((p: any) => p.quantity === 0).length
      const categories = new Set(productList.map((p: any) => p.category)).size

      setStats({
        totalProducts: productList.length,
        totalValue,
        totalProfit,
        lowStock,
        outOfStock,
        categories
      })

    } catch (error) {
      console.error('Error:', error)
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = useCallback(() => {
    let filtered = [...products]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(query) ||
        p.sku?.toLowerCase().includes(query) ||
        p.category?.toLowerCase().includes(query) ||
        p.supplier?.toLowerCase().includes(query) ||
        p.location?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      )
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter)
    }

    // Stock filter
    if (stockFilter === 'low') {
      filtered = filtered.filter(p => p.quantity <= p.minstock && p.quantity > 0)
    } else if (stockFilter === 'out') {
      filtered = filtered.filter(p => p.quantity === 0)
    } else if (stockFilter === 'healthy') {
      filtered = filtered.filter(p => p.quantity > p.minstock)
    }

    setFilteredProducts(filtered)
  }, [searchQuery, products, categoryFilter, stockFilter])

  const formatCurrency = (amount: number) => `GH${amount.toFixed(2)}`

  const getStockStatus = (product: any) => {
    if (product.quantity === 0) {
      return { label: 'Out of Stock', color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', icon: AlertCircle }
    }
    if (product.quantity <= product.minstock) {
      return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', icon: AlertTriangle }
    }
    return { label: 'In Stock', color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', icon: CheckCircle }
  }

  const getProfitColor = (profit: number, margin: number) => {
    if (margin > 50) return 'text-green-600 dark:text-green-400'
    if (margin > 20) return 'text-blue-600 dark:text-blue-400'
    if (margin > 0) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const clearSearch = () => {
    setSearchQuery('')
    setCategoryFilter('all')
    setStockFilter('all')
  }

  // Handle Escape key to clear search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearSearch()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category)))
  }, [products])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-ping"></div>
            <div className="absolute inset-0 border-4 border-blue-600 dark:border-blue-400 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Simple Inventory</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {lastUpdated && `Last updated: ${lastUpdated.toLocaleTimeString()}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchData}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Refresh (Ctrl+R)"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {darkMode ? '' : ''}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Products</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalProducts}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Value</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">{formatCurrency(stats.totalValue)}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Profit</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{formatCurrency(stats.totalProfit)}</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/20 p-3 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{stats.lowStock}</p>
              </div>
              <div className="bg-yellow-100 dark:bg-yellow-900/20 p-3 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Categories</p>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{stats.categories}</p>
              </div>
              <div className="bg-indigo-100 dark:bg-indigo-900/20 p-3 rounded-lg">
                <Layers className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products, SKU, category, supplier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Categories</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Stock</option>
                <option value="healthy">Healthy</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
              </select>

              <button
                onClick={clearSearch}
                className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            Press <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">ESC</kbd> to clear search
          </div>
        </div>

        {/* Products Table */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center border border-gray-200 dark:border-gray-700">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No products found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchQuery ? 'Try adjusting your search or filters' : 'Add your first product to get started'}
            </p>
            <Link
              href="/products/add"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Product
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">SKU</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Min</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Profit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Margin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Supplier</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredProducts.map((product, index) => {
                    const profitPerItem = product.price - product.cost
                    const totalProfit = profitPerItem * product.quantity
                    const profitMargin = product.cost > 0 ? (profitPerItem / product.cost) * 100 : 0
                    const stockStatus = getStockStatus(product)
                    const StockIcon = stockStatus.icon
                    const profitColor = getProfitColor(totalProfit, profitMargin)

                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{product.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{product.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                            {product.sku}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{formatCurrency(product.price)}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{formatCurrency(product.cost)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <StockIcon className={`h-4 w-4 ${stockStatus.color.split(' ')[1]}`} />
                            <span className={`text-sm ${stockStatus.color.split(' ')[1]}`}>
                              {product.quantity} units
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{product.minstock}</td>
                        <td className={`px-6 py-4 text-sm font-medium ${profitColor}`}>
                          {formatCurrency(totalProfit)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${profitColor.replace('text', 'bg')}/10`}>
                            {profitMargin.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{product.supplier || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{product.location || '-'}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => router.push(`/products/edit/${product.id}`)}
                              className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm('Are you sure?')) {
                                  try {
                                    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${product.id}`, {
                                      method: 'DELETE'
                                    })
                                    fetchData()
                                  } catch (error) {
                                    console.error('Error:', error)
                                  }
                                }
                              }}
                              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-600">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Showing {filteredProducts.length} of {products.length} products
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Low Stock:</span>
                  <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">{stats.lowStock}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Out of Stock:</span>
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">{stats.outOfStock}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
