export default function Dashboard() {
  const orders = [
    { id: 'PO-001', customer: 'Bloomingdale NYC', date: 'Jun 26, 2026', status: 'In Production', items: 12 },
    { id: 'PO-002', customer: 'Saks Fifth Avenue', date: 'Jun 25, 2026', status: 'Completed', items: 8 },
    { id: 'PO-003', customer: 'Nordstrom LA', date: 'Jun 24, 2026', status: 'Pending', items: 15 },
  ]

  const statusColor: Record<string, string> = {
    'Pending': 'bg-yellow-100 text-yellow-700',
    'In Production': 'bg-blue-100 text-blue-700',
    'Completed': 'bg-green-100 text-green-700',
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
                <td className="px-6 py-4 font-mono text-sm font-medium">{o.id}</td>
                <td className="px-6 py-4 text-gray-800">{o.customer}</td>
                <td className="px-6 py-4 text-gray-500 text-sm">{o.items} items</td>
                <td className="px-6 py-4 text-gray-500 text-sm">{o.date}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor[o.status]}`}>
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
    </main>
  )
}
