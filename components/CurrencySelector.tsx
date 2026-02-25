// components/CurrencySelector.tsx
"use client"

import { useState, useEffect } from 'react'

export interface Currency {
  code: string
  name: string
  symbol: string
  rate?: number // Exchange rate relative to GHS
}

const CURRENCIES: Currency[] = [
  { code: 'GHS', name: 'Ghana Cedi', symbol: 'GH₵', rate: 1 },
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 13.5 }, // Approx rate
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 14.2 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 16.8 },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', rate: 0.08 },
]

interface CurrencySelectorProps {
  value?: string
  onChange?: (currencyCode: string) => void
  showLabel?: boolean
  className?: string
}

export default function CurrencySelector({ 
  value = 'GHS', 
  onChange,
  showLabel = true,
  className = '' 
}: CurrencySelectorProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<string>(value)

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCurrency = e.target.value
    setSelectedCurrency(newCurrency)
    if (onChange) {
      onChange(newCurrency)
    }
  }

  const getCurrencyByCode = (code: string): Currency | undefined => {
    return CURRENCIES.find(c => c.code === code)
  }

  const selected = getCurrencyByCode(selectedCurrency) || CURRENCIES[0]

  return (
    <div className={`flex flex-col ${className}`}>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Currency
        </label>
      )}
      <div className="flex items-center space-x-2">
        <select
          value={selectedCurrency}
          onChange={handleChange}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          {CURRENCIES.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.code} - {currency.name} ({currency.symbol})
            </option>
          ))}
        </select>
        <div className="flex-shrink-0">
          <span className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium bg-gray-50 text-gray-700">
            {selected.symbol}
          </span>
        </div>
      </div>
      {selected.rate && selected.code !== 'GHS' && (
        <p className="mt-1 text-xs text-gray-500">
          1 {selected.code} ≈ {selected.rate} GHS
        </p>
      )}
    </div>
  )
}

// Currency formatting utility
export function formatCurrency(amount: number, currencyCode: string = 'GHS'): string {
  const currency = CURRENCIES.find(c => c.code === currencyCode) || CURRENCIES[0]
  
  const formatter = new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  
  return formatter.format(amount)
}

// Currency conversion utility
export function convertCurrency(
  amount: number, 
  fromCurrency: string, 
  toCurrency: string = 'GHS'
): number {
  const from = CURRENCIES.find(c => c.code === fromCurrency)
  const to = CURRENCIES.find(c => c.code === toCurrency)
  
  if (!from || !to || !from.rate || !to.rate) {
    return amount // Fallback
  }
  
  // Convert to GHS first, then to target currency
  const amountInGHS = amount * from.rate
  return amountInGHS / to.rate
}
