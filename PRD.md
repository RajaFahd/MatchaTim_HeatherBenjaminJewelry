# 💎 Heather Benjamin Jewelry
# Product Requirements Document (PRD)

Version: 1.0

Project: AI Order-to-Production Assistant

Duration: 48–72 Hours (Hackathon MVP)

---

# 1. Background

Heather Benjamin Jewelry is a handmade jewelry company collaborating with artisans and production partners in Bali.

Currently, Purchase Orders (POs) are processed manually by reviewing customer documents, identifying products, preparing production instructions, coordinating with artisans, preparing packing guides, and updating customers.

This process is slow, error-prone, and heavily depends on the founder's knowledge.

---

# 2. Problem Statement

Current issues include:

- Purchase Orders come in multiple formats (PDF, Excel, Images, Email)
- Manual extraction of customer and product information
- Manual production preparation
- Scattered information across spreadsheets and emails
- Production misunderstandings
- Packing mistakes
- Slow communication
- Founder dependency

---

# 3. Objective

Build an AI-powered assistant capable of converting customer Purchase Orders into structured operational workflows.

The system should:

- Extract purchase order information
- Validate order completeness
- Generate production instructions
- Generate packing guides
- Track production progress

---

# 4. Success Metrics

Target:

- Reduce processing time by 80%
- Reduce production errors
- Reduce packing mistakes
- Improve communication
- Improve operational visibility

---

# 5. Scope

## In Scope

- User Authentication (Admin/Manager Login)
- Upload Purchase Order
- AI Document Extraction
- AI Validation
- Production Instruction
- Packing Guide
- Order Tracking Dashboard

## Out of Scope

- ERP
- Inventory Management
- Shopify Integration
- QuickBooks
- Payment Gateway
- WhatsApp Notification

---

# 6. User

## Operation Staff

Responsibilities

- Upload Purchase Orders
- Review AI Results
- Monitor Production
- Download Packing Guide
- Monitor Tracking

---

# 7. Main Workflow

```
Customer

     │

Upload Purchase Order

     │

     ▼

AI Document Extraction

     │

     ▼

AI Validation

     │

     ▼

Save Order

     │

 ┌───┴─────────────┐

 ▼                 ▼

Production     Packing Guide

Instruction

       │

       ▼

Tracking Dashboard

       │

       ▼

Completed
```

---

# 8. Functional Requirements

## FR-01 Upload Purchase Order

Input

- PDF
- Excel
- Image

Output

- Uploaded document

---

## FR-02 AI Extraction

Extract

- Customer
- Purchase Order Number
- Product
- Quantity
- Material
- Size
- Notes

Output

JSON Order

---

## FR-03 Validation

AI should detect

- Missing Product
- Missing Material
- Missing Size
- Invalid Style Code

Output

Warning List

---

## FR-04 Production Instruction

Generate

- Product Image
- Style Code
- Quantity
- Material
- Production Notes
- Artisan Notes

---

## FR-05 Packing Guide

Generate

- Customer
- Product Images
- Packaging
- Quantities
- Outstanding Items
- Checklist

---

## FR-06 Tracking

Status

- Uploaded
- Reviewed
- Production
- QC
- Packing
- Shipping
- Completed

---

## FR-07 Admin Login

Input

- Email / Username
- Password

Output

- Access Token (JWT or Session)
- Access to Dashboard

---

# 9. Non Functional Requirements

Performance

- AI response < 15 seconds

Availability

- Cloud Deployment

Security

- Sensitive customer information excluded

Scalability

- Future ERP Integration Ready

---

# 10. Team Responsibilities

## Backend

Responsibilities

- Database
- REST API
- AI Integration
- Deployment

Suggested Stack

- Node.js
- Express.js
- Supabase
- PostgreSQL

---

## Frontend + UI/UX

Responsibilities

- Dashboard
- Upload Page
- Tracking Page
- Production Page
- Packing Guide UI

Suggested Stack

- Next.js
- TailwindCSS
- Axios
- Figma

---

## Data Engineer

Responsibilities

- Product Catalog
- Style Codes
- Images
- Material Mapping
- Sample Purchase Orders

Suggested Stack

- Excel
- CSV
- Python
- Supabase Storage

---

## AI Engineer

Responsibilities

- Prompt Engineering
- Document Extraction
- Validation
- Production Instruction
- Packing Guide

Suggested Stack

- Claude Vision API
- OCR
- LangChain (Optional)

---

## QA & Support

Responsibilities

- API Testing
- Integration Testing
- Bug Reporting
- Deployment Testing

Suggested Stack

- Postman
- GitHub Issues
- Playwright

---

## PM + Documentation

Responsibilities

- Requirement Gathering
- Sprint Planning
- Timeline
- Documentation
- Presentation
- Demo Video

Suggested Stack

- Notion
- Google Docs
- Trello
- Canva

---

# 11. Suggested Tech Stack

| Layer | Technology |
|---------|------------|
| Frontend | Next.js |
| Styling | Tailwind CSS |
| Backend | Node.js + Express |
| AI | Claude Vision API |
| Database | Supabase PostgreSQL |
| Storage | Supabase Storage |
| Deployment | Vercel + Render |
| Version Control | GitHub |

---

# 12. Deliverables

- Working Prototype
- AI Workflow
- Production Instruction Generator
- Packing Guide Generator
- Dashboard
- Documentation
- Demo Video

---

# 13. Future Enhancement

- Shopify Integration
- QuickBooks Integration
- Inventory Management
- WhatsApp Notification
- Email Notification
- Analytics Dashboard
- Role-based Access Control (RBAC)
- Supplier Management