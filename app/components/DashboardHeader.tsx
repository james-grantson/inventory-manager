'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus,
  Layout,
  ChevronDown,
  Gem,
  Sparkles,
  Sun,
  Moon,
  Bell,
  BarChart3,
  Tags,
  Mail,
  LogOut,
  User,
  Store,
  BarChart
} from 'lucide-react'
import { supabase } from '@/lib/supabase-client'
import { useUser } from '@/contexts/UserContext'
import { useOrganization } from '@/contexts/OrganizationContext'

interface DashboardHeaderProps {
  title: string
  icon: React.ReactNode
  subtitle?: string
  currentDashboard: 'classic' | 'simple' | 'sophisticated'
  lastUpdated?: Date | null
  darkMode: boolean
  setDarkMode: (value: boolean) => void
  onRefresh?: () => void
}

export default function DashboardHeader({
  title,
  icon, 
  subtitle,
  currentDashboard,
  lastUpdated,
  darkMode,
  setDarkMode,
  onRefresh
}: DashboardHeaderProps) {
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [orgDropdownOpen, setOrgDropdownOpen] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const { profile } = useUser()
  const { organizations, currentOrganization, setCurrentOrganization } = useOrganization()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email ?? null)
      }
    }
    getUser()
  }, [])

  const switchDashboard = (dashboard: string) => {
    setDropdownOpen(false)
    localStorage.setItem('dashboardStyle', dashboard)
    window.location.href = '/'
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Left side - Title, icon, and dashboard switcher */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 dark:from-purple-600 dark:to-pink-600 rounded-xl blur-lg opacity-50"></div>
              <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 dark:from-purple-700 dark:to-pink-700 p-3 rounded-xl">
                {icon}
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>   
              {subtitle && (
                <p className="text-gray-600 dark:text-gray-300 text-sm flex items-center gap-2">
                  {lastUpdated && (
                    <>
                      <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-600"></span>
                    </>
                  )}
                  <span className="flex items-center gap-1">
                    <span className={`w-2 h-2 rounded-full ${
                      currentDashboard === 'classic' ? 'bg-blue-500' : 
                      currentDashboard === 'simple' ? 'bg-purple-500' :
                      'bg-pink-500'
                    }`}></span>
                    {currentDashboard.charAt(0).toUpperCase() + currentDashboard.slice(1)} Mode
                  </span>
                </p>
              )}
            </div>

            {/* Dashboard Switcher Button (moved to left) */}
            <div className="relative ml-4" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 transition-all duration-300 hover:scale-105"
              >
                <Layout className="h-4 w-4" />
                <span className="font-medium">Dashboard</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute left-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                  >
                    <button
                      onClick={() => switchDashboard('classic')}
                      className={`w-full px-4 py-3 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 ${
                        currentDashboard === 'classic' ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700' : ''
                      }`}
                    >
                      <Gem className={`h-4 w-4 ${currentDashboard === 'classic' ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                      <span>Classic Dashboard</span>
                      {currentDashboard === 'classic' && (
                        <span className="ml-auto text-xs bg-white/20 px-2 py-1 rounded text-white">Current</span>
                      )}
                    </button>
                    <button
                      onClick={() => switchDashboard('simple')}
                      className={`w-full px-4 py-3 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 border-t border-gray-200 dark:border-gray-700 ${
                        currentDashboard === 'simple' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600' : ''
                      }`}
                    >
                      <Layout className={`h-4 w-4 ${currentDashboard === 'simple' ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                      <span>Simple Dashboard</span>
                      {currentDashboard === 'simple' && (
                        <span className="ml-auto text-xs bg-white/20 px-2 py-1 rounded text-white">Current</span>
                      )}
                    </button>
                    <button
                      onClick={() => switchDashboard('sophisticated')}
                      className={`w-full px-4 py-3 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 border-t border-gray-200 dark:border-gray-700 ${
                        currentDashboard === 'sophisticated' ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600' : ''
                      }`}
                    >
                      <Sparkles className={`h-4 w-4 ${currentDashboard === 'sophisticated' ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                      <span>Sophisticated Dashboard</span>
                      {currentDashboard === 'sophisticated' && (
                        <span className="ml-auto text-xs bg-white/20 px-2 py-1 rounded text-white">Current</span>
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right side - Controls */}
          <div className="flex items-center space-x-3">
            {/* Add Product Button (only for non-cashiers) */}
            {profile?.role !== 'cashier' && (
              <Link
                href="/products/add"
                className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg flex items-center justify-center transition-colors"
                title="Add Product"
              >
                <Plus className="h-5 w-5" />
              </Link>
            )}

            {/* POS Link */}
            <Link 
              href="/pos" 
              className="p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-all border border-gray-200 dark:border-gray-700" 
              title="Point of Sale"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </Link>

            <Link 
              href="/barcode" 
              className="p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-all border border-gray-200 dark:border-gray-700" 
              title="Barcode Generator"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </Link>
            
            {/* Simple Reports Link */}
            {profile?.role !== 'cashier' && (
              <Link 
                href="/reports" 
                className="p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-all border border-gray-200 dark:border-gray-700" 
                title="Simple Reports"
              >
                <BarChart3 className="h-5 w-5" />
              </Link>
            )}

            {/* Enhanced Reports Link */}
            {profile?.role !== 'cashier' && (
              <Link
                href="/reports/enhanced"
                className="p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-all border border-gray-200 dark:border-gray-700"
                title="Enhanced Reports"
              >
                <BarChart className="h-5 w-5" />
              </Link>
            )}

            <Link 
              href="/categories" 
              className="p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-all border border-gray-200 dark:border-gray-700" 
              title="Manage Categories"
            >
              <Tags className="h-5 w-5" />
            </Link>

            {onRefresh && (
              <button
                onClick={onRefresh}
                className="p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-all border border-gray-200 dark:border-gray-700"
                title="Refresh (Ctrl+R)"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}

            {/* Global User Management – only for super admins */}
            {profile?.isSuperAdmin && (
              <Link
                href="/admin/users"
                className="p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-all border border-gray-200 dark:border-gray-700"
                title="Manage Users (Global)"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </Link>
            )}

            {/* Organization Switcher */}
            {organizations.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setOrgDropdownOpen(!orgDropdownOpen)}
                  className="p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-all border border-gray-200 dark:border-gray-700 flex items-center gap-1"
                  title="Switch Store"
                >
                  <Store className="h-5 w-5" />
                  {currentOrganization && <span className="text-sm hidden md:inline">{currentOrganization.name}</span>}
                </button>
                <AnimatePresence>
                  {orgDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                    >
                      {organizations.map(org => (
                        <button
                          key={org.id}
                          onClick={() => {
                            setCurrentOrganization(org);
                            setOrgDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 ${
                            currentOrganization?.id === org.id ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600' : ''
                          }`}
                        >
                          <Store className={`h-4 w-4 ${currentOrganization?.id === org.id ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                          <span>{org.name}</span>
                          {currentOrganization?.id === org.id && (
                            <span className="ml-auto text-xs bg-white/20 px-2 py-1 rounded text-white">Current</span>
                          )}
                        </button>
                      ))}
                      <div className="border-t border-gray-200 dark:border-gray-700">
                        <Link
                          href="/admin/organizations"
                          className="w-full px-4 py-3 text-left text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                          onClick={() => setOrgDropdownOpen(false)}
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <span>Manage Stores</span>
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* User email display with profile link */}
            <Link
              href="/profile"
              className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors"
              title="View Profile"
            >
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300 max-w-[150px] truncate">
                {userEmail || 'Loading...'}
              </span>
            </Link>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-all border border-gray-200 dark:border-gray-700"
              title="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <button className="p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-all border border-gray-200 dark:border-gray-700 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>

            <button
              onClick={handleLogout}
              className="p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl transition-all border border-gray-200 dark:border-gray-700"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}