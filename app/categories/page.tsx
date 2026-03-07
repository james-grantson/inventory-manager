'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, ArrowLeft, RefreshCw, Check, X } from 'lucide-react'

interface Category {
  id: string
  name: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newCategory, setNewCategory] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError('')
      console.log('Fetching categories...')
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`)
      console.log('Response status:', res.status)
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      
      const data = await res.json()
      console.log('Categories data:', data)
      
      // Handle different response formats
      let categoriesArray = []
      if (Array.isArray(data)) {
        categoriesArray = data
      } else if (data && Array.isArray(data.categories)) {
        categoriesArray = data.categories
      } else if (data && data.data && Array.isArray(data.data)) {
        categoriesArray = data.data
      } else {
        console.error('Unexpected data format:', data)
        throw new Error('Invalid data format received from server')
      }
      
      setCategories(categoriesArray)
    } catch (error) {
      console.error('Error fetching categories:', error)
      setError(error instanceof Error ? error.message : 'Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  const addCategory = async () => {
    if (!newCategory.trim()) return
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setNewCategory('')
        fetchCategories()
        setSuccess('Category added successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Failed to add category')
        setTimeout(() => setError(''), 3000)
      }
    } catch (error) {
      console.error('Error adding category:', error)
      setError('Failed to add category')
      setTimeout(() => setError(''), 3000)
    }
  }

  const updateCategory = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setEditingId(null)
        fetchCategories()
        setSuccess('Category updated successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Failed to update category')
        setTimeout(() => setError(''), 3000)
      }
    } catch (error) {
      console.error('Error updating category:', error)
      setError('Failed to update category')
      setTimeout(() => setError(''), 3000)
    }
  }

  const deleteCategory = async (id: string) => {
    if (!confirm('Are you sure? This will delete the category.')) return
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories/${id}`, {
        method: 'DELETE'
      })
      
      const data = await res.json()
      
      if (res.ok) {
        fetchCategories()
        setSuccess('Category deleted successfully!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(data.error || 'Failed to delete category')
        setTimeout(() => setError(''), 3000)
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      setError('Failed to delete category')
      setTimeout(() => setError(''), 3000)
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/products" className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Categories</h1>
          <button onClick={fetchCategories} className="ml-auto p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg text-red-700">
            Error: {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 rounded-lg text-green-700">
            {success}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold mb-4">Add New Category</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter category name"
              className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg"
              onKeyPress={(e) => e.key === 'Enter' && addCategory()}
            />
            <button
              onClick={addCategory}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              <Plus className="h-4 w-4 inline mr-1" />
              Add
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold">All Categories</h2>
          </div>
          
          {categories.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No categories yet. Add your first category above.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {categories.map(cat => (
                <li key={cat.id} className="p-4 flex items-center justify-between">
                  <span>{cat.name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingId(cat.id)
                        setEditName(cat.name)
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteCategory(cat.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
