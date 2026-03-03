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
  Sun,
  ChevronRight,
  Star,
  Zap,
  Shield,
  Globe,
  Settings,
  Bell,
  Search,
  Filter,
  Download,
  Upload,
  RefreshCw,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  PieChart,
  LineChart,
  Users,
  CreditCard,
  Truck,
  Box,
  Home,
  LogOut,
  User
} from 'lucide-react'

interface PremiumDashboardProps {
  products?: any[]
}

export default function PremiumDashboard({ products: externalProducts }: PremiumDashboardProps) {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>(externalProducts || [])
  const [loading, setLoading] = useState(!externalProducts)
  const [greeting, setGreeting] = useState('')
  const [currentTime, setCurrentTime] = useState('')
  const [selectedMetric, setSelectedMetric] = useState('all')
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState(3)

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

    const savedMode = localStorage.getItem('premiumDarkMode')
    if (savedMode) setDarkMode(savedMode === 'true')

    return () => clearInterval(timer)
  }, [externalProducts])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('premiumDarkMode', darkMode.toString())
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

  const formatCurrency = (amount: number) => `GH₵${amount.toFixed(2)}`

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
        type: "spring" as const,
        stiffness: 300,
        damping: 20
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-800 flex items-center justify-center">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'dark bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'}`}>
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-80 h-80 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-40 w-80 h-80 bg-yellow-300 dark:bg-yellow-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-20 w-80 h-80 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Modern Sidebar */}
      <motion.aside 
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
        className={`fixed left-0 top-0 h-full ${sidebarCollapsed ? 'w-20' : 'w-64'} bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-r border-gray-200 dark:border-gray-700 shadow-2xl transition-all duration-300 z-50`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Box className="h-5 w-5 text-white" />
                </div>
                {!sidebarCollapsed && (
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="font-bold text-gray-900 dark:text-white"
                  >
                    Inventory Pro
                  </motion.span>
                )}
              </div>
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronRight className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {[
              { icon: Home, label: 'Dashboard', href: '/', active: true },
              { icon: Package, label: 'Products', href: '/products' },
              { icon: BarChart3, label: 'Analytics', href: '/reports' },
              { icon: Users, label: 'Suppliers', href: '/suppliers' },
              { icon: CreditCard, label: 'Orders', href: '/orders' },
              { icon: Settings, label: 'Settings', href: '/settings' },
            ].map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                    item.active 
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">James Grantson</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
                </div>
              )}
              {!sidebarCollapsed && (
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <LogOut className="h-4 w-4 text-gray-500" />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products, suppliers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors relative">
                    <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    {notifications > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                  </button>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Settings className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  </button>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    {darkMode ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-gray-600" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="p-6">
          {/* Welcome Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {greeting}, James
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Here's what's happening with your inventory today
                </p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  <span className="text-sm">Export</span>
                </button>
                <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  <span className="text-sm">Import</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { 
                label: 'Total Products', 
                value: totalProducts, 
                icon: Package, 
                color: 'from-indigo-500 to-indigo-600',
                bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
                textColor: 'text-indigo-600 dark:text-indigo-400',
                change: '+12.5%',
                trend: 'up'
              },
              { 
                label: 'Total Value', 
                value: formatCurrency(totalValue), 
                icon: DollarSign, 
                color: 'from-green-500 to-green-600',
                bgColor: 'bg-green-50 dark:bg-green-900/20',
                textColor: 'text-green-600 dark:text-green-400',
                change: '+8.2%',
                trend: 'up'
              },
              { 
                label: 'Low Stock', 
                value: lowStock, 
                icon: AlertTriangle, 
                color: 'from-yellow-500 to-yellow-600',
                bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
                textColor: 'text-yellow-600 dark:text-yellow-400',
                change: '-3.1%',
                trend: 'down'
              },
              { 
                label: 'Categories', 
                value: Object.keys(categories).length, 
                icon: Layers, 
                color: 'from-purple-500 to-purple-600',
                bgColor: 'bg-purple-50 dark:bg-purple-900/20',
                textColor: 'text-purple-600 dark:text-purple-400',
                change: '+2',
                trend: 'up'
              }
            ].map((stat, index) => (
              <div
                key={index}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/50 to-transparent dark:from-gray-800/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 ${stat.bgColor} rounded-xl`}>
                      <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      stat.trend === 'up' 
                        ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
                  </div>
                  <div className="mt-4 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${stat.color} rounded-full`}
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Category Distribution Card */}
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-indigo-500" />
                  Category Distribution
                </h2>
                <select className="px-3 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm">
                  <option>This Month</option>
                  <option>This Quarter</option>
                  <option>This Year</option>
                </select>
              </div>
              <div className="space-y-4">
                {Object.entries(categories).map(([category, count]: [string, any], index) => (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{category}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{count} products</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                          style={{ width: `${(count / totalProducts) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{Math.round((count / totalProducts) * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stock Health Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                <Activity className="h-5 w-5 text-indigo-500" />
                Stock Health
              </h2>
              <div className="space-y-6">
                <div className="relative pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Healthy</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{healthyStock}</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                      style={{ width: `${(healthyStock / totalProducts) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="relative pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Low Stock</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{lowStock}</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full"
                      style={{ width: `${(lowStock / totalProducts) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="relative pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Out of Stock</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{outOfStock}</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                      style={{ width: `${(outOfStock / totalProducts) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Overall Health</span>
                    <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                      {Math.round((healthyStock / totalProducts) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Products Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-indigo-500" />
                  Recent Products
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    {viewMode === 'grid' ? <List className="h-5 w-5" /> : <Grid className="h-5 w-5" />}
                  </button>
                  <Link href="/products" className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1">
                    View all <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
            
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6'
              : 'divide-y divide-gray-200 dark:divide-gray-700'
            }>
              {products.slice(0, 6).map((product, index) => (
                <div
                  key={product.id}
                  onClick={() => router.push(`/products/edit/${product.id}`)}
                  className={viewMode === 'grid'
                    ? 'group p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl hover:shadow-lg transition-all cursor-pointer border border-gray-200 dark:border-gray-600'
                    : 'p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors'
                  }
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
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
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[
              { href: '/products/add', icon: Plus, label: 'Add Product', desc: 'Create new item', color: 'from-indigo-500 to-indigo-600' },
              { href: '/products', icon: Package, label: 'Manage', desc: 'Edit & update', color: 'from-purple-500 to-purple-600' },
              { href: '/reports', icon: FileText, label: 'Reports', desc: 'Export data', color: 'from-green-500 to-green-600' },
              { href: '/barcode', icon: Barcode, label: 'Barcode', desc: 'Generate codes', color: 'from-yellow-500 to-yellow-600' }
            ].map((action, index) => (
              <div key={index}>
                <Link
                  href={action.href}
                  className="group block bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all text-center"
                >
                  <div className={`w-14 h-14 mx-auto mb-3 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <action.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {action.label}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{action.desc}</p>
                </Link>
              </div>
            ))}
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
