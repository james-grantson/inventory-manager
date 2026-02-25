"use client"

import { useState, Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function EditProductContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const productId = searchParams.get('id') || 'prod-001'
  
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    quantity: ''
  })

  // Fetch product data from API
  useEffect(() => {
    fetchProductData()
  }, [productId])

  const fetchProductData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`https://inventory-manager-api-ghana.vercel.app/api/products/${productId}`)
      
      if (response.ok) {
        const data = await response.json()
        setProduct(data.product || data)
        
        // Populate form with actual product data
        setFormData({
          name: data.product?.name || data?.name || '',
          sku: data.product?.sku || data?.sku || '',
          price: data.product?.price?.toString() || data?.price?.toString() || '',
          quantity: data.product?.quantity?.toString() || data?.quantity?.toString() || ''
        })
      } else {
        console.error('Failed to fetch product:', response.status)
        // Keep default form data if API fails
      }
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const updateData: any = {}
      
      // Only include fields that have values
      if (formData.name) updateData.name = formData.name
      if (formData.sku) updateData.sku = formData.sku
      if (formData.price) updateData.price = parseFloat(formData.price)
      if (formData.quantity) updateData.quantity = parseInt(formData.quantity)

      const response = await fetch(`https://inventory-manager-api-ghana.vercel.app/api/products/${productId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        const data = await response.json()
        alert(` ${data.message}`)
        router.push('/products')
      } else {
        const errorData = await response.json()
        alert(` Error: ${errorData.error || 'Failed to update product'}`)
      }
    } catch (error: any) {
      alert(` Network error: ${error.message}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product data...</p>
          <button 
            onClick={fetchProductData}
            className="mt-4 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
          >
            Retry Loading
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Edit Product</h1>
        <p className="text-gray-600 mb-6">ID: {productId}</p>
        
        <div className="bg-white p-6 rounded-xl shadow">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2">Product Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="Enter product name"
              />
              <p className="text-xs text-gray-500 mt-1">
                Current: {product?.name || 'Not set'}
              </p>
            </div>
            
            <div>
              <label className="block mb-2">SKU</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({...formData, sku: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="Enter SKU"
              />
              <p className="text-xs text-gray-500 mt-1">
                Current: {product?.sku || 'Not set'}
              </p>
            </div>
            
            <div>
              <label className="block mb-2">Price (GHS)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="0.00"
                step="0.01"
              />
              <p className="text-xs text-gray-500 mt-1">
                Current: {product?.price ? `GH${product.price}` : 'Not set'}
              </p>
            </div>
            
            <div>
              <label className="block mb-2">Quantity</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Current: {product?.quantity || 'Not set'}
              </p>
            </div>
            
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.push('/products')}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={fetchProductData}
                className="px-4 py-2 bg-gray-100 text-gray-700 border rounded hover:bg-gray-200"
              >
                Reset
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Update Product
              </button>
            </div>
          </form>
        </div>
        
        <div className="mt-6 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Product Information:</h3>
          <p><strong>ID:</strong> {productId}</p>
          <p><strong>Backend API:</strong> inventory-manager-api-ghana.vercel.app</p>
          <p><strong>Endpoint:</strong> GET /api/products/{productId}</p>
          <button 
            onClick={() => console.log('Product data:', product)}
            className="mt-2 px-3 py-1 bg-gray-200 rounded text-xs"
          >
            Log Product Data
          </button>
        </div>
      </div>
    </div>
  )
}

export default function EditProduct() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading edit form...</div>}>
      <EditProductContent />
    </Suspense>
  )
}
