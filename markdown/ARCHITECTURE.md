# 🏗️ ARCHITECTURE.md

# Heather Benjamin Jewelry

## AI Order-to-Production Assistant

**Version:** 1.0

**Architecture Type:** Monolithic + AI Service Integration

---

# 1. Overview

The system is designed as a lightweight AI-powered workflow platform that transforms customer Purchase Orders (POs) into structured production and fulfillment processes.

To meet the hackathon timeline (48–72 hours), the system uses a **Monolithic Backend Architecture** with an external AI service.

The architecture emphasizes:

* Simple deployment
* Easy integration
* Fast development
* Scalability for future enhancements

---

# 2. High Level Architecture

```text
                          Customer

                              │

                   Upload Purchase Order

                              │

                              ▼

                  Frontend (Next.js)

                              │
                        REST API (HTTPS)

                              ▼

                  Backend (Express.js)

        ┌───────────────┼──────────────────┐
        │               │                  │
        ▼               ▼                  ▼

 Claude Vision      Supabase DB     Supabase Storage

        │               │                  │
        └───────────────┴──────────────────┘

                              │

                              ▼

                   Tracking Dashboard
```

---

# 3. System Components

## Frontend

Responsibilities

* Login/Authentication UI
* Upload Purchase Order
* Display Order Information
* Display AI Validation
* Production Instruction Page
* Packing Guide Page
* Tracking Dashboard

Technology

* Next.js
* Tailwind CSS
* Axios
* React

---

## Backend

Responsibilities

* User Authentication (Login, Token JWT / Session)
* REST API
* File Upload
* AI Integration
* Business Logic
* Database Management

Technology

* Node.js
* Express.js

---

## AI Layer

Responsibilities

* Read Purchase Order
* Extract Structured Data
* Validate Order
* Generate Production Instruction
* Generate Packing Guide

Technology

* Claude Vision API
* OCR
* LangChain (Optional)

---

## Database

Responsibilities

* Store User accounts / admin credentials
* Store Purchase Orders
* Store Product Catalog
* Store Tracking
* Store AI Results

Technology

* PostgreSQL (Supabase)

---

## Storage

Responsibilities

* Store Uploaded Purchase Orders
* Store Product Images
* Store Generated Documents

Technology

* Supabase Storage

---

# 4. Main Workflow

```
Customer

      │

Upload Purchase Order

      │

      ▼

Frontend

      │

      ▼

Backend

      │

      ▼

Claude Vision API

      │

Extract Purchase Order

      │

      ▼

Validate Data

      │

      ▼

Save to Database

      │

 ┌────┴──────────────┐

 ▼                   ▼

Production      Packing Guide

Instruction

      │

      ▼

Tracking Dashboard
```

---

# 5. Backend Architecture

```
backend/

├── src/
│
├── config/
│
├── middleware/
│
├── routes/
│
├── controllers/
│
├── services/
│
├── repositories/
│
├── modules/
│
├── utils/
│
└── app.js
```

## Responsibilities

### Routes

Receive HTTP Request

↓

Call Controller

---

### Controllers

Validate Request

↓

Call Service

↓

Return Response

---

### Services

Business Logic

↓

AI Integration

↓

Repository

---

### Repository

Database Query

↓

Supabase

---

# 6. Frontend Architecture

```
frontend/

├── app/
├── components/
├── hooks/
├── services/
├── public/
├── styles/
└── utils/
```

Responsibilities

* UI Components
* API Integration
* State Management
* Dashboard
* Tracking

---

# 7. AI Architecture

```
Purchase Order

        │

        ▼

Claude Vision

        │

        ▼

Structured JSON

        │

        ▼

Validation

        │

        ▼

Production Generator

        │

        ▼

Packing Generator

        │

        ▼

Save Database
```

Responsibilities

### Document Extraction

Extract

* Customer
* PO Number
* Product
* Quantity
* Material
* Notes

---

### Validation

Detect

* Missing Material
* Missing Size
* Unknown Product
* Invalid Style Code

---

### Production Generator

Generate

* Product Images
* Materials
* Artisan Notes
* Production Notes

---

### Packing Generator

Generate

* Packing Checklist
* Product Images
* Quantity
* Packaging Notes
* Outstanding Items

---

# 8. Data Flow

```
Purchase Order

      │

      ▼

Upload API

      │

      ▼

Claude Vision

      │

      ▼

JSON Extraction

      │

      ▼

Validation

      │

      ▼

Database

      │

      ▼

Frontend Dashboard
```

---

# 9. Folder Structure

```
project/

├── frontend/
│
├── backend/
│
├── ai/
│
├── data/
│
├── database/
│
├── docs/
│
├── README.md
│
├── PRD.md
│
└── package.json
```

---

# 10. Deployment Architecture

```
Developer

     │

     ▼

GitHub Repository

     │

     ├───────────────┐

     ▼               ▼

 Vercel          Render

Frontend        Backend

      │

      ▼

Supabase

(Database + Storage)

      │

      ▼

Claude Vision API
```

---

# 11. Security Considerations

The prototype excludes sensitive customer information whenever possible.

Recommendations:

* Store API Keys using Environment Variables
* Validate uploaded files
* Limit upload file size
* Use HTTPS
* Sanitize user input
* Hide internal AI prompts

---

# 12. Scalability

Future enhancements may include:

* Shopify Integration
* QuickBooks Integration
* Inventory Management
* Role-based Access Control (RBAC)
* Supplier Management
* Analytics Dashboard
* Email Notification
* WhatsApp Integration

---

# 13. Design Principles

The architecture follows these principles:

* Simplicity
* Modularity
* Scalability
* Maintainability
* AI-first Workflow
* RESTful API
* Separation of Concerns

---

# 14. Architecture Decision

| Decision           | Reason                                          |
| ------------------ | ----------------------------------------------- |
| Monolithic Backend | Faster development within hackathon timeline    |
| Express.js         | Lightweight and familiar ecosystem              |
| Next.js            | Fast UI development                             |
| Supabase           | Managed PostgreSQL + Storage                    |
| Claude Vision API  | Accurate document understanding                 |
| REST API           | Simple integration between frontend and backend |

---

# 15. Future Architecture

Future versions may evolve into:

```
Frontend

      │

API Gateway

      │

 ┌────┴──────────────┐

 │                   │

Auth Service     Order Service

 │                   │

 ├──────────────┐    │

 ▼              ▼    ▼

AI Service   Notification Service

       │

       ▼

Database Cluster
```

This architecture is intentionally simplified for the MVP while remaining extensible for future production use.
