'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/contexts/UserContext';
import { useApi } from '@/lib/api';
import { motion } from 'framer-motion';
import { Store, Plus, LogIn, ArrowRight, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function SetupPage() {
  const router = useRouter();
  const { profile, loading: profileLoading } = useUser();
  const { apiFetch } = useApi();
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [storeName, setStoreName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasOrganizations, setHasOrganizations] = useState(false);

  useEffect(() => {
    if (!profileLoading) {
      if (!profile) {
        router.push('/login');
        return;
      }
      checkOrganizations();
    }
  }, [profile, profileLoading]);

  const checkOrganizations = async () => {
    try {
      const res = await apiFetch('/api/organizations');
      const orgs = await res.json();
      if (orgs.length > 0) {
        setHasOrganizations(true);
        setTimeout(() => router.push('/'), 2000);
      }
    } catch (err) {
      console.error('Error checking organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName.trim()) return;

    setCreating(true);
    setError('');
    setSuccess('');

    try {
      const res = await apiFetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: storeName })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create store');
      }

      setSuccess('Store created successfully! Redirecting...');
      setTimeout(() => router.push('/'), 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  if (profileLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-light dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  if (hasOrganizations) {
    return (
      <div className="min-h-screen bg-gradient-light dark:bg-gray-900 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md text-center border border-gray-200 dark:border-gray-700">
          <CheckCircle className="h-16 w-16 mx-auto text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">You already have stores!</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">Redirecting you to the dashboard...</p>
          <Link href="/" className="text-purple-600 hover:text-purple-700 dark:text-purple-400">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-light dark:bg-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-4">
            <Store className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome to Inventory Manager</h1>
          <p className="text-gray-600 dark:text-gray-300">You're almost there! Set up your first store to get started.</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Store Card */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl w-fit mb-4">
              <Plus className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Create a New Store</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Start fresh by creating your own store. You'll become the owner and can invite others later.</p>
            <form onSubmit={handleCreateStore} className="space-y-3">
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g., My Store, Shop Name"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
                disabled={creating}
              />
              <button
                type="submit"
                disabled={creating}
                className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {creating ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Creating...</>
                ) : (
                  <><ArrowRight className="h-4 w-4" /> Create Store</>
                )}
              </button>
            </form>
          </motion.div>

          {/* Join Store Card (placeholder) */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700 opacity-75"
          >
            <div className="p-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl w-fit mb-4">
              <LogIn className="h-6 w-6 text-gray-500 dark:text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Join an Existing Store</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Have an invite? Ask the store admin to add you. Once added, you'll see the store here.
            </p>
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                To join a store, an admin must add you using your email. After that, this page will automatically redirect you to the dashboard.
              </p>
            </div>
          </motion.div>
        </div>

        <p className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
          Already have a store? <Link href="/login" className="text-purple-600 hover:text-purple-700 dark:text-purple-400">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}