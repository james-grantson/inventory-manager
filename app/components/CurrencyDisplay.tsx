'use client'

import { formatCurrency } from '@/lib/currency'

export default function CurrencyDisplay({ amount, currency = 'GHS' }: { amount: number; currency?: string }) {
  return (
    <span className="font-mono">
      {formatCurrency(amount, currency)}
    </span>
  )
}
