'use client'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface TrackingRecord {
  id: string
  status: string
  updatedAt: string
}

interface Order {
  id: string
  poNumber: string
  customerName: string
  status: string
  trackings: TrackingRecord[]
}

export default function TrackingPage() {
  const params = useParams()
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

  const getStatusInfo = (statuses: string[]) => {
    const record = order.trackings.find(t => statuses.includes(t.status))
    if (!record) return { done: false, date: '—' }
    
    try {
      const date = new Date(record.updatedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
      return { done: true, date }
    } catch {
      return { done: true, date: 'Completed' }
    }
  }

  const steps = [
    { label: 'Order Received', ...getStatusInfo(['Uploaded']) },
    { label: 'In Production', ...getStatusInfo(['Production']) },
    { label: 'QC Passed', ...getStatusInfo(['QC', 'Packing', 'Shipping', 'Completed']) },
    { label: 'Packed', ...getStatusInfo(['Packing', 'Shipping', 'Completed']) },
    { label: 'Shipped', ...getStatusInfo(['Shipping', 'Completed']) },
  ]

  const currentStep = steps.filter(s => s.done).length

  return (
    <main className="max-w-2xl mx-auto p-8">
      <a href={`/packing/${order.id}`} className="text-sm text-gray-400 hover:text-gray-600 mb-6 inline-block">← Back to Packing</a>

      <h1 className="text-2xl font-bold mb-2">🚚 Order Tracking</h1>
      <p className="text-gray-500 text-sm mb-8">{order.poNumber} — {order.customerName}</p>

      <div className="relative">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-4 mb-6 relative">
            {i < steps.length - 1 && (
              <div className={`absolute left-4 top-8 w-0.5 h-10 ${step.done ? 'bg-black' : 'bg-gray-200'}`} />
            )}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 z-10
              ${step.done ? 'bg-black text-white' : i === currentStep ? 'bg-gray-200 text-gray-600 border-2 border-black' : 'bg-gray-100 text-gray-400'}`}>
              {step.done ? '✓' : i + 1}
            </div>
            <div className="pt-0.5">
              <p className={`font-semibold ${step.done ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
              <p className="text-xs text-gray-400">{step.date}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <a href="/dashboard" className="px-6 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition inline-block">
          Go to Dashboard
        </a>
      </div>
    </main>
  )
}
