export default function TrackingPage() {
  const steps = [
    { label: 'Pesanan Masuk', en: 'Order Received', done: true, date: '26 Jun 2026' },
    { label: 'Sedang Produksi', en: 'In Production', done: true, date: '26 Jun 2026' },
    { label: 'QC Selesai', en: 'QC Passed', done: false, date: '-' },
    { label: 'Sudah Dikemas', en: 'Packed', done: false, date: '-' },
    { label: 'Sudah Dikirim', en: 'Shipped', done: false, date: '-' },
  ]

  const currentStep = steps.filter(s => s.done).length

  return (
    <main className="max-w-2xl mx-auto p-8">
      <a href="/packing/PO-001" className="text-sm text-gray-400 hover:text-gray-600 mb-6 inline-block">← Kembali ke Packing</a>

      <h1 className="text-2xl font-bold mb-2">🚚 Status Pesanan</h1>
      <p className="text-gray-500 text-sm mb-8">PO-001 — Bloomingdale NYC</p>

      <div className="relative">
        {steps.map((step, i) => (
          <div key={i} className="flex gap-4 mb-6 relative">
            {/* Line */}
            {i < steps.length - 1 && (
              <div className={`absolute left-4 top-8 w-0.5 h-10 ${step.done ? 'bg-black' : 'bg-gray-200'}`} />
            )}
            {/* Circle */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 z-10
              ${step.done ? 'bg-black text-white' : i === currentStep ? 'bg-gray-200 text-gray-600 border-2 border-black' : 'bg-gray-100 text-gray-400'}`}>
              {step.done ? '✓' : i + 1}
            </div>
            {/* Content */}
            <div className="pt-0.5">
              <p className={`font-semibold ${step.done ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
              <p className="text-xs text-gray-400">{step.en} · {step.date}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
