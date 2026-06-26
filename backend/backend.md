# ⚙️ Backend Service Documentation (Modular & Prisma ORM)

This service is a monolithic REST API built using **Node.js**, **Express.js**, **Prisma ORM (PostgreSQL)**, and **Supabase Storage**, integrated with **Google Gemini 2.0 Flash (via OpenRouter)** for Purchase Order extraction.

---

## 📂 File Structure (Feature-based Modular)

```text
backend/
├── prisma/
│   └── schema.prisma         # Prisma Schema file (PostgreSQL)
├── src/
│   ├── auth/                 # Auth Module
│   │   ├── authRepository.js
│   │   ├── authService.js
│   │   └── authRouter.js
│   ├── product/              # Product Catalog Module
│   │   ├── productRepository.js
│   │   ├── productService.js
│   │   └── productRouter.js
│   ├── order/                # Order Processing Module
│   │   ├── orderRepository.js
│   │   ├── orderService.js
│   │   └── orderRouter.js
│   ├── config/
│   │   ├── prisma.js         # Prisma Client instance
│   │   └── supabase.js       # Supabase Storage client
│   ├── middleware/
│   │   ├── auth.js           # JWT validation middleware
│   │   └── upload.js         # Multer upload middleware
│   ├── services/
│   │   ├── aiService.js      # Claude Vision PO parser
│   │   └── storageService.js # Supabase Storage helper
│   └── app.js                # App entrypoint
```

---

## 🚀 Getting Started

### 1. Install Dependencies
Navigate to the `backend` folder and install packages:
```bash
cd backend
npm install
```

### 2. Environment Variables
Rename `.env.example` to `.env` and configure:
```env
PORT=5000
SUPABASE_URL=https://your-supabase-project.supabase.co
SUPABASE_KEY=your-supabase-service-role-key-or-anon-key
DATABASE_URL=postgresql://postgres.your-project-id:your-password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
JWT_SECRET=your_jwt_secret_key_here
OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### 3. Generate Prisma Client
Generate the type-safe client using Prisma:
```bash
npx prisma generate
```

### 4. Database Setup & Migrations
To push the schema models directly to your Supabase PostgreSQL database:
```bash
npx prisma db push
```

### 5. Running the Server
Start the development server with hot-reloading:
```bash
npm run dev
```
The server will start on `http://localhost:5000`.

---

## 🛡️ API Endpoints

### 1. Authentication (`/api/auth`)

#### Register User
* **Method:** `POST`
* **Route:** `/api/auth/register`
* **Body:**
```json
{
  "email": "manager@heatherbenjamin.com",
  "password": "securepassword123",
  "name": "Operations Manager",
  "role": "manager"
}
```

#### User Login
* **Method:** `POST`
* **Route:** `/api/auth/login`
* **Body:**
```json
{
  "email": "manager@heatherbenjamin.com",
  "password": "securepassword123"
}
```
* **Response:**
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

---

### 2. Product Catalog (`/api/products`)
*All endpoints require authentication headers: `Authorization: Bearer <JWT_TOKEN>`*

#### Get Catalog
* **Method:** `GET`
* **Route:** `/api/products`

#### Add Product
* **Method:** `POST`
* **Route:** `/api/products`
* **Body:**
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

---

### 3. Purchase Orders (`/api/orders`)
*All endpoints require authentication headers: `Authorization: Bearer <JWT_TOKEN>`*

#### Upload Purchase Order
* **Method:** `POST`
* **Route:** `/api/orders/upload`
* **Content-Type:** `multipart/form-data`
* **Body:**
  * `file`: File upload field (supports PDF, Excel, JPEG, PNG, WEBP)
* **Response:**
```json
{
  "message": "Purchase Order uploaded, processed by AI, and saved successfully.",
  "order": {
    "id": "uuid-order-id",
    "po_number": "PO-99128",
    "customer_name": "Global Boutique Ltd",
    "customer_email": "purchasing@globalboutique.com",
    "upload_file": "https://supabase-url.co/storage/v1/object/public/purchase-orders/po/17823912-abc.pdf",
    "notes": "Express production requested.",
    "status": "Uploaded",
    "created_at": "2026-06-26T09:30:00Z",
    "validation_warnings": []
  }
}
```

#### Get All Orders
* **Method:** `GET`
* **Route:** `/api/orders`
* **Query Parameters:** `?status=Production` (optional filter)

#### Get Order Details
* **Method:** `GET`
* **Route:** `/api/orders/:id`
* **Response:** Returns the full details of the order, including its items (with matched products), production notes, packing guides, and tracking history.

#### Update Status
* **Method:** `PUT`
* **Route:** `/api/orders/:id/status`
* **Body:**
```json
{
  "status": "Production"
}
```
*Possible values:* `Uploaded`, `Reviewed`, `Production`, `QC`, `Packing`, `Shipping`, `Completed`.

---

## 🤖 AI Fallback Mode
If the `ANTHROPIC_API_KEY` is missing or the external API call fails, the backend **will not crash**. It automatically uses a **fallback simulation mode** to generate realistic structured order data, production guides, and packing checklists based on the products present in your database. This is designed to ensure a seamless workflow during hackathon demonstrations.
