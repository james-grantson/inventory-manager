'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    price: '',
    cost: '',
    quantity: '',
    min_stock: '10',  // Changed from minStock to min_stock
    supplier: '',
    location: ''
  })

  const categories = [
    'Automobile Lubricants',
    'Automobile Parts',
    'Building Materials',
    'Automotive',
    'Electronics',
    'Clothing',
    'Food',
    'Beverages',
    'Other'
  ]

  useEffect(() => {
    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}`)
      if (!response.ok) throw new Error('Failed to fetch')
      
      const data = await response.json()
      const product = data.product || data
      
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        description: product.description || '',
        category: product.category || '',
        price: product.price?.toString() || '',
        cost: product.cost?.toString() || '',
        quantity: product.quantity?.toString() || '',
        min_stock: product.min_stock?.toString() || product.minStock?.toString() || '10',
        supplier: product.supplier || '',
        location: product.location || ''
      })
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const calculateProfit = () => {
    const selling = parseFloat(formData.price) || 0
    const cost = parseFloat(formData.cost) || 0
    const profit = selling - cost
    const margin = cost > 0 ? (profit / cost) * 100 : 0
    return { profit, margin }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      // Use database column names (with underscores)
      const updateData = {
        name: formData.name,
        sku: formData.sku,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price) || 0,
        cost: parseFloat(formData.cost) || 0,
        quantity: parseInt(formData.quantity) || 0,
        min_stock: parseInt(formData.min_stock) || 10,  // Changed to min_stock
        supplier: formData.supplier,
        location: formData.location
      }

      console.log('Sending update:', updateData)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      const responseData = await response.json()
      
      if (response.ok) {
        alert(' Product updated successfully!')
        router.push('/products')
        router.refresh()
      } else {
        throw new Error(responseData.error || responseData.message || 'Update failed')
      }
    } catch (error: any) {
      console.error('Update error:', error)
      setError(error.message || 'Failed to update')
      alert(' Error: ' + (error.message || 'Update failed'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  const { profit, margin } = calculateProfit()
  const profitColor = profit >= 0 ? 'text-green-600' : 'text-red-600'

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">SKU</label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Selling Price (GHS) *</label>
                <input
                  type="number"
                  step="0.01"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cost Price (GHS)</label>
                <input
                  type="number"
                  step="0.01"
                  name="cost"
                  value={formData.cost}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            {formData.price && formData.cost && (
              <div className="bg-gray-50 p-3 rounded">
                <div className="text-sm font-medium">Profit Preview:</div>
                <div className={`text-lg font-bold ${profitColor}`}>
                  GH{profit.toFixed(2)} ({margin.toFixed(1)}% margin)
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Quantity *</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Minimum Stock</label>
                <input
                  type="number"
                  name="min_stock"  // Changed from minStock to min_stock
                  value={formData.min_stock}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Supplier</label>
                <input
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Storage Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push('/products')}
                className="px-6 py-2 border rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
