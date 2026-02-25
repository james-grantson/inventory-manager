// lib/currency.ts - Currency configuration
export type Currency = {
  code: string;
  symbol: string;
  name: string;
  locale: string;
  decimalDigits: number;
};

export const CURRENCIES: Record<string, Currency> = {
  GHS: { code: 'GHS', symbol: '', name: 'Ghana Cedis', locale: 'en-GH', decimalDigits: 2 },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US', decimalDigits: 2 },
  EUR: { code: 'EUR', symbol: '', name: 'Euro', locale: 'de-DE', decimalDigits: 2 },
  GBP: { code: 'GBP', symbol: '', name: 'British Pound', locale: 'en-GB', decimalDigits: 2 },
  NGN: { code: 'NGN', symbol: '', name: 'Nigerian Naira', locale: 'en-NG', decimalDigits: 2 }
};

export const DEFAULT_CURRENCY = 'GHS';

export function formatCurrency(amount: number, currencyCode: string = DEFAULT_CURRENCY): string {
  const currency = CURRENCIES[currencyCode] || CURRENCIES[DEFAULT_CURRENCY];
  return new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: currency.decimalDigits,
    maximumFractionDigits: currency.decimalDigits
  }).format(amount);
}

export function getCurrencySymbol(currencyCode: string = DEFAULT_CURRENCY): string {
  return CURRENCIES[currencyCode]?.symbol || CURRENCIES[DEFAULT_CURRENCY].symbol;
}
