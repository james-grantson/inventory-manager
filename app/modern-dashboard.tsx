'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, Variants } from 'framer-motion'
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
  Sparkles,
  Grid,
  List,
  Moon,
  Sun
} from 'lucide-react'

interface UltraModernDashboardProps {
  products?: any[]
}

export default function UltraModernDashboard({ products: externalProducts }: UltraModernDashboardProps) {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>(externalProducts || [])
  const [loading, setLoading] = useState(!externalProducts)
  const [greeting, setGreeting] = useState('')
  const [currentTime, setCurrentTime] = useState('')
  const [selectedMetric, setSelectedMetric] = useState('all')
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    if (externalProducts) {
      setProducts(externalProducts)
      setLoading(false)
    } else {
      fetchData()
    }

    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good Morning')
    else if (hour < 18) setGreeting('Good Afternoon')
    else setGreeting('Good Evening')
    
    setCurrentTime(new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    }))

    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      }))
    }, 1000)

    const savedMode = localStorage.getItem('ultraModernDarkMode')
    if (savedMode) setDarkMode(savedMode === 'true')

    return () => clearInterval(timer)
  }, [externalProducts])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('ultraModernDarkMode', darkMode.toString())
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

  const categories = products.reduce((acc: any, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1
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

  // Fixed animation variants with proper typing
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.05,
        duration: 0.3
      }
    }
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Floating Controls */}
      <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setDarkMode(!darkMode)}
          className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700"
        >
          {darkMode ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-gray-700" />}
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700"
        >
          {viewMode === 'grid' ? <List className="h-5 w-5" /> : <Grid className="h-5 w-5" />}
        </motion.button>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Ultra-Modern Dashboard
                </h1>
                <Sparkles className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-gray-600 dark:text-gray-400 text-sm">{greeting}, James</p>
                <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                <p className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {currentTime}
                </p>
              </div>
            </motion.div>
            
            <motion.div 
              className="flex gap-3"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Link
                href="/products"
                className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700"
              >
                <Package className="h-4 w-4 inline mr-2" />
                Products
              </Link>
              <Link
                href="/products/add"
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg shadow-blue-500/25"
              >
                <Plus className="h-4 w-4 inline mr-2" />
                Add Product
              </Link>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Interactive Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Total Products', value: totalProducts, icon: Package, color: 'blue', trend: '+12%' },
              { label: 'Total Value', value: formatCurrency(totalValue), icon: DollarSign, color: 'green', trend: '+8%' },
              { label: 'Low Stock', value: lowStock, icon: AlertTriangle, color: 'yellow', trend: '-3%' },
              { label: 'Categories', value: Object.keys(categories).length, icon: Layers, color: 'purple', trend: '+2' }
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                onHoverStart={() => setHoveredCard(stat.label)}
                onHoverEnd={() => setHoveredCard(null)}
                className="relative overflow-hidden group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br from-${stat.color}-500/10 to-${stat.color}-600/5 dark:from-${stat.color}-500/20 dark:to-${stat.color}-600/10 rounded-xl transition-opacity duration-300 ${hoveredCard === stat.label ? 'opacity-100' : 'opacity-0'}`} />
                <div className="relative bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className={`h-5 w-5 text-${stat.color}-500`} />
                    <span className={`text-xs font-medium px-2 py-1 rounded-full bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                      {stat.trend}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stock Health Overview */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500" />
                Stock Health Overview
              </h2>
              <div className="flex gap-2">
                {['all', 'healthy', 'low', 'out'].map((metric) => (
                  <button
                    key={metric}
                    onClick={() => setSelectedMetric(metric)}
                    className={`px-3 py-1 text-xs rounded-full transition-all ${
                      selectedMetric === metric
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {metric.charAt(0).toUpperCase() + metric.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Healthy Stock</span>
                </div>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">{healthyStock}</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">{Math.round((healthyStock / totalProducts) * 100)}% of total</div>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Low Stock</span>
                </div>
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{lowStock}</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Need reorder soon</div>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Out of Stock</span>
                </div>
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">{outOfStock}</div>
                <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">Immediate attention</div>
              </div>
            </div>
          </motion.div>

          {/* Category Distribution */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Category Distribution
            </h2>
            <div className="space-y-3">
              {Object.entries(categories).map(([category, count]: [string, any], index) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300">{category}</span>
                    <span className="text-gray-500 dark:text-gray-400">{count} products</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / totalProducts) * 100}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recent Products */}
          <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-blue-500" />
                Recent Products
              </h2>
              <Link href="/products" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1">
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6'
              : 'divide-y divide-gray-200 dark:divide-gray-700'
            }>
              {products.slice(0, 6).map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => router.push(`/products/edit/${product.id}`)}
                  className={viewMode === 'grid'
                    ? 'group p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:shadow-md transition-all cursor-pointer border border-gray-200 dark:border-gray-600'
                    : 'p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors'
                  }
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {product.name}
                        </h3>
                        <div className={`px-2 py-0.5 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getStockColor(product.quantity, product.minstock)} flex items-center gap-1`}>
                          {getStockIcon(product.quantity, product.minstock)}
                          {product.quantity === 0 ? 'Out' : product.quantity <= (product.minstock || 10) ? 'Low' : 'In'}
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{product.description}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-gray-400 dark:text-gray-500">
                        <span>SKU: {product.sku}</span>
                        <span></span>
                        <span>{product.category}</span>
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="font-semibold text-gray-900 dark:text-white">{formatCurrency(product.price)}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{product.quantity} units</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-3"
          >
            {[
              { href: '/products/add', icon: Plus, label: 'Add Product', desc: 'Create new item', color: 'from-blue-500 to-blue-600' },
              { href: '/products', icon: Package, label: 'Manage', desc: 'Edit & update', color: 'from-purple-500 to-purple-600' },
              { href: '/reports', icon: FileText, label: 'Reports', desc: 'Export data', color: 'from-green-500 to-green-600' },
              { href: '/barcode', icon: Barcode, label: 'Barcode', desc: 'Generate codes', color: 'from-yellow-500 to-yellow-600' }
            ].map((action, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={action.href}
                  className="group block bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all text-center"
                >
                  <div className={`w-12 h-12 mx-auto mb-2 bg-gradient-to-r ${action.color} rounded-lg flex items-center justify-center shadow-lg`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {action.label}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{action.desc}</p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
