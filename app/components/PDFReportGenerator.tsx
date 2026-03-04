'use client'

import { useState } from 'react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { motion } from 'framer-motion'
import {
  Download,
  FileText,
  BarChart3,
  Package,
  DollarSign,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Filter,
  RefreshCw,
  ChevronDown,
  Printer,
  Share2
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

export default function PDFReportGenerator({ products }: ReportProps) {
  const [reportType, setReportType] = useState<'inventory' | 'lowstock' | 'profit' | 'valuation'>('inventory')
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('all')
  const [category, setCategory] = useState<string>('all')
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const categories = ['all', ...new Set(products.map(p => p.category))]

  const calculateTotals = () => {
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0)
    const totalCost = products.reduce((sum, p) => sum + (p.cost * p.quantity), 0)
    const totalProfit = totalValue - totalCost
    const profitMargin = totalValue > 0 ? (totalProfit / totalValue) * 100 : 0
    
    return {
      totalProducts: products.length,
      totalItems: products.reduce((sum, p) => sum + p.quantity, 0),
      totalValue,
      totalCost,
      totalProfit,
      profitMargin,
      lowStockCount: products.filter(p => p.quantity <= p.minstock).length,
      outOfStockCount: products.filter(p => p.quantity === 0).length
    }
  }

  const filterProducts = () => {
    let filtered = [...products]
    
    if (category !== 'all') {
      filtered = filtered.filter(p => p.category === category)
    }
    
    // Date filtering would be implemented here with actual dates
    
    return filtered
  }

  const generateInventoryReport = (doc: jsPDF, filteredProducts: Product[]) => {
    const totals = calculateTotals()
    
    // Title
    doc.setFontSize(20)
    doc.setTextColor(44, 62, 80)
    doc.text('Inventory Status Report', 14, 22)
    
    // Date
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30)
    
    // Summary Cards
    doc.setFontSize(12)
    doc.setTextColor(52, 152, 219)
    doc.text('Summary', 14, 40)
    
    const summaryData = [
      ['Total Products', filteredProducts.length.toString()],
      ['Total Items', totals.totalItems.toString()],
      ['Total Value', `GH${totals.totalValue.toFixed(2)}`],
      ['Low Stock Items', totals.lowStockCount.toString()],
      ['Out of Stock', totals.outOfStockCount.toString()]
    ]
    
    autoTable(doc, {
      startY: 45,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [52, 152, 219] },
      styles: { fontSize: 10 }
    })

    // Products Table
    doc.setFontSize(12)
    doc.setTextColor(52, 152, 219)
    doc.text('Product Details', 14, doc.lastAutoTable.finalY + 15)
    
    const productData = filteredProducts.map(p => [
      p.name,
      p.sku,
      p.category,
      p.quantity.toString(),
      `${p.quantity <= p.minstock ? '' : ''}`,
      `GH${p.price.toFixed(2)}`,
      `GH${(p.price * p.quantity).toFixed(2)}`
    ])

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Product', 'SKU', 'Category', 'Stock', 'Status', 'Price', 'Total Value']],
      body: productData,
      theme: 'striped',
      headStyles: { fillColor: [52, 152, 219] },
      styles: { fontSize: 8 },
      columnStyles: {
        4: { 
          cellWidth: 15,
          halign: 'center'
        }
      }
    })
  }

  const generateLowStockReport = (doc: jsPDF, filteredProducts: Product[]) => {
    const lowStockProducts = filteredProducts.filter(p => p.quantity <= p.minstock)
    
    // Title
    doc.setFontSize(20)
    doc.setTextColor(231, 76, 60)
    doc.text('Low Stock Alert Report', 14, 22)
    
    // Date
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30)
    
    // Summary
    doc.setFontSize(12)
    doc.setTextColor(231, 76, 60)
    doc.text(`Found ${lowStockProducts.length} items requiring attention`, 14, 40)

    const productData = lowStockProducts.map(p => [
      p.name,
      p.sku,
      p.category,
      p.quantity.toString(),
      p.minstock.toString(),
      `${p.quantity === 0 ? 'OUT OF STOCK' : 'LOW'}`,
      p.supplier || 'N/A',
      p.location || 'N/A'
    ])

    autoTable(doc, {
      startY: 45,
      head: [['Product', 'SKU', 'Category', 'Current', 'Min', 'Status', 'Supplier', 'Location']],
      body: productData,
      theme: 'striped',
      headStyles: { fillColor: [231, 76, 60] },
      styles: { fontSize: 8 },
      columnStyles: {
        5: { 
          cellWidth: 25,
          halign: 'center',
          fontStyle: 'bold'
        }
      }
    })
  }

  const generateProfitReport = (doc: jsPDF, filteredProducts: Product[]) => {
    const totals = calculateTotals()
    
    // Title
    doc.setFontSize(20)
    doc.setTextColor(39, 174, 96)
    doc.text('Profit & Loss Report', 14, 22)
    
    // Date
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30)
    
    // Profit Summary
    doc.setFontSize(12)
    doc.setTextColor(39, 174, 96)
    doc.text('Financial Summary', 14, 40)
    
    const summaryData = [
      ['Total Revenue', `GH${totals.totalValue.toFixed(2)}`],
      ['Total Cost', `GH${totals.totalCost.toFixed(2)}`],
      ['Gross Profit', `GH${totals.totalProfit.toFixed(2)}`],
      ['Profit Margin', `${totals.profitMargin.toFixed(2)}%`],
      ['Items Sold', totals.totalItems.toString()]
    ]
    
    autoTable(doc, {
      startY: 45,
      head: [['Metric', 'Value']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [39, 174, 96] },
      styles: { fontSize: 10 }
    })

    // Profit by Product
    doc.setFontSize(12)
    doc.setTextColor(39, 174, 96)
    doc.text('Profit by Product', 14, doc.lastAutoTable.finalY + 15)
    
    const productData = filteredProducts.map(p => {
      const itemProfit = (p.price - p.cost) * p.quantity
      const margin = p.cost > 0 ? ((p.price - p.cost) / p.cost) * 100 : 0
      return [
        p.name,
        p.sku,
        `GH${p.cost.toFixed(2)}`,
        `GH${p.price.toFixed(2)}`,
        `GH${itemProfit.toFixed(2)}`,
        `${margin.toFixed(1)}%`,
        margin > 30 ? 'High' : margin > 15 ? 'Medium' : 'Low'
      ]
    })

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Product', 'SKU', 'Cost', 'Price', 'Profit', 'Margin', 'Performance']],
      body: productData,
      theme: 'striped',
      headStyles: { fillColor: [39, 174, 96] },
      styles: { fontSize: 8 },
      columnStyles: {
        6: { 
          cellWidth: 20,
          halign: 'center'
        }
      }
    })
  }

  const generateValuationReport = (doc: jsPDF, filteredProducts: Product[]) => {
    const totals = calculateTotals()
    
    // Title
    doc.setFontSize(20)
    doc.setTextColor(155, 89, 182)
    doc.text('Inventory Valuation Report', 14, 22)
    
    // Date
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30)
    
    // Valuation by Category
    doc.setFontSize(12)
    doc.setTextColor(155, 89, 182)
    doc.text('Valuation by Category', 14, 40)
    
    const categories = Array.from(new Set(filteredProducts.map(p => p.category)))
    const categoryData = categories.map(cat => {
      const catProducts = filteredProducts.filter(p => p.category === cat)
      const catValue = catProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0)
      const catCost = catProducts.reduce((sum, p) => sum + (p.cost * p.quantity), 0)
      const catProfit = catValue - catCost
      const percentage = (catValue / totals.totalValue) * 100
      
      return [
        cat,
        catProducts.length.toString(),
        catProducts.reduce((sum, p) => sum + p.quantity, 0).toString(),
        `GH${catValue.toFixed(2)}`,
        `GH${catProfit.toFixed(2)}`,
        `${percentage.toFixed(1)}%`
      ]
    })

    autoTable(doc, {
      startY: 45,
      head: [['Category', 'Products', 'Items', 'Value', 'Profit', 'Share']],
      body: categoryData,
      theme: 'striped',
      headStyles: { fillColor: [155, 89, 182] },
      styles: { fontSize: 9 }
    })

    // Overall Summary
    doc.setFontSize(12)
    doc.setTextColor(155, 89, 182)
    doc.text('Overall Summary', 14, doc.lastAutoTable.finalY + 15)
    
    const finalSummary = [
      ['Total Inventory Value', `GH${totals.totalValue.toFixed(2)}`],
      ['Average Item Value', `GH${(totals.totalValue / totals.totalItems).toFixed(2)}`],
      ['Total Items in Stock', totals.totalItems.toString()],
      ['Unique Categories', categories.length.toString()]
    ]
    
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 20,
      head: [['Metric', 'Value']],
      body: finalSummary,
      theme: 'striped',
      headStyles: { fillColor: [155, 89, 182] },
      styles: { fontSize: 9 }
    })
  }

  const generatePDF = () => {
    setIsGenerating(true)
    
    try {
      const doc = new jsPDF()
      const filteredProducts = filterProducts()
      
      switch(reportType) {
        case 'inventory':
          generateInventoryReport(doc, filteredProducts)
          break
        case 'lowstock':
          generateLowStockReport(doc, filteredProducts)
          break
        case 'profit':
          generateProfitReport(doc, filteredProducts)
          break
        case 'valuation':
          generateValuationReport(doc, filteredProducts)
          break
      }
      
      // Add footer with page numbers
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text(
          `Page ${i} of ${pageCount} - Generated by Inventory Manager Pro`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        )
      }
      
      // Save the PDF
      doc.save(`${reportType}-report-${new Date().toISOString().split('T')[0]}.pdf`)
      
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
          { type: 'inventory', label: 'Inventory Status', icon: Package, color: 'blue' },
          { type: 'lowstock', label: 'Low Stock Alert', icon: AlertTriangle, color: 'red' },
          { type: 'profit', label: 'Profit & Loss', icon: TrendingUp, color: 'green' },
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

      {/* Filters */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-gray-500" />
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Report Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Category</label>
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
          
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
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
      <div className="flex gap-3">
        <button
          onClick={generatePDF}
          disabled={isGenerating}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
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
        
        <button
          onClick={() => window.print()}
          className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all flex items-center gap-2"
        >
          <Printer className="h-5 w-5" />
          <span className="hidden sm:inline">Print</span>
        </button>
        
        <button
          onClick={() => {
            navigator.share?.({
              title: 'Inventory Report',
              text: `Generated ${reportType} report with ${filterProducts().length} products`
            })
          }}
          className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-all flex items-center gap-2"
        >
          <Share2 className="h-5 w-5" />
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>

      {/* Report Preview Info */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2"> Report Preview</h4>
        <p className="text-xs text-blue-700 dark:text-blue-400">
          This report will include {filterProducts().length} products 
          {category !== 'all' ? ` from ${category} category` : ''}. 
          Estimated {Math.ceil(filterProducts().length / 10)} pages.
        </p>
      </div>
    </div>
  )
}
