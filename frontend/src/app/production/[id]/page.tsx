export default function ProductionPage() {
  const items = [
    {
      kode: 'HBJ-STAR-M',
      en: 'Star Hairpin Medium',
      id: 'Jepit Bintang Ukuran Sedang',
      jumlah: 5,
      bahan_en: 'Sterling Silver, Polish Finish',
      bahan_id: 'Perak Sterling, Finishing Poles',
      catatan_en: 'Ensure star points are symmetrical. Handle with care.',
      catatan_id: 'Pastikan ujung bintang simetris. Tangani dengan hati-hati.',
    },
    {
      kode: 'HBJ-MOON-S',
      en: 'Moon Earring Small',
      id: 'Anting Bulan Ukuran Kecil',
      jumlah: 3,
      bahan_en: 'Gold Vermeil',
      bahan_id: 'Emas Vermeil',
      catatan_en: '⚠️ SIZE NOT CONFIRMED — hold production until clarified.',
      catatan_id: '⚠️ UKURAN BELUM DIKONFIRMASI — tahan produksi sampai ada kepastian.',
    },
    {
      kode: 'HBJ-ROSE-L',
      en: 'Rose Ring Large',
      id: 'Cincin Mawar Ukuran Besar',
      jumlah: 8,
      bahan_en: 'Sterling Silver, Oxidized',
      bahan_id: 'Perak Sterling, Dioksidasi',
      catatan_en: 'Apply oxidation evenly on petals.',
      catatan_id: 'Terapkan oksidasi merata di seluruh kelopak.',
    },
  ]

  return (
    <main className="max-w-5xl mx-auto p-8">
      <a href="/review/PO-001" className="text-sm text-gray-400 hover:text-gray-600 mb-6 inline-block">← Kembali ke Review</a>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">🔨 Instruksi Produksi</h1>
          <p className="text-gray-500 text-sm mt-1">PO-001 — Bloomingdale NYC</p>
        </div>
        <a href="/packing/PO-001" className="px-5 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition">
          Panduan Packing →
        </a>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.kode} className={`bg-white border rounded-2xl overflow-hidden ${item.catatan_en.includes('⚠️') ? 'border-red-200' : 'border-gray-200'}`}>
            {/* Header item */}
            <div className={`px-6 py-4 flex justify-between items-center ${item.catatan_en.includes('⚠️') ? 'bg-red-50' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-4">
                <span className="font-mono font-bold text-sm bg-white border border-gray-200 px-3 py-1 rounded-lg">{item.kode}</span>
                <div>
                  <p className="font-semibold text-gray-900">{item.en}</p>
                  <p className="text-sm text-gray-500">{item.id}</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-gray-700">{item.jumlah} <span className="text-sm font-normal text-gray-400">pcs</span></span>
            </div>

            {/* Detail bilingual */}
            <div className="px-6 py-4 grid grid-cols-2 gap-6">
              {/* English */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">🇺🇸 English</p>
                <p className="text-sm"><span className="text-gray-400">Material:</span> {item.bahan_en}</p>
                <p className="text-sm mt-2"><span className="text-gray-400">Notes:</span> {item.catatan_en}</p>
              </div>
              {/* Indonesian */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">🇮🇩 Indonesian</p>
                <p className="text-sm"><span className="text-gray-400">Bahan:</span> {item.bahan_id}</p>
                <p className="text-sm mt-2"><span className="text-gray-400">Catatan:</span> {item.catatan_id}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
