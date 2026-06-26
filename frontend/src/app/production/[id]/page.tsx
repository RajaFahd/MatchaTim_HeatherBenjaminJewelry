export default function ProductionPage() {
  const items = [
    {
      code: 'HBJ-STAR-M',
      name: 'Star Hairpin Medium',
      qty: 5,
      material: 'Sterling Silver, Polish Finish',
      notes: 'Ensure star points are symmetrical. Handle with care.',
      warning: false,
    },
    {
      code: 'HBJ-MOON-S',
      name: 'Moon Earring Small',
      qty: 3,
      material: 'Gold Vermeil',
      notes: '⚠️ SIZE NOT CONFIRMED — hold production until clarified.',
      warning: true,
    },
    {
      code: 'HBJ-ROSE-L',
      name: 'Rose Ring Large',
      qty: 8,
      material: 'Sterling Silver, Oxidized',
      notes: 'Apply oxidation evenly on all petals.',
      warning: false,
    },
  ]

  return (
    <main className="max-w-5xl mx-auto p-8">
      <a href="/review/PO-001" className="text-sm text-gray-400 hover:text-gray-600 mb-6 inline-block">← Back to Review</a>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">🔨 Production Instructions</h1>
          <p className="text-gray-500 text-sm mt-1">PO-001 — Bloomingdale NYC</p>
        </div>
        <a href="/packing/PO-001" className="px-5 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition">
          Packing Guide →
        </a>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.code} className={`bg-white border rounded-2xl overflow-hidden ${item.warning ? 'border-red-200' : 'border-gray-200'}`}>
            <div className={`px-6 py-4 flex justify-between items-center ${item.warning ? 'bg-red-50' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-4">
                <span className="font-mono font-bold text-sm bg-white border border-gray-200 px-3 py-1 rounded-lg">{item.code}</span>
                <p className="font-semibold text-gray-900">{item.name}</p>
              </div>
              <span className="text-2xl font-bold text-gray-700">{item.qty} <span className="text-sm font-normal text-gray-400">pcs</span></span>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm"><span className="text-gray-400">Material:</span> {item.material}</p>
              <p className="text-sm mt-2"><span className="text-gray-400">Notes:</span> {item.notes}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
