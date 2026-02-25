// components/BarcodeGenerator.tsx
"use client"

import { useState, useEffect, useRef } from 'react'

// Dynamic import for jsbarcode to avoid SSR issues
let JsBarcode: any = null;

if (typeof window !== 'undefined') {
  import('jsbarcode').then((module) => {
    JsBarcode = module.default;
  });
}

interface BarcodeGeneratorProps {
  value: string
  format?: 'CODE128' | 'EAN13' | 'UPC' | 'CODE39'
  width?: number
  height?: number
  displayValue?: boolean
  fontSize?: number
  showControls?: boolean
  onBarcodeGenerated?: (dataUrl: string) => void
}

export default function BarcodeGenerator({
  value,
  format = 'CODE128',
  width = 2,
  height = 100,
  displayValue = true,
  fontSize = 20,
  showControls = false,
  onBarcodeGenerated
}: BarcodeGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [barcodeFormat, setBarcodeFormat] = useState<string>(format)
  const [barcodeWidth, setBarcodeWidth] = useState<number>(width)
  const [barcodeHeight, setBarcodeHeight] = useState<number>(height)
  const [showValue, setShowValue] = useState<boolean>(displayValue)
  const [barcodeValue, setBarcodeValue] = useState<string>(value)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Generate barcode when values change
  useEffect(() => {
    if (isClient && canvasRef.current && barcodeValue && JsBarcode) {
      try {
        JsBarcode(canvasRef.current, barcodeValue, {
          format: barcodeFormat as any,
          width: barcodeWidth,
          height: barcodeHeight,
          displayValue: showValue,
          fontSize: fontSize,
          margin: 10,
          background: '#ffffff',
          lineColor: '#000000',
        })

        // Get data URL for download
        const dataUrl = canvasRef.current.toDataURL('image/png')
        if (onBarcodeGenerated) {
          onBarcodeGenerated(dataUrl)
        }
      } catch (error) {
        console.error('Error generating barcode:', error)
      }
    }
  }, [barcodeValue, barcodeFormat, barcodeWidth, barcodeHeight, showValue, fontSize, onBarcodeGenerated, isClient])

  const handleDownload = () => {
    if (canvasRef.current) {
      const link = document.createElement('a')
      link.download = `barcode-${barcodeValue}.png`
      link.href = canvasRef.current.toDataURL('image/png')
      link.click()
    }
  }

  const handlePrint = () => {
    if (canvasRef.current) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Print Barcode</title>
              <style>
                body { margin: 0; padding: 20px; text-align: center; }
                img { max-width: 100%; height: auto; }
                @media print {
                  button { display: none; }
                }
              </style>
            </head>
            <body>
              <h3>Barcode: ${barcodeValue}</h3>
              <img src="${canvasRef.current.toDataURL('image/png')}" alt="Barcode" />
              <br><br>
              <button onclick="window.print()">Print</button>
              <button onclick="window.close()">Close</button>
            </body>
          </html>
        `)
        printWindow.document.close()
      }
    }
  }

  // If no value, show placeholder
  if (!barcodeValue) {
    return (
      <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
        <p className="text-gray-500">Enter a value to generate barcode</p>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-700">Barcode Preview</h3>
          <div className="text-sm text-gray-500">
            Format: {barcodeFormat} | Size: {barcodeWidth}px  {barcodeHeight}px
          </div>
        </div>
        
        {/* Barcode Canvas */}
        <div className="bg-white p-4 border border-gray-200 rounded-lg flex justify-center items-center min-h-[150px]">
          <canvas ref={canvasRef} className="max-w-full" />
        </div>

        <p className="text-center text-sm text-gray-600 mt-2">
          Value: <span className="font-mono font-medium">{barcodeValue}</span>
        </p>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Barcode Value
              </label>
              <input
                type="text"
                value={barcodeValue}
                onChange={(e) => setBarcodeValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter barcode value"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Format
              </label>
              <select
                value={barcodeFormat}
                onChange={(e) => setBarcodeFormat(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="CODE128">CODE128</option>
                <option value="EAN13">EAN-13</option>
                <option value="UPC">UPC</option>
                <option value="CODE39">CODE39</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Width
              </label>
              <input
                type="range"
                min="1"
                max="5"
                step="0.5"
                value={barcodeWidth}
                onChange={(e) => setBarcodeWidth(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-500 text-center">{barcodeWidth}px</div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Height
              </label>
              <input
                type="range"
                min="50"
                max="200"
                step="10"
                value={barcodeHeight}
                onChange={(e) => setBarcodeHeight(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="text-xs text-gray-500 text-center">{barcodeHeight}px</div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showValue"
                checked={showValue}
                onChange={(e) => setShowValue(e.target.checked)}
                className="h-4 w-4 text-blue-600"
              />
              <label htmlFor="showValue" className="ml-2 text-sm text-gray-700">
                Show value
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3 mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={handleDownload}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          Download PNG
        </button>
        <button
          onClick={handlePrint}
          className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
        >
          Print
        </button>
      </div>
    </div>
  )
}
