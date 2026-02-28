"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import CurrencySelector, { formatCurrency } from '@/components/CurrencySelector'

interface ProductFormData {
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
}

export default function AddProductPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    category: '',
    quantity: 0,
    price: 0,
    currency: 'GHS',
    sku: '',
    barcode: '',
    description: '',
    supplier: '',
    minimum_stock: 10,
    location: '',
  })
  const [loading, setLoading] = useState(false)
  const [useCustomCategory, setUseCustomCategory] = useState(false)`n  const [error, setError] = useState('')

  // Auto-generate SKU on name change
  useEffect(() => {
    if (formData.name && !formData.sku) {
      const sku = formData.name
        .toUpperCase()
        .replace(/\s+/g, '-')
        .replace(/[^A-Z0-9-]/g, '')
        .substring(0, 20) + '-' + Date.now().toString().slice(-4)
      setFormData(prev => ({ ...prev, sku }))
    }
  }, [formData.name])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('https://inventory-manager-api-ghana.vercel.app/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to add product')
      }

      // Success - redirect to products page
      router.push('/products')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }))
  }

  const handleCurrencyChange = (currencyCode: string) => {
    setFormData(prev => ({ ...prev, currency: currencyCode }))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <Link
            href="/products"
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
             Back to Products
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Add New Product</h1>
          <p className="text-gray-600 mt-2">Add a new item to your inventory</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Premium Cocoa Beans"
                  required
                />
              </div>

              {/* Category */}
                          <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <div className="space-y-2">
                {!useCustomCategory ? (
                  <div className="flex gap-2">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="flex-1 p-2 border rounded"
                    >
                      <option value="">Select Category</option>
                      <option value="Automobile Lubricants">Automobile Lubricants</option>
                      <option value="Automobile Parts">Automobile Parts</option>
                      <option value="Building Materials">Building Materials</option>
                      <option value="Automotive">Automotive</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Food">Food</option>
                      <option value="Beverages">Beverages</option>
                      <option value="Other">Other</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => setUseCustomCategory(true)}
                      className="px-3 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200"
                      title="Add custom category"
                    >
                       Custom
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      placeholder="Enter custom category"
                      className="flex-1 p-2 border rounded"
                    />
                    <button
                      type="button"
                      onClick={() => setUseCustomCategory(false)}
                      className="px-3 py-2 text-sm bg-gray-100 rounded hover:bg-gray-200"
                    >
                       Select
                    </button>
                  </div>
                )}
              </div>
            </div>

              {/* SKU (Auto-generated) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU (Stock Keeping Unit)
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
                  placeholder="Auto-generated"
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">Auto-generated from product name</p>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Minimum Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Stock Level
                </label>
                <input
                  type="number"
                  name="minimum_stock"
                  value={formData.minimum_stock}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Alert when stock falls below this level
                </p>
              </div>

              {/* Price and Currency */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pl-12"
                      required
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                      {formData.currency === 'GHS' ? 'GH' : 
                       formData.currency === 'USD' ? '$' :
                       formData.currency === 'EUR' ? '' :
                       formData.currency === 'GBP' ? '' :
                       formData.currency === 'NGN' ? '' : ''}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Total value: {formatCurrency(formData.price * formData.quantity, formData.currency)}
                  </p>
                </div>

                <div>
                  <CurrencySelector
                    value={formData.currency}
                    onChange={handleCurrencyChange}
                    showLabel={true}
                  />
                </div>
              </div>

              {/* Supplier */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier
                </label>
                <input
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Supplier name"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Storage Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Warehouse A, Shelf B3"
                />
              </div>

              {/* Barcode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Barcode
                </label>
                <input
                  type="text"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Optional barcode"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Product description, notes, specifications..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                href="/products"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                {loading ? 'Adding Product...' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}



