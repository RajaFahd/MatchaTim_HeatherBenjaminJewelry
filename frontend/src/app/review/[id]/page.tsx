export default function ReviewPage() {
  const order = {
    id: 'PO-001',
    customer: 'Bloomingdale NYC',
    email: 'buyer@bloomingdale.com',
    date: 'Jun 26, 2026',
    items: [
      { kode: 'HBJ-STAR-M', description: 'Star Hairpin Medium', qty: 5, size: 'Medium', material: 'Sterling Silver', price: 45, ok: true },
      { kode: 'HBJ-MOON-S', description: 'Moon Earring Small', qty: 3, size: 'NEEDS CONFIRMATION', material: 'Gold Vermeil', price: 65, ok: false },
      { kode: 'HBJ-ROSE-L', description: 'Rose Ring Large', qty: 8, size: 'Large', material: 'Sterling Silver', price: 55, ok: true },
    ]
  }

  return (
    <main className="max-w-5xl mx-auto p-8">
      <a href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 mb-6 inline-block">← Back to Dashboard</a>

      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <h1 className="text-xl font-bold mb-4">📦 {order.id} — AI Reading Result</h1>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div><p className="text-gray-400">Customer</p><p className="font-semibold">{order.customer}</p></div>
          <div><p className="text-gray-400">Email</p><p className="font-semibold">{order.email}</p></div>
          <div><p className="text-gray-400">Date</p><p className="font-semibold">{order.date}</p></div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold">Order Items</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-6 py-3 text-left font-medium">Product Code</th>
              <th className="px-6 py-3 text-left font-medium">Description</th>
              <th className="px-6 py-3 text-left font-medium">Qty</th>
              <th className="px-6 py-3 text-left font-medium">Size</th>
              <th className="px-6 py-3 text-left font-medium">Material</th>
              <th className="px-6 py-3 text-left font-medium">Price</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.kode} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4 font-mono font-medium">{item.kode}</td>
                <td className="px-6 py-4">{item.description}</td>
                <td className="px-6 py-4">{item.qty} pcs</td>
                <td className="px-6 py-4">
                  {item.ok ? item.size : (
                    <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">
                      ⚠️ {item.size}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">{item.material}</td>
                <td className="px-6 py-4">${item.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <a href="/production/PO-001" className="px-6 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition inline-block">
        Create Production Instructions →
      </a>
    </main>
  )
}
