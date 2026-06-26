'use client'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useRouter } from 'next/navigation'

export default function UploadPage() {
  const [loading, setLoading] = useState(false)
  const [fileName, setFileName] = useState('')
  const router = useRouter()

  const onDrop = useCallback((files: File[]) => {
    setFileName(files[0].name)
    setLoading(true)
    setTimeout(() => router.push('/dashboard'), 2000)
  }, [router])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/*': ['.png', '.jpg', '.jpeg']
    }
  })

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900">💎 Heather Benjamin Jewelry</h1>
        <p className="text-gray-500 mt-2">AI Purchase Order Assistant</p>
      </div>

      <div
        {...getRootProps()}
        className={`w-full max-w-lg border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'}`}
      >
        <input {...getInputProps()} />
        <p className="text-5xl mb-4">📄</p>
        <p className="text-lg font-semibold text-gray-700">
          {isDragActive ? 'Lepas file di sini...' : 'Drag & drop file PO di sini'}
        </p>
        <p className="text-sm text-gray-400 mt-2">PDF, Excel (.xlsx), atau foto</p>
        <button className="mt-6 px-8 py-3 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition">
          Pilih File
        </button>
      </div>

      {fileName && !loading && (
        <p className="mt-4 text-sm text-gray-500">📎 {fileName}</p>
      )}

      {loading && (
        <div className="mt-8 text-center">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 font-medium">AI sedang membaca pesanan...</p>
          <p className="text-gray-400 text-sm mt-1">Mohon tunggu sebentar</p>
        </div>
      )}
    </main>
  )
}