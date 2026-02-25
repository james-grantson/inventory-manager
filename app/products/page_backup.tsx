"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import CurrencyDisplay from '../components/CurrencyDisplay'

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])

  // Fetch products from API
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('https://inventory-manager-api-ghana.vercel.app/api/products')
      
      if (response.ok) {
        const data = await response.json()
        console.log('API Response:', data)
        setProducts(data.products || data || [])
        setFilteredProducts(data.products || data || [])
      } else {
        console.error('API failed:', response.status)
        setProducts([])
        setFilteredProducts([])
      }
    } catch (error) {
      console.error('Fetch error:', error)
      setProducts([])
      setFilteredProducts([])
    } finally {
      setLoading(false)
    }
  }

  const deleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`https://inventory-manager-api-ghana.vercel.app/api/products/${productId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert(` Product "${productName}" deleted successfully!`)
        // Refresh the products list
        fetchProducts()
      } else {
        const errorData = await response.json()
        alert(` Error: ${errorData.error || 'Failed to delete product'}`)
      }
    } catch (error: any) {
      alert(` Network error: ${error.message}`)
    }
  }

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredProducts(products)
    } else {
      const filtered = products.filter(product =>
        product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product?.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product?.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product?.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredProducts(filtered)
    }
  }, [searchTerm, products])

  const calculateProfit = (price: number, cost: number, quantity: number) => {
    const profitPerItem = price - cost
    const totalProfit = profitPerItem * quantity
    const profitMargin = cost > 0 ? (profitPerItem / cost) * 100 : 0
    return { profitPerItem, totalProfit, profitMargin }
  }

  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity === 0) return { text: 'Out of Stock', color: 'bg-red-100 text-red-800' }
    if (quantity <= minStock) return { text: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' }
    return { text: 'In Stock', color: 'bg-green-100 text-green-800' }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
          <button 
            onClick={fetchProducts}
            className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
          >
            Retry Loading
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Products Inventory</h1>
              <p className="text-gray-600">Manage your products and inventory</p>
              <p className="text-sm text-gray-500 mt-1">
                Backend: inventory-manager-api-ghana.vercel.app
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              >
                 Dashboard
              </button>
              <button
                onClick={() => router.push('/products/add')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                + Add New Product
              </button>
              <button
                onClick={fetchProducts}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                 Refresh
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Stats */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search products by name, SKU, category, or supplier..."
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Clear Search
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl shadow border">
              <div className="text-sm text-gray-600">Total Products</div>
              <div className="text-2xl font-bold text-gray-800">{products.length}</div>
              <div className="text-xs text-gray-500 mt-1">From API</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow border">
              <div className="text-sm text-gray-600">Total Value</div>
              <div className="text-2xl font-bold text-green-600">
                <CurrencyDisplay amount={products.reduce((sum, p) => sum + (p.price * p.quantity), 0)} />
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow border">
              <div className="text-sm text-gray-600">Low Stock Items</div>
              <div className="text-2xl font-bold text-yellow-600">
                {products.filter(p => p.quantity <= p.minStock && p.quantity > 0).length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow border">
              <div className="text-sm text-gray-600">Out of Stock</div>
              <div className="text-2xl font-bold text-red-600">
                {products.filter(p => p.quantity === 0).length}
              </div>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  if (!product) return null
                  
                  const profit = calculateProfit(product.price || 0, product.cost || 0, product.quantity || 0)
                  const stockStatus = getStockStatus(product.quantity || 0, product.minStock || 10)
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600">
                              {product.category === 'Automobile Lubricants' && ''}
                              {product.category === 'Automobile Parts' && ''}
                              {product.category === 'Building Materials' && ''}
                              {!['Automobile Lubricants', 'Automobile Parts', 'Building Materials'].includes(product.category) && ''}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name || 'Unnamed Product'}
                            </div>
                            <div className="text-sm text-gray-500">
                              SKU: {product.sku || 'No SKU'} | ID: {product.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {product.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          <CurrencyDisplay amount={product.price || 0} />
                        </div>
                        {product.cost > 0 && (
                          <div className="text-sm text-gray-500">
                            Cost: <CurrencyDisplay amount={product.cost} />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.quantity || 0} units
                        </div>
                        <div className="text-sm">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${stockStatus.color}`}>
                            {stockStatus.text}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Min: {product.minStock || 10}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-medium text-green-600">
                            <CurrencyDisplay amount={profit.totalProfit} />
                          </div>
                          <div className={`text-xs ${profit.profitMargin > 30 ? 'text-green-600' : profit.profitMargin > 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {profit.profitMargin.toFixed(1)}% margin
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => router.push(`/products/edit?id=${product.id}`)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => deleteProduct(product.id, product.name || 'this product')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-5xl mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {products.length === 0 ? 'No products found' : 'No matching products'}
              </h3>
              <p className="text-gray-500 mb-4">
                {products.length === 0 
                  ? 'Add your first product to get started' 
                  : 'Try a different search term'}
              </p>
              {products.length === 0 && (
                <button
                  onClick={() => router.push('/products/add')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  + Add First Product
                </button>
              )}
            </div>
          )}

          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {filteredProducts.length} of {products.length} products
                <div className="text-xs mt-1">API: inventory-manager-api-ghana.vercel.app</div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={fetchProducts}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  Refresh Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
