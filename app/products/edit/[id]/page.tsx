'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Trash2 } from 'lucide-react'
import ImageUpload from '@/app/components/ImageUpload'

interface Category {
  id: string
  name: string
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
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
    Promise.all([fetchCategories(), fetchProduct()])
  }, [])

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`)
      const data = await res.json()
      setCategories(data)
    } catch (err) {
      console.error('Failed to load categories:', err)
    } finally {
      setLoadingCategories(false)
    }
  }

  const fetchProduct = async () => {
    try {
      const productId = params.id
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}`)
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
    } catch (err) {
      setError('Failed to load product')
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

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })

      if (!res.ok) throw new Error('Failed to update product')
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
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${params.id}`, {
        method: 'DELETE'
      })
      router.push('/products')
    } catch (err) {
      setError('Failed to delete product')
    }
  }

  if (loading || loadingCategories) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-light dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/products" className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold">Edit Product</h1>
          </div>
          <button onClick={handleDelete} className="p-2 bg-red-100 dark:bg-red-900/20 text-red-600 rounded-lg">
            <Trash2 className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border">
          {error && <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 rounded-lg">{error}</div>}

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
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">SKU</label>
                  <input type="text" name="sku" value={formData.sku} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg" />
                </div>

                {/* Category Dropdown */}
                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <select name="categoryId" value={formData.categoryId} onChange={handleChange} required className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg">
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Supplier</label>
                  <input type="text" name="supplier" value={formData.supplier} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg" />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold mb-4">Pricing & Stock</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Price (GH) *</label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Cost (GH) *</label>
                  <input type="number" name="cost" value={formData.cost} onChange={handleChange} required min="0" step="0.01" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Quantity *</label>
                  <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required min="0" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Min Stock *</label>
                  <input type="number" name="minstock" value={formData.minstock} onChange={handleChange} required min="0" className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg" />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <><Loader2 className="h-5 w-5 animate-spin" /> Saving...</> : <><Save className="h-5 w-5" /> Save Changes</>}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}