'use client'
import { useEffect, useState } from 'react'

interface OrderItem {
  id: string
}

interface Order {
  id: string
  poNumber: string
  customerName: string
  createdAt: string
  status: string
  items?: OrderItem[]
}

export default function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('/api/orders', {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch orders')
        return res.json()
      })
      .then(data => {
        if (Array.isArray(data)) {
          setOrders(data)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const statusColor: Record<string, string> = {
    'Pending': 'bg-yellow-100 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400',
    'Uploaded': 'bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-400',
    'Reviewed': 'bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400',
    'Production': 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400',
    'In Production': 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400',
    'QC': 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400',
    'Packing': 'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400',
    'Shipping': 'bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400',
    'Completed': 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400',
  }

  const formatItemsCount = (items: OrderItem[] | undefined) => {
    if (!items) return '0 items'
    const count = items.length
    return `${count} item${count !== 1 ? 's' : ''}`
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-txt-main font-display">📋 Order Dashboard</h1>
          <p className="text-txt-muted text-sm mt-1">All incoming purchase orders and status tracking</p>
        </div>
        <a 
          href="/" 
          className="px-5 py-2.5 bg-primary-gold hover:bg-opacity-95 text-white rounded-btn text-xs font-semibold tracking-wide uppercase transition duration-300"
        >
          + Upload New PO
        </a>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="w-8 h-8 border-2 border-primary-gold border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-bg-card rounded-card border border-border-main p-16 text-center">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-lg font-medium text-txt-main font-display">No purchase orders found</p>
          <p className="text-sm text-txt-muted mt-2">Upload a PO file on the homepage to start processing.</p>
        </div>
      ) : (
        <div className="bg-bg-card rounded-card border border-border-main overflow-hidden transition-all duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-bg-main border-b border-border-main text-txt-muted text-xs uppercase tracking-wider">
                <tr className="text-left">
                  <th className="px-6 py-4 font-semibold">PO Number</th>
                  <th className="px-6 py-4 font-semibold">Customer</th>
                  <th className="px-6 py-4 font-semibold">Items</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-bg-main/40 transition-colors duration-200">
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-primary-gold">{o.poNumber}</td>
                    <td className="px-6 py-4 text-txt-main font-medium">{o.customerName}</td>
                    <td className="px-6 py-4 text-txt-muted">{formatItemsCount(o.items)}</td>
                    <td className="px-6 py-4 text-txt-muted text-xs">{formatDate(o.createdAt)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${statusColor[o.status] || 'bg-bg-main text-txt-muted'}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <a href={`/review/${o.id}`} className="text-primary-gold hover:text-opacity-80 text-xs font-bold uppercase tracking-wider transition">
                        View Details →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  )
}
