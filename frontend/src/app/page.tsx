'use client'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useRouter } from 'next/navigation'

export default function UploadPage() {
  const [loading, setLoading] = useState(false)
  const [fileName, setFileName] = useState('')
  const router = useRouter()

  const onDrop = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];
    setFileName(file.name);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem('token');
      const response = await fetch("/api/orders/upload", {
        method: "POST",
        headers: token ? { "Authorization": `Bearer ${token}` } : {},
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to upload purchase order.");
      }

      const data = await response.json();
      if (data?.order?.id) {
        router.push(`/review/${data.order.id}`);
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      alert(err.message || "An error occurred during upload.");
      setLoading(false);
    }
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
    <main className="flex-1 flex flex-col items-center justify-center py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-semibold tracking-wide text-txt-main font-display">
          💎 Heather Benjamin
        </h1>
        <p className="text-primary-gold text-xs uppercase tracking-widest font-semibold mt-2">
          AI Purchase Order Assistant
        </p>
      </div>

      <div
        {...getRootProps()}
        className={`w-full max-w-lg border border-dashed rounded-card p-16 text-center cursor-pointer transition-all duration-300 bg-bg-card
          ${isDragActive ? 'border-primary-gold bg-accent-champagne/10' : 'border-border-main hover:border-primary-gold hover:bg-accent-champagne/5'}`}
      >
        <input {...getInputProps()} />
        <p className="text-5xl mb-6">📄</p>
        <p className="text-lg font-medium text-txt-main">
          {isDragActive ? 'Drop the purchase order here...' : 'Drag & drop your PO file here'}
        </p>
        <p className="text-xs text-txt-muted mt-2">PDF, Excel (.xlsx), or Image</p>
        <button className="mt-8 px-8 py-3 bg-primary-gold hover:bg-opacity-95 text-white rounded-btn text-sm font-semibold tracking-wide transition duration-300">
          Browse File
        </button>
      </div>

      {fileName && !loading && (
        <p className="mt-6 text-sm text-txt-muted flex items-center gap-2">
          <span>📎</span> {fileName}
        </p>
      )}

      {loading && (
        <div className="mt-10 text-center">
          <div className="w-8 h-8 border-2 border-primary-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-txt-main font-medium text-sm">AI is analyzing your purchase order...</p>
          <p className="text-txt-muted text-xs mt-1">Please wait a moment</p>
        </div>
      )}
    </main>
  )
}
