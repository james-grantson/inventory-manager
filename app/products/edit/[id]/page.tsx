'use client'

import { useParams } from 'next/navigation'

export default function TestPage() {
  const params = useParams()
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Test Edit Page</h1>
      <p>Product ID: {params.id}</p>
      <p className="text-green-600"> If you see this, routing works!</p>
    </div>
  )
}
