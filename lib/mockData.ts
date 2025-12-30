// Mock data service - works without Supabase
export const mockProducts = [
  {
    id: '1',
    name: 'Laptop Pro',
    sku: 'LP-001',
    quantity: 42,
    price: 1299.99,
    category: 'Electronics',
    status: 'In Stock'
  },
  {
    id: '2', 
    name: 'Wireless Mouse',
    sku: 'WM-045',
    quantity: 5,
    price: 29.99,
    category: 'Accessories',
    status: 'Low Stock'
  },
  {
    id: '3',
    name: 'Mechanical Keyboard',
    sku: 'MK-112',
    quantity: 0,
    price: 89.99,
    category: 'Accessories',
    status: 'Out of Stock'
  }
]

export const productService = {
  getAll: () => Promise.resolve({ success: true, data: mockProducts, error: null }),
  getById: (id: string) => Promise.resolve({ 
    success: true, 
    data: mockProducts.find(p => p.id === id), 
    error: null 
  })
}
