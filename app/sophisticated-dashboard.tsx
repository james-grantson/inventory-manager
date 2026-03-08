'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
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
  BarChart3,
  PieChart,
  Download,
  Upload,
  Settings,
  Bell,
  Sun,
  Moon,
  X,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Gem,
  Flame,
  Droplet,
  Leaf,
  Plus,
  Layout
} from 'lucide-react'
import DashboardHeader from './components/DashboardHeader'

interface SophisticatedDashboardProps {
  products?: any[]
}

export default function SophisticatedDashboard({ products: externalProducts }: SophisticatedDashboardProps) {
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
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    totalProfit: 0,
    lowStock: 0,
    outOfStock: 0,
    categories: 0,
    avgProfitMargin: 0
  })

  useEffect(() => {
    if (externalProducts && externalProducts.length > 0) {
      setProducts(externalProducts)
      setFilteredProducts(externalProducts)
      setLoading(false)
      calculateStats(externalProducts)
    } else {
      fetchData()
    }
  }, [externalProducts])

  useEffect(() => {
    const timer = setTimeout(() => {
      filterProducts()
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery, products, categoryFilter, stockFilter])

  useEffect(() => {
    if (!externalProducts) {
      const interval = setInterval(fetchData, 120000)
      return () => clearInterval(interval)
    }
  }, [externalProducts])

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

  useEffect(() => {
    const savedMode = localStorage.getItem('sophisticatedDarkMode')
    if (savedMode) setDarkMode(savedMode === 'true')
  }, [])

  useEffect(() => {
    localStorage.setItem('sophisticatedDarkMode', darkMode.toString())
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
      calculateStats(productList)

    } catch (error) {
      console.error('Error:', error)
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (productList: any[]) => {
    const totalValue = productList.reduce((sum: number, p: any) => sum + (p.price * p.quantity), 0)
    const totalProfit = productList.reduce((sum: number, p: any) => sum + ((p.price - p.cost) * p.quantity), 0)
    const lowStock = productList.filter((p: any) => p.quantity <= p.minstock && p.quantity > 0).length
    const outOfStock = productList.filter((p: any) => p.quantity === 0).length
    const categories = new Set(productList.map((p: any) => p.category?.name || 'Uncategorized')).size
    
    const avgMargin = productList.length > 0 
      ? productList.reduce((sum, p) => sum + (p.cost > 0 ? ((p.price - p.cost) / p.cost) * 100 : 0), 0) / productList.length
      : 0

    setStats({
      totalProducts: productList.length,
      totalValue,
      totalProfit,
      lowStock,
      outOfStock,
      categories,
      avgProfitMargin: avgMargin
    })
  }

  const filterProducts = useCallback(() => {
    let filtered = [...products]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(query) ||
        p.sku?.toLowerCase().includes(query) ||
        p.category?.name?.toLowerCase().includes(query) ||
        p.supplier?.toLowerCase().includes(query) ||
        p.location?.toLowerCase().includes(query)
      )
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => (p.category?.name || 'Uncategorized') === categoryFilter)
    }

    if (stockFilter === 'low') {
      filtered = filtered.filter(p => p.quantity <= p.minstock && p.quantity > 0)
    } else if (stockFilter === 'out') {
      filtered = filtered.filter(p => p.quantity === 0)
    } else if (stockFilter === 'healthy') {
      filtered = filtered.filter(p => p.quantity > p.minstock)
    }

    setFilteredProducts(filtered)
  }, [searchQuery, products, categoryFilter, stockFilter])

  const formatCurrency = (amount: number) => `GH₵${amount.toFixed(2)}`
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleDateString('en-GH', { year: 'numeric', month: 'short', day: 'numeric' })
    } catch {
      return 'Invalid date'
    }
  }

  const getStockStatus = (product: any) => {
    if (product.quantity === 0) {
      return { label: 'Critical', color: 'from-red-500 to-pink-500', icon: Flame }
    }
    if (product.quantity <= product.minstock) {
      return { label: 'Warning', color: 'from-yellow-500 to-orange-500', icon: AlertTriangle }
    }
    if (product.quantity <= product.minstock * 2) {
      return { label: 'Fair', color: 'from-blue-500 to-cyan-500', icon: Droplet }
    }
    return { label: 'Excellent', color: 'from-green-500 to-emerald-500', icon: Leaf }
  }

  const getProfitColor = (margin: number) => {
    if (margin > 50) return 'from-purple-500 to-pink-500'
    if (margin > 30) return 'from-blue-500 to-cyan-500'
    if (margin > 15) return 'from-green-500 to-emerald-500'
    if (margin > 0) return 'from-yellow-500 to-orange-500'
    return 'from-red-500 to-pink-500'
  }

  const clearSearch = () => {
    setSearchQuery('')
    setCategoryFilter('all')
    setStockFilter('all')
  }

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
    return Array.from(new Set(products.map(p => p.category?.name || 'Uncategorized')))
  }, [products])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-light dark:bg-gray-900 flex items-center justify-center">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-light dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-xl rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center border border-gray-200 dark:border-gray-700">
            <AlertCircle className="h-12 w-12 text-red-500 dark:text-red-400" />
          </div>
          <p className="text-gray-900 dark:text-white text-lg mb-6">{error}</p>
          <button
            onClick={fetchData}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-light dark:bg-gray-900 transition-colors duration-300">
      <DashboardHeader 
        title="Sophisticated Inventory" 
        icon={<Sparkles className="h-8 w-8 text-white" />}
        subtitle="Premium Experience"
        currentDashboard="sophisticated"
        lastUpdated={lastUpdated}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onRefresh={fetchData}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {[
            { label: 'Products', value: stats.totalProducts, icon: Package, color: 'from-purple-500 to-pink-500' },
            { label: 'Value', value: formatCurrency(stats.totalValue), icon: DollarSign, color: 'from-green-500 to-emerald-500' },
            { label: 'Profit', value: formatCurrency(stats.totalProfit), icon: TrendingUp, color: 'from-blue-500 to-cyan-500' },
            { label: 'Margin', value: `${stats.avgProfitMargin.toFixed(1)}%`, icon: PieChart, color: 'from-yellow-500 to-orange-500' },
            { label: 'Low Stock', value: stats.lowStock, icon: AlertTriangle, color: 'from-red-500 to-pink-500' },
            { label: 'Categories', value: stats.categories, icon: Layers, color: 'from-indigo-500 to-purple-500' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="relative group"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl`}></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-xl shadow-lg`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400">
                    +{Math.floor(Math.random() * 20)}%
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search products, SKU, category, supplier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-white"
              >
                <option value="all">All Categories</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="px-4 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-white"
              >
                <option value="all">All Stock</option>
                <option value="healthy">Healthy</option>
                <option value="low">Low Stock</option>
                <option value="out">Out of Stock</option>
              </select>

              <button
                onClick={clearSearch}
                className="px-6 py-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all text-gray-700 dark:text-gray-300"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-gray-400"></span>
              Press <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">ESC</kbd> to clear
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-gray-400"></span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600">Ctrl+R</kbd> to refresh
            </span>
          </div>
        </motion.div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-16 text-center border border-gray-200 dark:border-gray-700 shadow-lg"
          >
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-white dark:bg-gray-800 rounded-full p-8 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                <Package className="h-16 w-16 text-gray-400 dark:text-gray-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No products found</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
              {searchQuery ? 'Try adjusting your search or filters' : 'Add your first product to get started'}
            </p>
            <Link
              href="/products/add"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg gap-2"
            >
              <Plus className="h-5 w-5" />
              Add New Product
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, index) => {
              const profitPerItem = product.price - product.cost
              const totalProfit = profitPerItem * product.quantity
              const profitMargin = product.cost > 0 ? (profitPerItem / product.cost) * 100 : 0
              const stockStatus = getStockStatus(product)
              const StockIcon = stockStatus.icon
              const profitGradient = getProfitColor(profitMargin)

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="group relative"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${stockStatus.color} rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl`}></div>
                  
                  <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${stockStatus.color} flex items-center gap-1`}>
                            <StockIcon className="h-3 w-3" />
                            {stockStatus.label}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{product.description}</p>
                        
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 mb-3">
                          <span className="text-xs text-gray-600 dark:text-gray-300">SKU: {product.sku}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Price</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(product.price)}</p>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Cost</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(product.cost)}</p>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Stock</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{product.quantity}</p>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Min</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{product.minstock}</p>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Supplier:</span>
                            <span className="text-gray-900 dark:text-white">{product.supplier || '—'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Location:</span>
                            <span className="text-gray-900 dark:text-white">{product.location || '—'}</span>
                          </div>
                        </div>

                        <div className={`p-4 rounded-xl bg-gradient-to-r ${profitGradient} bg-opacity-10 border border-gray-200 dark:border-gray-700`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Total Profit</span>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(totalProfit)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Margin</span>
                            <span className="text-sm font-semibold px-3 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white">
                              {profitMargin.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => router.push(`/products/edit/${product.id}`)}
                        className="p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all text-gray-600 dark:text-gray-300"
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
                        className="p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all text-gray-600 dark:text-gray-300"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Sparkles className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Footer Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-8 bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-lg"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 dark:text-gray-400">Showing</span>
                <span className="text-gray-900 dark:text-white font-semibold">{filteredProducts.length}</span>
                <span className="text-gray-500 dark:text-gray-400">of</span>
                <span className="text-gray-900 dark:text-white font-semibold">{products.length}</span>
                <span className="text-gray-500 dark:text-gray-400">products</span>
              </div>
              <div className="w-px h-6 bg-gray-200 dark:bg-gray-700"></div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Excellent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Fair</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"></div>
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Warning</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500"></div>
                  <span className="text-gray-600 dark:text-gray-400 text-sm">Critical</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

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