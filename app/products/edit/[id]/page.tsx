'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Trash2, Image as ImageIcon, CheckCircle } from 'lucide-react'
import ImageUpload from '@/app/components/ImageUpload'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [imageUrl, setImageUrl] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    category: '',
    price: '',
    cost: '',
    quantity: '',
    minstock: '10',
    supplier: '',
    location: ''
  })

  useEffect(() => {
    fetchProduct()
  }, [])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const productId = params.id
      console.log('Fetching product ID:', productId)
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}`)
      
      if (!res.ok) {
        throw new Error('Failed to fetch product')
      }
      
      const product = await res.json()
      console.log('Product data received:', product)
      
      // Populate all form fields with product data
      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        description: product.description || '',
        category: product.category || '',
        price: product.price?.toString() || '',
        cost: product.cost?.toString() || '',
        quantity: product.quantity?.toString() || '',
        minstock: product.minstock?.toString() || '10',
        supplier: product.supplier || '',
        location: product.location || ''
      })
      
      // Set image if exists
      if (product.image_url) {
        setImageUrl(product.image_url)
      }
      
    } catch (err) {
      console.error('Error fetching product:', err)
      setError('Failed to load product data')
    } finally {
      setLoading(false)
    }
  }

  const generateSKU = () => {
    const prefix = formData.category ? formData.category.substring(0, 3).toUpperCase() : 'PRD'
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `${prefix}-${random}`
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccessMessage('')

    try {
      // Validate required fields
      if (!formData.name || !formData.category || !formData.price || !formData.cost || !formData.quantity) {
        throw new Error('Please fill in all required fields')
      }

      const productData = {
        name: formData.name,
        sku: formData.sku || generateSKU(),
        description: formData.description || '',
        category: formData.category,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost),
        quantity: parseInt(formData.quantity),
        minstock: parseInt(formData.minstock) || 10,
        supplier: formData.supplier || '',
        location: formData.location || '',
        image_url: imageUrl || null
      }

      console.log('Updating product:', productData)

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update product')
      }
      
      setSuccessMessage('Product updated successfully!')
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/products')
        router.refresh()
      }, 2000)
      
    } catch (err: any) {
      console.error('Update error:', err)
      setError(err.message || 'Failed to update product')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${params.id}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Failed to delete product')
      
      router.push('/products')
      router.refresh()
    } catch (err) {
      setError('Failed to delete product')
      console.error(err)
    }
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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/products"
              className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Product</h1>
          </div>
          
          <button
            onClick={handleDelete}
            className="p-2 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
            title="Delete Product"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>

        {/* Form - IDENTICAL to Add Product Page */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3 text-green-700 dark:text-green-300">
              <CheckCircle className="h-5 w-5" />
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Image Upload Section */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Product Image</h2>
              <ImageUpload
                onImageUploaded={setImageUrl}
                existingImage={imageUrl}
                onRemove={() => setImageUrl('')}
              />
            </div>

            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-white"
                    placeholder="e.g. Engine Oil 5W-30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    SKU
                  </label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-white"
                    placeholder="Auto-generated if empty"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Leave empty to auto-generate
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-white"
                    placeholder="Product description..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-white"
                    placeholder="e.g. Automotive"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Supplier
                  </label>
                  <input
                    type="text"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-white"
                    placeholder="e.g. Auto Parts Co."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-white"
                    placeholder="e.g. Aisle 3, Shelf B"
                  />
                </div>
              </div>
            </div>

            {/* Pricing and Stock */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pricing & Stock</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price (GH₵) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cost (GH₵) *
                  </label>
                  <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Min Stock *
                  </label>
                  <input
                    type="number"
                    name="minstock"
                    value={formData.minstock}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-white"
                    placeholder="10"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
