"use client"

import { useState, useEffect } from 'react'

export default function Home() {
  const [status, setStatus] = useState('checking...')

  const checkBackend = async () => {
    try {
      const response = await fetch('https://inventory-manager-api-ghana.vercel.app/api/health')
      if (response.ok) {
        const data = await response.json()
        setStatus(`✅ Connected - ${data.message}`)
      } else {
        setStatus('❌ Connection failed')
      }
    } catch (error) {
      setStatus('❌ Connection error')
    }
  }

  useEffect(() => {
    checkBackend()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Inventory Management System
        </h1>
        <p className="text-gray-600 mb-8">
          Professional inventory system with PDF reports & multi-currency support
        </p>
        
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">System Status</h2>
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-medium">
              Backend Status: <span className={status.includes('✅') ? 'text-green-600' : 'text-red-600'}>
                {status}
              </span>
            </p>
            <button 
              onClick={checkBackend}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Refresh Status
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📦 Product Management</h2>
            <p className="text-gray-600 mb-4">Manage your inventory products</p>
            
            <div className="space-y-4">
              <a 
                href="/products"
                className="block p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
              >
                <h3 className="font-bold text-blue-700">View All Products</h3>
                <p className="text-sm text-gray-600 mt-1">Browse and manage your inventory</p>
              </a>
              
              <a 
                href="/products/add"
                className="block p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100"
              >
                <h3 className="font-bold text-green-700">Add/Edit Products</h3>
                <p className="text-sm text-gray-600 mt-1">Create or modify product entries</p>
              </a>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">📊 PDF Reports</h2>
            <p className="text-gray-600 mb-4">Generate professional inventory reports</p>
            
            <div className="space-y-4">
              <a 
                href="https://inventory-manager-api-ghana.vercel.app/api/reports/pdf/test"
                target="_blank"
                className="block p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100"
              >
                <h3 className="font-bold text-purple-700">Test PDF Generation</h3>
                <p className="text-sm text-gray-600 mt-1">Download a test PDF</p>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Backend: inventory-manager-api-ghana.vercel.app</p>
          <p>Frontend: inventory-manager-frontend-ghana.vercel.app</p>
        </div>
      </div>
    </div>
  )
}

