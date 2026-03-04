'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Image as ImageIcon,
  Package,
  RefreshCw,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react'

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'table' | 'gallery'>('table')
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [searchQuery, products])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`)
      const data = await res.json()
      console.log('Fetched products:', data.products) // Debug log
      setProducts(data.products || [])
      setFilteredProducts(data.products || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterProducts = () => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = products.filter(p => 
      p.name?.toLowerCase().includes(query) ||
      p.sku?.toLowerCase().includes(query) ||
      p.category?.toLowerCase().includes(query)
    )
    setFilteredProducts(filtered)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${id}`, {
        method: 'DELETE'
      })
      fetchProducts()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleImageError = (productId: string) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }))
  }

  const formatCurrency = (amount: number) => `GH${amount.toFixed(2)}`

  const getStockStatus = (quantity: number, minstock: number) => {
    if (quantity === 0) return { label: 'Out of Stock', class: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' }
    if (quantity <= minstock) return { label: 'Low Stock', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300' }
    return { label: 'In Stock', class: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-light dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-light dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {filteredProducts.length} products found
            </p>
          </div>
          
          <div className="flex gap-3">
            {/* View Toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 border border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'table' 
                    ? 'bg-white dark:bg-gray-700 shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                title="Table View"
              >
                <TableIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('gallery')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'gallery' 
                    ? 'bg-white dark:bg-gray-700 shadow-sm' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                title="Gallery View"
              >
                <LayoutGrid className="h-5 w-5" />
              </button>
            </div>

            <Link
              href="/products/add"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
            >
              <Plus className="h-5 w-5" />
              Add Product
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name, SKU, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Products Display */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No products found</p>
          </div>
        ) : viewMode === 'table' ? (
          /* Table View */
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Image</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Product</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">SKU</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Price</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Stock</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredProducts.map((product) => {
                    const status = getStockStatus(product.quantity, product.minstock)
                    const hasImage = product.image_url && !imageErrors[product.id]
                    
                    return (
                      <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <td className="px-6 py-4">
                          {hasImage ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                              onError={() => handleImageError(product.id)}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700">
                              <ImageIcon className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{product.name}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{product.sku}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{product.category}</td>
                        <td className="px-6 py-4 font-medium text-green-600 dark:text-green-400">{formatCurrency(product.price)}</td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{product.quantity}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.class}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => router.push(`/products/edit/${product.id}`)}
                              className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-blue-600 dark:text-blue-400"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-red-600 dark:text-red-400"
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
          </div>
        ) : (
          /* Gallery View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const status = getStockStatus(product.quantity, product.minstock)
              const hasImage = product.image_url && !imageErrors[product.id]
              
              return (
                <div
                  key={product.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
                  onClick={() => router.push(`/products/edit/${product.id}`)}
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gray-100 dark:bg-gray-900">
                    {hasImage ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={() => handleImageError(product.id)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.class}`}>
                        {status.label}
                      </span>
                    </div>

                    {/* Quick Actions */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/products/edit/${product.id}`)
                        }}
                        className="p-3 bg-white rounded-full hover:bg-gray-100 transition-colors"
                        title="Edit"
                      >
                        <Edit className="h-5 w-5 text-gray-700" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(product.id)
                        }}
                        className="p-3 bg-white rounded-full hover:bg-gray-100 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5 text-red-600" />
                      </button>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                      SKU: {product.sku}  {product.category}
                    </p>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(product.price)}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Stock: {product.quantity}
                      </span>
                    </div>

                    {product.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={fetchProducts}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg flex items-center gap-2 transition-colors border border-gray-200 dark:border-gray-700"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Products
          </button>
        </div>
      </div>
    </div>
  )
}
