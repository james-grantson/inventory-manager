import { openDB, IDBPDatabase } from 'idb'

export interface OfflineProduct {
  id: string
  name: string
  description: string
  price: number
  quantity: number
  sku: string
  category: string
  image_url?: string
  synced: boolean
  lastModified: number
}

export interface SyncQueueItem {
  id: string
  operation: 'create' | 'update' | 'delete'
  data: any
  timestamp: number
  retryCount: number
}

let dbInstance: IDBPDatabase | null = null

export async function getDB() {
  if (dbInstance) return dbInstance
  
  dbInstance = await openDB('inventory-db', 1, {
    upgrade(db) {
      // Products store
      const productStore = db.createObjectStore('products', { keyPath: 'id' })
      productStore.createIndex('by-synced', 'synced')
      productStore.createIndex('by-modified', 'lastModified')
      
      // Sync queue store
      const queueStore = db.createObjectStore('syncQueue', { keyPath: 'id' })
      queueStore.createIndex('by-timestamp', 'timestamp')
    },
  })
  
  return dbInstance
}

// Save product offline
export async function saveProductOffline(product: OfflineProduct) {
  const db = await getDB()
  await db.put('products', {
    ...product,
    synced: false,
    lastModified: Date.now()
  })
}

// Get all products (works offline!)
export async function getOfflineProducts(): Promise<OfflineProduct[]> {
  const db = await getDB()
  return db.getAll('products')
}

// Queue sync operations
export async function queueSync(item: Omit<SyncQueueItem, 'id' | 'retryCount'>) {
  const db = await getDB()
  await db.add('syncQueue', {
    id: crypto.randomUUID(),
    ...item,
    retryCount: 0
  })
}

// Sync when online
export async function syncWithServer() {
  if (!navigator.onLine) return
  
  const db = await getDB()
  const queue = await db.getAll('syncQueue')
  
  // Sort by timestamp to maintain order
  queue.sort((a, b) => a.timestamp - b.timestamp)
  
  for (const item of queue) {
    try {
      // Process each operation
      switch (item.operation) {
        case 'create':
        case 'update':
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${item.data.id}`, {
            method: item.operation === 'create' ? 'POST' : 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item.data)
          })
          break
        case 'delete':
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${item.data.id}`, {
            method: 'DELETE'
          })
          break
      }
      
      // Remove from queue on success
      await db.delete('syncQueue', item.id)
      
      // Mark product as synced
      const product = await db.get('products', item.data.id)
      if (product) {
        product.synced = true
        await db.put('products', product)
      }
      
    } catch (error) {
      console.error('Sync failed for item:', item.id, error)
      // Increment retry count
      item.retryCount++
      if (item.retryCount < 5) { // Max 5 retries
        await db.put('syncQueue', item)
      }
    }
  }
}

// Listen for online/offline events
export function initOfflineSync() {
  window.addEventListener('online', () => {
    console.log('Back online - syncing...')
    syncWithServer()
  })
}
