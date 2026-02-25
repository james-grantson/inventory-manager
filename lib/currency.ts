export const formatCurrency = (amount: number, currency: string = 'GHS'): string => {
  const symbols: Record<string, string> = {
    'GHS': 'GH',
    'USD': '$',
    'EUR': '',
    'GBP': '',
    'NGN': ''
  }
  
  const symbol = symbols[currency] || currency
  return `${symbol}${amount.toFixed(2)}`
}

export const convertCurrency = (amount: number, from: string, to: string): number => {
  // Mock conversion rates - replace with real API later
  const rates: Record<string, number> = {
    'GHS': 1,
    'USD': 0.083,
    'EUR': 0.076,
    'GBP': 0.065,
    'NGN': 125
  }
  
  if (!rates[from] || !rates[to]) return amount
  return (amount / rates[from]) * rates[to]
}
