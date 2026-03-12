'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, ArrowLeft, RefreshCw } from 'lucide-react'
import AuthGuard from '@/app/components/AuthGuard'
import { useApi } from '@/lib/api'
import { useOrganization } from '@/contexts/OrganizationContext'

interface Category {
  id: string
  name: string
}

export default function CategoriesPage() {
  const router = useRouter()
  const { apiFetch } = useApi()
  const { currentOrganization } = useOrganization()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newCategory, setNewCategory] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (currentOrganization) {
      fetchCategories()
    } else {
      setLoading(false)
      setError('No store selected. Please select or create a store.')
    }
  }, [currentOrganization])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await apiFetch('/api/categories')
      const data = await res.json()
      
      // Handle different response formats
      let categoriesArray: Category[] = []
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
      setError('')
      const res = await apiFetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategory })
      })
      const data = await res.json()
      if (res.ok) {
        setNewCategory('')
        await fetchCategories()
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
      setError('')
      const res = await apiFetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName })
      })
      const data = await res.json()
      if (res.ok) {
        setEditingId(null)
        await fetchCategories()
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
      setError('')
      const res = await apiFetch(`/api/categories/${id}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (res.ok) {
        await fetchCategories()
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
      <AuthGuard>
        <div className="min-h-screen bg-gradient-light dark:bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
        </div>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-light dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/products" className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Categories</h1>
            <button 
              onClick={fetchCategories} 
              className="ml-auto p-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
              title="Refresh"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 rounded-lg text-green-700">
              {success}
            </div>
          )}

          {!currentOrganization && !loading && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No store selected. Please select or create a store to manage categories.</p>
              <Link
                href="/admin/organizations"
                className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg"
              >
                Manage Stores
              </Link>
            </div>
          )}

          {currentOrganization && (
            <>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold mb-4">Add New Category</h2>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="Enter category name"
                    className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    onKeyPress={(e) => e.key === 'Enter' && addCategory()}
                  />
                  <button
                    onClick={addCategory}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
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
                      <li key={cat.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        {editingId === cat.id ? (
                          <div className="flex-1 flex items-center gap-2">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="flex-1 px-3 py-1 bg-gray-50 dark:bg-gray-700 border rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                              autoFocus
                              onKeyPress={(e) => e.key === 'Enter' && updateCategory(cat.id)}
                            />
                            <button
                              onClick={() => updateCategory(cat.id)}
                              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                              title="Save"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                              title="Cancel"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="text-gray-900 dark:text-white">{cat.name}</span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingId(cat.id)
                                  setEditName(cat.name)
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteCategory(cat.id)}
                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </AuthGuard>
  )
}