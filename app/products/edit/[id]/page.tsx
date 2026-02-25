'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string
  
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: 'Other',
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

  useEffect(() => {
    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      setError('')
      console.log(` Fetching product ${productId}...`)
      
      const response = await fetch(`https://inventory-manager-api-ghana.vercel.app/api/products/${productId}`)
      console.log(' Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log(' Product data:', data)
        
        const productData = data.product || data
        setProduct(productData)
        
        setFormData({
          name: productData.name || '',
          sku: productData.sku || '',
          description: productData.description || '',
          category: productData.category || 'Other',
          price: productData.price?.toString() || productData.selling_price?.toString() || '',
          cost: productData.cost?.toString() || productData.cost_price?.toString() || '',
          quantity: productData.quantity?.toString() || productData.stock?.toString() || '',
          minStock: productData.minStock?.toString() || productData.minimum_stock?.toString() || '10',
          supplier: productData.supplier || '',
          location: productData.location || ''
        })
      } else {
        const errorText = await response.text()
        console.error(' Failed to fetch product:', errorText)
        setError(`Failed to load product: ${response.status}`)
      }
    } catch (error) {
      console.error(' Error fetching product:', error)
      setError('Error loading product data')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      setError('')
      
      // Prepare data for API
      const updateData: any = {
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

      console.log('?? Sending update to API:', {
        url: `https://inventory-manager-api-ghana.vercel.app/api/products/${productId}`,
        method: 'PATCH',
        data: updateData
      })

      // Try PATCH first
      let response = await fetch(`https://inventory-manager-api-ghana.vercel.app/api/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      })

      console.log(' PATCH response status:', response.status)

      // If PATCH fails with 404, try PUT
      if (response.status === 404) {
        console.log(' PATCH not supported, trying PUT...')
        response = await fetch(`https://inventory-manager-api-ghana.vercel.app/api/products/${productId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData)
        })
        console.log(' PUT response status:', response.status)
      }

      const data = await response.json()
      console.log(' Update response:', data)
      
      if (response.ok) {
        alert(` Product updated successfully!`)
        
        // Navigate back to products page
        router.push('/products')
        
        // Force a refresh of the products page
        setTimeout(() => {
          router.refresh()
        }, 100)
      } else {
        console.error(' Update failed:', data)
        setError(data.error || data.message || 'Failed to update product')
        alert(` Error: ${data.error || data.message || 'Failed to update product'}`)
      }
    } catch (error: any) {
      console.error(' Network error:', error)
      setError(`Network error: ${error.message}`)
      alert(` Network error: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-600 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/products')}
                className="text-white hover:bg-blue-700 p-2 rounded-lg"
              >
                 Back to Products
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">Edit Product</h1>
                <p className="text-blue-100 text-sm">ID: {productId}</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="border-b pb-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Basic Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      SKU
                    </label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selling Price (GHS) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        GH?
                      </span>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                        step="0.01"
                        min="0"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cost Price (GHS)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        GH
                      </span>
                      <input
                        type="number"
                        name="cost"
                        value={formData.cost}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                      min="0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Minimum Stock Level
                    </label>
                    <input
                      type="number"
                      name="minStock"
                      value={formData.minStock}
                      onChange={handleChange}
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Supplier & Location */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Supplier & Location</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Profit Preview */}
              {formData.price && formData.cost && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-700 mb-2">Profit Preview</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Profit per unit</p>
                      <p className={`text-lg font-bold ${parseFloat(formData.price) > parseFloat(formData.cost) ? 'text-green-600' : 'text-red-600'}`}>
                        GH?{(parseFloat(formData.price) - parseFloat(formData.cost)).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Profit margin</p>
                      <p className={`text-lg font-bold ${parseFloat(formData.price) > parseFloat(formData.cost) ? 'text-green-600' : 'text-red-600'}`}>
                        {parseFloat(formData.cost) > 0 
                          ? `${((parseFloat(formData.price) - parseFloat(formData.cost)) / parseFloat(formData.cost) * 100).toFixed(1)}%`
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex flex-col md:flex-row gap-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => router.push('/products')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={fetchProduct}
                  className="px-6 py-3 bg-gray-100 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-200 font-medium"
                  disabled={saving}
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium md:ml-auto disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                      Updating...
                    </>
                  ) : 'Update Product'}
                </button>
              </div>
            </form>
          </div>

          {/* Debug Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="font-semibold text-blue-800 mb-3"> Debug Information</h3>
            <div className="space-y-2 text-sm text-blue-700">
              <p><strong>Product ID:</strong> {productId}</p>
              <p><strong>Update Endpoint:</strong> PATCH /api/products/{productId}</p>
              <p><strong>Fallback Endpoint:</strong> PUT /api/products/{productId}</p>
              <button 
                onClick={() => {
                  console.log('Current form data:', formData)
                  console.log('Original product:', product)
                }}
                className="px-3 py-1 bg-blue-200 rounded text-xs"
              >
                Log Data to Console
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
