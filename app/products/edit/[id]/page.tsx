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
        
        // Log user_id if it exists
        if (productData.user_id) {
          console.log(' User ID:', productData.user_id)
        }
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
      
      const updateData = {
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

      console.log(' Sending update to API:', updateData)

      const response = await fetch(`https://inventory-manager-api-ghana.vercel.app/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      const data = await response.json()
      console.log(' Update response:', data)
      
      if (response.ok) {
        alert(` Product updated successfully!`)
        router.push('/products')
        setTimeout(() => router.refresh(), 100)
      } else {
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
              <button onClick={() => router.push('/products')} className="text-white hover:bg-blue-700 p-2 rounded-lg">
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
          {error && <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4"><p className="text-red-700">{error}</p></div>}

          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Form fields - simplified for brevity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                  <input type="text" name="sku" value={formData.sku} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Selling Price (GHS) *</label>
                  <input type="number" name="price" value={formData.price} onChange={handleChange} required step="0.01" className="w-full px-4 py-3 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                  <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg" />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => router.push('/products')} className="px-6 py-3 border rounded-lg">Cancel</button>
                <button type="submit" disabled={saving} className="px-6 py-3 bg-blue-600 text-white rounded-lg ml-auto">
                  {saving ? 'Updating...' : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
