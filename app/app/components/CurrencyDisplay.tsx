"use client"

import { formatCurrency } from "@/lib/currency"
import { useState, useEffect } from "react"

export default function CurrencyDisplay({ amount }: { amount: number }) {
  const [currency, setCurrency] = useState("GHS")
  
  useEffect(() => {
    const saved = localStorage.getItem("inventory_currency") || "GHS"
    setCurrency(saved)
    
    const handleCurrencyChange = () => {
      setCurrency(localStorage.getItem("inventory_currency") || "GHS")
    }
    
    window.addEventListener('currencychange', handleCurrencyChange)
    return () => window.removeEventListener('currencychange', handleCurrencyChange)
  }, [])
  
  return (
    <span className="font-bold text-gray-800">
      {formatCurrency(amount, currency)}
    </span>
  )
}
