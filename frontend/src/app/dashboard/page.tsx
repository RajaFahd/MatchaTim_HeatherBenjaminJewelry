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
    fetch('/api/orders')
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
    'Pending': 'bg-yellow-100 text-yellow-700',
    'Uploaded': 'bg-purple-100 text-purple-700',
    'Reviewed': 'bg-indigo-100 text-indigo-700',
    'Production': 'bg-blue-100 text-blue-700',
    'In Production': 'bg-blue-100 text-blue-700',
    'QC': 'bg-amber-100 text-amber-700',
    'Packing': 'bg-orange-100 text-orange-700',
    'Shipping': 'bg-teal-100 text-teal-700',
    'Completed': 'bg-green-100 text-green-700',
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
    <main className="max-w-5xl mx-auto p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📋 Order Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">All incoming purchase orders</p>
        </div>
        <a href="/" className="px-5 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition">
          + Upload New PO
        </a>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-lg font-semibold text-gray-700">No purchase orders found</p>
          <p className="text-sm text-gray-400 mt-1">Upload a PO file on the homepage to start processing.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-left text-sm text-gray-500">
                <th className="px-6 py-4 font-medium">PO Number</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Items</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o, i) => (
                <tr key={o.id} className={`border-b border-gray-100 hover:bg-gray-50 transition ${i === orders.length - 1 ? 'border-0' : ''}`}>
                  <td className="px-6 py-4 font-mono text-sm font-medium">{o.poNumber}</td>
                  <td className="px-6 py-4 text-gray-800">{o.customerName}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{formatItemsCount(o.items)}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{formatDate(o.createdAt)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor[o.status] || 'bg-gray-100 text-gray-700'}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <a href={`/review/${o.id}`} className="text-blue-600 text-sm hover:underline font-medium">
                      View →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
