'use client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Product {
  styleCode: string
  productName: string
  imageUrl?: string
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

  const [itemsChecklist, setItemsChecklist] = useState<Record<string, boolean>>({})

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
        const packingRecord = data.packings?.[0]
        let savedStatus = {
          invoiced: false,
          materials: false,
          production: false,
          qc: false,
          packed: false,
          shipped: false,
        }
        let savedItems: Record<string, boolean> = {}

        if (packingRecord && packingRecord.checklist) {
          const chk = packingRecord.checklist
          if (chk.statusChecklist) {
            savedStatus = { ...savedStatus, ...chk.statusChecklist }
          }
          if (chk.itemsChecklist) {
            savedItems = chk.itemsChecklist
          }
        }
        setChecklist(savedStatus)
        setItemsChecklist(savedItems)
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

  const toggleItem = (itemId: string) => {
    setItemsChecklist(prev => ({ ...prev, [itemId]: !prev[itemId] }))
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
      const token = localStorage.getItem('token')
      // 1. Save packing checklist in database
      const packingRecord = order.packings?.[0]
      const savePackRes = await fetch(`/api/orders/${order.id}/packing`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          packingNote: packingRecord?.packingNote || '',
          checklist: {
            statusChecklist: checklist,
            itemsChecklist: itemsChecklist
          }
        })
      })

      if (!savePackRes.ok) {
        throw new Error('Failed to save packing checklist')
      }

      // 2. Determine and update order status
      let status = 'Packing'
      if (checklist.shipped) {
        status = 'Shipping'
      } else if (checklist.packed) {
        status = 'QC'
      }

      const response = await fetch(`/api/orders/${order.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
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

  const packingRecord = order.packings?.[0]
  const done = Object.values(checklist).filter(Boolean).length
  const total = steps.length

  return (
    <main className="w-full">
      <a href={`/production/${order.id}`} className="text-xs font-bold uppercase tracking-wider text-txt-muted hover:text-primary-gold mb-6 inline-block transition">
        ← Back to Production
      </a>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-txt-main font-display">📦 Packing Guide</h1>
          <p className="text-txt-muted text-sm mt-1">{order.poNumber} — {order.customerName}</p>
        </div>
        <button 
          onClick={handleProceedToTracking}
          className="px-5 py-2.5 bg-primary-gold hover:bg-opacity-95 text-white rounded-btn text-xs font-semibold tracking-wide uppercase transition duration-300 cursor-pointer"
        >
          Track Order →
        </button>
      </div>

      <div className="w-full bg-border-main rounded-full h-1.5 mb-8 overflow-hidden">
        <div className="bg-primary-gold h-1.5 rounded-full transition-all duration-500" style={{ width: `${(done / total) * 100}%` }} />
      </div>

      {packingRecord?.packingNote && (
        <div className="bg-accent-champagne/10 border border-primary-gold/30 rounded-card p-6 mb-8 text-sm text-txt-main transition-colors duration-300">
          <h3 className="font-semibold text-primary-gold font-display text-base mb-2">🤖 AI Packing Instructions</h3>
          <p className="leading-relaxed">{packingRecord.packingNote}</p>
        </div>
      )}

      <div className="bg-bg-card border border-border-main rounded-card overflow-hidden mb-8 transition-colors duration-300">
        <div className="px-6 py-4 border-b border-border-main bg-bg-main/30 font-semibold text-txt-main font-display">
          Packing List
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg-main/60 text-txt-muted text-xs uppercase tracking-wider border-b border-border-main">
              <tr className="text-left">
                <th className="px-6 py-3 font-semibold w-16">Packed?</th>
                <th className="px-6 py-3 font-semibold w-20">Preview</th>
                <th className="px-6 py-3 font-semibold">Code</th>
                <th className="px-6 py-3 font-semibold">Product</th>
                <th className="px-6 py-3 font-semibold">Qty</th>
                <th className="px-6 py-3 font-semibold">Packaging</th>
                <th className="px-6 py-3 font-semibold">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main">
              {order.items.map(item => {
                const code = item.product ? item.product.styleCode : 'UNKNOWN'
                const name = item.product ? item.product.productName : 'Unknown Product'
                const sizeText = item.size ? ` (Size: ${item.size})` : ''
                const packaging = item.material ? `${item.material} box, 1 per box${sizeText}` : `Standard jewelry pouch${sizeText}`
                
                return (
                  <tr key={item.id} className="hover:bg-bg-main/25 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={!!itemsChecklist[item.id]}
                        onChange={() => toggleItem(item.id)}
                        className="w-5 h-5 rounded cursor-pointer accent-primary-gold border-border-main focus:ring-0"
                      />
                    </td>
                    <td className="px-6 py-3">
                      {item.product?.imageUrl ? (
                        <img 
                          src={item.product.imageUrl} 
                          alt={name} 
                          className="w-12 h-12 object-cover rounded-image border border-border-main"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-bg-main border border-border-main rounded-image flex items-center justify-center text-txt-muted text-xs">
                          No Image
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-primary-gold">{code}</td>
                    <td className="px-6 py-4 text-txt-main">{name}</td>
                    <td className="px-6 py-4 text-txt-main font-medium">{item.quantity} pcs</td>
                    <td className="px-6 py-4 text-txt-main">{packaging}</td>
                    <td className="px-6 py-4 text-txt-muted text-xs">{item.specialRequest || 'None'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-bg-card border border-border-main rounded-card p-6 transition-colors duration-300">
        <h2 className="font-semibold text-txt-main font-display text-lg mb-4">✅ Order Status Checklist</h2>
        <div className="space-y-4">
          {steps.map(step => (
            <label key={step.key} className="flex items-center gap-3.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={checklist[step.key]}
                onChange={() => toggle(step.key)}
                className="w-5 h-5 rounded cursor-pointer accent-primary-gold border-border-main focus:ring-0 focus:ring-offset-0"
              />
              <span className={`text-sm transition-all duration-300 ${checklist[step.key] ? 'line-through text-txt-muted opacity-60' : 'text-txt-main font-medium'}`}>
                {step.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </main>
  )
}
