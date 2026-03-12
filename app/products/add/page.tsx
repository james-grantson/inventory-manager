'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Store } from 'lucide-react'
import ImageUpload from '@/app/components/ImageUpload'
import AuthGuard from '@/app/components/AuthGuard'
import { useApi } from '@/lib/api'
import { useOrganization } from '@/contexts/OrganizationContext'

interface Category {
  id: string
  name: string
}

export default function AddProductPage() {
  const router = useRouter()
  const { apiFetch } = useApi()
  const { currentOrganization } = useOrganization()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [error, setError] = useState('')
  const [imageUrl, setImageUrl] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    categoryId: '',
    price: '',
    cost: '',
    quantity: '',
    minstock: '10',
    supplier: '',
    location: ''
  })

  useEffect(() => {
    if (currentOrganization) {
      fetchCategories()
    } else {
      setLoadingCategories(false)
    }
  }, [currentOrganization])

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true)
      setError('')
      const res = await apiFetch('/api/categories')
      const data = await res.json()
      // Handle different response formats (array or { categories: [...] })
      const categoriesArray = Array.isArray(data) ? data : data.categories || []
      setCategories(categoriesArray)
    } catch (err: any) {
      console.error('Failed to load categories:', err)
      setError(err.message || 'Failed to load categories')
    } finally {
      setLoadingCategories(false)
    }
  }

  const generateSKU = () => {
    const prefix = formData.categoryId 
      ? categories.find(c => c.id === formData.categoryId)?.name.substring(0, 3).toUpperCase() 
      : 'PRD'
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
    return `${prefix || 'PRD'}-${random}`
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!formData.name || !formData.categoryId || !formData.price || !formData.cost || !formData.quantity) {
        throw new Error('Please fill in all required fields')
      }

      const productData = {
        name: formData.name,
        sku: formData.sku || generateSKU(),
        description: formData.description || '',
        categoryId: formData.categoryId,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost),
        quantity: parseInt(formData.quantity),
        minstock: parseInt(formData.minstock) || 10,
        supplier: formData.supplier || '',
        location: formData.location || '',
        image_url: imageUrl || null
      }

      const res = await apiFetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to add product')
      }

      router.push('/products')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // If no organization selected, show message
  if (!currentOrganization) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-light dark:bg-gray-900 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center max-w-md">
            <Store className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Store Selected</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Please select or create a store to add products.</p>
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

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-light dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/products" className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add New Product</h1>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Store: <span className="font-medium text-purple-600">{currentOrganization.name}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div className="border-b pb-6">
                <h2 className="text-lg font-semibold mb-4">Product Image</h2>
                <ImageUpload onImageUploaded={setImageUrl} existingImage={imageUrl} onRemove={() => setImageUrl('')} />
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Product Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">SKU</label>
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Auto-generated if empty"
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave empty to auto-generate</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Category *</label>
                    {loadingCategories ? (
                      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading categories...</span>
                      </div>
                    ) : categories.length === 0 ? (
                      <div className="px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border rounded-lg text-yellow-700 dark:text-yellow-300">
                        No categories found. Please add categories first.
                      </div>
                    ) : (
                      <select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Select a category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Supplier</label>
                    <input
                      type="text"
                      name="supplier"
                      value={formData.supplier}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h2 className="text-lg font-semibold mb-4">Pricing & Stock</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Price (GH) *</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Cost (GH) *</label>
                    <input
                      type="number"
                      name="cost"
                      value={formData.cost}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Quantity *</label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                      min="0"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Min Stock *</label>
                    <input
                      type="number"
                      name="minstock"
                      value={formData.minstock}
                      onChange={handleChange}
                      required
                      min="0"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t">
                <button
                  type="submit"
                  disabled={loading || loadingCategories || categories.length === 0}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl flex items-center gap-2 disabled:opacity-50 shadow-lg"
                >
                  {loading ? <><Loader2 className="h-5 w-5 animate-spin" /> Saving...</> : <><Save className="h-5 w-5" /> Save Product</>}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AuthGuard>
  )
}