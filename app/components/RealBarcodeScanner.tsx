'use client'

import { useState, useRef, useEffect } from 'react'
import { BrowserMultiFormatReader, Result } from '@zxing/library'
import Webcam from 'react-webcam'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera,
  ScanLine,
  X,
  Check,
  RefreshCw,
  Maximize2,
  Minimize2,
  Zap,
  ZapOff,
  Settings,
  Barcode as BarcodeIcon
} from 'lucide-react'

interface RealBarcodeScannerProps {
  onScan: (value: string) => void
  onClose?: () => void
}

export default function RealBarcodeScanner({ onScan, onClose }: RealBarcodeScannerProps) {
  const [scanning, setScanning] = useState(true)
  const [scannedValue, setScannedValue] = useState('')
  const [error, setError] = useState('')
  const [torchOn, setTorchOn] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDevice, setSelectedDevice] = useState('')
  const [scanHistory, setScanHistory] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  const webcamRef = useRef<Webcam>(null)
  const codeReader = useRef<BrowserMultiFormatReader | null>(null)
  const scanningRef = useRef(false)

  useEffect(() => {
    // Initialize barcode reader
    codeReader.current = new BrowserMultiFormatReader()
    
    // Get available cameras
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const videoDevices = devices.filter(device => device.kind === 'videoinput')
        setDevices(videoDevices)
        if (videoDevices.length > 0) {
          setSelectedDevice(videoDevices[0].deviceId)
        }
      })
      .catch(err => {
        console.error('Error enumerating devices:', err)
        setError('Could not access camera devices')
      })

    return () => {
      stopScanning()
    }
  }, [])

  useEffect(() => {
    if (scanning && webcamRef.current && selectedDevice) {
      startScanning()
    } else {
      stopScanning()
    }
  }, [scanning, selectedDevice, webcamRef.current])

  const startScanning = async () => {
    if (!codeReader.current || scanningRef.current) return
    
    scanningRef.current = true
    setIsLoading(true)
    setError('')

    try {
      const videoElement = webcamRef.current?.video
      if (!videoElement) {
        throw new Error('Video element not available')
      }

      // Ensure video is playing
      if (videoElement.readyState < 2) {
        await new Promise(resolve => {
          videoElement.onloadeddata = resolve
        })
      }

      codeReader.current.decodeFromVideoDevice(
        selectedDevice,
        videoElement,
        (result: Result | undefined, error: Error | undefined) => {
          if (result) {
            const barcodeValue = result.getText()
            setScannedValue(barcodeValue)
            setScanHistory(prev => [barcodeValue, ...prev].slice(0, 10))
            
            // Beep or vibrate
            if (navigator.vibrate) {
              navigator.vibrate(100)
            }
            
            // Optional: auto-add after short delay
            setTimeout(() => {
              onScan(barcodeValue)
            }, 500)
          }
          
          if (error && !result) {
            // Silent error - just keep scanning
          }
        }
      )
    } catch (err) {
      console.error('Scanning error:', err)
      setError('Failed to start scanning. Please check camera permissions.')
    } finally {
      setIsLoading(false)
    }
  }

  const stopScanning = () => {
    if (codeReader.current) {
      codeReader.current.reset()
      scanningRef.current = false
    }
  }

  const toggleTorch = async () => {
    if (!webcamRef.current?.video) return
    
    try {
      const stream = webcamRef.current.video.srcObject as MediaStream
      const track = stream.getVideoTracks()[0]
      
      // Check if torch is supported
      const capabilities = track.getCapabilities() as any
      if (capabilities.torch) {
        await track.applyConstraints({
          advanced: [{ torch: !torchOn }] as any
        })
        setTorchOn(!torchOn)
      } else {
        setError('Torch not supported on this device')
      }
    } catch (err) {
      console.error('Torch error:', err)
      setError('Could not toggle torch')
    }
  }

  const handleScanComplete = (value: string) => {
    onScan(value)
    setScannedValue('')
  }

  const clearHistory = () => {
    setScanHistory([])
  }

  const retryScan = () => {
    setError('')
    setScannedValue('')
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 ${
      fullscreen ? 'fixed inset-4 z-50' : ''
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <ScanLine className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Barcode Scanner</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {scanning ? 'Scanning...' : 'Camera off'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Camera Selection */}
          {devices.length > 1 && (
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300"
            >
              {devices.map((device, index) => (
                <option key={device.deviceId} value={device.deviceId}>
                  Camera {index + 1}
                </option>
              ))}
            </select>
          )}

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={fullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {fullscreen ? <Minimize2 className="h-4 w-4 text-gray-600 dark:text-gray-400" /> : <Maximize2 className="h-4 w-4 text-gray-600 dark:text-gray-400" />}
          </button>

          {/* Close Button */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Camera View */}
      <div className="relative bg-black aspect-video">
        <Webcam
          ref={webcamRef}
          audio={false}
          videoConstraints={{
            deviceId: selectedDevice,
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }}
          className="absolute inset-0 w-full h-full object-cover"
          screenshotFormat="image/jpeg"
        />

        {/* Scanning Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 border-2 border-purple-500 rounded-lg animate-pulse"></div>
        </div>

        {/* Scanning Line Animation */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-scan"></div>

        {/* Controls Overlay */}
        <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3 pointer-events-none">
          <div className="bg-black/50 backdrop-blur-sm rounded-full p-1 flex gap-2 pointer-events-auto">
            <button
              onClick={() => setScanning(!scanning)}
              className={`p-3 rounded-full transition-all ${
                scanning 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
              title={scanning ? 'Stop Scanning' : 'Start Scanning'}
            >
              {scanning ? <ZapOff className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
            </button>

            <button
              onClick={toggleTorch}
              className="p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
              title={torchOn ? 'Turn off torch' : 'Turn on torch'}
            >
              {torchOn ? <Zap className="h-5 w-5 text-yellow-400" /> : <Zap className="h-5 w-5" />}
            </button>

            {error && (
              <button
                onClick={retryScan}
                className="p-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-full transition-colors"
                title="Retry"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Scanned Value Popup */}
        <AnimatePresence>
          {scannedValue && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="absolute bottom-24 left-0 right-0 mx-auto w-64 bg-green-600 text-white rounded-lg p-3 shadow-xl text-center pointer-events-auto"
            >
              <div className="flex items-center justify-between mb-1">
                <Check className="h-4 w-4" />
                <span className="text-sm font-medium">Barcode Detected!</span>
                <button
                  onClick={() => setScannedValue('')}
                  className="text-white/80 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs font-mono break-all">{scannedValue}</p>
              <button
                onClick={() => handleScanComplete(scannedValue)}
                className="mt-2 w-full px-2 py-1 bg-green-700 hover:bg-green-800 rounded text-xs transition-colors"
              >
                Add to List
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="absolute top-4 left-0 right-0 mx-auto w-64 bg-red-600 text-white rounded-lg p-3 shadow-xl text-center">
            <p className="text-xs">{error}</p>
          </div>
        )}
      </div>

      {/* Scan History */}
      {scanHistory.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Recent Scans</h4>
            <button
              onClick={clearHistory}
              className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              Clear
            </button>
          </div>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {scanHistory.map((value, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <span className="text-xs font-mono text-gray-900 dark:text-white">{value}</span>
                <button
                  onClick={() => handleScanComplete(value)}
                  className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors"
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-2">
          <BarcodeIcon className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Position the barcode within the purple frame. The scanner will automatically detect and read it.
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Supported formats: CODE128, EAN13, UPC, QR Code, Data Matrix, PDF417, and more.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(1000%); }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  )
}
