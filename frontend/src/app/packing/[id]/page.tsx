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
    { key: 'invoiced', label: 'Sudah difaktur', en: 'Invoiced' },
    { key: 'materials', label: 'Bahan siap', en: 'Materials ready' },
    { key: 'production', label: 'Sedang produksi', en: 'In production' },
    { key: 'qc', label: 'QC selesai', en: 'QC passed' },
    { key: 'packed', label: 'Sudah dikemas', en: 'Packed' },
    { key: 'shipped', label: 'Sudah dikirim', en: 'Shipped' },
  ]

  const items = [
    { kode: 'HBJ-STAR-M', nama: 'Star Hairpin Medium', jumlah: 5, packaging: 'Kotak putih kecil, 1 per kotak', note: 'Bungkus dengan tissue putih' },
    { kode: 'HBJ-MOON-S', nama: 'Moon Earring Small', jumlah: 3, packaging: 'Kotak putih kecil, 1 pasang per kotak', note: '⚠️ Tunggu konfirmasi ukuran' },
    { kode: 'HBJ-ROSE-L', nama: 'Rose Ring Large', jumlah: 8, packaging: 'Kotak hitam medium, 1 per kotak', note: 'Tambah silica gel' },
  ]

  const done = Object.values(checklist).filter(Boolean).length
  const total = steps.length

  return (
    <main className="max-w-5xl mx-auto p-8">
      <a href="/production/PO-001" className="text-sm text-gray-400 hover:text-gray-600 mb-6 inline-block">← Kembali ke Produksi</a>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">📦 Panduan Packing Bali</h1>
          <p className="text-gray-500 text-sm mt-1">PO-001 — Bloomingdale NYC</p>
        </div>
        <span className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-xl">{done}/{total} selesai</span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-2 mb-8">
        <div
          className="bg-black h-2 rounded-full transition-all"
          style={{ width: `${(done / total) * 100}%` }}
        />
      </div>

      {/* Tabel packing */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-100 font-semibold">Daftar Packing</div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-6 py-3 text-left font-medium">Kode</th>
              <th className="px-6 py-3 text-left font-medium">Produk</th>
              <th className="px-6 py-3 text-left font-medium">Jumlah</th>
              <th className="px-6 py-3 text-left font-medium">Packaging</th>
              <th className="px-6 py-3 text-left font-medium">Catatan</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.kode} className="border-t border-gray-100">
                <td className="px-6 py-4 font-mono text-xs font-medium">{item.kode}</td>
                <td className="px-6 py-4">{item.nama}</td>
                <td className="px-6 py-4">{item.jumlah} pcs</td>
                <td className="px-6 py-4 text-gray-600">{item.packaging}</td>
                <td className="px-6 py-4 text-gray-500 text-xs">{item.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Checklist status */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="font-semibold mb-4">✅ Checklist Status Pesanan</h2>
        <div className="space-y-3">
          {steps.map(step => (
            <label key={step.key} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={checklist[step.key as keyof typeof checklist]}
                onChange={() => toggle(step.key as keyof typeof checklist)}
                className="w-5 h-5 rounded cursor-pointer accent-black"
              />
              <span className={`text-sm ${checklist[step.key as keyof typeof checklist] ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                {step.label} <span className="text-gray-400">/ {step.en}</span>
              </span>
            </label>
          ))}
        </div>
      </div>
    </main>
  )
}
