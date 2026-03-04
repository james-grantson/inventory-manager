'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Download, 
  Printer, 
  Copy, 
  Check,
  Package,
  Barcode as BarcodeIcon,
  Settings,
  RefreshCw
} from 'lucide-react'
import JsBarcode from 'jsbarcode'

export default function BarcodePage() {
  const [barcodeValue, setBarcodeValue] = useState('')
  const [copied, setCopied] = useState(false)
  const [format, setFormat] = useState('CODE128')
  const [width, setWidth] = useState(2)
  const [height, setHeight] = useState(80)
  const [showText, setShowText] = useState(true)
  const [fontSize, setFontSize] = useState(16)
  const [margin, setMargin] = useState(10)
  const barcodeRef = useRef<SVGSVGElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

  const generateBarcode = () => {
    if (barcodeValue && barcodeRef.current) {
      try {
        JsBarcode(barcodeRef.current, barcodeValue, {
          format: format,
          width: width,
          height: height,
          displayValue: showText,
          fontSize: fontSize,
          margin: margin,
          background: '#ffffff',
          lineColor: '#000000'
        })
      } catch (error) {
        console.error('Barcode generation error:', error)
      }
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(barcodeValue)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (barcodeRef.current && canvasRef.current) {
      // Draw SVG to canvas
      const ctx = canvasRef.current.getContext('2d')
      const svgData = new XMLSerializer().serializeToString(barcodeRef.current)
      const img = new Image()
      img.onload = () => {
        canvasRef.current.width = img.width
        canvasRef.current.height = img.height
        ctx?.drawImage(img, 0, 0)
        
        // Download as PNG
        const link = document.createElement('a')
        link.download = `barcode-${barcodeValue || 'sample'}.png`
        link.href = canvasRef.current.toDataURL('image/png')
        link.click()
      }
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
    }
  }

  const handlePrint = () => {
    if (barcodeRef.current) {
      const svgData = new XMLSerializer().serializeToString(barcodeRef.current)
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Barcode</title>
              <style>
                body { 
                  display: flex; 
                  justify-content: center; 
                  align-items: center; 
                  min-height: 100vh; 
                  margin: 0; 
                  background: white; 
                  font-family: system-ui, -apple-system, sans-serif;
                }
                .container {
                  text-align: center;
                  padding: 20px;
                }
                .barcode-value {
                  margin-top: 20px;
                  font-size: 18px;
                  color: #333;
                }
              </style>
            </head>
            <body>
              <div class="container">
                ${svgData}
                <div class="barcode-value">${barcodeValue}</div>
              </div>
              <script>window.onload = () => window.print()</script>
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
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <BarcodeIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Barcode Generator</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Create and print product barcodes</p>
                </div>
              </div>
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
            <div className="flex items-center gap-2 mb-6">
              <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Barcode Settings</h2>
            </div>
            
            <div className="space-y-4">
              {/* Barcode Value Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Enter Barcode Value *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={barcodeValue}
                    onChange={(e) => setBarcodeValue(e.target.value)}
                    placeholder="e.g., 1234567890 or SKU-12345"
                    className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={handleCopy}
                    disabled={!barcodeValue}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Width: {width}px</label>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Thickness</span>
                </div>
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
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Height: {height}px</label>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Size</span>
                </div>
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

              {/* Font Size Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Font Size: {fontSize}px</label>
                </div>
                <input
                  type="range"
                  min="8"
                  max="24"
                  step="1"
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="w-full accent-purple-600"
                />
              </div>

              {/* Show Text Toggle */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-400">Show text below barcode</label>
                <button
                  onClick={() => setShowText(!showText)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    showText ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      showText ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateBarcode}
                disabled={!barcodeValue}
                className="w-full mt-6 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className="h-4 w-4" />
                Generate Barcode
              </button>
            </div>
          </motion.div>

          {/* Barcode Display Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center gap-2 mb-6">
              <Package className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Generated Barcode</h2>
            </div>
            
            {/* Hidden canvas for download */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            
            {/* Barcode Display */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-inner flex justify-center min-h-[200px] items-center">
              {barcodeValue ? (
                <svg ref={barcodeRef} className="max-w-full"></svg>
              ) : (
                <div className="text-center py-8">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <BarcodeIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">Enter a value and click Generate</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {barcodeValue && (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleDownload}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download PNG
                </button>
                <button
                  onClick={handlePrint}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </button>
              </div>
            )}

            {/* Sample Product SKUs */}
            <div className="mt-8">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick SKU Selection</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { name: 'Engine Oil', sku: 'OIL-5W30-001' },
                  { name: 'Brake Pads', sku: 'BP-TOYOTA-2023' },
                  { name: 'Cement 50kg', sku: 'CEMENT-50KG' },
                  { name: 'Light Bulb', sku: 'SKU-1772490975' },
                  { name: 'Goil Petrol', sku: 'SKU-1772466738' },
                  { name: 'Air Filter', sku: 'AF-TOYOTA-2024' }
                ].map((product) => (
                  <button
                    key={product.sku}
                    onClick={() => {
                      setBarcodeValue(product.sku)
                      setTimeout(generateBarcode, 100)
                    }}
                    className="p-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-left transition-colors"
                  >
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{product.name}</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.sku}</p>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Barcode Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4"
        >
          <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2"> Barcode Tips</h4>
          <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1 list-disc list-inside">
            <li>Use SKU numbers for product identification</li>
            <li>CODE128 supports alphanumeric characters (best for SKUs)</li>
            <li>EAN13 is standard for retail products (requires 12-13 digits)</li>
            <li>Download PNG for printing or saving</li>
            <li>You can print directly from browser</li>
          </ul>
        </motion.div>

        {/* Back to Products Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center"
        >
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors text-gray-700 dark:text-gray-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>
        </motion.div>
      </main>
    </div>
  )
}

// Force redeploy: 03/03/2026 17:12:59
