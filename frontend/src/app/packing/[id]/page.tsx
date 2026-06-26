'use client'
import { useState } from 'react'

export default function PackingPage() {
  const [checklist, setChecklist] = useState({
    invoiced: false,
    materials: false,
    production: false,
    qc: false,
    packed: false,
    shipped: false,
  })

  const toggle = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const steps = [
    { key: 'invoiced', label: 'Invoiced' },
    { key: 'materials', label: 'Materials Ready' },
    { key: 'production', label: 'In Production' },
    { key: 'qc', label: 'QC Passed' },
    { key: 'packed', label: 'Packed' },
    { key: 'shipped', label: 'Shipped' },
  ]

  const items = [
    { code: 'HBJ-STAR-M', name: 'Star Hairpin Medium', qty: 5, packaging: 'Small white box, 1 per box', note: 'Wrap with white tissue paper' },
    { code: 'HBJ-MOON-S', name: 'Moon Earring Small', qty: 3, packaging: 'Small white box, 1 pair per box', note: '⚠️ Awaiting size confirmation' },
    { code: 'HBJ-ROSE-L', name: 'Rose Ring Large', qty: 8, packaging: 'Medium black box, 1 per box', note: 'Include silica gel' },
  ]

  const done = Object.values(checklist).filter(Boolean).length
  const total = steps.length

  return (
    <main className="max-w-5xl mx-auto p-8">
      <a href="/production/PO-001" className="text-sm text-gray-400 hover:text-gray-600 mb-6 inline-block">← Back to Production</a>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">📦 Packing Guide</h1>
          <p className="text-gray-500 text-sm mt-1">PO-001 — Bloomingdale NYC</p>
        </div>
        <span className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-xl">{done}/{total} completed</span>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2 mb-8">
        <div className="bg-black h-2 rounded-full transition-all" style={{ width: `${(done / total) * 100}%` }} />
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-100 font-semibold">Packing List</div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-6 py-3 text-left font-medium">Code</th>
              <th className="px-6 py-3 text-left font-medium">Product</th>
              <th className="px-6 py-3 text-left font-medium">Qty</th>
              <th className="px-6 py-3 text-left font-medium">Packaging</th>
              <th className="px-6 py-3 text-left font-medium">Notes</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.code} className="border-t border-gray-100">
                <td className="px-6 py-4 font-mono text-xs font-medium">{item.code}</td>
                <td className="px-6 py-4">{item.name}</td>
                <td className="px-6 py-4">{item.qty} pcs</td>
                <td className="px-6 py-4 text-gray-600">{item.packaging}</td>
                <td className="px-6 py-4 text-gray-500 text-xs">{item.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="font-semibold mb-4">✅ Order Status Checklist</h2>
        <div className="space-y-3">
          {steps.map(step => (
            <label key={step.key} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={checklist[step.key as keyof typeof checklist]}
                onChange={() => toggle(step.key as keyof typeof checklist)}
                className="w-5 h-5 rounded cursor-pointer accent-black"
              />
              <span className={`text-sm ${checklist[step.key as keyof typeof checklist] ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                {step.label}
              </span>
            </label>
          ))}
        </div>
      </div>
    </main>
  )
}
