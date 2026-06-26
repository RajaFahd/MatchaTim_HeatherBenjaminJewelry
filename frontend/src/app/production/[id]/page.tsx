'use client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Product {
  styleCode: string
  productName: string
  material?: string
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

  const handleProceedToPacking = async () => {
    if (!order) return
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/orders/${order.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
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

  const productionRecord = order.productions?.[0]

  return (
    <main className="w-full">
      <a href={`/review/${order.id}`} className="text-xs font-bold uppercase tracking-wider text-txt-muted hover:text-primary-gold mb-6 inline-block transition">
        ← Back to Review
      </a>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-txt-main font-display">🔨 Production Instructions</h1>
          <p className="text-txt-muted text-sm mt-1">{order.poNumber} — {order.customerName}</p>
        </div>
        <button 
          onClick={handleProceedToPacking}
          className="px-5 py-2.5 bg-primary-gold hover:bg-opacity-95 text-white rounded-btn text-xs font-semibold tracking-wide uppercase transition duration-300 cursor-pointer"
        >
          Packing Guide →
        </button>
      </div>

      {productionRecord && (productionRecord.productionNote || productionRecord.artisanNote) && (
        <div className="bg-accent-champagne/10 border border-primary-gold/30 rounded-card p-6 mb-8 text-sm text-txt-main transition-colors duration-300">
          <h3 className="font-semibold text-primary-gold font-display text-base mb-3">🤖 AI Production Notes</h3>
          {productionRecord.productionNote && (
            <p className="mb-3 leading-relaxed">
              <strong className="text-primary-gold uppercase tracking-wider text-xs block mb-0.5">General Instructions:</strong> 
              {productionRecord.productionNote}
            </p>
          )}
          {productionRecord.artisanNote && (
            <p className="leading-relaxed">
              <strong className="text-primary-gold uppercase tracking-wider text-xs block mb-0.5">Balinese Artisan Craftsmanship:</strong> 
              {productionRecord.artisanNote}
            </p>
          )}
        </div>
      )}

      <div className="space-y-6">
        {order.items.map((item) => {
          const code = item.product ? item.product.styleCode : 'UNKNOWN'
          const name = item.product ? item.product.productName : 'Unknown Product'
          const material = item.material || (item.product ? item.product.material : 'N/A')
          const notes = item.specialRequest || 'No special requests.'
          const warning = !item.productId || item.size === 'NEEDS CONFIRMATION' || item.size === 'UNKNOWN'

          return (
            <div key={item.id} className={`bg-bg-card border rounded-card overflow-hidden transition-all duration-300
              ${warning ? 'border-error-red/30' : 'border-border-main'}`}>
              <div className={`px-6 py-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 border-b border-border-main/50
                ${warning ? 'bg-error-red/5' : 'bg-bg-main/20'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <span className="w-fit font-mono font-bold text-xs bg-bg-main border border-border-main px-3 py-1 rounded-lg text-primary-gold">{code}</span>
                  <p className="font-semibold text-txt-main font-display text-sm sm:text-base">{name}</p>
                </div>
                <span className="text-lg sm:text-xl font-bold text-txt-main">
                  {item.quantity} <span className="text-xs font-normal text-txt-muted">pcs</span>
                </span>
              </div>
              <div className="px-6 py-4 flex flex-col md:flex-row gap-6">
                {/* Product Image */}
                <div className="w-24 h-24 flex-shrink-0">
                  {item.product?.imageUrl ? (
                    <img 
                      src={item.product.imageUrl} 
                      alt={name} 
                      className="w-full h-full object-cover rounded-image border border-border-main"
                    />
                  ) : (
                    <div className="w-full h-full bg-bg-main border border-border-main rounded-image flex items-center justify-center text-txt-muted text-xs text-center p-2">
                      No Image
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 text-sm space-y-2">
                  <p><span className="text-txt-muted text-xs uppercase tracking-wider mr-2">Material:</span> <span className="font-medium text-txt-main">{material}</span></p>
                  {item.size && <p><span className="text-txt-muted text-xs uppercase tracking-wider mr-2">Size:</span> <span className="font-medium text-txt-main">{item.size}</span></p>}
                  <p className="pt-2 border-t border-border-main/40"><span className="text-txt-muted text-xs uppercase tracking-wider block mb-1">Notes / Requests:</span> <span className="text-txt-main italic">{notes}</span></p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
