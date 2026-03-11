'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Sparkles, Gem, Layout, Plus } from 'lucide-react'
import { getAuthToken } from '@/lib/auth'
import ClassicDashboard from './classic-dashboard'
import SimpleDashboard from './simple-dashboard'
import SophisticatedDashboard from './sophisticated-dashboard'

export default function DashboardPage() {
  const router = useRouter()
  const [dashboardStyle, setDashboardStyle] = useState<'classic' | 'simple' | 'sophisticated'>('simple')
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragRef = useRef<HTMLDivElement>(null)
  const dragStart = useRef({ x: 0, y: 0, left: 0, top: 0 })

  // Load saved position from localStorage
  useEffect(() => {
    const savedPos = localStorage.getItem('floatingButtonsPos')
    if (savedPos) {
      try {
        const { x, y } = JSON.parse(savedPos)
        setPosition({ x, y })
      } catch (e) {}
    }
  }, [])

  // Save position when it changes (debounced)
  useEffect(() => {
    if (!isDragging) {
      localStorage.setItem('floatingButtonsPos', JSON.stringify(position))
    }
  }, [position, isDragging])

  useEffect(() => {
    const saved = localStorage.getItem('dashboardStyle') as 'classic' | 'simple' | 'sophisticated'
    if (saved) setDashboardStyle(saved)
    
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = await getAuthToken()
      if (!token) {
        router.push('/login')
        return
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const cycleDashboard = () => {
    const next = {
      'classic': 'simple',
      'simple': 'sophisticated',
      'sophisticated': 'classic'
    }[dashboardStyle] as 'classic' | 'simple' | 'sophisticated'
    
    setDashboardStyle(next)
    localStorage.setItem('dashboardStyle', next)
  }

  const getButtonInfo = () => {
    switch(dashboardStyle) {
      case 'classic': 
        return { 
          next: 'Simple', 
          icon: Layout, 
          color: 'from-blue-600 to-blue-700',
          label: 'Classic'
        }
      case 'simple': 
        return { 
          next: 'Sophisticated', 
          icon: Sparkles, 
          color: 'from-purple-600 to-pink-600',
          label: 'Simple'
        }
      case 'sophisticated': 
        return { 
          next: 'Classic', 
          icon: Gem, 
          color: 'from-green-600 to-emerald-600',
          label: 'Sophisticated'
        }
    }
  }

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!dragRef.current) return
    e.preventDefault()
    setIsDragging(true)
    const rect = dragRef.current.getBoundingClientRect()
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      left: rect.left,
      top: rect.top,
    }
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return
    e.preventDefault()
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    setPosition({
      x: dragStart.current.left + dx,
      y: dragStart.current.top + dy,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    } else {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
      </div>
    )
  }

  const buttonInfo = getButtonInfo()

  return (
    <>
      {/* Draggable floating action buttons */}
      <div
        ref={dragRef}
        onMouseDown={handleMouseDown}
        style={{
          position: 'fixed',
          left: position.x || undefined,
          right: position.x ? undefined : '1rem', // fallback to right if not dragged
          top: position.y || undefined,
          bottom: position.y ? undefined : 'auto',
          cursor: isDragging ? 'grabbing' : 'grab',
          zIndex: 50,
          display: 'flex',
          gap: '0.5rem',
        }}
        className="select-none"
      >
        <Link
          href="/products/add"
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg shadow-lg flex items-center justify-center transition-colors"
          title="Add Product"
        >
          <Plus className="h-5 w-5" />
        </Link>
        
        <button
          onClick={cycleDashboard}
          className={`bg-gradient-to-r ${buttonInfo.color} hover:opacity-90 text-white p-3 rounded-lg shadow-lg flex items-center justify-center transition-all`}
          title={`Switch to ${buttonInfo.next} Dashboard`}
        >
          <buttonInfo.icon className="h-5 w-5" />
        </button>
      </div>

      {/* Current Dashboard Label (for debugging) */}
      <div className="fixed top-4 left-4 z-50 bg-black/50 text-white px-3 py-1 rounded-lg text-sm">
        Current: {buttonInfo.label}
      </div>

      {/* Render the selected dashboard */}
      {dashboardStyle === 'classic' && <ClassicDashboard products={products} />}
      {dashboardStyle === 'simple' && <SimpleDashboard products={products} />}
      {dashboardStyle === 'sophisticated' && <SophisticatedDashboard products={products} />}
    </>
  )
}