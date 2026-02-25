"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase, checkAuth } from '@/lib/supabase-client'

interface Product {
  id: string
  name: string
  category: string
  quantity: number
  price: number
  currency: string
  sku: string
  barcode?: string
  description?: string
  supplier?: string
  minimum_stock: number
  location?: string
  created_at: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    loadUserAndProducts()
  }, [])

  const loadUserAndProducts = async () => {
    try {
      // Check auth
      const { session } = await checkAuth()
      setUser(session?.user || null)
      
      // Load products
      await loadProducts()
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadProducts = async () => {
    try {
      const response = await fetch('https://inventory-manager-api-ghana.vercel.app/api/products')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
      
      // Fallback to showing empty state
      setProducts([])
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return
    }

    try {
      const response = await fetch(`https://inventory-manager-api-ghana.vercel.app/api/products/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        // Refresh the product list
        await loadProducts()
      } else {
        console.error('Failed to delete product')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const formatCurrency = (amount: number, currency: string = 'GHS') => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const getStockStatus = (quantity: number, minimum: number) => {
    if (quantity === 0) return 'out-of-stock'
    if (quantity < minimum) return 'low-stock'
    return 'in-stock'
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Inventory Products</h1>
              <p className="text-gray-600 mt-2">
                {user ? `Welcome, ${user.email}` : 'Manage your inventory items'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/products/add"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                + Add Product
              </Link>
              {user && (
                <button
                  onClick={() => supabase.auth.signOut()}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="text-sm text-gray-500">Total Products</div>
              <div className="text-2xl font-bold mt-1">{products.length}</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="text-sm text-gray-500">Total Value</div>
              <div className="text-2xl font-bold mt-1">
                {formatCurrency(products.reduce((sum, p) => sum + (p.price * p.quantity), 0))}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="text-sm text-gray-500">Low Stock</div>
              <div className="text-2xl font-bold text-amber-600 mt-1">
                {products.filter(p => p.quantity < p.minimum_stock).length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm">
              <div className="text-sm text-gray-500">Out of Stock</div>
              <div className="text-2xl font-bold text-red-600 mt-1">
                {products.filter(p => p.quantity === 0).length}
              </div>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
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
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-500">
                        <p className="text-lg">No products found</p>
                        <p className="mt-2">Add your first product to get started</p>
                        <Link
                          href="/products/add"
                          className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Add Product
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.sku}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                          {product.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className={`px-3 py-1 text-xs rounded-full ${
                            getStockStatus(product.quantity, product.minimum_stock) === 'out-of-stock'
                              ? 'bg-red-100 text-red-800'
                              : getStockStatus(product.quantity, product.minimum_stock) === 'low-stock'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {product.quantity} units
                          </span>
                          {product.quantity < product.minimum_stock && (
                            <span className="ml-2 text-xs text-amber-600">
                              (Low stock)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {formatCurrency(product.price, product.currency)}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {product.location || 'Not specified'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <Link
                            href={`/products/edit?id=${product.id}`}
                            className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* PDF Report Button */}
        <div className="mt-8 text-center">
          <a
            href="https://inventory-manager-api-ghana.vercel.app/api/products/report/pdf"
            target="_blank"
            className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
             Generate PDF Report
          </a>
          <p className="text-sm text-gray-500 mt-2">
            Click to download a comprehensive inventory report
          </p>
        </div>
      </div>
    </div>
  )
}

