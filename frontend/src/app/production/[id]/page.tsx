'use client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Product {
  styleCode: string
  productName: string
  material?: string
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

interface Production {
  id: string
  productionNote?: string
  artisanNote?: string
}

interface Order {
  id: string
  poNumber: string
  customerName: string
  status: string
  items: OrderItem[]
  productions: Production[]
}

export default function ProductionPage() {
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

  const handleProceedToPacking = async () => {
    if (!order) return
    try {
      const response = await fetch(`/api/orders/${order.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'Packing' })
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      router.push(`/packing/${order.id}`)
    } catch (err: any) {
      alert(err.message || 'Failed to update status')
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

  const productionRecord = order.productions?.[0]

  return (
    <main className="max-w-5xl mx-auto p-8">
      <a href={`/review/${order.id}`} className="text-sm text-gray-400 hover:text-gray-600 mb-6 inline-block">← Back to Review</a>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">🔨 Production Instructions</h1>
          <p className="text-gray-500 text-sm mt-1">{order.poNumber} — {order.customerName}</p>
        </div>
        <button 
          onClick={handleProceedToPacking}
          className="px-5 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition cursor-pointer"
        >
          Packing Guide →
        </button>
      </div>

      {productionRecord && (productionRecord.productionNote || productionRecord.artisanNote) && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-8 text-sm text-gray-800">
          <h3 className="font-semibold text-yellow-900 mb-2">🤖 AI Production Notes</h3>
          {productionRecord.productionNote && <p className="mb-2"><strong>General:</strong> {productionRecord.productionNote}</p>}
          {productionRecord.artisanNote && <p><strong>Artisan:</strong> {productionRecord.artisanNote}</p>}
        </div>
      )}

      <div className="space-y-4">
        {order.items.map((item) => {
          const code = item.product ? item.product.styleCode : 'UNKNOWN'
          const name = item.product ? item.product.productName : 'Unknown Product'
          const material = item.material || (item.product ? item.product.material : 'N/A')
          const notes = item.specialRequest || 'No special requests.'
          const warning = !item.productId || item.size === 'NEEDS CONFIRMATION' || item.size === 'UNKNOWN'

          return (
            <div key={item.id} className={`bg-white border rounded-2xl overflow-hidden ${warning ? 'border-red-200' : 'border-gray-200'}`}>
              <div className={`px-6 py-4 flex justify-between items-center ${warning ? 'bg-red-50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold text-sm bg-white border border-gray-200 px-3 py-1 rounded-lg">{code}</span>
                  <p className="font-semibold text-gray-900">{name}</p>
                </div>
                <span className="text-2xl font-bold text-gray-700">{item.quantity} <span className="text-sm font-normal text-gray-400">pcs</span></span>
              </div>
              <div className="px-6 py-4">
                <p className="text-sm"><span className="text-gray-400">Material:</span> {material}</p>
                {item.size && <p className="text-sm mt-1"><span className="text-gray-400">Size:</span> {item.size}</p>}
                <p className="text-sm mt-2"><span className="text-gray-400">Notes:</span> {notes}</p>
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
