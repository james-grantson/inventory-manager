'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Download, Printer, Copy, Check } from 'lucide-react'
import Barcode from 'react-barcode'

export default function BarcodePage() {
  const [barcodeValue, setBarcodeValue] = useState('')
  const [copied, setCopied] = useState(false)
  const [format, setFormat] = useState('CODE128')
  const [width, setWidth] = useState(2)
  const [height, setHeight] = useState(80)

  const formats = [
    'CODE128',
    'CODE39',
    'EAN13',
    'EAN8',
    'UPC',
    'ITF14',
    'MSI',
    'PHARMACODE',
    'CODABAR'
  ]

  const handleCopy = () => {
    navigator.clipboard.writeText(barcodeValue)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const canvas = document.querySelector('canvas')
    if (canvas) {
      const link = document.createElement('a')
      link.download = `barcode-${barcodeValue || 'sample'}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    }
  }

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      const canvas = document.querySelector('canvas')
      if (canvas) {
        const imgData = canvas.toDataURL('image/png')
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Barcode</title>
              <style>
                body { display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: white; }
                img { max-width: 100%; height: auto; }
              </style>
            </head>
            <body>
              <img src="${imgData}" />
              <script>window.print();</script>
            </body>
          </html>
        `)
        printWindow.document.close()
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-light dark:bg-gray-900 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-700 dark:text-gray-300" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Barcode Generator</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Barcode Settings</h2>
            
            <div className="space-y-4">
              {/* Barcode Value Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Enter Barcode Value
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={barcodeValue}
                    onChange={(e) => setBarcodeValue(e.target.value)}
                    placeholder="e.g., 1234567890"
                    className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={handleCopy}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2"
                  >
                    {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5 text-gray-600 dark:text-gray-400" />}
                  </button>
                </div>
              </div>

              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Barcode Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-white"
                >
                  {formats.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              {/* Width Slider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Width: {width}px
                </label>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="0.5"
                  value={width}
                  onChange={(e) => setWidth(parseFloat(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>

              {/* Height Slider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Height: {height}px
                </label>
                <input
                  type="range"
                  min="40"
                  max="200"
                  step="5"
                  value={height}
                  onChange={(e) => setHeight(parseInt(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleDownload}
                  disabled={!barcodeValue}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
                <button
                  onClick={handlePrint}
                  disabled={!barcodeValue}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </button>
              </div>
            </div>
          </motion.div>

          {/* Barcode Display Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Generated Barcode</h2>
            
            {barcodeValue ? (
              <div className="bg-white p-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-inner">
                <Barcode
                  value={barcodeValue}
                  format={format}
                  width={width}
                  height={height}
                  displayValue={true}
                  fontSize={16}
                  margin={10}
                  background="#ffffff"
                  lineColor="#000000"
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-32 h-32 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <span className="text-4xl text-gray-400 dark:text-gray-500"></span>
                </div>
                <p className="text-gray-500 dark:text-gray-400">Enter a value to generate barcode</p>
              </div>
            )}

            {/* Sample Products */}
            <div className="mt-8 w-full">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Sample Product Barcodes</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'Engine Oil', sku: 'OIL-5W30-001' },
                  { name: 'Brake Pads', sku: 'BP-TOYOTA-2023' },
                  { name: 'Cement 50kg', sku: 'CEMENT-50KG' },
                  { name: 'Light Bulb', sku: 'SKU-1772490975' }
                ].map((product) => (
                  <button
                    key={product.sku}
                    onClick={() => setBarcodeValue(product.sku)}
                    className="p-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-left transition-colors"
                  >
                    <p className="text-xs text-gray-500 dark:text-gray-400">{product.name}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{product.sku}</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Link to Products */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors text-gray-700 dark:text-gray-300"
          >
             Back to Products
          </Link>
        </motion.div>
      </main>
    </div>
  )
}
