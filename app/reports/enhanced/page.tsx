'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
import { useApi } from '@/lib/api';
import AuthGuard from '@/app/components/AuthGuard';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  Calendar, 
  Download, 
  TrendingUp, 
  DollarSign, 
  PieChart,
  Loader2,
  FileText,
  BarChart
} from 'lucide-react';

interface DailyData {
  date: string;
  salesCount: number;
  totalAmount: number;
  totalCost: number;
  totalProfit: number;
}

interface ReportData {
  summary: {
    totalSales: number;
    totalCost: number;
    totalProfit: number;
    grossProfitMargin: number;
    salesCount: number;
  };
  daily: DailyData[];
}

export default function EnhancedReportsPage() {
  const router = useRouter();
  const { profile } = useUser();
  const { apiFetch } = useApi();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [error, setError] = useState('');

  const fetchReport = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ startDate, endDate });
      const res = await apiFetch(`/api/reports/sales-summary?${params}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch report');
      }
      const data = await res.json();
      setReportData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `GH₵${amount.toFixed(2)}`;

  if (profile?.role === 'cashier') {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-light dark:bg-gray-900 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg text-center max-w-md">
            <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">You do not have permission to view reports.</p>
            <Link href="/" className="text-purple-600 hover:text-purple-700 dark:text-purple-400">
              Go to Dashboard
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
            <div className="flex items-center gap-4">
              <Link href="/reports" className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Enhanced Sales Report</h1>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Date Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 mb-8"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-purple-600" />
              Select Date Range
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <button
                onClick={fetchReport}
                disabled={loading || !startDate || !endDate}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BarChart className="h-4 w-4" />}
                Generate Report
              </button>
            </div>
            {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
          </motion.div>

          {/* Report Results */}
          {reportData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Sales</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(reportData.summary.totalSales)}</p>
                  <p className="text-xs text-gray-500 mt-1">{reportData.summary.salesCount} transactions</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Cost</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(reportData.summary.totalCost)}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Profit</p>
                  </div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(reportData.summary.totalProfit)}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <PieChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Gross Margin</p>
                  </div>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{reportData.summary.grossProfitMargin}%</p>
                </div>
              </div>

              {/* Daily Breakdown Table */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Daily Breakdown</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sales</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cost</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Profit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {reportData.daily.map((day) => (
                        <tr key={day.date} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {format(new Date(day.date), 'dd MMM yyyy')}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 text-right">{day.salesCount}</td>
                          <td className="px-6 py-4 text-sm text-green-600 dark:text-green-400 text-right">{formatCurrency(day.totalAmount)}</td>
                          <td className="px-6 py-4 text-sm text-red-600 dark:text-red-400 text-right">{formatCurrency(day.totalCost)}</td>
                          <td className="px-6 py-4 text-sm font-medium text-green-600 dark:text-green-400 text-right">{formatCurrency(day.totalProfit)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Download Button (placeholder) */}
              <div className="flex justify-end">
                <button
                  onClick={() => alert('Export feature coming soon!')}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg flex items-center gap-2 border border-gray-200 dark:border-gray-700"
                >
                  <Download className="h-4 w-4" />
                  Export as CSV
                </button>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}