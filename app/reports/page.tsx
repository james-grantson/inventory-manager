'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, FileText, BarChart3, Download, RefreshCw, Store } from 'lucide-react'
import PDFReportGenerator from '@/app/components/PDFReportGenerator'
import AuthGuard from '@/app/components/AuthGuard'
import { useApi } from '@/lib/api'
import { useOrganization } from '@/contexts/OrganizationContext'
import { useRouter } from 'next/navigation'

export default function ReportsPage() {
  const router = useRouter()
  const { apiFetch } = useApi()
  const { currentOrganization } = useOrganization()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (currentOrganization) {
      fetchProducts()
    } else {
      setLoading(false)
      setError('No store selected. Please select or create a store.')
    }
  }, [currentOrganization])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await apiFetch('/api/products')
      const data = await res.json()
      setProducts(data.products || [])
    } catch (error: any) {
      console.error('Error fetching products:', error)
      setError(error.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  // Handle loading and no organization
  if (!currentOrganization && !loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-light dark:bg-gray-900 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center max-w-md">
            <Store className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Store Selected</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{error || 'Please select or create a store to generate reports.'}</p>
            <Link
              href="/admin/organizations"
              className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg"
            >
              Manage Stores
            </Link>
          </div>
        </div>
      </AuthGuard>
    )
  }

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-light dark:bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
        </div>
      </AuthGuard>
    )
  }

  if (error) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-light dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <FileText className="h-10 w-10 text-red-600 dark:text-red-400" />
            </div>
            <p className="text-gray-900 dark:text-white mb-4">{error}</p>
            <button
              onClick={fetchProducts}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-light dark:bg-gray-900 transition-colors duration-300">
        <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link
                  href="/"
                  className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </Link>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Generate professional PDF reports</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {currentOrganization && (
                  <div className="text-sm text-gray-600 dark:text-gray-400 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    Store: <span className="font-semibold text-purple-600 dark:text-purple-400">{currentOrganization.name}</span>
                  </div>
                )}
                <button
                  onClick={fetchProducts}
                  className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Refresh Data"
                >
                  <RefreshCw className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <PDFReportGenerator products={products} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Download className="h-5 w-5 text-purple-600" />
              Recent Reports
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No reports generated yet. Use the generator above to create your first report.
            </p>
          </motion.div>
        </main>
      </div>
    </AuthGuard>
  )
}