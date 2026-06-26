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
    const token = localStorage.getItem('token')
    fetch(`/api/orders/${id}`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
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
      <div className="flex justify-center items-center py-32">
        <div className="w-8 h-8 border-2 border-primary-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <main className="text-center py-16">
        <p className="text-xl font-bold text-error-red font-display">Error: {error || 'Order not found'}</p>
        <a href="/dashboard" className="text-primary-gold hover:underline mt-6 inline-block font-semibold">Back to Dashboard</a>
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
    { label: 'Order Received', ...getStatusInfo(['Uploaded', 'Reviewed', 'Production', 'QC', 'Packing', 'Shipping', 'Completed']) },
    { label: 'Invoice Issued', ...getStatusInfo(['Reviewed', 'Production', 'QC', 'Packing', 'Shipping', 'Completed']) },
    { label: 'Deposit Tracked', ...getStatusInfo(['Reviewed', 'Production', 'QC', 'Packing', 'Shipping', 'Completed']) },
    { label: 'Material Preparation', ...getStatusInfo(['Production', 'QC', 'Packing', 'Shipping', 'Completed']) },
    { label: 'In Production', ...getStatusInfo(['Production', 'QC', 'Packing', 'Shipping', 'Completed']) },
    { label: 'Quality Control (QC)', ...getStatusInfo(['QC', 'Packing', 'Shipping', 'Completed']) },
    { label: 'Packed & Ready', ...getStatusInfo(['Packing', 'Shipping', 'Completed']) },
    { label: 'Shipped', ...getStatusInfo(['Shipping', 'Completed']) },
  ]

  const currentStep = steps.filter(s => s.done).length

  return (
    <main className="max-w-2xl mx-auto py-8">
      <a href={`/packing/${order.id}`} className="text-xs font-bold uppercase tracking-wider text-txt-muted hover:text-primary-gold mb-6 inline-block transition">
        ← Back to Packing
      </a>

      <h1 className="text-3xl font-semibold mb-2 text-txt-main font-display">🚚 Order Tracking</h1>
      <p className="text-txt-muted text-sm mb-10">{order.poNumber} — {order.customerName}</p>

      <div className="relative pl-2">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-6 mb-8 relative">
            {i < steps.length - 1 && (
              <div className={`absolute left-4 top-8 w-0.5 h-10 ${step.done ? 'bg-primary-gold' : 'bg-border-main'}`} />
            )}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 z-10 transition-colors duration-300
              ${step.done ? 'bg-primary-gold text-white' : i === currentStep ? 'bg-bg-card text-primary-gold border-2 border-primary-gold' : 'bg-bg-card text-txt-muted border border-border-main'}`}>
              {step.done ? '✓' : i + 1}
            </div>
            <div className="pt-0.5">
              <p className={`font-semibold text-sm ${step.done ? 'text-txt-main' : 'text-txt-muted'}`}>{step.label}</p>
              <p className="text-xs text-txt-muted mt-0.5">{step.date}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <a href="/dashboard" className="px-6 py-3.5 bg-primary-gold hover:bg-opacity-95 text-white rounded-btn text-xs font-semibold tracking-wider uppercase transition duration-300 inline-block">
          Go to Dashboard
        </a>
      </div>
    </main>
  )
}
