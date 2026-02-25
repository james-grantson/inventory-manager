"use client"

import { useState, useEffect } from "react"

export default function ConnectionStatus() {
  const [status, setStatus] = useState("checking...")
  const [lastChecked, setLastChecked] = useState("")
  const [isConnected, setIsConnected] = useState(false)

  const checkBackend = async () => {
    try {
      setStatus("checking...")
      setIsConnected(false)
      
      const response = await fetch("https://inventory-manager-api-ghana.vercel.app/api/health")
      if (response.ok) {
        const data = await response.json()
        setStatus(` Connected - ${data.message}`)
        setIsConnected(true)
      } else {
        setStatus(" Connection failed")
        setIsConnected(false)
      }
    } catch (error) {
      setStatus(" Connection error")
      setIsConnected(false)
    }
    setLastChecked(new Date().toLocaleTimeString())
  }

  useEffect(() => {
    checkBackend()
    // Check every 60 seconds
    const interval = setInterval(checkBackend, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="p-4 bg-white rounded-xl shadow">
      <h3 className="font-semibold text-lg mb-2">Connection Status</h3>
      <div className="flex items-center justify-between">
        <div>
          <p className={isConnected ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
            {status}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Backend: inventory-manager-api-ghana.vercel.app
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Last checked: {lastChecked}</p>
          <button 
            onClick={checkBackend}
            className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
          >
            Refresh Status
          </button>
        </div>
      </div>
    </div>
  )
}
