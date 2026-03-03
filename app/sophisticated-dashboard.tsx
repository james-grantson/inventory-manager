'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Package, 
  DollarSign, 
  AlertTriangle, 
  Layers,
  Search,
  Filter,
  RefreshCw,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  Minus,
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
  Info,
  Sparkles,
  Zap,
  Shield,
  Globe,
  Heart,
  Star,
  Award,
  Gem,
  Crown,
  Rocket,
  Coffee,
  Gift,
  Wind,
  Feather,
  Droplet,
  Flame,
  Leaf,
  Plus
} from 'lucide-react'

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
  const [selectedMetric, setSelectedMetric] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [notifications, setNotifications] = useState(5)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    totalProfit: 0,
    lowStock: 0,
    outOfStock: 0,
    categories: 0,
    avgProfitMargin: 0
  })

  // Initialize with external products if provided
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

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      filterProducts()
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, products, categoryFilter, stockFilter])

  // Auto-refresh every 2 minutes (only when not using external products)
  useEffect(() => {
    if (!externalProducts) {
      const interval = setInterval(fetchData, 120000)
      return () => clearInterval(interval)
    }
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
    const categories = new Set(productList.map((p: any) => p.category)).size
    
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
      return { label: 'Critical', color: 'from-red-500 to-pink-500', icon: Flame, bgColor: 'bg-red-500/20' }
    }
    if (product.quantity <= product.minstock) {
      return { label: 'Warning', color: 'from-yellow-500 to-orange-500', icon: AlertTriangle, bgColor: 'bg-yellow-500/20' }
    }
    if (product.quantity <= product.minstock * 2) {
      return { label: 'Fair', color: 'from-blue-500 to-cyan-500', icon: Droplet, bgColor: 'bg-blue-500/20' }
    }
    return { label: 'Excellent', color: 'from-green-500 to-emerald-500', icon: Leaf, bgColor: 'bg-green-500/20' }
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full animate-pulse"></div>
          </div>
          <p className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 text-white/80 whitespace-nowrap">
            Loading sophisticated dashboard...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-xl rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center border border-white/20">
            <AlertCircle className="h-12 w-12 text-white" />
          </div>
          <p className="text-white text-lg mb-6">{error}</p>
          <button
            onClick={fetchData}
            className="px-8 py-4 bg-white/10 backdrop-blur-xl text-white rounded-xl hover:bg-white/20 transition-all border border-white/20 shadow-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-xl border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl blur-lg opacity-50"></div>
                <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl">
                  <Gem className="h-8 w-8 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold text-white">Sophisticated Inventory</h1>
                <p className="text-white/60 text-sm flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Last updated: {lastUpdated?.toLocaleTimeString()}
                  <span className="w-1 h-1 rounded-full bg-white/30"></span>
                  <Sparkles className="h-3 w-3 text-yellow-300" />
                  Premium Experience
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="flex items-center space-x-3"
            >
              <button
                onClick={fetchData}
                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/20"
                title="Refresh (Ctrl+R)"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/20"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all border border-white/20 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </button>
              <div className="w-px h-8 bg-white/20 mx-2"></div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold">JG</span>
                </div>
                <div className="hidden md:block">
                  <p className="text-white font-medium">James Grantson</p>
                  <p className="text-white/60 text-xs">Premium Admin</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards - Sophisticated */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8"
        >
          {[
            { label: 'Products', value: stats.totalProducts, icon: Package, color: 'from-purple-500 to-pink-500', delay: 0.1 },
            { label: 'Value', value: formatCurrency(stats.totalValue), icon: DollarSign, color: 'from-green-500 to-emerald-500', delay: 0.2 },
            { label: 'Profit', value: formatCurrency(stats.totalProfit), icon: TrendingUp, color: 'from-blue-500 to-cyan-500', delay: 0.3 },
            { label: 'Margin', value: `${stats.avgProfitMargin.toFixed(1)}%`, icon: PieChart, color: 'from-yellow-500 to-orange-500', delay: 0.4 },
            { label: 'Low Stock', value: stats.lowStock, icon: AlertTriangle, color: 'from-red-500 to-pink-500', delay: 0.5 },
            { label: 'Categories', value: stats.categories, icon: Layers, color: 'from-indigo-500 to-purple-500', delay: 0.6 }
          ].map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              onHoverStart={() => setHoveredCard(stat.label)}
              onHoverEnd={() => setHoveredCard(null)}
              className="relative group"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl`}></div>
              <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-xl shadow-lg`}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs font-medium px-2 py-1 bg-white/20 rounded-full text-white/80">
                    +{Math.floor(Math.random() * 20)}%
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-white/60 mt-1">{stat.label}</p>
                </div>
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Sparkles className="h-4 w-4 text-yellow-300" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Search and Filters - Sophisticated */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 mb-8"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/40" />
              <input
                type="text"
                placeholder="Search products, SKU, category, supplier..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 text-white placeholder-white/40"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-4 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 text-white appearance-none min-w-[160px]"
              >
                <option value="all" className="bg-gray-800">All Categories</option>
                {uniqueCategories.map(cat => (
                  <option key={cat} value={cat} className="bg-gray-800">{cat}</option>
                ))}
              </select>

              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="px-4 py-4 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50 text-white appearance-none min-w-[140px]"
              >
                <option value="all" className="bg-gray-800">All Stock</option>
                <option value="healthy" className="bg-gray-800">Healthy</option>
                <option value="low" className="bg-gray-800">Low Stock</option>
                <option value="out" className="bg-gray-800">Out of Stock</option>
              </select>

              <button
                onClick={clearSearch}
                className="px-6 py-4 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/20 text-white"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4 text-sm text-white/40">
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-white/40"></span>
              Press <kbd className="px-2 py-1 bg-white/10 rounded">ESC</kbd> to clear
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1 h-1 rounded-full bg-white/40"></span>
              <kbd className="px-2 py-1 bg-white/10 rounded">Ctrl+R</kbd> to refresh
            </span>
          </div>
        </motion.div>

        {/* Products Display - Sophisticated Cards */}
        {filteredProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-16 text-center border border-white/20"
          >
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-white/10 backdrop-blur-xl rounded-full p-8 flex items-center justify-center border border-white/20">
                <Package className="h-16 w-16 text-white/60" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">No products found</h3>
            <p className="text-white/60 mb-8 max-w-md mx-auto">
              {searchQuery ? 'Try adjusting your search or filters for better results' : 'Add your first product to start managing your sophisticated inventory'}
            </p>
            <Link
              href="/products/add"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg gap-2"
            >
              <Plus className="h-5 w-5" />
              Add New Product
            </Link>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
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
                  variants={itemVariants}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="group relative"
                >
                  {/* Background glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${stockStatus.color} rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl`}></div>
                  
                  {/* Main card */}
                  <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                    {/* Header with status */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-pink-300 transition-all">
                            {product.name}
                          </h3>
                          <div className={`px-3 py-1 rounded-full text-xs font-medium text-white bg-gradient-to-r ${stockStatus.color} flex items-center gap-1`}>
                            <StockIcon className="h-3 w-3" />
                            {stockStatus.label}
                          </div>
                        </div>
                        <p className="text-sm text-white/60 line-clamp-2 mb-3">{product.description}</p>
                        
                        {/* SKU Badge */}
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20 mb-3">
                          <span className="text-xs text-white/80">SKU: {product.sku}</span>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-white/5 rounded-xl p-3">
                            <p className="text-xs text-white/40 mb-1">Price</p>
                            <p className="text-sm font-semibold text-white">{formatCurrency(product.price)}</p>
                          </div>
                          <div className="bg-white/5 rounded-xl p-3">
                            <p className="text-xs text-white/40 mb-1">Cost</p>
                            <p className="text-sm font-semibold text-white">{formatCurrency(product.cost)}</p>
                          </div>
                          <div className="bg-white/5 rounded-xl p-3">
                            <p className="text-xs text-white/40 mb-1">Stock</p>
                            <p className="text-sm font-semibold text-white">{product.quantity}</p>
                          </div>
                          <div className="bg-white/5 rounded-xl p-3">
                            <p className="text-xs text-white/40 mb-1">Min</p>
                            <p className="text-sm font-semibold text-white">{product.minstock}</p>
                          </div>
                        </div>

                        {/* Supplier & Location */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-white/40">Supplier:</span>
                            <span className="text-white/80">{product.supplier || ''}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-white/40">Location:</span>
                            <span className="text-white/80">{product.location || ''}</span>
                          </div>
                        </div>

                        {/* Profit Section */}
                        <div className={`p-4 rounded-xl bg-gradient-to-r ${profitGradient} bg-opacity-10 border border-white/20`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-white/80">Total Profit</span>
                            <span className="text-lg font-bold text-white">{formatCurrency(totalProfit)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-white/80">Margin</span>
                            <span className={`text-sm font-semibold px-3 py-1 rounded-full bg-white/20 text-white`}>
                              {profitMargin.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/20">
                      <button
                        onClick={() => router.push(`/products/edit/${product.id}`)}
                        className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white/80 hover:text-white"
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
                        className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-white/80 hover:text-white"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Sparkles className="h-4 w-4 text-yellow-300" />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {/* Footer Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-white/60">Showing</span>
                <span className="text-white font-semibold">{filteredProducts.length}</span>
                <span className="text-white/60">of</span>
                <span className="text-white font-semibold">{products.length}</span>
                <span className="text-white/60">products</span>
              </div>
              <div className="w-px h-6 bg-white/20"></div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
                  <span className="text-white/60 text-sm">Healthy</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500"></div>
                  <span className="text-white/60 text-sm">Warning</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500"></div>
                  <span className="text-white/60 text-sm">Critical</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white/80 hover:text-white transition-all text-sm flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export
              </button>
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white/80 hover:text-white transition-all text-sm flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Import
              </button>
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
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 8s infinite ease-in-out;
        }
      `}</style>
    </div>
  )
}
