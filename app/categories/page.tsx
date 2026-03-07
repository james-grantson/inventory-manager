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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`)
      const data = await res.json()
      setCategories(data)
      setError('')
    } catch (error) {
      console.error('Error fetching categories:', error)
      setError('Failed to load categories')
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

  return (
    <div className="min-h-screen bg-gradient-light dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/products" 
            className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Categories</h1>
          <button 
            onClick={fetchCategories} 
            className="ml-auto p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300">
            {success}
          </div>
        )}

        {/* Add Category */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Category</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Enter category name"
              className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-white"
              onKeyPress={(e) => e.key === 'Enter' && addCategory()}
            />
            <button
              onClick={addCategory}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
        </div>

        {/* Categories List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <h2 className="font-semibold text-gray-900 dark:text-white">All Categories</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No categories yet. Add your first category above.
            </div>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {categories.map(cat => (
                <li key={cat.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  {editingId === cat.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="flex-1 px-3 py-1 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                        autoFocus
                        onKeyPress={(e) => e.key === 'Enter' && updateCategory(cat.id)}
                      />
                      <button
                        onClick={() => updateCategory(cat.id)}
                        className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        title="Save"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Cancel"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-900 dark:text-white">{cat.name}</span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingId(cat.id)
                            setEditName(cat.name)
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteCategory(cat.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
