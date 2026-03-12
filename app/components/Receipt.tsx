'use client';

import { useRef, useEffect } from 'react';
import { format } from 'date-fns';

interface ReceiptProps {
  sale: {
    id: string;
    invoiceNumber?: string;
    createdAt: string;
    totalAmount: number;
    paymentMethod: string;
    customerName?: string;
    customerPhone?: string;
    profile: {
      fullName: string;
      email: string;
    };
    saleItems: Array<{
      id: string;
      quantity: number;
      priceAtSale: number;
      subtotal: number;
      product: {
        name: string;
        sku: string;
      };
    }>;
  };
  organization: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
  };
  onClose?: () => void;
  autoPrint?: boolean;
}

export default function Receipt({ sale, organization, onClose, autoPrint = false }: ReceiptProps) {
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoPrint) {
      handlePrint();
    }
  }, [autoPrint]);

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${organization.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .receipt { max-width: 300px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 20px; }
            .store-name { font-size: 18px; font-weight: bold; }
            .details { margin: 15px 0; }
            .items { width: 100%; border-collapse: collapse; margin: 10px 0; }
            .items th { border-bottom: 1px solid #ccc; text-align: left; }
            .items td { padding: 5px 0; }
            .total { font-weight: bold; font-size: 16px; text-align: right; margin-top: 10px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            .thank-you { font-size: 14px; margin-top: 10px; }
          </style>
        </head>
        <body>
          ${printContent.outerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // Safe currency formatter – handles numbers or strings
  const formatCurrency = (amount: any) => {
    const num = typeof amount === 'number' ? amount : parseFloat(amount);
    return isNaN(num) ? 'GH₵0.00' : `GH₵${num.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => format(new Date(dateString), 'dd/MM/yyyy HH:mm');

  return (
    <div className="bg-white p-6 rounded-lg max-w-md mx-auto">
      <div ref={printRef} className="receipt print:p-0">
        {/* Store Header */}
        <div className="text-center border-b pb-4 mb-4">
          <h2 className="text-xl font-bold">{organization.name}</h2>
          {organization.address && <p className="text-sm">{organization.address}</p>}
          {organization.phone && <p className="text-sm">Tel: {organization.phone}</p>}
          {organization.email && <p className="text-sm">{organization.email}</p>}
        </div>

        {/* Receipt Info */}
        <div className="mb-4 text-sm">
          <div className="flex justify-between">
            <span>Invoice:</span>
            <span className="font-mono">{sale.invoiceNumber || sale.id.slice(0, 8)}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{formatDate(sale.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span>Cashier:</span>
            <span>{sale.profile.fullName || sale.profile.email}</span>
          </div>
          {sale.customerName && (
            <div className="flex justify-between">
              <span>Customer:</span>
              <span>{sale.customerName}</span>
            </div>
          )}
          {sale.customerPhone && (
            <div className="flex justify-between">
              <span>Phone:</span>
              <span>{sale.customerPhone}</span>
            </div>
          )}
        </div>

        {/* Items Table */}
        <table className="w-full text-sm mb-4">
          <thead>
            <tr className="border-b">
              <th className="text-left">Item</th>
              <th className="text-right">Qty</th>
              <th className="text-right">Price</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {sale.saleItems.map(item => (
              <tr key={item.id}>
                <td className="py-1">
                  <div>{item.product.name}</div>
                  <div className="text-xs text-gray-500">{item.product.sku}</div>
                </td>
                <td className="text-right align-middle">{item.quantity}</td>
                <td className="text-right align-middle">{formatCurrency(item.priceAtSale)}</td>
                <td className="text-right align-middle">{formatCurrency(item.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="border-t pt-2 text-right">
          <div className="flex justify-between font-bold text-lg">
            <span>Total:</span>
            <span>{formatCurrency(sale.totalAmount)}</span>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Payment: {sale.paymentMethod === 'cash' ? 'Cash' : sale.paymentMethod === 'card' ? 'Card' : 'Mobile Money'}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm border-t pt-4">
          <p className="thank-you">Thank you for your purchase!</p>
          <p className="text-xs text-gray-500">Goods sold are not returnable</p>
        </div>
      </div>

      {/* Buttons (only visible on screen) */}
      <div className="flex justify-center gap-3 mt-6 print:hidden">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          Print Receipt
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}