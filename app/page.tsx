'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Package, 
  DollarSign, 
  AlertTriangle, 
  Layers,
  ArrowRight,
  Plus,
  FileText,
  Barcode,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`)
      const data = await res.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => `GH${amount.toFixed(2)}`

  const totalProducts = products.length
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.quantity), 0)
  const totalItems = products.reduce((sum, p) => sum + p.quantity, 0)
  const lowStock = products.filter(p => p.quantity <= (p.minstock || 10)).length
  const outOfStock = products.filter(p => p.quantity === 0).length
  const healthyStock = products.filter(p => p.quantity > (p.minstock || 10)).length

  // Category breakdown
  const categories = products.reduce((acc: any, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1
    return acc
  }, {})

  // Stock status function
  const getStockVariant = (quantity: number, minstock: number = 10): "default" | "secondary" | "destructive" | "outline" => {
    if (quantity === 0) return 'destructive'
    if (quantity <= minstock) return 'secondary'
    return 'default'
  }

  const getStockIcon = (quantity: number, minstock: number = 10) => {
    if (quantity === 0) return <Minus className="h-3 w-3" />
    if (quantity <= minstock) return <TrendingDown className="h-3 w-3" />
    return <TrendingUp className="h-3 w-3" />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Inventory Dashboard</h1>
              <p className="text-muted-foreground mt-1">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link href="/products">
                  <Package className="mr-2 h-4 w-4" />
                  Products
                </Link>
              </Button>
              <Button asChild>
                <Link href="/products/add">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalItems} total items in stock
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalValue)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Current inventory value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Stock Health</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl font-bold text-yellow-600">{lowStock}</span>
                  <span className="text-sm text-muted-foreground ml-1">low</span>
                </div>
                <div>
                  <span className="text-2xl font-bold text-red-600">{outOfStock}</span>
                  <span className="text-sm text-muted-foreground ml-1">out</span>
                </div>
                <div>
                  <span className="text-2xl font-bold text-green-600">{healthyStock}</span>
                  <span className="text-sm text-muted-foreground ml-1">good</span>
                </div>
              </div>
              <Progress value={(healthyStock / totalProducts) * 100} className="mt-3 h-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Layers className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{Object.keys(categories).length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Unique product categories
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Category Distribution */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Breakdown of products by category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(categories).map(([category, count]: [string, any]) => (
              <div key={category}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{category}</span>
                  <span className="text-muted-foreground">{count} products</span>
                </div>
                <Progress value={(count / totalProducts) * 100} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Products</CardTitle>
              <CardDescription>Your latest inventory items</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/products" className="gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {products.slice(0, 5).map((product) => (
                <div
                  key={product.id}
                  onClick={() => router.push(`/products/edit/${product.id}`)}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent cursor-pointer transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{product.name}</h3>
                      <Badge variant={getStockVariant(product.quantity, product.minstock)} className="gap-1">
                        {getStockIcon(product.quantity, product.minstock)}
                        {product.quantity === 0 ? 'Out' : product.quantity <= (product.minstock || 10) ? 'Low' : 'In Stock'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      SKU: {product.sku}  {product.category}
                      {product.supplier && `  ${product.supplier}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(product.price)}</div>
                    <p className="text-sm text-muted-foreground">{product.quantity} units</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <Button variant="outline" className="h-24 flex-col gap-2" asChild>
            <Link href="/products/add">
              <Plus className="h-5 w-5" />
              <span>Add Product</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2" asChild>
            <Link href="/products">
              <Package className="h-5 w-5" />
              <span>Manage</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2" asChild>
            <Link href="/reports">
              <FileText className="h-5 w-5" />
              <span>Reports</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-24 flex-col gap-2" asChild>
            <Link href="/barcode">
              <Barcode className="h-5 w-5" />
              <span>Barcode</span>
            </Link>
          </Button>
        </div>
      </main>
    </div>
  )
}
