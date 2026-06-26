'use client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Product {
  styleCode: string
  productName: string
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

interface PackingRecord {
  id: string
  packingNote?: string
  checklist?: any
}

interface Order {
  id: string
  poNumber: string
  customerName: string
  status: string
  items: OrderItem[]
  packings: PackingRecord[]
}

export default function PackingPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    invoiced: false,
    materials: false,
    production: false,
    qc: false,
    packed: false,
    shipped: false,
  })

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

  const toggle = (key: string) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const steps = [
    { key: 'invoiced', label: 'Invoiced' },
    { key: 'materials', label: 'Materials Ready' },
    { key: 'production', label: 'In Production' },
    { key: 'qc', label: 'QC Passed' },
    { key: 'packed', label: 'Packed' },
    { key: 'shipped', label: 'Shipped' },
  ]

  const handleProceedToTracking = async () => {
    if (!order) return
    try {
      let status = 'Packing'
      if (checklist.shipped) {
        status = 'Shipping'
      } else if (checklist.packed) {
        status = 'QC'
      }

      const response = await fetch(`/api/orders/${order.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      router.push(`/tracking/${order.id}`)
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

  const packingRecord = order.packings?.[0]
  const done = Object.values(checklist).filter(Boolean).length
  const total = steps.length

  return (
    <main className="max-w-5xl mx-auto p-8">
      <a href={`/production/${order.id}`} className="text-sm text-gray-400 hover:text-gray-600 mb-6 inline-block">← Back to Production</a>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">📦 Packing Guide</h1>
          <p className="text-gray-500 text-sm mt-1">{order.poNumber} — {order.customerName}</p>
        </div>
        <button 
          onClick={handleProceedToTracking}
          className="px-5 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition cursor-pointer"
        >
          Track Order →
        </button>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2 mb-8">
        <div className="bg-black h-2 rounded-full transition-all" style={{ width: `${(done / total) * 100}%` }} />
      </div>

      {packingRecord?.packingNote && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8 text-sm text-gray-800">
          <h3 className="font-semibold text-blue-900 mb-2">🤖 AI Packing Instructions</h3>
          <p>{packingRecord.packingNote}</p>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-100 font-semibold">Packing List</div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-6 py-3 text-left font-medium">Code</th>
              <th className="px-6 py-3 text-left font-medium">Product</th>
              <th className="px-6 py-3 text-left font-medium">Qty</th>
              <th className="px-6 py-3 text-left font-medium">Packaging</th>
              <th className="px-6 py-3 text-left font-medium">Notes</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map(item => {
              const code = item.product ? item.product.styleCode : 'UNKNOWN'
              const name = item.product ? item.product.productName : 'Unknown Product'
              const sizeText = item.size ? ` (Size: ${item.size})` : ''
              const packaging = item.material ? `${item.material} box, 1 per box${sizeText}` : `Standard jewelry pouch${sizeText}`
              
              return (
                <tr key={item.id} className="border-t border-gray-100">
                  <td className="px-6 py-4 font-mono text-xs font-medium">{code}</td>
                  <td className="px-6 py-4">{name}</td>
                  <td className="px-6 py-4">{item.quantity} pcs</td>
                  <td className="px-6 py-4 text-gray-600">{packaging}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{item.specialRequest || 'None'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="font-semibold mb-4">✅ Order Status Checklist</h2>
        <div className="space-y-3">
          {steps.map(step => (
            <label key={step.key} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checklist[step.key]}
                onChange={() => toggle(step.key)}
                className="w-5 h-5 rounded cursor-pointer accent-black"
              />
              <span className={`text-sm ${checklist[step.key] ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                {step.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </main>
  )
}
