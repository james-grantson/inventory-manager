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

  useEffect(() => {
    if (productId) {
      fetchProduct()
    }
  }, [productId])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await fetch(`https://inventory-manager-api-ghana.vercel.app/api/products/${productId}`)
      const data = await response.json()
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
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      const response = await fetch(`https://inventory-manager-api-ghana.vercel.app/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        alert('Product updated successfully!')
        router.push('/products')
      }
    } catch (error) {
      console.error('Error updating:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Edit Product</h1>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
          {/* Add your form fields here */}
          <input type="text" name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded mb-4" placeholder="Product Name" />
          <button type="submit" disabled={saving} className="bg-blue-600 text-white px-4 py-2 rounded">
            {saving ? 'Saving...' : 'Update Product'}
          </button>
        </form>
      </div>
    </div>
  )
}
