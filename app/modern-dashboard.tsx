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
  BarChart3
} from 'lucide-react'

interface ModernDashboardProps {
  products?: any[]
}

export default function ModernDashboard({ products: externalProducts }: ModernDashboardProps) {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>(externalProducts || [])
  const [loading, setLoading] = useState(!externalProducts)
  const [greeting, setGreeting] = useState('')
  const [currentTime, setCurrentTime] = useState('')

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

    return () => clearInterval(timer)
  }, [externalProducts])

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
    if (quantity === 0) return 'bg-gradient-to-br from-red-500 to-red-600'
    if (quantity <= minstock) return 'bg-gradient-to-br from-yellow-500 to-yellow-600'
    return 'bg-gradient-to-br from-green-500 to-green-600'
  }

  const getStockIcon = (quantity: number, minstock: number = 10) => {
    if (quantity === 0) return <Minus className="h-3 w-3" />
    if (quantity <= minstock) return <TrendingDown className="h-3 w-3" />
    return <TrendingUp className="h-3 w-3" />
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100, damping: 12 }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 bg-white/10 backdrop-blur-lg rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <header className="relative backdrop-blur-xl bg-white/10 border-b border-white/10 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Modern Dashboard</h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-white/70 text-sm">{greeting}, James</p>
                <span className="w-1 h-1 rounded-full bg-white/30"></span>
                <p className="text-white/70 text-sm flex items-center gap-1">
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
                className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl transition-all border border-white/10"
              >
                <Package className="h-4 w-4 inline mr-2" />
                Products
              </Link>
              <Link
                href="/products/add"
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/25"
              >
                <Plus className="h-4 w-4 inline mr-2" />
                Add Product
              </Link>
            </motion.div>
          </div>
        </div>
      </header>

      <main className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div variants={itemVariants}>
              <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-all group">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/60 text-sm font-medium mb-2">Total Products</p>
                    <p className="text-3xl font-bold text-white">{totalProducts}</p>
                    <p className="text-white/40 text-xs mt-2">{totalItems} items in stock</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                    <Package className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1, delay: 0.5 }}
                  />
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-all group">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/60 text-sm font-medium mb-2">Total Value</p>
                    <p className="text-3xl font-bold text-white">{formatCurrency(totalValue)}</p>
                    <p className="text-white/40 text-xs mt-2">Current inventory value</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/25">
                    <DollarSign className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1, delay: 0.6 }}
                  />
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-all group">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/60 text-sm font-medium mb-2">Stock Health</p>
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-xl font-bold text-green-400">{healthyStock}</span>
                        <span className="text-white/40 text-xs ml-1">good</span>
                      </div>
                      <div>
                        <span className="text-xl font-bold text-yellow-400">{lowStock}</span>
                        <span className="text-white/40 text-xs ml-1">low</span>
                      </div>
                      <div>
                        <span className="text-xl font-bold text-red-400">{outOfStock}</span>
                        <span className="text-white/40 text-xs ml-1">out</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/25">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <div className="flex justify-between text-xs text-white/40">
                    <span>Stock Health</span>
                    <span>{Math.round((healthyStock / totalProducts) * 100)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${(healthyStock / totalProducts) * 100}%` }}
                      transition={{ duration: 1, delay: 0.7 }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-all group">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-white/60 text-sm font-medium mb-2">Categories</p>
                    <p className="text-3xl font-bold text-white">{Object.keys(categories).length}</p>
                    <p className="text-white/40 text-xs mt-2">Unique categories</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <Layers className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1, delay: 0.8 }}
                  />
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div variants={itemVariants}>
            <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-400" />
                  Category Distribution
                </h2>
              </div>
              <div className="space-y-4">
                {Object.entries(categories).map(([category, count]: [string, any], index) => (
                  <motion.div 
                    key={category}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white/80">{category}</span>
                      <span className="text-white/60">{count} products</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / totalProducts) * 100}%` }}
                        transition={{ duration: 1, delay: 0.2 * index }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/10 overflow-hidden">
              <div className="p-6 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-purple-400" />
                  Recent Products
                </h2>
                <Link href="/products" className="text-white/60 hover:text-white transition-colors text-sm flex items-center gap-1">
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              
              <div className="divide-y divide-white/10">
                {products.slice(0, 5).map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.05 * index }}
                    onClick={() => router.push(`/products/edit/${product.id}`)}
                    className="p-6 hover:bg-white/5 cursor-pointer transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-white">{product.name}</h3>
                          <div className={`px-2 py-0.5 rounded-full text-xs font-medium text-white flex items-center gap-1 ${getStockColor(product.quantity, product.minstock)}`}>
                            {getStockIcon(product.quantity, product.minstock)}
                            {product.quantity === 0 ? 'Out' : product.quantity <= (product.minstock || 10) ? 'Low' : 'In Stock'}
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-white/40">
                          <span>SKU: {product.sku}</span>
                          <span></span>
                          <span>{product.category}</span>
                          {product.supplier && (
                            <>
                              <span></span>
                              <span>{product.supplier}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 sm:ml-4">
                        <div className="text-right">
                          <div className="font-semibold text-white">{formatCurrency(product.price)}</div>
                          <div className="text-sm text-white/40">{product.quantity} units</div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-white/40 hover:text-white transition-colors" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { href: '/products/add', icon: Plus, label: 'Add Product', desc: 'Create new item', color: 'from-purple-500 to-pink-500' },
              { href: '/products', icon: Package, label: 'Manage', desc: 'Edit & update', color: 'from-blue-500 to-cyan-500' },
              { href: '/reports', icon: FileText, label: 'Reports', desc: 'Export data', color: 'from-green-500 to-emerald-500' },
              { href: '/barcode', icon: Barcode, label: 'Barcode', desc: 'Generate codes', color: 'from-yellow-500 to-orange-500' }
            ].map((action, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href={action.href}
                  className="backdrop-blur-xl bg-white/10 rounded-2xl p-6 border border-white/10 hover:bg-white/15 transition-all text-center block group"
                >
                  <div className={`w-12 h-12 mx-auto mb-3 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center shadow-lg`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-medium text-white group-hover:text-white transition-colors">{action.label}</h3>
                  <p className="text-sm text-white/40 mt-1">{action.desc}</p>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="flex flex-wrap items-center justify-end gap-4 text-sm"
          >
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-green-500 to-green-600"></div>
              <span className="text-white/60">Healthy Stock</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600"></div>
              <span className="text-white/60">Low Stock</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-500 to-red-600"></div>
              <span className="text-white/60">Out of Stock</span>
            </div>
          </motion.div>
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
