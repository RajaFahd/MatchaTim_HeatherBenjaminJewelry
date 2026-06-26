'use client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Product {
  styleCode: string
  productName: string
  description?: string
  wholesalePrice?: number
}

interface OrderItem {
  id: string
  productId?: string
  quantity: number
  size?: string
  material?: string
  specialRequest?: string
  product?: Product | null
}

interface Order {
  id: string
  poNumber: string
  customerName: string
  customerEmail?: string
  status: string
  createdAt: string
  items: OrderItem[]
}

export default function ReviewPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    fetch(`/api/orders/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Order not found')
        return res.json()
      })
      .then(data => {
        setOrder(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [id])

  const handleCreateInstructions = async () => {
    if (!order) return
    
    try {
      const response = await fetch(`/api/orders/${order.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'Production' })
      })

      if (!response.ok) {
        throw new Error('Failed to update order status')
      }

      router.push(`/production/${order.id}`)
    } catch (err: any) {
      alert(err.message || 'Failed to update order status')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <main className="max-w-5xl mx-auto p-8 text-center">
        <p className="text-xl font-bold text-red-500">Error: {error || 'Order not found'}</p>
        <a href="/dashboard" className="text-blue-500 hover:underline mt-4 inline-block">Back to Dashboard</a>
      </main>
    )
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    } catch {
      return dateStr
    }
  }

  return (
    <main className="max-w-5xl mx-auto p-8">
      <a href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 mb-6 inline-block">← Back to Dashboard</a>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <h1 className="text-xl font-bold mb-4">📦 {order.poNumber} — AI Reading Result</h1>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div><p className="text-gray-400">Customer</p><p className="font-semibold">{order.customerName}</p></div>
          <div><p className="text-gray-400">Email</p><p className="font-semibold">{order.customerEmail || '—'}</p></div>
          <div><p className="text-gray-400">Date</p><p className="font-semibold">{formatDate(order.createdAt)}</p></div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold">Order Items</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-6 py-3 text-left font-medium">Product Code</th>
              <th className="px-6 py-3 text-left font-medium">Description</th>
              <th className="px-6 py-3 text-left font-medium">Qty</th>
              <th className="px-6 py-3 text-left font-medium">Size</th>
              <th className="px-6 py-3 text-left font-medium">Material</th>
              <th className="px-6 py-3 text-left font-medium">Price</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => {
              const code = item.product ? item.product.styleCode : 'UNKNOWN';
              const name = item.product ? item.product.productName : (item.specialRequest || 'No description');
              const price = item.product ? `$${Number(item.product.wholesalePrice).toFixed(2)}` : '—';
              const isOk = item.size && item.size !== 'NEEDS CONFIRMATION' && item.size !== 'UNKNOWN';

              return (
                <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono font-medium">{code}</td>
                  <td className="px-6 py-4">{name}</td>
                  <td className="px-6 py-4">{item.quantity} pcs</td>
                  <td className="px-6 py-4">
                    {isOk ? item.size : (
                      <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">
                        ⚠️ {item.size || 'NEEDS CONFIRMATION'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">{item.material || '—'}</td>
                  <td className="px-6 py-4">{price}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <button 
        onClick={handleCreateInstructions}
        className="px-6 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition inline-block cursor-pointer"
      >
        Create Production Instructions →
      </button>
    </main>
  )
}
