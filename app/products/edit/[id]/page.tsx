'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Loader2, Trash2, Image as ImageIcon, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase-client'

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [imageUrl, setImageUrl] = useState<string>('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
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
      
      // Populate form with product data
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
        setImagePreview(product.image_url)
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

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB')
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setError('')
    setUploadSuccess(false)
  }

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return imageUrl

    setUploading(true)
    try {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `products/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, imageFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath)

      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 3000)
      return publicUrl
    } catch (err) {
      console.error('Upload error:', err)
      setError('Failed to upload image')
      return null
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setImageUrl('')
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccessMessage('')

    try {
      let finalImageUrl = imageUrl
      if (imageFile) {
        const uploadedUrl = await uploadImage()
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl
        }
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
        image_url: finalImageUrl || null
      }

      console.log('Updating product:', productData)

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to update product')
      }
      
      setSuccessMessage('Product updated successfully!')
      setTimeout(() => {
        router.push('/products')
        router.refresh()
      }, 1500)
      
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/products" className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Product</h1>
          </div>
          <button onClick={handleDelete} className="p-2 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30 text-red-600 rounded-lg">
            <Trash2 className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
              <CheckCircle className="h-5 w-5" />
              {successMessage}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Image Upload Section */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Product Image</h2>
              
              <div className="flex items-start gap-6">
                <div className="relative">
                  {imagePreview ? (
                    <div className="relative group">
                      <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200" />
                      <button type="button" onClick={handleRemoveImage} className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100">
                        <Trash2 className="h-3 w-3" />
                      </button>
                      {uploadSuccess && (
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Uploaded!
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <input type="file" id="image-upload" accept="image/*" onChange={handleImageSelect} className="hidden" disabled={uploading} />
                  <div className="space-y-3">
                    <button type="button" onClick={() => document.getElementById('image-upload')?.click()} disabled={uploading} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50">
                      {uploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <ImageIcon className="h-4 w-4" />
                          {imagePreview ? 'Change Image' : 'Upload Image'}
                        </>
                      )}
                    </button>
                    <p className="text-xs text-gray-500">Max size: 5MB</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Fields - Same as Add Page */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Product Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">SKU</label>
                  <input type="text" name="sku" value={formData.sku} onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows={3}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <input type="text" name="category" value={formData.category} onChange={handleChange} required
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Supplier</label>
                  <input type="text" name="supplier" value={formData.supplier} onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <input type="text" name="location" value={formData.location} onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg" />
                </div>
              </div>
            </div>

            {/* Pricing and Stock */}
            <div className="border-t pt-6">
              <h2 className="text-lg font-semibold mb-4">Pricing & Stock</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Price (GH) *</label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" step="0.01"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Cost (GH) *</label>
                  <input type="number" name="cost" value={formData.cost} onChange={handleChange} required min="0" step="0.01"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Quantity *</label>
                  <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required min="0"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Min Stock *</label>
                  <input type="number" name="minstock" value={formData.minstock} onChange={handleChange} required min="0"
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-lg" />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t">
              <button type="submit" disabled={saving || uploading}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl flex items-center gap-2 disabled:opacity-50">
                {saving || uploading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {uploading ? 'Uploading...' : 'Saving...'}
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
