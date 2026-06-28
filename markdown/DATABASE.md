# DATABASE.md

# 🗄️ Database Design

## Heather Benjamin Jewelry

AI Order-to-Production Assistant

---

# 1. Database Overview

Database Type

PostgreSQL (Supabase)

The database is designed to support:

* Purchase Orders
* Product Catalog
* AI Extraction
* Production
* Packing
* Tracking

---

# 2. Entity Relationship Diagram

```
Orders
│
├──< Order Items
│
├──< Tracking
│
├──< Production
│
└──< Packing

Products
│
└──< Order Items
```

---

# 3. Tables

---

## orders

Stores Purchase Order information.

| Column         | Type      |
| -------------- | --------- |
| id             | UUID      |
| po_number      | VARCHAR   |
| customer_name  | VARCHAR   |
| customer_email | VARCHAR   |
| upload_file    | TEXT      |
| notes          | TEXT      |
| status         | VARCHAR   |
| created_at     | TIMESTAMP |

---

## order_items

Stores all ordered products.

| Column          | Type    |
| --------------- | ------- |
| id              | UUID    |
| order_id        | UUID FK |
| product_id      | UUID FK |
| quantity        | INTEGER |
| size            | VARCHAR |
| material        | VARCHAR |
| special_request | TEXT    |

---

## products

Product Catalog.

| Column          | Type    |
| --------------- | ------- |
| id              | UUID    |
| style_code      | VARCHAR |
| product_name    | VARCHAR |
| description     | TEXT    |
| material        | VARCHAR |
| image_url       | TEXT    |
| wholesale_price | DECIMAL |

---

## production

Generated production instruction.

| Column          | Type      |
| --------------- | --------- |
| id              | UUID      |
| order_id        | UUID FK   |
| production_note | TEXT      |
| artisan_note    | TEXT      |
| generated_by_ai | BOOLEAN   |
| created_at      | TIMESTAMP |

---

## packing

Generated packing guide.

| Column          | Type      |
| --------------- | --------- |
| id              | UUID      |
| order_id        | UUID FK   |
| packing_note    | TEXT      |
| checklist       | JSON      |
| generated_by_ai | BOOLEAN   |
| created_at      | TIMESTAMP |

---

## tracking

Track order progress.

| Column     | Type      |
| ---------- | --------- |
| id         | UUID      |
| order_id   | UUID FK   |
| status     | VARCHAR   |
| updated_at | TIMESTAMP |

Status

* Uploaded
* Reviewed
* Production
* QC
* Packing
* Shipping
* Completed

---

## users

Stores user credentials and roles for dashboard access.

| Column        | Type      |
| ------------- | --------- |
| id            | UUID      |
| email         | VARCHAR   |
| password_hash | VARCHAR   |
| name          | VARCHAR   |
| role          | VARCHAR   |
| created_at    | TIMESTAMP |

---

# 4. Relationships

```
Orders

1

│

│

N

Order Items

│

N

│

1

Products
```

```
Orders

1

│

├──────1 Production

├──────1 Packing

└──────N Tracking
```

---

# 5. Suggested Status Flow

```
Uploaded

↓

Reviewed

↓

Production

↓

Quality Control

↓

Packing

↓

Shipping

↓

Completed
```

---

# 6. Example Order JSON

```json
{
  "po_number": "PO-001",
  "customer": "ABC Jewelry",
  "items": [
    {
      "style_code": "HB102",
      "quantity": 10,
      "material": "Gold",
      "size": "7"
    }
  ],
  "status": "Production"
}
```

---

# 7. Future Tables

Future development may include

* inventory
* suppliers
* invoices
* notifications
* audit_logs
* ai_prompt_history

These tables are intentionally excluded from the MVP (except for the users table which was added for admin authentication) to keep the prototype lightweight and achievable within the hackathon timeline.
