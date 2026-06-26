# Design System

## Heather Benjamin Jewelry

Version: 1.0

---

# Design Philosophy

Heather Benjamin Jewelry bukan sekadar toko online, tetapi sebuah **premium jewelry experience**.

Website harus memberikan kesan:

* Elegant
* Exclusive
* Timeless
* Professional
* Modern Luxury
* Clean
* Editorial Style

Pengunjung harus merasa sedang membuka website brand perhiasan premium, bukan marketplace.

---

# Design Principles

1. White space lebih penting daripada dekorasi.
2. Gunakan warna sesedikit mungkin.
3. Fokus pada kualitas foto produk.
4. Typography menjadi elemen utama branding.
5. Gunakan animasi yang halus.
6. Hindari card yang berlebihan.
7. Layout harus terasa premium dan tidak padat.

---

# Brand Personality

Luxury

Minimalist

Modern

Trustworthy

Sophisticated

High-end

---

# Color Palette

## Primary

Luxury Gold

HEX

#C6A55A

Usage

Primary Button

Active Navigation

Highlight

Icon

Small Decoration

---

## Secondary

Ivory White

HEX

#FAF8F4

Usage

Background

Section

Cards

---

## Accent

Champagne

HEX

#E8D9B5

Usage

Hover

Badge

Small Decoration

Border

---

## Dark

Charcoal Black

HEX

#1E1E1E

Usage

Heading

Footer

Main Text

---

## Neutral

Warm Gray

HEX

#7A7A7A

Usage

Description

Subtitle

Placeholder

---

## Border

HEX

#E5E5E5

---

## Success

HEX

#2E7D32

---

## Error

HEX

#D32F2F

---

# Gradient

Luxury Gradient

from

#C6A55A

to

#F2E7C9

Gunakan hanya pada:

Hero CTA

Premium Badge

Small Accent

Jangan digunakan sebagai background utama.

---

# Background Rules

Main

#FFFFFF

Alternate Section

#FAF8F4

Dark Section

#1E1E1E

---

# Typography

Heading

Playfair Display

Fallback

Georgia

---

Body

Inter

Fallback

sans-serif

---

Code

JetBrains Mono

---

# Font Scale

Hero

64px

H1

48px

H2

36px

H3

28px

H4

22px

Body Large

18px

Body

16px

Caption

14px

Small

12px

---

# Font Weight

300

400

500

600

700

---

# Border Radius

Button

12px

Card

18px

Input

12px

Image

20px

Modal

24px

---

# Shadows

Gunakan shadow seminimal mungkin.

Lebih utamakan:

Border

White Space

Contrast

Shadow hanya:

0 10px 30px rgba(0,0,0,.08)

---

# Buttons

Primary

Background

Luxury Gold

Text

White

Hover

Sedikit lebih gelap.

Transition

300ms ease

---

Secondary

Transparent

Border Gold

Text Gold

Hover

Gold Background

White Text

---

# Icons

Gunakan Lucide Icons.

Ukuran

18px

20px

24px

Style

Outline

---

# Layout

Container

1280px

Section Padding

120px Desktop

80px Tablet

60px Mobile

Grid Gap

32px

---

# Cards

Gunakan card hanya jika diperlukan.

Product Card

Image

Product Name

Category

Price

Wishlist

Tanpa border tebal.

Hover hanya:

Lift 4px

Scale 1.02

---

# Images

Background bersih.

Dominasi putih.

Foto resolusi tinggi.

Gunakan rasio:

4:5

atau

1:1

---

# Animation

Gunakan Framer Motion.

Durasi

0.4s

Hover

Scale

Opacity

TranslateY

Jangan gunakan animasi berlebihan.

---

# Navbar

Transparent saat Hero.

Menjadi putih saat scroll.

Logo kiri.

Menu tengah.

Search + Cart + Profile kanan.

---

# Hero

Foto editorial besar.

Heading maksimal 2 baris.

CTA jelas.

Banyak white space.

---

# Product Page

Gallery kiri.

Detail kanan.

Sticky information.

Thumbnail vertikal.

---

# Checkout

Step by Step.

Shipping

Payment

Review

Confirmation

---

# Dashboard

Sidebar kiri.

Content kanan.

Gunakan tabel modern.

Jangan gunakan warna mencolok.

---

# Forms

Input tinggi 48px.

Border tipis.

Focus:

Gold Border

No heavy shadow.

---

# Responsive

Desktop

1440px+

Laptop

1280px

Tablet

768px

Mobile

390px

---

# Component Rules

Semua komponen harus menggunakan:

Design Token

Spacing

Typography

Color

Radius

Shadow

yang sama.

Tidak boleh membuat style baru tanpa alasan yang jelas.

---

# UX Rules

Loading Skeleton.

Toast Notification.

Confirmation Dialog.

Empty State.

Error State.

Success State.

---

# Accessibility

Kontras minimal WCAG AA.

Keyboard Navigation.

Visible Focus State.

Alt Text pada semua gambar.

---

# Development Rules

Gunakan Tailwind CSS.

Semua warna dibuat sebagai Design Tokens.

Jangan hardcode HEX di komponen.

Gunakan CSS Variables.

Gunakan reusable components.

Pisahkan:

UI

Business Logic

API

State Management

---

# Light Mode & Dark Mode

Untuk menjaga estetika mewah dan kenyamanan mata pengguna, antarmuka mendukung pergantian mode tampilan dengan skema pemetaan warna berikut:

## Light Mode (Default)
* **Background Utama**: `#FFFFFF` (Putih murni untuk memberikan kesan bersih dan lapang)
* **Background Sekunder / Kartu**: `#FAF8F4` (Ivory White untuk kontras yang lembut)
* **Teks Utama (Heading)**: `#1E1E1E` (Charcoal Black untuk kejelasan tingkat tinggi)
* **Teks Sekunder (Body/Deskripsi)**: `#7A7A7A` (Warm Gray untuk hirarki teks yang baik)
* **Border & Pembagi**: `#E5E5E5` (Abu-abu sangat terang)

## Dark Mode
* **Background Utama**: `#121212` (Hitam pekat/deep dark untuk mempertahankan kedalaman warna gold)
* **Background Sekunder / Kartu**: `#1E1E1E` (Charcoal Black untuk kontras elemen dan kedalaman visual)
* **Teks Utama (Heading)**: `#FAF8F4` (Ivory White agar teks kontras dan tetap lembut di mata)
* **Teks Sekunder (Body/Deskripsi)**: `#A0A0A0` (Light Warm Gray agar tidak terlalu terang namun tetap terbaca)
* **Border & Pembagi**: `#2D2D2D` (Charcoal gelap)

## Aturan Transisi & Konsistensi
1. **Warna Aksen & Utama Tetap**: Luxury Gold (`#C6A55A`) dan Champagne (`#E8D9B5`) tidak boleh berubah warna baik di mode terang maupun gelap untuk menjaga identitas brand.
2. **Smooth Transition**: Gunakan transisi CSS `transition-colors duration-300` saat berganti mode tampilan.
3. **Toggle Switch**: Letakkan tombol pemindah mode di bagian kanan Navbar dengan ikon Lucide `Sun` untuk Light Mode dan `Moon` untuk Dark Mode.

---

# Overall Goal

Website harus memberikan kesan:

"A luxury jewelry boutique with timeless elegance."

Bukan marketplace.

Bukan template admin.

Bukan toko online biasa.

Tetapi sebuah premium digital brand experience.

