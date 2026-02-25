"use client"

import { CURRENCIES, DEFAULT_CURRENCY } from "@/lib/currency"
import { useState, useEffect } from "react"

export default function CurrencySelector() {
  const [selectedCurrency, setSelectedCurrency] = useState(DEFAULT_CURRENCY)
  
  useEffect(() => {
    const saved = localStorage.getItem("inventory_currency")
    if (saved && CURRENCIES[saved]) {
      setSelectedCurrency(saved)
    }
  }, [])
  
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value
    setSelectedCurrency(newCurrency)
    localStorage.setItem("inventory_currency", newCurrency)
    window.dispatchEvent(new Event('currencychange'))
  }
  
  return (
    <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow">
      <span className="font-semibold text-gray-700">Currency:</span>
      
      <select
        value={selectedCurrency}
        onChange={handleChange}
        className="px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {Object.entries(CURRENCIES).map(([code, currency]) => (
          <option key={code} value={code}>
            {currency.symbol} {currency.name} ({currency.code})
          </option>
        ))}
      </select>
      
      <div className="text-sm text-gray-600">
        Selected: <span className="font-bold">{CURRENCIES[selectedCurrency]?.symbol} {selectedCurrency}</span>
      </div>
    </div>
  )
}
