'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Download,
  Printer,
  Copy,
  Check,
  Package,
  Barcode as BarcodeIcon,
  Settings,
  RefreshCw,
  Plus,
  Trash2,
  Grid,
  Layers,
  Camera,
  ScanLine,
  FileUp
} from 'lucide-react'
import JsBarcode from 'jsbarcode'

interface BarcodeItem {
  id: string
  value: string
  name?: string
  quantity?: number
}

export default function EnhancedBarcodePage() {
  const [barcodeValue, setBarcodeValue] = useState('')
  const [barcodeItems, setBarcodeItems] = useState<BarcodeItem[]>([])
  const [copied, setCopied] = useState<string | null>(null)
  const [format, setFormat] = useState('CODE128')
  const [width, setWidth] = useState(2)
  const [height, setHeight] = useState(80)
  const [showText, setShowText] = useState(true)
  const [fontSize, setFontSize] = useState(16)
  const [margin, setMargin] = useState(10)
  const [viewMode, setViewMode] = useState<'single' | 'bulk' | 'scan'>('single')
  const [bulkText, setBulkText] = useState('')
  const [scanning, setScanning] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const barcodeRefs = useRef<{ [key: string]: SVGSVGElement | null }>({})

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

  const sampleProducts = [
    { name: 'Engine Oil', sku: 'OIL-5W30-001', quantity: 150 },
    { name: 'Brake Pads', sku: 'BP-TOYOTA-2023', quantity: 42 },
    { name: 'Cement 50kg', sku: 'CEMENT-50KG', quantity: 280 },
    { name: 'Light Bulb', sku: 'SKU-1772490975', quantity: 30 },
    { name: 'Goil Petrol', sku: 'SKU-1772466738', quantity: 90 },
    { name: 'Air Filter', sku: 'AF-TOYOTA-2024', quantity: 25 }
  ]

  const generateBarcode = (value: string, id: string) => {
    const element = barcodeRefs.current[id]
    if (element && value) {
      try {
        JsBarcode(element, value, {
          format: format,
          width: width,
          height: height,
          displayValue: showText,
          fontSize: fontSize,
          margin: margin,
          background: '#ffffff',
          lineColor: '#000000'
        })
        return true
      } catch (error) {
        console.error('Barcode generation error:', error)
        return false
      }
    }
    return false
  }

  const addBarcode = () => {
    if (!barcodeValue) return
    
    const newItem: BarcodeItem = {
      id: Date.now().toString(),
      value: barcodeValue,
      name: `Item ${barcodeItems.length + 1}`
    }
    setBarcodeItems([...barcodeItems, newItem])
    setBarcodeValue('')
    
    setTimeout(() => {
      generateBarcode(newItem.value, newItem.id)
    }, 100)
  }

  const removeBarcode = (id: string) => {
    setBarcodeItems(barcodeItems.filter(item => item.id !== id))
  }

  const addFromProducts = (product: typeof sampleProducts[0]) => {
    const newItem: BarcodeItem = {
      id: Date.now().toString(),
      value: product.sku,
      name: product.name,
      quantity: product.quantity
    }
    setBarcodeItems([...barcodeItems, newItem])
    
    setTimeout(() => {
      generateBarcode(newItem.value, newItem.id)
    }, 100)
  }

  const addAllProducts = () => {
    const newItems = sampleProducts.map((product, index) => ({
      id: (Date.now() + index).toString(),
      value: product.sku,
      name: product.name,
      quantity: product.quantity
    }))
    setBarcodeItems([...barcodeItems, ...newItems])
    
    setTimeout(() => {
      newItems.forEach(item => {
        generateBarcode(item.value, item.id)
      })
    }, 200)
  }

  const parseBulkText = () => {
    const lines = bulkText.split('\n').filter(line => line.trim())
    const newItems: BarcodeItem[] = []
    
    lines.forEach((line, index) => {
      const parts = line.split(',').map(p => p.trim())
      const value = parts[0]
      const name = parts[1] || `Item ${index + 1}`
      const quantity = parts[2] ? parseInt(parts[2]) : undefined
      
      if (value) {
        newItems.push({
          id: (Date.now() + index).toString(),
          value,
          name,
          quantity
        })
      }
    })
    
    setBarcodeItems([...barcodeItems, ...newItems])
    setBulkText('')
    
    setTimeout(() => {
      newItems.forEach(item => {
        generateBarcode(item.value, item.id)
      })
    }, 200)
  }

  const downloadSingle = (item: BarcodeItem) => {
    const element = barcodeRefs.current[item.id]
    if (!element) return
    
    try {
      // Create a canvas element
      const canvas = document.createElement('canvas')
      const svgString = new XMLSerializer().serializeToString(element)
      const img = new Image()
      
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0)
        
        const link = document.createElement('a')
        link.download = `barcode-${item.value}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
      }
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgString)
    } catch (error) {
      console.error('Download error:', error)
    }
  }

  const downloadAll = () => {
    barcodeItems.forEach(item => downloadSingle(item))
  }

  const printAll = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    
    const barcodeElements = barcodeItems.map(item => {
      const svg = document.getElementById(`barcode-${item.id}`)?.outerHTML || ''
      return `
        <div style="page-break-after: always; text-align: center; padding: 20px; margin-bottom: 20px;">
          ${svg}
          ${item.name ? `<p style="font-size: 14px; margin-top: 10px;">${item.name}</p>` : ''}
          ${item.quantity ? `<p style="font-size: 12px; color: #666;">Qty: ${item.quantity}</p>` : ''}
          <p style="font-size: 16px; font-weight: bold; margin-top: 5px;">${item.value}</p>
        </div>
      `
    }).join('')

    printWindow.document.write(`
      <html>
        <head>
          <title>Print Barcodes</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            @media print {
              div { page-break-after: always; }
            }
          </style>
        </head>
        <body>
          ${barcodeElements}
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const startScanning = async () => {
    setScanning(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
    } catch (error) {
      console.error('Camera access error:', error)
      setScanning(false)
    }
  }

  const stopScanning = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setScanning(false)
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
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Enhanced Barcode Generator</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Bulk generation & camera scanning</p>
                </div>
              </div>
            </div>

            {/* View Mode Tabs */}
            <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('single')}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  viewMode === 'single' 
                    ? 'bg-white dark:bg-gray-700 shadow-md text-purple-600 dark:text-purple-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <BarcodeIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Single</span>
              </button>
              <button
                onClick={() => setViewMode('bulk')}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  viewMode === 'bulk' 
                    ? 'bg-white dark:bg-gray-700 shadow-md text-purple-600 dark:text-purple-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Layers className="h-4 w-4" />
                <span className="hidden sm:inline">Bulk</span>
              </button>
              <button
                onClick={() => setViewMode('scan')}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  viewMode === 'scan' 
                    ? 'bg-white dark:bg-gray-700 shadow-md text-purple-600 dark:text-purple-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Camera className="h-4 w-4" />
                <span className="hidden sm:inline">Scan</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'single' && (
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
                      onClick={addBarcode}
                      disabled={!barcodeValue}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-4 w-4" />
                      Add
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

                {/* Quick Add Products */}
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick Add Products</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={addAllProducts}
                      className="col-span-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 rounded-lg transition-colors text-purple-700 dark:text-purple-400 font-medium text-sm flex items-center justify-center gap-2"
                    >
                      <Package className="h-4 w-4" />
                      Add All Products
                    </button>
                    {sampleProducts.map((product) => (
                      <button
                        key={product.sku}
                        onClick={() => addFromProducts(product)}
                        className="p-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg text-left transition-colors"
                      >
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{product.name}</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.sku}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Barcode List Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Generated Barcodes</h2>
                </div>
                {barcodeItems.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={downloadAll}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm flex items-center gap-1"
                    >
                      <Download className="h-4 w-4" />
                      Download All
                    </button>
                    <button
                      onClick={printAll}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm flex items-center gap-1"
                    >
                      <Printer className="h-4 w-4" />
                      Print All
                    </button>
                  </div>
                )}
              </div>

              {/* Barcode List */}
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {barcodeItems.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <BarcodeIcon className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400">No barcodes generated yet</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Add a value or select a product to get started</p>
                  </div>
                ) : (
                  barcodeItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{item.name || 'Barcode'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Value: {item.value}</p>
                          {item.quantity && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => downloadSingle(item)}
                            className="p-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download className="h-4 w-4 text-gray-700 dark:text-gray-300" />
                          </button>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(item.value)
                              setCopied(item.id)
                              setTimeout(() => setCopied(null), 2000)
                            }}
                            className="p-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors"
                            title="Copy"
                          >
                            {copied === item.id ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-gray-700 dark:text-gray-300" />}
                          </button>
                          <button
                            onClick={() => removeBarcode(item.id)}
                            className="p-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </div>

                      {/* Barcode Display */}
                      <div className="bg-white p-4 rounded-lg border border-gray-200 dark:border-gray-600 flex justify-center">
                        <svg
                          id={`barcode-${item.id}`}
                          ref={el => barcodeRefs.current[item.id] = el}
                          className="max-w-full"
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}

        {viewMode === 'bulk' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-6">
                <FileUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Bulk Barcode Generation</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Enter values (one per line, format: value,name,quantity)
                  </label>
                  <textarea
                    value={bulkText}
                    onChange={(e) => setBulkText(e.target.value)}
                    placeholder="e.g.:
OIL-5W30-001,Engine Oil,150
BP-TOYOTA-2023,Brake Pads,42
CEMENT-50KG,Cement 50kg,280"
                    rows={8}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 text-gray-900 dark:text-white font-mono text-sm"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={parseBulkText}
                    disabled={!bulkText.trim()}
                    className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Generate Barcodes
                  </button>
                  <button
                    onClick={() => setBulkText(sampleProducts.map(p => `${p.sku},${p.name},${p.quantity}`).join('\n'))}
                    className="px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors text-gray-700 dark:text-gray-300"
                  >
                    Load Samples
                  </button>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                  <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2"> CSV Format</h4>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mb-2">Each line should have:</p>
                  <ul className="text-xs text-blue-700 dark:text-blue-400 list-disc list-inside space-y-1">
                    <li><strong>value</strong> - The barcode value (required)</li>
                    <li><strong>name</strong> - Product name (optional)</li>
                    <li><strong>quantity</strong> - Quantity (optional)</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {viewMode === 'scan' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <ScanLine className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Barcode Scanner</h2>
                </div>
                <button
                  onClick={scanning ? stopScanning : startScanning}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    scanning 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  <Camera className="h-4 w-4" />
                  {scanning ? 'Stop Scanning' : 'Start Camera'}
                </button>
              </div>

              {scanning ? (
                <div className="space-y-4">
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 border-2 border-purple-500 m-8 rounded-lg pointer-events-none"></div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    Position barcode within the frame to scan
                  </p>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                       Note: Full barcode scanning requires additional libraries. This is a UI mockup for demonstration.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <ScanLine className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400">Click "Start Camera" to begin scanning</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Works with any camera-enabled device</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

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
