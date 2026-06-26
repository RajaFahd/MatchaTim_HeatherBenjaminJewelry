'use client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Product {
  styleCode: string
  productName: string
  description?: string
  wholesalePrice?: number
  imageUrl?: string
}

interface OrderItem {
  id: string
  productId?: string
  styleCode?: string
  productName?: string
  unitPrice?: number
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

  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false)
  const [poNumber, setPoNumber] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [editItems, setEditItems] = useState<any[]>([])

  const fetchOrderDetails = () => {
    if (!id) return
    setLoading(true)
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
        setPoNumber(data.poNumber)
        setCustomerName(data.customerName)
        setCustomerEmail(data.customerEmail || '')
        setEditItems(data.items.map((item: OrderItem) => ({
          id: item.id,
          styleCode: item.styleCode || (item.product ? item.product.styleCode : 'UNKNOWN'),
          productName: item.productName || (item.product ? item.product.productName : 'UNKNOWN'),
          unitPrice: item.unitPrice !== undefined ? item.unitPrice : (item.product ? Number(item.product.wholesalePrice) : 0),
          quantity: item.quantity,
          size: item.size || '',
          material: item.material || '',
          specialRequest: item.specialRequest || ''
        })))
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchOrderDetails()
  }, [id])

  const handleItemChange = (index: number, field: string, value: any) => {
    const updated = [...editItems]
    updated[index] = { ...updated[index], [field]: value }
    setEditItems(updated)
  }

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          poNumber,
          customerName,
          customerEmail,
          items: editItems
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save changes')
      }

      setIsEditing(false)
      fetchOrderDetails() // Reload fresh details
    } catch (err: any) {
      alert(err.message || 'Failed to save changes')
    }
  }

  const handleCreateInstructions = async () => {
    if (!order) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/orders/${order.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
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
    <main className="w-full">
      <div className="flex justify-between items-center mb-6">
        <a href="/dashboard" className="text-xs font-bold uppercase tracking-wider text-txt-muted hover:text-primary-gold transition">
          ← Back to Dashboard
        </a>
        <button
          onClick={() => {
            if (isEditing) {
              fetchOrderDetails() // Cancel: reload original data
            }
            setIsEditing(!isEditing)
          }}
          className="px-4 py-2 border border-primary-gold text-primary-gold hover:bg-primary-gold hover:text-white rounded-btn text-xs font-semibold tracking-wider uppercase transition duration-300"
        >
          {isEditing ? 'Cancel Edit' : 'Edit Order Data'}
        </button>
      </div>

      <div className="bg-bg-card border border-border-main rounded-card p-8 mb-8 transition-colors duration-300">
        <h1 className="text-2xl font-semibold mb-6 font-display text-txt-main">
          📦 {isEditing ? 'Editing Order Info' : `${order.poNumber} — AI Extraction Result`}
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div>
            <p className="text-txt-muted text-xs uppercase tracking-wider mb-1.5">Customer Name</p>
            {isEditing ? (
              <input
                type="text"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full h-11 border border-border-main rounded-btn bg-bg-main px-3 text-sm text-txt-main focus:border-primary-gold focus:outline-none transition"
              />
            ) : (
              <p className="font-semibold text-txt-main">{order.customerName}</p>
            )}
          </div>
          <div>
            <p className="text-txt-muted text-xs uppercase tracking-wider mb-1.5">Customer Email</p>
            {isEditing ? (
              <input
                type="email"
                value={customerEmail}
                onChange={e => setCustomerEmail(e.target.value)}
                className="w-full h-11 border border-border-main rounded-btn bg-bg-main px-3 text-sm text-txt-main focus:border-primary-gold focus:outline-none transition"
              />
            ) : (
              <p className="font-semibold text-txt-main">{order.customerEmail || '—'}</p>
            )}
          </div>
          <div>
            <p className="text-txt-muted text-xs uppercase tracking-wider mb-1.5">PO Number</p>
            {isEditing ? (
              <input
                type="text"
                value={poNumber}
                onChange={e => setPoNumber(e.target.value)}
                className="w-full h-11 border border-border-main rounded-btn bg-bg-main px-3 text-sm text-txt-main focus:border-primary-gold focus:outline-none transition"
              />
            ) : (
              <p className="font-semibold text-txt-main">{order.poNumber}</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-bg-card border border-border-main rounded-card overflow-hidden mb-8 transition-colors duration-300">
        <div className="px-6 py-4 border-b border-border-main bg-bg-main/30">
          <h2 className="font-semibold text-txt-main font-display text-lg">Order Items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg-main/60 text-txt-muted text-xs uppercase tracking-wider border-b border-border-main">
              <tr className="text-left">
                <th className="px-6 py-3 font-semibold w-20">Preview</th>
                <th className="px-6 py-3 font-semibold">Product Code</th>
                <th className="px-6 py-3 font-semibold">Description / Special Request</th>
                <th className="px-6 py-3 font-semibold">Qty</th>
                <th className="px-6 py-3 font-semibold">Size</th>
                <th className="px-6 py-3 font-semibold">Material</th>
                <th className="px-6 py-3 font-semibold">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main">
              {isEditing ? (
                editItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-bg-main/10 transition-colors">
                    <td className="px-4 py-3">
                      {order.items[index]?.product?.imageUrl ? (
                        <img 
                          src={order.items[index].product.imageUrl} 
                          alt={item.styleCode} 
                          className="w-12 h-12 object-cover rounded-image border border-border-main"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-bg-main border border-border-main rounded-image flex items-center justify-center text-txt-muted text-xs">
                          No Image
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={item.styleCode}
                        onChange={e => handleItemChange(index, 'styleCode', e.target.value)}
                        className="w-28 h-9 border border-border-main rounded-btn bg-bg-main px-2 text-xs font-mono text-primary-gold focus:border-primary-gold focus:outline-none transition"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1.5 w-full min-w-[220px]">
                        <input
                          type="text"
                          value={item.productName}
                          onChange={e => handleItemChange(index, 'productName', e.target.value)}
                          className="w-full h-8 border border-border-main rounded-btn bg-bg-main px-2 text-xs text-txt-main focus:border-primary-gold focus:outline-none transition font-semibold"
                          placeholder="Product Name"
                        />
                        <input
                          type="text"
                          value={item.specialRequest}
                          onChange={e => handleItemChange(index, 'specialRequest', e.target.value)}
                          className="w-full h-8 border border-border-main rounded-btn bg-bg-main px-2 text-[11px] text-txt-muted focus:border-primary-gold focus:outline-none transition italic"
                          placeholder="Special Request / Description"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={e => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                        className="w-16 h-9 border border-border-main rounded-btn bg-bg-main px-2 text-xs text-txt-main focus:border-primary-gold focus:outline-none transition"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={item.size}
                        onChange={e => handleItemChange(index, 'size', e.target.value)}
                        className="w-20 h-9 border border-border-main rounded-btn bg-bg-main px-2 text-xs text-txt-main focus:border-primary-gold focus:outline-none transition"
                        placeholder="e.g. 7"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={item.material}
                        onChange={e => handleItemChange(index, 'material', e.target.value)}
                        className="w-24 h-9 border border-border-main rounded-btn bg-bg-main px-2 text-xs text-txt-main focus:border-primary-gold focus:outline-none transition"
                        placeholder="e.g. Gold"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={e => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-20 h-9 border border-border-main rounded-btn bg-bg-main px-2 text-xs text-txt-main focus:border-primary-gold focus:outline-none transition"
                      />
                    </td>
                  </tr>
                ))
              ) : (
                order.items.map((item) => {
                  const code = item.styleCode || (item.product ? item.product.styleCode : 'UNKNOWN');
                  const name = item.productName || (item.product ? item.product.productName : (item.specialRequest || 'No description'));
                  const price = item.unitPrice !== null && item.unitPrice !== undefined && Number(item.unitPrice) > 0
                    ? `$${Number(item.unitPrice).toFixed(2)}`
                    : (item.product ? `$${Number(item.product.wholesalePrice).toFixed(2)}` : '—');
                  const isOk = item.size && item.size !== 'NEEDS CONFIRMATION' && item.size !== 'UNKNOWN';

                  return (
                    <tr key={item.id} className="hover:bg-bg-main/20 transition-colors">
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
                      <td className="px-6 py-4 font-mono font-semibold text-primary-gold">{code}</td>
                      <td className="px-6 py-4 text-txt-main">{name}</td>
                      <td className="px-6 py-4 text-txt-main font-medium">{item.quantity} pcs</td>
                      <td className="px-6 py-4">
                        {isOk ? (
                          <span className="text-txt-main">{item.size}</span>
                        ) : (
                          <span className="px-2.5 py-1 bg-error-red/10 dark:bg-error-red/20 text-error-red rounded-full text-xs font-semibold tracking-wider">
                            ⚠️ {item.size || 'CONFIRM'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-txt-muted">{item.material || '—'}</td>
                      <td className="px-6 py-4 text-txt-main font-mono">{price}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {isEditing ? (
          <button 
            onClick={handleSaveChanges}
            className="w-full sm:w-auto px-6 py-3.5 bg-primary-gold hover:bg-opacity-95 text-white rounded-btn text-xs font-semibold tracking-wider uppercase transition duration-300 cursor-pointer text-center"
          >
            Save Changes
          </button>
        ) : (
          <button 
            onClick={handleCreateInstructions}
            className="w-full sm:w-auto px-6 py-3.5 bg-primary-gold hover:bg-opacity-95 text-white rounded-btn text-xs font-semibold tracking-wider uppercase transition duration-300 cursor-pointer text-center"
          >
            Create Production Instructions →
          </button>
        )}
      </div>
    </main>
  )
}
