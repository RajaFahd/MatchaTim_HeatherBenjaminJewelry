'use client'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import WorkflowStepper from '@/components/WorkflowStepper'

interface Product {
  styleCode: string
  productName: string
  imageUrl?: string
}

interface OrderItem {
  id: string
  productId?: string
  styleCode?: string
  productName?: string
  unitPrice?: any
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
  customerEmail?: string
  status: string
  items: OrderItem[]
  packings: PackingRecord[]
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

export default function PackingPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeImage, setActiveImage] = useState<{ src: string; alt: string } | null>(null)

  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    invoiced: false,
    deposit: false,
    materials: false,
    production: false,
    qc: false,
    packed: false,
    shipped: false,
    updated: false,
  })

  const [itemsChecklist, setItemsChecklist] = useState<Record<string, boolean>>({})
  const [backorderChecklist, setBackorderChecklist] = useState<Record<string, boolean>>({})

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
          deposit: false,
          materials: false,
          production: false,
          qc: false,
          packed: false,
          shipped: false,
          updated: false,
        }
        let savedItems: Record<string, boolean> = {}
        let savedBackorders: Record<string, boolean> = {}

        if (packingRecord && packingRecord.checklist) {
          const chk = packingRecord.checklist
          if (chk.statusChecklist) {
            savedStatus = { ...savedStatus, ...chk.statusChecklist }
          }
          if (chk.itemsChecklist) {
            savedItems = chk.itemsChecklist
          }
          if (chk.backorderChecklist) {
            savedBackorders = chk.backorderChecklist
          }
        }
        setChecklist(savedStatus)
        setItemsChecklist(savedItems)
        setBackorderChecklist(savedBackorders)
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

  const toggleBackorder = (itemId: string) => {
    setBackorderChecklist(prev => ({ ...prev, [itemId]: !prev[itemId] }))
  }

  const handlePrintInvoice = () => {
    if (!order) return
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const itemsHtml = order.items.map((item, index) => {
      const code = item.styleCode || item.product?.styleCode || 'UNKNOWN'
      const name = item.productName || item.product?.productName || 'Unknown Product'
      const price = item.unitPrice ? parseFloat(item.unitPrice.toString()) : 0.0
      const subtotal = price * item.quantity
      return `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px; font-size: 14px;">${index + 1}</td>
          <td style="padding: 12px; font-size: 14px; font-family: monospace; font-weight: bold; color: #b5945b;">${code}</td>
          <td style="padding: 12px; font-size: 14px;">${name}</td>
          <td style="padding: 12px; font-size: 14px; text-align: center;">${item.quantity}</td>
          <td style="padding: 12px; font-size: 14px; text-align: right;">$${price.toFixed(2)}</td>
          <td style="padding: 12px; font-size: 14px; text-align: right; font-weight: 500;">$${subtotal.toFixed(2)}</td>
        </tr>
      `
    }).join('')

    const totalAmount = order.items.reduce((sum, item) => {
      const price = item.unitPrice ? parseFloat(item.unitPrice.toString()) : 0.0
      return sum + (price * item.quantity)
    }, 0)
    const totalUnits = order.items.reduce((sum, item) => sum + item.quantity, 0)

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${order.poNumber}</title>
          <style>
            body {
              font-family: 'Inter', system-ui, sans-serif;
              color: #1e293b;
              margin: 40px;
              line-height: 1.5;
            }
            .header {
              display: flex;
              justify-content: space-between;
              border-bottom: 2px solid #b5945b;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .logo-title {
              color: #b5945b;
              font-size: 24px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .invoice-title {
              font-size: 28px;
              font-weight: 700;
              color: #0f172a;
              text-align: right;
            }
            .details-grid {
              display: grid;
              grid-template-cols: 1fr 1fr;
              gap: 40px;
              margin-bottom: 40px;
            }
            .section-title {
              font-size: 12px;
              font-weight: 700;
              text-transform: uppercase;
              color: #64748b;
              margin-bottom: 8px;
              letter-spacing: 0.5px;
            }
            .address-box {
              font-size: 14px;
              color: #334155;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th {
              background-color: #f8fafc;
              border-bottom: 2px solid #cbd5e1;
              color: #475569;
              font-weight: 600;
              text-transform: uppercase;
              font-size: 11px;
              letter-spacing: 0.5px;
              padding: 12px;
              text-align: left;
            }
            .summary-table {
              width: 300px;
              margin-left: auto;
              font-size: 14px;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 12px;
            }
            .summary-total {
              border-top: 2px solid #b5945b;
              font-weight: bold;
              font-size: 16px;
              color: #b5945b;
              padding-top: 12px;
            }
            .footer {
              margin-top: 60px;
              border-top: 1px solid #e2e8f0;
              padding-top: 20px;
              text-align: center;
              font-size: 12px;
              color: #64748b;
            }
            @media print {
              body { margin: 20px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="logo-title">Heather Benjamin Jewelry</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Handmade Artisan Jewelry &mdash; Bali, Indonesia</div>
            </div>
            <div>
              <div class="invoice-title">INVOICE</div>
              <div style="font-size: 14px; text-align: right; margin-top: 5px;"><strong>PO Number:</strong> ${order.poNumber}</div>
              <div style="font-size: 14px; text-align: right;"><strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
          </div>

          <div class="details-grid">
            <div>
              <div class="section-title">Bill To</div>
              <div class="address-box">
                <strong>${order.customerName}</strong><br>
                ${order.customerEmail || 'No Email Available'}<br>
                Heather Benjamin Customer Account
              </div>
            </div>
            <div>
              <div class="section-title">Payment & Shipping</div>
              <div class="address-box">
                <strong>Status:</strong> ${order.status}<br>
                <strong>Currency:</strong> USD<br>
                <strong>Method:</strong> Standard Shipping
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 50px;">No.</th>
                <th style="width: 120px;">Code</th>
                <th>Product Description</th>
                <th style="width: 80px; text-align: center;">Qty</th>
                <th style="width: 120px; text-align: right;">Unit Price</th>
                <th style="width: 120px; text-align: right;">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="summary-table">
            <div class="summary-row">
              <span style="color: #64748b;">Total SKUs:</span>
              <span style="font-weight: 500;">${order.items.length}</span>
            </div>
            <div class="summary-row">
              <span style="color: #64748b;">Total Units:</span>
              <span style="font-weight: 500;">${totalUnits} pcs</span>
            </div>
            <div class="summary-row summary-total">
              <span>Grand Total:</span>
              <span>$${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div class="footer">
            Thank you for your business!<br>
            Heather Benjamin Jewelry | Bali, Indonesia | contact@heatherbenjaminjewelry.com
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  const steps = [
    { key: 'invoiced', label: 'Invoice Issued' },
    { key: 'deposit', label: 'Deposit Tracked' },
    { key: 'materials', label: 'Material Preparation' },
    { key: 'production', label: 'Production Progress' },
    { key: 'qc', label: 'Quality Control (QC)' },
    { key: 'packed', label: 'Packing Completed' },
    { key: 'shipped', label: 'Shipping Dispatched' },
    { key: 'updated', label: 'Customer Updated' },
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
            itemsChecklist: itemsChecklist,
            backorderChecklist: backorderChecklist
          }
        })
      })

      if (!savePackRes.ok) {
        throw new Error('Failed to save packing checklist')
      }

      // 2. Determine and update order status
      let status = 'Packing'
      if (checklist.updated) {
        status = 'Completed'
      } else if (checklist.shipped) {
        status = 'Shipping'
      } else if (checklist.packed) {
        status = 'Packing'
      } else if (checklist.qc) {
        status = 'QC'
      } else if (checklist.production) {
        status = 'Production'
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
      <WorkflowStepper currentStep="packing" orderStatus={order.status} orderId={order.id} />
      <a href={`/production/${order.id}`} className="text-xs font-bold uppercase tracking-wider text-txt-muted hover:text-primary-gold mb-6 inline-block transition">
        ← Back to Production
      </a>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-txt-main font-display">📦 Packing Guide</h1>
          <p className="text-txt-muted text-sm mt-1">{order.poNumber} — {order.customerName}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handlePrintInvoice}
            className="px-5 py-2.5 bg-bg-card hover:bg-bg-main text-primary-gold border border-primary-gold/45 hover:border-primary-gold rounded-btn text-xs font-semibold tracking-wide uppercase transition duration-300 cursor-pointer flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4.5 h-4.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
            Generate Invoice
          </button>
          <button 
            onClick={handleProceedToTracking}
            className="px-5 py-2.5 bg-primary-gold hover:bg-opacity-95 text-white rounded-btn text-xs font-semibold tracking-wide uppercase transition duration-300 cursor-pointer"
          >
            Track Order →
          </button>
        </div>
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
                <th className="px-6 py-3 font-semibold w-24">Backorder?</th>
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
                const code = item.styleCode || (item.product ? item.product.styleCode : 'UNKNOWN')
                const name = item.productName || (item.product ? item.product.productName : 'Unknown Product')
                const sizeText = item.size ? ` (Size: ${item.size})` : ''
                const packaging = item.material ? `${item.material} box, 1 per box${sizeText}` : `Standard jewelry pouch${sizeText}`
                
                return (
                  <tr key={item.id} className="hover:bg-bg-main/25 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={!!itemsChecklist[item.id]}
                        onChange={() => toggleItem(item.id)}
                        disabled={!!backorderChecklist[item.id]}
                        className="w-5 h-5 rounded cursor-pointer accent-primary-gold border-border-main focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={!!backorderChecklist[item.id]}
                        onChange={() => toggleBackorder(item.id)}
                        disabled={!!itemsChecklist[item.id]}
                        className="w-5 h-5 rounded cursor-pointer accent-amber-500 border-border-main focus:ring-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </td>
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
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-primary-gold">{code}</td>
                    <td className="px-6 py-4 text-txt-main">
                      <div className="flex items-center gap-2">
                        <span>{name}</span>
                        {!!backorderChecklist[item.id] && (
                          <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-500 rounded text-[10px] font-bold uppercase tracking-wider border border-amber-500/20">
                            Backorder
                          </span>
                        )}
                      </div>
                    </td>
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
