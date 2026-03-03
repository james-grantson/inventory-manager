'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-all duration-500 ${darkMode ? 'dark' : ''}`}>
      {/* Rich Gradient Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Animated Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%239C92AC" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        {/* Animated Blobs */}
        <div className="absolute top-0 -left-40 w-80 h-80 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-0 -right-40 w-80 h-80 bg-yellow-300 dark:bg-yellow-900 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-20 w-80 h-80 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-pink-400 to-orange-400 rounded-full filter blur-3xl opacity-20 animate-pulse animation-delay-1000"></div>
      </div>

      {/* Modern Sidebar */}
      <motion.aside 
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5, type: "spring" }}
        className={`fixed left-0 top-0 h-full ${sidebarCollapsed ? 'w-20' : 'w-64'} bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-r border-white/20 dark:border-gray-700/50 shadow-2xl transition-all duration-300 z-50`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-4 border-b border-white/20 dark:border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
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
                className="p-1 hover:bg-white/10 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronRight className={`h-5 w-5 text-gray-600 dark:text-gray-300 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
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
                      : 'text-gray-700 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-white/20 dark:border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <User className="h-5 w-5 text-white" />
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">James Grantson</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Admin</p>
                </div>
              )}
              {!sidebarCollapsed && (
                <button className="p-2 hover:bg-white/10 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <LogOut className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/50">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products, suppliers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/50 dark:bg-gray-700/50 border border-white/20 dark:border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-all placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-white/10 dark:hover:bg-gray-700 rounded-lg transition-colors relative">
                    <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    {notifications > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    )}
                  </button>
                  <button className="p-2 hover:bg-white/10 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    <Settings className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  </button>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2 hover:bg-white/10 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    {darkMode ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-gray-700" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="p-6 relative z-10">
          {/* Welcome Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                  {greeting}, James
                </h1>
                <p className="text-white/80 mt-1 drop-shadow">
                  Here's what's happening with your inventory today
                </p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  <span className="text-sm">Export</span>
                </button>
                <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg flex items-center gap-2">
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
                bgColor: 'bg-indigo-500/20',
                textColor: 'text-white',
                change: '+12.5%',
                trend: 'up'
              },
              { 
                label: 'Total Value', 
                value: formatCurrency(totalValue), 
                icon: DollarSign, 
                color: 'from-green-500 to-green-600',
                bgColor: 'bg-green-500/20',
                textColor: 'text-white',
                change: '+8.2%',
                trend: 'up'
              },
              { 
                label: 'Low Stock', 
                value: lowStock, 
                icon: AlertTriangle, 
                color: 'from-yellow-500 to-yellow-600',
                bgColor: 'bg-yellow-500/20',
                textColor: 'text-white',
                change: '-3.1%',
                trend: 'down'
              },
              { 
                label: 'Categories', 
                value: Object.keys(categories).length, 
                icon: Layers, 
                color: 'from-purple-500 to-purple-600',
                bgColor: 'bg-purple-500/20',
                textColor: 'text-white',
                change: '+2',
                trend: 'up'
              }
            ].map((stat, index) => (
              <div
                key={index}
                className="group relative"
              >
                <div className="absolute inset-0 bg-white/5 dark:bg-gray-800/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm" />
                <div className="relative bg-white/10 dark:bg-gray-800/10 backdrop-blur-md rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20 dark:border-gray-700/50">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 ${stat.bgColor} rounded-xl backdrop-blur-sm`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      stat.trend === 'up' 
                        ? 'bg-green-500/20 text-green-200' 
                        : 'bg-red-500/20 text-red-200'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-white/70 mt-1">{stat.label}</div>
                  </div>
                  <div className="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
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
            <div className="lg:col-span-2 bg-white/10 dark:bg-gray-800/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 dark:border-gray-700/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-indigo-300" />
                  Category Distribution
                </h2>
                <select className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-sm text-white">
                  <option className="bg-gray-800 text-white">This Month</option>
                  <option className="bg-gray-800 text-white">This Quarter</option>
                  <option className="bg-gray-800 text-white">This Year</option>
                </select>
              </div>
              <div className="space-y-4">
                {Object.entries(categories).map(([category, count]: [string, any], index) => (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-white">{category}</span>
                      <span className="text-sm text-white/70">{count} products</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full"
                          style={{ width: `${(count / totalProducts) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-white/70">{Math.round((count / totalProducts) * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stock Health Card */}
            <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/20 dark:border-gray-700/50">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
                <Activity className="h-5 w-5 text-indigo-300" />
                Stock Health
              </h2>
              <div className="space-y-6">
                <div className="relative pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      <span className="text-sm text-white">Healthy</span>
                    </div>
                    <span className="text-sm font-medium text-white">{healthyStock}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"
                      style={{ width: `${(healthyStock / totalProducts) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="relative pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <span className="text-sm text-white">Low Stock</span>
                    </div>
                    <span className="text-sm font-medium text-white">{lowStock}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"
                      style={{ width: `${(lowStock / totalProducts) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="relative pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <span className="text-sm text-white">Out of Stock</span>
                    </div>
                    <span className="text-sm font-medium text-white">{outOfStock}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full"
                      style={{ width: `${(outOfStock / totalProducts) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white">Overall Health</span>
                    <span className="text-lg font-bold text-white">
                      {Math.round((healthyStock / totalProducts) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Products Section */}
          <div className="bg-white/10 dark:bg-gray-800/10 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
            <div className="p-6 border-b border-white/20 dark:border-gray-700/50">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-indigo-300" />
                  Recent Products
                </h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {viewMode === 'grid' ? <List className="h-5 w-5 text-white" /> : <Grid className="h-5 w-5 text-white" />}
                  </button>
                  <Link href="/products" className="text-sm text-indigo-300 hover:text-indigo-200 flex items-center gap-1">
                    View all <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
            
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6'
              : 'divide-y divide-white/20 dark:divide-gray-700/50'
            }>
              {products.slice(0, 6).map((product, index) => (
                <div
                  key={product.id}
                  onClick={() => router.push(`/products/edit/${product.id}`)}
                  className={viewMode === 'grid'
                    ? 'group p-4 bg-white/5 dark:bg-gray-800/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer border border-white/20 dark:border-gray-700/50'
                    : 'p-4 hover:bg-white/5 cursor-pointer transition-colors'
                  }
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-white group-hover:text-indigo-300 transition-colors">
                          {product.name}
                        </h3>
                        <div className={`px-2 py-0.5 rounded-full text-xs font-medium text-white bg-gradient-to-r ${getStockColor(product.quantity, product.minstock)} flex items-center gap-1`}>
                          {getStockIcon(product.quantity, product.minstock)}
                          {product.quantity === 0 ? 'Out' : product.quantity <= (product.minstock || 10) ? 'Low' : 'In'}
                        </div>
                      </div>
                      <p className="text-sm text-white/70 line-clamp-1">{product.description}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-white/50">
                        <span>SKU: {product.sku}</span>
                        <span></span>
                        <span>{product.category}</span>
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      <div className="font-semibold text-white">{formatCurrency(product.price)}</div>
                      <div className="text-sm text-white/70">{product.quantity} units</div>
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
                  className="group block bg-white/10 dark:bg-gray-800/10 backdrop-blur-md rounded-xl p-4 border border-white/20 dark:border-gray-700/50 hover:bg-white/20 transition-all text-center"
                >
                  <div className={`w-14 h-14 mx-auto mb-3 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <action.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-medium text-white group-hover:text-indigo-300 transition-colors">
                    {action.label}
                  </h3>
                  <p className="text-xs text-white/70 mt-1">{action.desc}</p>
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
        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  )
}
