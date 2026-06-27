'use client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import WorkflowStepper from '@/components/WorkflowStepper'

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

const resolveProductImageUrl = (url?: string) => {
  if (!url) return '';
  const trimmedUrl = url.trim();
  if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://') || trimmedUrl.startsWith('data:')) {
    return trimmedUrl;
  }
  const parts = trimmedUrl.split('/');
  const filename = parts[parts.length - 1];
  return `https://mknbwdffgngnnontrvou.supabase.co/storage/v1/object/public/product-image/${filename}`;
};

const getDisplayImageUrl = (item: any) => {
  if (item?.product?.imageUrl) {
    return resolveProductImageUrl(item.product.imageUrl);
  }
  const code = item?.styleCode || item?.product?.styleCode;
  if (code && code.trim().match(/^HB\d+$/i)) {
    return `https://mknbwdffgngnnontrvou.supabase.co/storage/v1/object/public/product-image/${code.trim().toUpperCase()}.jpg`;
  }
  return '';
};

export default function ReviewPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeImage, setActiveImage] = useState<{ src: string; alt: string } | null>(null)

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
      <WorkflowStepper currentStep="review" orderStatus={order.status} orderId={order.id} />
      
      {order.items.some(item => !item.productId || !item.product) && (
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-card flex gap-3.5 items-start text-amber-800 dark:text-amber-300">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 flex-shrink-0 mt-0.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h4 className="text-sm font-semibold">Terdapat Kode Produk Tidak Dikenal</h4>
            <p className="text-xs mt-1 opacity-90 leading-relaxed">
              Satu atau beberapa item memiliki kode produk yang tidak terdaftar di katalog. Silakan edit kode produk tersebut menjadi kode yang terdaftar di katalog agar pesanan dapat diproses ke tahapan berikutnya.
            </p>
          </div>
        </div>
      )}

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
                {isEditing && <th className="px-6 py-3 font-semibold w-16 text-center">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main">
              {isEditing ? (
                editItems.map((item, index) => {
                  const isUnknown = !order.items[index]?.productId && !order.items[index]?.product;
                  return (
                    <tr key={item.id} className={`hover:bg-bg-main/10 transition-colors ${isUnknown ? 'bg-amber-500/5 dark:bg-amber-950/10 border-l-4 border-l-amber-500' : ''}`}>
                    <td className="px-4 py-3">
                      {getDisplayImageUrl({ product: order.items[index]?.product, styleCode: item.styleCode }) ? (
                        <img 
                          src={getDisplayImageUrl({ product: order.items[index]?.product, styleCode: item.styleCode })} 
                          alt={item.styleCode} 
                          className="w-12 h-12 object-cover rounded-image border border-border-main cursor-zoom-in hover:scale-105 active:scale-95 transition-all duration-200"
                          onClick={() => {
                            const src = getDisplayImageUrl({ product: order.items[index]?.product, styleCode: item.styleCode });
                            if (src) setActiveImage({ src, alt: item.styleCode || 'Product Preview' });
                          }}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='%237A7A7A' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E";
                          }}
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
                        className={`w-28 h-9 border rounded-btn bg-bg-main px-2 text-xs font-mono text-primary-gold focus:outline-none transition ${isUnknown ? 'border-amber-500 ring-1 ring-amber-500/20' : 'border-border-main focus:border-primary-gold'}`}
                      />
                      {isUnknown && (
                        <span className="block text-[9px] text-amber-600 dark:text-amber-400 mt-1 font-sans">
                          ⚠️ Tidak di katalog
                        </span>
                      )}
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
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = editItems.filter((_, idx) => idx !== index);
                          setEditItems(updated);
                        }}
                        className="text-error-red hover:text-red-700 transition p-2 bg-error-red/10 hover:bg-error-red/20 rounded-btn cursor-pointer inline-flex items-center justify-center"
                        title="Hapus Item"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                  );
                })
              ) : (
                order.items.map((item) => {
                  const code = item.styleCode || (item.product ? item.product.styleCode : 'UNKNOWN');
                  const name = item.productName || (item.product ? item.product.productName : (item.specialRequest || 'No description'));
                  const price = item.unitPrice !== null && item.unitPrice !== undefined && Number(item.unitPrice) > 0
                    ? `$${Number(item.unitPrice).toFixed(2)}`
                    : (item.product ? `$${Number(item.product.wholesalePrice).toFixed(2)}` : '—');
                  const isOk = item.size && item.size !== 'NEEDS CONFIRMATION' && item.size !== 'UNKNOWN';
                  const isUnknownProduct = !item.productId && !item.product;

                  return (
                    <tr key={item.id} className={`hover:bg-bg-main/20 transition-colors ${isUnknownProduct ? 'bg-amber-500/5 dark:bg-amber-950/10 border-l-4 border-l-amber-500' : ''}`}>
                      <td className="px-6 py-3">
                        {getDisplayImageUrl(item) ? (
                          <img 
                            src={getDisplayImageUrl(item)} 
                            alt={name} 
                            className="w-12 h-12 object-cover rounded-image border border-border-main cursor-zoom-in hover:scale-105 active:scale-95 transition-all duration-200"
                            onClick={() => {
                              const src = getDisplayImageUrl(item);
                              if (src) setActiveImage({ src, alt: name });
                            }}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24' fill='none' stroke='%237A7A7A' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21 15 16 10 5 21'%3E%3C/polyline%3E%3C/svg%3E";
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-bg-main border border-border-main rounded-image flex items-center justify-center text-txt-muted text-xs">
                            No Image
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono font-semibold text-primary-gold">
                        {code}
                        {isUnknownProduct && (
                          <span className="block text-[10px] text-amber-600 dark:text-amber-400 font-sans mt-0.5">
                            ⚠️ Tidak di katalog
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-txt-main">{name}</td>
                      <td className="px-6 py-4 text-txt-main font-medium">{item.quantity} pcs</td>
                      <td className="px-6 py-4">
                        {isOk ? (
                          <span className="text-txt-main">{item.size}</span>
                        ) : (
                          <span className="px-2.5 py-1 bg-error-red/10 dark:bg-error-red/20 text-error-red rounded-full text-xs font-semibold tracking-wider">
                            {item.size || 'CONFIRM'}
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
            disabled={order.items.some(item => !item.productId || !item.product)}
            className="w-full sm:w-auto px-6 py-3.5 bg-primary-gold hover:bg-opacity-95 text-white rounded-btn text-xs font-semibold tracking-wider uppercase transition duration-300 cursor-pointer text-center disabled:opacity-40 disabled:cursor-not-allowed"
            title={order.items.some(item => !item.productId || !item.product) ? "Harap perbaiki atau hapus kode produk yang tidak terdaftar di katalog terlebih dahulu" : undefined}
          >
            Create Production Instructions →
          </button>
        )}
      </div>

      {/* Lightbox Modal */}
      {activeImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md transition-opacity duration-300 cursor-zoom-out"
          onClick={() => setActiveImage(null)}
        >
          <div className="relative max-w-[90vw] max-h-[85vh] p-2 flex flex-col items-center animate-scale-up" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setActiveImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors p-2 bg-black/40 hover:bg-black/60 rounded-full focus:outline-none cursor-pointer"
              title="Close"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img 
              src={activeImage.src} 
              alt={activeImage.alt} 
              className="max-w-full max-h-[75vh] rounded-lg object-contain shadow-2xl border border-white/10"
            />
            <p className="mt-4 text-white font-mono text-sm bg-black/60 px-4 py-2 rounded-full border border-white/10 backdrop-blur-sm">
              {activeImage.alt}
            </p>
          </div>
        </div>
      )}
    </main>
  )
}
