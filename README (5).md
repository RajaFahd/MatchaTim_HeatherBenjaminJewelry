<p align="center">
  <img src="assets/banner.svg" alt="Heather Benjamin Jewelry — AI Order-to-Production Assistant" width="100%"/>
</p>

# 💎 Heather Benjamin Jewelry — AI Order-to-Production Assistant

> Mengubah Purchase Order pelanggan (PDF, Excel, atau gambar) menjadi instruksi produksi, panduan packing, dan tracking order yang rapi — secara otomatis menggunakan AI.

[![Node.js](https://img.shields.io/badge/Node.js-Express%205-339933?logo=node.js&logoColor=white)](#)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)](#)
[![Prisma](https://img.shields.io/badge/Prisma-PostgreSQL-2D3748?logo=prisma&logoColor=white)](#)
[![Supabase](https://img.shields.io/badge/Supabase-Storage-3ECF8E?logo=supabase&logoColor=white)](#)
[![License](https://img.shields.io/badge/License-Proprietary-blue.svg)](#-lisensi)

---

## 📑 Daftar Isi

- [Tentang Project](#-tentang-project)
- [Latar Belakang & Business Case](#-latar-belakang--business-case)
- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Struktur Folder](#-struktur-folder)
- [Skema Database](#-skema-database)
- [Alur Kerja AI](#-alur-kerja-ai)
- [Instalasi & Menjalankan Project](#-instalasi--menjalankan-project)
- [Environment Variables](#-environment-variables)
- [Dokumentasi API](#-dokumentasi-api)
- [Halaman & Routing Frontend](#-halaman--routing-frontend)
- [Status & Workflow Order](#-status--workflow-order)
- [Design System](#-design-system)
- [Keamanan](#-keamanan)
- [Roadmap](#-roadmap--future-enhancement)
- [Dokumen Terkait](#-dokumen-terkait)
- [Tim & Pembagian Peran](#-tim--pembagian-peran)
- [Lisensi](#-lisensi)

---

## 📖 Tentang Project

**Heather Benjamin Jewelry** adalah brand perhiasan handmade premium yang berkolaborasi dengan pengrajin (artisan) dan mitra produksi di Bali. Saat ini, proses pengolahan **Purchase Order (PO)** dari customer wholesale masih dilakukan secara manual: membaca dokumen PO, mengidentifikasi produk, menyiapkan instruksi produksi, berkoordinasi dengan artisan, menyiapkan panduan packing, hingga update ke customer.

Proses manual ini **lambat, rawan kesalahan**, dan sangat bergantung pada pengetahuan founder.

Project ini adalah **prototipe MVP hasil hackathon (48–72 jam)** yang membangun sebuah **AI Order-to-Production Assistant** — sebuah aplikasi web full-stack yang mampu:

1. Menerima upload PO dalam format **PDF, Excel, atau gambar (JPEG/PNG/WEBP)**.
2. Mengekstrak data PO (customer, nomor PO, produk, qty, material, size, catatan khusus) menggunakan **AI Vision/LLM**.
3. Memvalidasi kelengkapan data (mendeteksi produk/size/material yang hilang).
4. Menghasilkan **instruksi produksi** otomatis untuk artisan.
5. Menghasilkan **panduan packing** beserta checklist.
6. Melacak progres order dari awal sampai selesai lewat **tracking dashboard**.

---

## 🎯 Latar Belakang & Business Case

Disarikan dari brief bisnis (lihat [`maua72.md`](./maua72.md)):

- PO datang dalam berbagai format (PDF, spreadsheet, email, form pesanan) dan sering berisi banyak produk, style, material, dan permintaan khusus yang berbeda-beda.
- Informasi kritikal tersebar di banyak tempat (spreadsheet, dokumen, gambar, email, chat), yang berisiko menyebabkan:
  - Kesalahpahaman produksi
  - Produk/qty salah
  - Kesalahan packing
  - Komunikasi customer yang lambat
  - Order sulit ditrack
  - Ketergantungan pada pengetahuan founder

**Tujuan bisnis:** mengurangi waktu proses & koordinasi order sebesar **80%**, dengan workflow:

```
Customer Order → Production → Quality Control → Packing → Shipping → Customer Update
```

Sistem ini menjadi **single source of truth** yang mengubah PO mentah menjadi instruksi yang jelas — baik untuk tim produksi maupun tim fulfillment di Bali — tanpa perlu klarifikasi tambahan dari founder.

> 📌 Detail lengkap requirement bisnis & fungsional ada di [`PRD.md`](./PRD.md).

---

## ✨ Fitur Utama

| Fitur | Deskripsi |
|---|---|
| 🔐 **Autentikasi Admin/Manager** | Login berbasis JWT untuk staf operasional |
| 📤 **Upload Purchase Order** | Drag & drop file PDF / Excel (XLS, XLSX) / Gambar (JPEG, PNG, WEBP), maks. 10MB |
| 🤖 **Ekstraksi Data via AI** | AI membaca dokumen/gambar PO dan mengubahnya menjadi JSON terstruktur (customer, item, qty, material, size, harga, dll) |
| ✅ **Validasi Otomatis** | Mendeteksi info yang hilang (produk tidak dikenal, size kosong, style code tidak valid, dst.) |
| 🛠️ **Instruksi Produksi** | Otomatis menghasilkan catatan produksi & catatan untuk artisan |
| 📦 **Panduan Packing** | Menghasilkan checklist packing per item, lengkap dengan catatan packaging |
| 📊 **Dashboard & Tracking** | Memantau seluruh order beserta status (Uploaded → Reviewed → Production → QC → Packing → Shipping → Completed) |
| 🗃️ **Manajemen Order** | Edit detail order/item, update status, soft delete, archive, restore |
| 📚 **Katalog Produk** | CRUD katalog produk (style code, nama, material, gambar, harga wholesale) untuk membantu AI mencocokkan item |
| 🛡️ **Mode Fallback AI** | Jika API key AI tidak tersedia/gagal, sistem otomatis memakai data simulasi agar demo tetap berjalan |

---

## 🧰 Tech Stack

### Backend
| Komponen | Teknologi |
|---|---|
| Runtime | Node.js |
| Framework | Express.js 5 |
| ORM | Prisma ORM |
| Database | PostgreSQL (Supabase) |
| File Storage | Supabase Storage |
| Autentikasi | JWT (`jsonwebtoken`) + `bcryptjs` |
| Upload Handler | Multer (in-memory storage) |
| Parsing Dokumen | `pdf-parse` (PDF), `xlsx` (Excel) |
| AI Provider | Google Gemini 2.5 Flash via **Google AI Studio** (utama) & **OpenRouter** (fallback) — menggunakan SDK `openai` dengan base URL custom |
| PDF Generator | `pdfkit` (tersedia untuk ekspor dokumen) |

### Frontend
| Komponen | Teknologi |
|---|---|
| Framework | Next.js 16 (App Router) |
| Library UI | React 19 |
| Styling | Tailwind CSS 4 |
| Upload UI | `react-dropzone` |
| Bahasa | TypeScript |

---

## 🏗️ Arsitektur Sistem

Arsitektur mengikuti pola **Monolithic Backend + External AI Service**, dipilih agar pengembangan cepat sesuai timeline hackathon.

<p align="center">
  <img src="assets/architecture-diagram.svg" alt="Diagram Arsitektur Sistem" width="100%"/>
</p>

<details>
<summary><b>Lihat alur utama dalam bentuk teks</b></summary>

```
Customer → Upload PO → Frontend → Backend → AI Extraction
   → Validasi → Simpan ke Database
   → ┌─ Production Instruction
     └─ Packing Guide
   → Tracking Dashboard → Completed
```

</details>

### Backend (Feature-based Modular)

```
backend/src/
├── auth/        → Modul autentikasi (repository, service, router)
├── product/     → Modul katalog produk
├── order/       → Modul order (upload, ekstraksi AI, status, production, packing)
├── config/      → Koneksi Prisma & Supabase
├── middleware/  → JWT auth guard, Multer upload guard
├── services/    → aiService, parserService, storageService, systemPrompt
└── app.js       → Entry point Express
```

Pola layering setiap modul: **Router → Service (business logic + AI) → Repository (Prisma/DB)**.

### Frontend (Next.js App Router)

```
frontend/src/
├── app/
│   ├── page.tsx              → Halaman Upload PO (Home)
│   ├── login/                → Halaman Login
│   ├── dashboard/            → Dashboard & daftar order
│   ├── review/[id]/          → Review hasil ekstraksi AI
│   ├── production/[id]/      → Instruksi produksi
│   ├── packing/[id]/         → Panduan & checklist packing
│   └── tracking/[id]/        → Tracking status order
└── components/
    ├── ClientWrapper.tsx
    └── WorkflowStepper.tsx   → Stepper visual: Production → Packing, dst.
```

> Arsitektur sistem secara menyeluruh juga dijelaskan di [`ARCHITECTURE.md`](./ARCHITECTURE.md)

---

## 📂 Struktur Folder

<details>
<summary><b>Klik untuk melihat struktur folder lengkap</b></summary>

```
HeatherBenjaminJewelry/
├── README.md                 ← (file ini)
├── PRD.md                    ← Product Requirements Document
├── ARCHITECTURE.md           ← Dokumen arsitektur sistem
├── DATABASE.md               ← Dokumen desain database
├── DESIGN.md                 ← Design system & UI guideline
├── maua72.md                 ← Business case asli (brief hackathon)
│
├── backend/
│   ├── backend.md            ← Dokumentasi teknis backend
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma     ← Skema database (Prisma)
│   │   └── migrations/       ← Riwayat migrasi database
│   └── src/
│       ├── app.js
│       ├── auth/
│       ├── product/
│       ├── order/
│       ├── config/
│       ├── middleware/
│       └── services/
│
├── frontend/
│   ├── README.md             ← README bawaan Next.js
│   ├── AGENTS.md / CLAUDE.md ← Instruksi internal untuk AI coding agent
│   ├── package.json
│   ├── next.config.ts        ← Konfigurasi rewrite proxy ke backend
│   └── src/
│       ├── app/
│       └── components/
│
├── data/
│   └── data.md                ← (placeholder dataset/katalog produk)
│
└── docs/
    └── docs.md                ← (placeholder dokumentasi tambahan)
```

</details>

---

## 🗄️ Skema Database

Database menggunakan **PostgreSQL** (di-hosting via **Supabase**) dengan **Prisma ORM**. Skema aktual (`backend/prisma/schema.prisma`) terdiri dari 7 tabel:

### Entity Relationship Diagram

<p align="center">
  <img src="assets/erd-diagram.svg" alt="Entity Relationship Diagram" width="100%"/>
</p>

<details>
<summary><b>Lihat relasi dalam bentuk teks</b></summary>

```
users

orders 1──N order_items N──1 products
orders 1──N production
orders 1──N packing
orders 1──N tracking
```

</details>

<details>
<summary><b>📋 Detail kolom setiap tabel (klik untuk buka)</b></summary>

### Tabel `users`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | |
| email | VARCHAR (unique) | |
| password_hash | VARCHAR | di-hash dengan bcrypt |
| name | VARCHAR | |
| role | VARCHAR | default `manager` |
| created_at | TIMESTAMP | |

### Tabel `orders`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | |
| po_number | VARCHAR (unique) | |
| customer_name | VARCHAR | |
| customer_email | VARCHAR | nullable |
| upload_file | TEXT | URL publik Supabase Storage |
| notes | TEXT | |
| status | VARCHAR | default `Uploaded` |
| is_deleted | BOOLEAN | soft delete |
| is_archived | BOOLEAN | arsip |
| created_at | TIMESTAMP | |

### Tabel `order_items`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | |
| order_id | UUID (FK → orders, cascade) | |
| product_id | UUID (FK → products, set null) | nullable jika produk tak dikenali |
| style_code | VARCHAR | nullable |
| product_name | VARCHAR | nullable |
| unit_price | DECIMAL(12,2) | default 0 |
| quantity | INTEGER | |
| size | VARCHAR | nullable |
| material | VARCHAR | nullable |
| special_request | TEXT | nullable |

### Tabel `products`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | |
| style_code | VARCHAR (unique) | |
| product_name | VARCHAR | |
| description | TEXT | nullable |
| material | VARCHAR | nullable |
| image_url | TEXT | nullable |
| wholesale_price | DECIMAL(12,2) | default 0 |

### Tabel `production`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | |
| order_id | UUID (FK → orders, cascade) | |
| production_note | TEXT | dihasilkan AI |
| artisan_note | TEXT | dihasilkan AI |
| generated_by_ai | BOOLEAN | default true |
| created_at | TIMESTAMP | |

### Tabel `packing`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | |
| order_id | UUID (FK → orders, cascade) | |
| packing_note | TEXT | dihasilkan AI |
| checklist | JSON | default `[]` |
| generated_by_ai | BOOLEAN | default true |
| created_at | TIMESTAMP | |

### Tabel `tracking`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | UUID (PK) | |
| order_id | UUID (FK → orders, cascade) | |
| status | VARCHAR | salah satu dari status workflow |
| updated_at | TIMESTAMP | |

</details>

> Tabel tambahan untuk pengembangan lanjutan (`inventory`, `suppliers`, `invoices`, `notifications`, `audit_logs`, `ai_prompt_history`) sengaja **belum** dibuat di MVP ini agar prototipe tetap ringan.

---

## 🤖 Alur Kerja AI

File kunci: `backend/src/services/aiService.js`, `parserService.js`, `systemPrompt.js`.

<p align="center">
  <img src="assets/ai-workflow-diagram.svg" alt="Diagram Alur Kerja AI" width="100%"/>
</p>

<details>
<summary><b>Lihat alur AI dalam bentuk teks</b></summary>

```
Upload File (PDF/Excel/Gambar)
        │
        ▼
parserService → ekstrak teks (PDF/Excel) ATAU encode base64 (gambar)
        │
        ▼
systemPrompt.js → bangun system prompt + daftar katalog produk saat ini
        │
        ▼
aiService → kirim ke AI dengan structured JSON Schema
        │
   ┌────┴────┐
   ▼         ▼
Gemini 2.5  OpenRouter (fallback jika Gemini gagal/limit)
Flash       (model: google/gemini-2.5-flash)
   │
   ▼
Parse respons JSON (po_number, customer, products[], order_summary,
production_notes, packing_guide, missing_info, flags, validation, dst.)
   │
   ▼
Simpan ke database (orders, order_items, production, packing, tracking)
```

</details>

**Output terstruktur AI mencakup:**
- Data PO: `po_number`, `order_date`, `ship_date`, `payment_terms`, info `customer`
- Daftar `products` (style code, nama, material, finish, size, harga satuan, qty, subtotal, catatan khusus)
- `order_summary` (total SKU, total unit, total order, mata uang, metode pengiriman)
- `production_notes` (item urgent, item gift, item fragile, custom request)
- `packing_guide` (checklist item, label karton, metode pengiriman, perlu tracking atau tidak)
- `missing_info` & `flags` → dasar validasi otomatis
- `validation` → pengecekan kecocokan subtotal/total/style code

**Mekanisme retry:** jika terjadi rate limit (HTTP 429), sistem otomatis retry dengan backoff (5s, lalu 10s) sebelum pindah ke provider AI berikutnya.

### 🛟 Mode Fallback (tanpa AI)
Jika **tidak ada** API key AI yang dikonfigurasi, **atau** semua percobaan ke AI gagal, sistem **tidak akan crash**. Backend otomatis menghasilkan data simulasi (mock) berbasis katalog produk yang ada di database, lengkap dengan peringatan `"⚠️ This is FALLBACK data..."` pada `validation_warnings` — agar demo tetap bisa berjalan mulus.

---

## 🚀 Instalasi & Menjalankan Project

### Prasyarat
- Node.js (disarankan versi LTS terbaru)
- Akun & Project [Supabase](https://supabase.com) (PostgreSQL + Storage)
- API Key AI: [Google AI Studio (Gemini)](https://aistudio.google.com) dan/atau [OpenRouter](https://openrouter.ai)

### 1. Clone Repository
```bash
git clone <repo-url>
cd HeatherBenjaminJewelry
```

### 2. Setup Backend
```bash
cd backend
npm install
```

Buat file `.env` di folder `backend/` (lihat [Environment Variables](#-environment-variables)).

Generate Prisma client & push schema ke database Supabase:
```bash
npx prisma generate
npx prisma db push
```

Jalankan server (dev mode dengan hot-reload):
```bash
npm run dev
```
Backend berjalan di `http://localhost:5000`.

> 💡 Pastikan sudah membuat **bucket Storage** bernama `purchase-orders` di Supabase Storage agar upload file PO berhasil disimpan.

### 3. Setup Frontend
```bash
cd frontend
npm install
```

Buat file `.env.local` (opsional, jika backend tidak di `localhost:5000`):
```env
BACKEND_API_URL=http://127.0.0.1:5000
```

Jalankan dev server:
```bash
npm run dev
```
Frontend berjalan di `http://localhost:3000`. Semua request `/api/*` dan `/data/images/*` otomatis diteruskan (rewrite proxy) ke backend sesuai `next.config.ts`.

### 4. Buat User Admin/Manager Pertama
Karena belum ada UI registrasi, gunakan endpoint API langsung (lihat [Dokumentasi API](#-dokumentasi-api)):
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"manager@heatherbenjamin.com","password":"securepassword123","name":"Operations Manager","role":"manager"}'
```
Lalu login lewat halaman `/login` di frontend.

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
| Variable | Wajib | Keterangan |
|---|---|---|
| `PORT` | Opsional | Default `5000` |
| `DATABASE_URL` | ✅ | Connection string Postgres Supabase (pooler, untuk Prisma Client runtime) |
| `DIRECT_URL` | ✅ | Connection string langsung Postgres Supabase (untuk migrasi Prisma) |
| `SUPABASE_URL` | ✅ | URL project Supabase |
| `SUPABASE_KEY` | ✅ | Service role key atau anon key Supabase |
| `JWT_SECRET` | ✅ | Secret untuk signing JWT (login) |
| `GEMINI_API_KEY` | Opsional* | API key Google AI Studio (Gemini) — provider AI utama |
| `OPENROUTER_API_KEY` | Opsional* | API key OpenRouter — provider AI fallback |
| `FRONTEND_URL` | Opsional | Untuk konfigurasi CORS origin tambahan selain `localhost:3000` |

\* Jika **kedua** key AI tidak diisi, sistem otomatis berjalan dalam [mode fallback](#-mode-fallback-tanpa-ai).

### Frontend (`frontend/.env.local`)
| Variable | Wajib | Keterangan |
|---|---|---|
| `BACKEND_API_URL` | Opsional | Default `http://127.0.0.1:5000`, dipakai oleh rewrite proxy Next.js |

---

## 📡 Dokumentasi API

Base URL backend: `http://localhost:5000/api` (atau diakses lewat proxy frontend di `/api`).

### Health Check
| Method | Route | Keterangan |
|---|---|---|
| `GET` | `/api` | Status API |
| `GET` | `/api/db-check` | Cek koneksi database via Prisma |

### 🔐 Autentikasi (`/api/auth`)

| Method | Route | Keterangan |
|---|---|---|
| `POST` | `/api/auth/register` | Daftarkan user admin/manager baru |
| `POST` | `/api/auth/login` | Login, mengembalikan JWT token |

<details>
<summary><b>Contoh request &amp; response</b></summary>

**Register**
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "manager@heatherbenjamin.com",
  "password": "securepassword123",
  "name": "Operations Manager",
  "role": "manager"
}
```

**Login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "manager@heatherbenjamin.com",
  "password": "securepassword123"
}
```
Response:
```json
{
  "message": "Login successful.",
  "token": "JWT_TOKEN_HERE",
  "user": {
    "id": "uuid-here",
    "email": "manager@heatherbenjamin.com",
    "name": "Operations Manager",
    "role": "manager"
  }
}
```

</details>

> Semua endpoint di bawah ini **wajib** header `Authorization: Bearer <JWT_TOKEN>`.

### 📚 Katalog Produk (`/api/products`)

| Method | Route | Keterangan |
|---|---|---|
| `GET` | `/api/products` | Ambil semua produk |
| `POST` | `/api/products` | Tambah produk baru |

<details>
<summary><b>Contoh body request</b></summary>

Body `POST /api/products`:
```json
{
  "style_code": "HB102",
  "product_name": "Balinese Gold Band Ring",
  "description": "Handmade gold band ring with filigree patterns.",
  "material": "Gold",
  "image_url": "https://example.com/hb102.jpg",
  "wholesale_price": 120.00
}
```

</details>

### 📦 Purchase Order / Order (`/api/orders`)

| Method | Route | Keterangan |
|---|---|---|
| `POST` | `/api/orders/upload` | Upload file PO → diproses AI → disimpan |
| `GET` | `/api/orders` | Ambil semua order (mendukung query filter) |
| `GET` | `/api/orders/:id` | Detail order lengkap (item, production, packing, tracking) |
| `PUT` | `/api/orders/:id` | Update detail order & item |
| `PUT` | `/api/orders/:id/status` | Update status order |
| `PUT` | `/api/orders/:id/production` | Update catatan produksi & artisan |
| `PUT` | `/api/orders/:id/packing` | Update catatan & checklist packing |
| `PUT` | `/api/orders/:id/archive` | Arsipkan order |
| `PUT` | `/api/orders/:id/restore` | Pulihkan order dari arsip |
| `DELETE` | `/api/orders/:id` | Soft delete order |

<details>
<summary><b>Contoh request &amp; response</b></summary>

**Upload PO**
```http
POST /api/orders/upload
Content-Type: multipart/form-data

file: <PDF | XLS | XLSX | JPEG | PNG | WEBP, maks. 10MB>
```
Response:
```json
{
  "message": "Purchase Order uploaded, processed by AI, and saved successfully.",
  "order": {
    "id": "uuid-order-id",
    "po_number": "PO-99128",
    "customer_name": "Global Boutique Ltd",
    "customer_email": "purchasing@globalboutique.com",
    "upload_file": "https://supabase-url.co/storage/v1/object/public/purchase-orders/po/...pdf",
    "notes": "Express production requested.",
    "status": "Uploaded",
    "created_at": "2026-06-26T09:30:00Z",
    "validation_warnings": []
  }
}
```

**Query filter `GET /api/orders`:**
`search`, `status`, `date`, `customer`, `sortBy`, `isArchived`, `isDeleted`

**Update Status**
```http
PUT /api/orders/:id/status
Content-Type: application/json

{ "status": "Production" }
```
Nilai valid: `Uploaded`, `Reviewed`, `Production`, `QC`, `Packing`, `Shipping`, `Completed`.

</details>

> 📌 Dokumentasi teknis backend lengkap (instalasi, endpoint, contoh response): [`backend/backend.md`](./backend/backend.md)

---

## 🖥️ Halaman & Routing Frontend

| Route | Halaman | Keterangan |
|---|---|---|
| `/` | Upload PO | Halaman utama, drag & drop upload file PO |
| `/login` | Login | Login admin/manager |
| `/dashboard` | Dashboard | Daftar & monitoring semua order |
| `/review/[id]` | Review Order | Review & koreksi hasil ekstraksi AI sebelum disimpan final |
| `/production/[id]` | Instruksi Produksi | Lihat/edit catatan produksi & artisan per order |
| `/packing/[id]` | Panduan Packing | Lihat/edit catatan packing & checklist item |
| `/tracking/[id]` | Tracking | Pantau status & histori progres order |

Komponen `WorkflowStepper` menampilkan progres visual antar tahap (Production → Packing, dst.) di setiap halaman terkait.

---

## 🔄 Status & Workflow Order

```
Uploaded → Reviewed → Production → QC → Packing → Shipping → Completed
```

| Status | Arti |
|---|---|
| `Uploaded` | File PO baru diupload & diekstrak AI |
| `Reviewed` | Data sudah dicek/divalidasi staf operasional |
| `Production` | Sedang dikerjakan artisan/produksi |
| `QC` | Quality Control |
| `Packing` | Proses pengepakan |
| `Shipping` | Dalam pengiriman |
| `Completed` | Order selesai |

Selain status di atas, order juga punya flag tambahan: **`is_archived`** (diarsipkan) dan **`is_deleted`** (soft delete, tidak benar-benar dihapus dari database).

---

## 🎨 Design System

Brand positioning: **"a luxury jewelry boutique with timeless elegance"** — bukan marketplace atau template admin biasa.

| Token | Nilai |
|---|---|
| Primary — Luxury Gold | `#C6A55A` |
| Secondary — Ivory White | `#FAF8F4` |
| Accent — Champagne | `#E8D9B5` |
| Dark — Charcoal Black | `#1E1E1E` |
| Neutral — Warm Gray | `#7A7A7A` |
| Font Heading | Playfair Display (fallback Georgia) |
| Font Body | Inter (fallback sans-serif) |
| Border Radius | Button 12px · Card 18px · Modal 24px |

Mendukung **Light Mode** & **Dark Mode** dengan token warna terpisah, transisi halus (`transition-colors duration-300`), dan toggle ikon Sun/Moon di navbar.

> 📌 Detail lengkap (typography scale, layout, animasi, aturan komponen, aksesibilitas): [`DESIGN.md`](./DESIGN.md)

---

## 🔒 Keamanan

- Password di-hash menggunakan **bcryptjs** sebelum disimpan.
- Autentikasi berbasis **JWT**, divalidasi lewat middleware (`middleware/auth.js`) di setiap endpoint privat.
- Upload file dibatasi tipe (`PDF`, `XLS/XLSX`, `JPEG/PNG/WEBP`) dan ukuran maksimal **10MB** (Multer file filter).
- **CORS** dibatasi hanya untuk origin yang terdaftar (`localhost:3000` & `FRONTEND_URL`).
- API key (Supabase, AI provider, JWT secret) disimpan di **environment variables**, tidak di-hardcode.
- Informasi sensitif customer diusahakan diminimalkan sesuai prinsip pada [`PRD.md`](./PRD.md) & [`ARCHITECTURE.md`](./ARCHITECTURE.md).
- Order tidak benar-benar dihapus permanen — menggunakan **soft delete** (`is_deleted`) demi audit trail.

> ⚠️ Untuk produksi nyata, disarankan menambahkan: rate limiting, validasi/sanitasi input lebih ketat, rotasi secret, HTTPS wajib, serta audit log.

---

## 🗺️ Roadmap / Future Enhancement

Di luar scope MVP saat ini, namun direncanakan untuk pengembangan lanjutan:

- Integrasi **Shopify**
- Integrasi **QuickBooks**
- **Inventory Management**
- Notifikasi **WhatsApp** & **Email**
- **Analytics Dashboard**
- **Role-Based Access Control (RBAC)** lebih granular
- **Supplier Management**
- Tabel tambahan: `inventory`, `suppliers`, `invoices`, `notifications`, `audit_logs`, `ai_prompt_history`

---

## 📄 Dokumen Terkait

| Dokumen | Isi |
|---|---|
| [`PRD.md`](./PRD.md) | Product Requirements Document — kebutuhan bisnis & fungsional |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Arsitektur sistem secara menyeluruh |
| [`DATABASE.md`](./DATABASE.md) | Desain database |
| [`DESIGN.md`](./DESIGN.md) | Design system & UI/UX guideline |
| [`maua72.md`](./maua72.md) | Business case asli dari panitia/hackathon |
| [`backend/backend.md`](./backend/backend.md) | Dokumentasi teknis backend (setup, API, fallback mode) |
| [`frontend/README.md`](./frontend/README.md) | README bawaan Next.js (create-next-app) |

---

## 👥 Tim & Pembagian Peran

Sesuai struktur tim pada [`PRD.md`](./PRD.md):

| Peran | Tanggung Jawab |
|---|---|
| **Backend** | Database, REST API, integrasi AI, deployment |
| **Frontend + UI/UX** | Dashboard, halaman upload, tracking, produksi, packing |
| **Data Engineer** | Katalog produk, style code, gambar, mapping material, sample PO |
| **AI Engineer** | Prompt engineering, ekstraksi dokumen, validasi, generator produksi & packing |
| **QA & Support** | API testing, integration testing, bug reporting |
| **PM + Documentation** | Requirement gathering, sprint planning, dokumentasi, presentasi, demo video |

---

## 📜 Lisensi

© 2026 **Heather Benjamin Jewelry**. All Rights Reserved.

Project ini merupakan prototipe **proprietary** yang dikembangkan untuk keperluan internal Heather Benjamin Jewelry (hasil hackathon/lomba). Source code, dokumentasi, dan aset di dalamnya tidak untuk disalin, dimodifikasi, atau didistribusikan ulang oleh pihak luar tanpa izin tertulis dari pemilik project.

---

<p align="center">Dibangun dengan 💛 untuk <strong>Heather Benjamin Jewelry</strong> — mengubah cara Purchase Order diproses, dari manual menjadi otomatis dengan AI.</p>
