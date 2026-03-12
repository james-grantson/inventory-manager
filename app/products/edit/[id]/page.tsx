'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Trash2, Store } from 'lucide-react'
import ImageUpload from '@/app/components/ImageUpload'
import AuthGuard from '@/app/components/AuthGuard'
import { useApi } from '@/lib/api'
import { useOrganization } from '@/contexts/OrganizationContext'

interface Category {
  id: string
  name: string
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const { apiFetch } = useApi()
  const { currentOrganization } = useOrganization()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
      Promise.all([fetchCategories(), fetchProduct()])
    } else {
      setLoading(false)
      setLoadingCategories(false)
    }
  }, [currentOrganization])

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true)
      setError('')
      const res = await apiFetch('/api/categories')
      const data = await res.json()
      const categoriesArray = Array.isArray(data) ? data : data.categories || []
      setCategories(categoriesArray)
    } catch (err: any) {
      console.error('Failed to load categories:', err)
      setError(err.message || 'Failed to load categories')
    } finally {
      setLoadingCategories(false)
    }
  }

  const fetchProduct = async () => {
    try {
      const productId = params.id
      const res = await apiFetch(`/api/products/${productId}`)
      if (!res.ok) throw new Error('Failed to fetch product')
      const data = await res.json()
      const product = data.product || data

      setFormData({
        name: product.name || '',
        sku: product.sku || '',
        description: product.description || '',
        categoryId: product.categoryId || '',
        price: product.price?.toString() || '',
        cost: product.cost?.toString() || '',
        quantity: product.quantity?.toString() || '',
        minstock: product.minstock?.toString() || '10',
        supplier: product.supplier || '',
        location: product.location || ''
      })
      setImageUrl(product.image_url || '')
    } catch (err: any) {
      setError(err.message || 'Failed to load product')
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
    setSaving(true)
    setError('')

    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        cost: parseFloat(formData.cost),
        quantity: parseInt(formData.quantity),
        minstock: parseInt(formData.minstock) || 10,
        image_url: imageUrl || null
      }

      const res = await apiFetch(`/api/products/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to update product')
      }
      router.push('/products')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this product?')) return
    try {
      await apiFetch(`/api/products/${params.id}`, {
        method: 'DELETE'
      })
      router.push('/products')
    } catch (err: any) {
      setError(err.message || 'Failed to delete product')
    }
  }

  // If no organization selected
  if (!currentOrganization && !loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-light dark:bg-gray-900 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center max-w-md">
            <Store className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Store Selected</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Please select or create a store to edit products.</p>
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

  if (loading || loadingCategories) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-light dark:bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent" />
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-light dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href="/products" className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Product</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Store: <span className="font-medium text-purple-600">{currentOrganization?.name}</span>
              </span>
              <button
                onClick={handleDelete}
                className="p-2 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-lg hover:bg-red-200 dark:hover:bg-red-800"
                title="Delete Product"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
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
                    <label className="block text-sm font-medium mb-2">Name *</label>
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
                    />
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
                  disabled={saving}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl flex items-center gap-2 disabled:opacity-50 shadow-lg"
                >
                  {saving ? <><Loader2 className="h-5 w-5 animate-spin" /> Saving...</> : <><Save className="h-5 w-5" /> Save Changes</>}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </AuthGuard>
  )
}