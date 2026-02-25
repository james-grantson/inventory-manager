'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Product {
  id: string
  name: string
  description: string
  price: number
  quantity: number
  sku: string
  category: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch('https://inventory-manager-api-ghana.vercel.app/api/products')
      const data = await response.json()
      
      console.log('API Response:', data)
      
      // Handle different API response formats
      let productsArray = []
      if (Array.isArray(data)) {
        productsArray = data
      } else if (data.products && Array.isArray(data.products)) {
        productsArray = data.products
      } else if (data.data && Array.isArray(data.data)) {
        productsArray = data.data
      } else {
        console.error('Unexpected API response format:', data)
        setError('Invalid data format from API')
        setProducts([])
        setLoading(false)
        return
      }
      
      setProducts(productsArray)
    } catch (err) {
      console.error('Error fetching products:', err)
      setError('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `GH${amount.toFixed(2)}`
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return
    
    try {
      await fetch(`https://inventory-manager-api-ghana.vercel.app/api/products/${id}`, {
        method: 'DELETE'
      })
      fetchProducts() // Refresh the list
    } catch (err) {
      console.error('Error deleting:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  // Calculate totals safely
  const totalProducts = products.length
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0)
  const lowStock = products.filter(p => p.quantity < 10).length

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <div className="space-x-4">
              <button
                onClick={fetchProducts}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Refresh
              </button>
              <Link
                href="/products/add"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Product
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-sm text-gray-600">Total Products</div>
            <div className="text-2xl font-bold mt-1">{totalProducts}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-sm text-gray-600">Total Value</div>
            <div className="text-2xl font-bold mt-1 text-green-600">
              {formatCurrency(totalValue)}
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-sm text-gray-600">Low Stock Items</div>
            <div className="text-2xl font-bold mt-1 text-yellow-600">
              {lowStock}
            </div>
          </div>
        </div>

        {/* Products Table */}
        {products.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <p className="text-gray-500 mb-4">No products found</p>
            <Link
              href="/products/add"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Your First Product
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.description}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{product.sku}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        product.quantity < 10 ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {product.quantity} units
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm space-x-3">
                      <button
                        onClick={() => router.push(`/products/edit/${product.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Debug info */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-sm">
          <p><strong>Debug:</strong> Products array length: {products.length}</p>
          <p><strong>API URL:</strong> https://inventory-manager-api-ghana.vercel.app/api/products</p>
          <button
            onClick={() => console.log('Products:', products)}
            className="mt-2 px-3 py-1 bg-gray-300 rounded text-xs"
          >
            Log to Console
          </button>
        </div>
      </div>
    </div>
  )
}
