'use client'

import { useState } from 'react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import {
  Download,
  Package,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Filter,
  RefreshCw,
  Printer
} from 'lucide-react'

interface Product {
  id: string
  name: string
  sku: string
  description: string
  category: string
  price: number
  cost: number
  quantity: number
  minstock: number
  supplier: string
  location: string
}

interface ReportProps {
  products: Product[]
}

// Extend jsPDF type to include autoTable properties
interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: {
    finalY: number
  }
  getNumberOfPages?: () => number
}

export default function PDFReportGenerator({ products }: ReportProps) {
  const [reportType, setReportType] = useState<'inventory' | 'lowstock' | 'profit' | 'valuation'>('inventory')
  const [category, setCategory] = useState<string>('all')
  const [isGenerating, setIsGenerating] = useState(false)

  // Get unique categories
  const uniqueCategories = products.map(p => p.category).filter((value, index, self) => self.indexOf(value) === index)
  const categories = ['all', ...uniqueCategories]

  const calculateTotals = () => {
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0)
    const totalCost = products.reduce((sum, p) => sum + (p.cost * p.quantity), 0)
    const totalProfit = totalValue - totalCost
    
    return {
      totalProducts: products.length,
      totalItems: products.reduce((sum, p) => sum + p.quantity, 0),
      totalValue,
      totalCost,
      totalProfit,
      lowStockCount: products.filter(p => p.quantity <= p.minstock).length
    }
  }

  const filterProducts = () => {
    let filtered = [...products]
    if (category !== 'all') {
      filtered = filtered.filter(p => p.category === category)
    }
    return filtered
  }

  const generatePDF = () => {
    setIsGenerating(true)
    
    try {
      const doc = new jsPDF() as jsPDFWithAutoTable
      const filteredProducts = filterProducts()
      const totals = calculateTotals()
      
      // Set title based on report type
      let title = 'Inventory Report'
      let headerColor: [number, number, number] = [52, 152, 219]
      
      switch(reportType) {
        case 'lowstock':
          title = 'Low Stock Alert Report'
          headerColor = [231, 76, 60]
          break
        case 'profit':
          title = 'Profit & Loss Report'
          headerColor = [39, 174, 96]
          break
        case 'valuation':
          title = 'Inventory Valuation Report'
          headerColor = [155, 89, 182]
          break
      }
      
      // Title
      doc.setFontSize(20)
      doc.setTextColor(headerColor[0], headerColor[1], headerColor[2])
      doc.text(title, 14, 22)
      
      // Date
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30)
      
      // Summary
      doc.setFontSize(12)
      doc.setTextColor(headerColor[0], headerColor[1], headerColor[2])
      doc.text('Summary', 14, 40)
      
      const summaryData = [
        ['Total Products', filteredProducts.length.toString()],
        ['Total Items', totals.totalItems.toString()],
        ['Total Value', `GH₵${totals.totalValue.toFixed(2)}`],
        ['Low Stock Items', totals.lowStockCount.toString()]
      ]
      
      autoTable(doc, {
        startY: 45,
        head: [['Metric', 'Value']],
        body: summaryData,
        theme: 'striped',
        headStyles: { fillColor: headerColor }
      })

      // Get position after first table
      const finalY = doc.lastAutoTable?.finalY || 80

      // Products table
      doc.setFontSize(12)
      doc.setTextColor(headerColor[0], headerColor[1], headerColor[2])
      doc.text('Products', 14, finalY + 10)
      
      const productData = filteredProducts.map(p => [
        p.name.substring(0, 30),
        p.sku,
        p.category,
        p.quantity.toString(),
        `GH${p.price.toFixed(2)}`,
        `GH${(p.price * p.quantity).toFixed(2)}`
      ])

      autoTable(doc, {
        startY: finalY + 15,
        head: [['Product', 'SKU', 'Category', 'Stock', 'Price', 'Total']],
        body: productData,
        theme: 'striped',
        headStyles: { fillColor: headerColor }
      })
      
      // Simple footer - just add it on the last page
      const pageCount = doc.getNumberOfPages ? doc.getNumberOfPages() : 1
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        )
      }
      
      // Save PDF
      const dateStr = new Date().toISOString().split('T')[0]
      doc.save(`${reportType}-report-${dateStr}.pdf`)
      
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const totals = calculateTotals()

  return (
    <div className="space-y-6">
      {/* Report Type Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { type: 'inventory', label: 'Inventory', icon: Package, color: 'blue' },
          { type: 'lowstock', label: 'Low Stock', icon: AlertTriangle, color: 'red' },
          { type: 'profit', label: 'Profit', icon: TrendingUp, color: 'green' },
          { type: 'valuation', label: 'Valuation', icon: DollarSign, color: 'purple' }
        ].map((item) => (
          <button
            key={item.type}
            onClick={() => setReportType(item.type as any)}
            className={`p-4 rounded-xl border-2 transition-all ${
              reportType === item.type
                ? `border-${item.color}-500 bg-${item.color}-50 dark:bg-${item.color}-900/20`
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <item.icon className={`h-6 w-6 mx-auto mb-2 text-${item.color}-600 dark:text-${item.color}-400`} />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.label}</p>
          </button>
        ))}
      </div>

      {/* Category Filter */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Category</h3>
        </div>
        
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'All Categories' : cat}
            </option>
          ))}
        </select>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">Products</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white">{totals.totalProducts}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Value</p>
          <p className="text-lg font-bold text-green-600 dark:text-green-400">GH{totals.totalValue.toFixed(0)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">Total Profit</p>
          <p className="text-lg font-bold text-purple-600 dark:text-purple-400">GH{totals.totalProfit.toFixed(0)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">Low Stock</p>
          <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{totals.lowStockCount}</p>
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={generatePDF}
        disabled={isGenerating}
        className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
      >
        {isGenerating ? (
          <>
            <RefreshCw className="h-5 w-5 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Download className="h-5 w-5" />
            Generate {reportType === 'inventory' ? 'Inventory' : 
                     reportType === 'lowstock' ? 'Low Stock' : 
                     reportType === 'profit' ? 'Profit' : 'Valuation'} Report
          </>
        )}
      </button>
    </div>
  )
}
