"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddProduct() {
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: 'Automobile Lubricants',
    price: '',
    cost: '',
    quantity: '',
    minStock: '10',
    supplier: '',
    location: ''
  })

  const [categories] = useState([
    'Automobile Lubricants',
    'Automobile Parts', 
    'Building Materials',
    'Other'
  ])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Prepare data for API
      const productData = {
        name: formData.name,
        sku: formData.sku,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price) || 0,
        cost: parseFloat(formData.cost) || 0,
        quantity: parseInt(formData.quantity) || 0,
        minStock: parseInt(formData.minStock) || 10,
        supplier: formData.supplier,
        location: formData.location
      }

      // Call backend API
      const response = await fetch('https://inventory-manager-api-ghana.vercel.app/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData)
      })

      if (response.ok) {
        const data = await response.json()
        alert(` ${data.message}\nNew Product ID: ${data.product.id}`)
        router.push('/products')
      } else {
        const errorData = await response.json()
        alert(` Error: ${errorData.error || 'Failed to create product'}`)
      }
    } catch (error: any) {
      alert(` Network error: ${error.message}`)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      description: '',
      category: 'Automobile Lubricants',
      price: '',
      cost: '',
      quantity: '',
      minStock: '10',
      supplier: '',
      location: ''
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-green-600 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/products')}
                className="text-white hover:bg-green-700 p-2 rounded-lg"
              >
                ← Back to Products
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">Add New Product</h1>
                <p className="text-green-100 text-sm">Create a new inventory item</p>
              </div>
            </div>
            <button 
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-gray-100 font-medium"
            >
              Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="border-b pb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Basic Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., Engine Oil 5W-30"
                    />
                  </div>

                  <div>
                    <label htmlFor="sku" className="block text-sm font-medium text-gray-700 mb-2">
                      SKU (Stock Keeping Unit)
                    </label>
                    <input
                      type="text"
                      id="sku"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., OIL-5W30-001"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Product details, specifications, or notes"
                  />
                </div>

                <div className="mt-6">
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing & Stock */}
              <div className="border-b pb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Pricing & Stock</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                      Selling Price (GHS) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        GH
                      </span>
                      <input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        step="0.01"
                        min="0"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-2">
                      Cost Price (GHS)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        GH₵
                      </span>
                      <input
                        type="number"
                        id="cost"
                        name="cost"
                        value={formData.cost}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                      Initial Quantity *
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label htmlFor="minStock" className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Stock Level
                    </label>
                    <input
                      type="number"
                      id="minStock"
                      name="minStock"
                      value={formData.minStock}
                      onChange={handleChange}
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="10"
                    />
                  </div>
                </div>
              </div>

              {/* Supplier & Location */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Supplier & Location</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="supplier" className="block text-sm font-medium text-gray-700 mb-2">
                      Supplier
                    </label>
                    <input
                      type="text"
                      id="supplier"
                      name="supplier"
                      value={formData.supplier}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., Shell Ghana Ltd"
                    />
                  </div>

                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                      Storage Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., Shelf A3, Warehouse 1"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col md:flex-row gap-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => router.push('/products')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Clear Form
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium md:ml-auto"
                >
                  Create Product
                </button>
              </div>
            </form>
          </div>

          {/* Quick Tips */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h3 className="font-semibold text-green-800 mb-3">💡 Quick Tips</h3>
            <ul className="space-y-2 text-green-700">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Fields marked with * are required</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>SKU should be unique for each product</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Set minimum stock level to get alerts when inventory is low</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Cost price helps calculate profit margins</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
