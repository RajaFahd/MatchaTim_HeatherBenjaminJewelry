export default function ReviewPage() {
  const order = {
    id: 'PO-001',
    customer: 'Bloomingdale NYC',
    email: 'buyer@bloomingdale.com',
    date: '26 Jun 2026',
    items: [
      { kode: 'HBJ-STAR-M', deskripsi: 'Star Hairpin Medium', jumlah: 5, ukuran: 'Medium', bahan: 'Sterling Silver', harga: 45, ok: true },
      { kode: 'HBJ-MOON-S', deskripsi: 'Moon Earring Small', jumlah: 3, ukuran: 'PERLU KONFIRMASI', bahan: 'Gold Vermeil', harga: 65, ok: false },
      { kode: 'HBJ-ROSE-L', deskripsi: 'Rose Ring Large', jumlah: 8, ukuran: 'Large', bahan: 'Sterling Silver', harga: 55, ok: true },
    ]
  }

  return (
    <main className="max-w-5xl mx-auto p-8">
      <a href="/dashboard" className="text-sm text-gray-400 hover:text-gray-600 mb-6 inline-block">← Kembali ke Dashboard</a>

      {/* Info Customer */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
        <h1 className="text-xl font-bold mb-4">📦 {order.id} — Hasil Bacaan AI</h1>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div><p className="text-gray-400">Customer</p><p className="font-semibold">{order.customer}</p></div>
          <div><p className="text-gray-400">Email</p><p className="font-semibold">{order.email}</p></div>
          <div><p className="text-gray-400">Tanggal</p><p className="font-semibold">{order.date}</p></div>
        </div>
      </div>

      {/* Tabel Item */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold">Daftar Item Pesanan</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-6 py-3 text-left font-medium">Kode Produk</th>
              <th className="px-6 py-3 text-left font-medium">Deskripsi</th>
              <th className="px-6 py-3 text-left font-medium">Jumlah</th>
              <th className="px-6 py-3 text-left font-medium">Ukuran</th>
              <th className="px-6 py-3 text-left font-medium">Bahan</th>
              <th className="px-6 py-3 text-left font-medium">Harga</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.kode} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4 font-mono font-medium">{item.kode}</td>
                <td className="px-6 py-4">{item.deskripsi}</td>
                <td className="px-6 py-4">{item.jumlah} pcs</td>
                <td className="px-6 py-4">
                  {item.ok ? item.ukuran : (
                    <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">
                      ⚠️ {item.ukuran}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">{item.bahan}</td>
                <td className="px-6 py-4">${item.harga}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tombol Aksi */}
      <div className="flex gap-3">
        <a href="/production/PO-001" className="px-6 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition">
          Buat Instruksi Produksi →
        </a>
      </div>
    </main>
  )
}
