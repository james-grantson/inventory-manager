// app/barcode/page.tsx - Ultra simple version
"use client"

import { useState } from 'react'
import Link from 'next/link'

export default function BarcodePage() {
  const [barcodeValue, setBarcodeValue] = useState('')
  const [generated, setGenerated] = useState(false)

  const generateBarcode = () => {
    if (barcodeValue.trim()) {
      setGenerated(true)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <Link href="/products" className="text-blue-600 hover:text-blue-800">
             Back to Products
          </Link>
          <h1 className="text-2xl font-bold mt-4">Barcode Generator</h1>
          <p className="text-gray-600">Basic barcode generator</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Enter Barcode Value</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={barcodeValue}
                onChange={(e) => setBarcodeValue(e.target.value)}
                className="flex-1 p-2 border rounded"
                placeholder="Enter barcode"
              />
              <button
                onClick={generateBarcode}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Generate
              </button>
            </div>
          </div>

          {generated && (
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">Barcode Preview</h3>
              <div className="bg-gray-100 p-4 rounded text-center">
                <div className="font-mono text-lg">{barcodeValue}</div>
                <div className="mt-2 text-sm text-gray-500">
                  Barcode simulation - full feature coming soon
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
