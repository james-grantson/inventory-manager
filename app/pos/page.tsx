'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import { useOrganization } from '@/contexts/OrganizationContext';
import AuthGuard from '@/app/components/AuthGuard';
import { useApi } from '@/lib/api';
import { motion } from 'framer-motion';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Smartphone,
  DollarSign,
  Search,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Store,
  User,
  Phone
} from 'lucide-react';
import Receipt from '@/app/components/Receipt';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
}

export default function POSPage() {
  const router = useRouter();
  const { profile } = useUser();
  const { currentOrganization } = useOrganization();
  const { apiFetch } = useApi();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'mobile_money'>('cash');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [lastSale, setLastSale] = useState<any>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    if (currentOrganization) {
      fetchProducts();
    } else {
      setLoading(false);
      setError('No store selected. Please select or create a store.');
    }
  }, [currentOrganization]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(products);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredProducts(
        products.filter(p => 
          p.name.toLowerCase().includes(query) || 
          p.sku.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await apiFetch('/api/products');
      const data = await res.json();
      setProducts(data.products || []);
      setFilteredProducts(data.products || []);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      setError(error.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    if (product.quantity <= 0) return;

    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.quantity) return prev;
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
            : item
        );
      } else {
        return [...prev, {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          subtotal: product.price
        }];
      }
    });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const product = products.find(p => p.id === productId);
    if (!product) return;
    if (newQuantity > product.quantity) return;

    setCart(prev =>
      prev.map(item =>
        item.productId === productId
          ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.price }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    setSuccessMessage('');
    setError('');
    setLastSale(null);

    try {
      const res = await apiFetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.subtotal
          })),
          paymentMethod,
          totalAmount: cartTotal,
          customerName: customerName.trim() || null,
          customerPhone: customerPhone.trim() || null
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Checkout failed');
      }

      const saleData = await res.json();
      setLastSale(saleData.sale);
      setSuccessMessage('Sale completed successfully!');
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      await fetchProducts(); // refresh stock

      // Show receipt modal after successful sale
      setShowReceipt(true);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Checkout error:', error);
      setError(error.message || 'Failed to complete sale');
      setTimeout(() => setError(''), 3000);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-light dark:bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
        </div>
      </AuthGuard>
    );
  }

  if (!currentOrganization) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-light dark:bg-gray-900 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center max-w-md">
            <Store className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Store Selected</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {error || 'Please select or create a store to start selling.'}
            </p>
            <Link
              href="/admin/organizations"
              className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg"
            >
              Manage Stores
            </Link>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-light dark:bg-gray-900">
        <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/" className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Point of Sale</h1>
              </div>
              {currentOrganization && (
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Store: <span className="font-semibold text-purple-600 dark:text-purple-400">{currentOrganization.name}</span>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              {successMessage}
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Product List */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto p-2">
                  {filteredProducts.length === 0 ? (
                    <div className="col-span-2 text-center py-8 text-gray-500 dark:text-gray-400">
                      No products found
                    </div>
                  ) : (
                    filteredProducts.map(product => (
                      <motion.div
                        key={product.id}
                        whileHover={{ scale: 1.02 }}
                        className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-4 cursor-pointer border-2 ${
                          product.quantity <= 0 ? 'border-red-300 opacity-50 cursor-not-allowed' : 'border-transparent hover:border-purple-500'
                        }`}
                        onClick={() => product.quantity > 0 && addToCart(product)}
                      >
                        <h3 className="font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">SKU: {product.sku}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-lg font-bold text-green-600 dark:text-green-400">
                            GH₵{product.price.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Stock: {product.quantity}
                          </span>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Cart */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-purple-600" />
                  Cart ({cart.length} items)
                </h2>

                {cart.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-8">Cart is empty</p>
                ) : (
                  <>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto mb-4">
                      {cart.map(item => (
                        <div key={item.productId} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-2 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white text-sm">{item.name}</p>
                            <p className="text-xs text-gray-500">GH₵{item.price.toFixed(2)}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="p-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-sm">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="p-1 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => removeFromCart(item.productId)}
                              className="p-1 bg-red-100 dark:bg-red-900/20 text-red-600 rounded ml-1 hover:bg-red-200 dark:hover:bg-red-800"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                      {/* Customer Information */}
                      <div className="mb-4 space-y-3">
                        <div>
                          <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                            <User className="h-4 w-4" /> Customer Name (optional)
                          </label>
                          <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="Enter customer name"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                            <Phone className="h-4 w-4" /> Phone Number (optional)
                          </label>
                          <input
                            type="tel"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="Enter phone number"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                      </div>

                      <div className="flex justify-between text-lg font-bold mb-4">
                        <span>Total:</span>
                        <span className="text-green-600">GH₵{cartTotal.toFixed(2)}</span>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Payment Method</label>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setPaymentMethod('cash')}
                            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition-colors ${
                              paymentMethod === 'cash'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            <DollarSign className="h-4 w-4" />
                            Cash
                          </button>
                          <button
                            onClick={() => setPaymentMethod('card')}
                            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition-colors ${
                              paymentMethod === 'card'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            <CreditCard className="h-4 w-4" />
                            Card
                          </button>
                          <button
                            onClick={() => setPaymentMethod('mobile_money')}
                            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition-colors ${
                              paymentMethod === 'mobile_money'
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            <Smartphone className="h-4 w-4" />
                            Mobile
                          </button>
                        </div>
                      </div>

                      <button
                        onClick={handleCheckout}
                        disabled={submitting || cart.length === 0}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {submitting ? (
                          <><Loader2 className="h-5 w-5 animate-spin" /> Processing...</>
                        ) : (
                          'Complete Sale'
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Receipt Modal */}
        {showReceipt && lastSale && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 dark:bg-gray-900 opacity-75"></div>
              </div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                <Receipt
                  sale={lastSale}
                  organization={{
                    name: currentOrganization.name,
                    address: 'Your Store Address', // You can fetch these from organization settings if available
                    phone: '+233 XX XXX XXXX',
                    email: `${currentOrganization.name.toLowerCase().replace(/\s/g, '')}@example.com`
                  }}
                  onClose={() => {
                    setShowReceipt(false);
                    setLastSale(null);
                  }}
                  autoPrint={true}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}