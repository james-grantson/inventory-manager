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

  // Fixed animation variants with correct types
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        duration: 0.5
      }
    }
  }

  const itemVariants: Variants = {
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

            {/* Rest of the dashboard content remains the same */}
            {/* ... keep all other cards and sections ... */}
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
