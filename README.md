# MediStock — Healthcare Supply & Inventory Management Platform

**MediStock** is a professional, centralized healthcare supply management platform tailored for pharmacies, hospitals, clinics, and ordinary users (featuring an integrated voluntary blood donation and donor-finding system).

---

## 🌟 Key Features Across Roles

### 1. Normal User
- Google Sign-In via Firebase Authentication.
- Browse full public pharmaceutical and surgical supply catalog with search and category filters.
- **Voluntary Blood Donation Network**:
  - Filter donors by blood group (A+, B+, O+, AB+, etc.) and city/area.
  - Register as a voluntary donor with availability status and privacy consent.
  - Post emergency blood requests with urgency indicators (Normal, Urgent, Critical) and hospital location.
  - Respond to emergency blood requests.
- User profile dashboard with donation history and notifications.

### 2. Pharmacy / Hospital / Clinic User (Healthcare Organization)
- Facility registration with license number and trade document verification.
- **Verification Gate**: Supply ordering is strictly locked until an administrator reviews and approves the facility.
- Real-time stock counts with atomic inventory reservations at checkout.
- Smart restocking cart with automatic line-item validation.
- Organization-wise order history and status tracking timeline (Pending → Confirmed → Processing → Shipped → Delivered).
- Dedicated printable official tax invoices with unique invoice numbers (`MS-INV-xxxx`).
- Product demand suggestion forms for unlisted medicines or vaccines.

### 3. Administrator
- **Product Management**: Full CRUD operations, SKU, manufacturer, price, available quantity, batch numbers, expiry dates, and Rx prescription requirements.
- **Inventory & Expiry Alert Center**: Automated threshold triggers for low stock and near-expiry (< 90 days) batches. Expired batches are automatically blocked from orders.
- **Organization Verification Center**: Inspect submitted license documentation and approve or reject applications with mandatory reasons.
- **Dedicated Organization Profiles (Section 5 Core Feature)**:
  - Deep-dive view for each registered facility (e.g. "Dhaka Central Hospital" or "Labaid Care Pharmacy").
  - Lifetime order list, spend analytics, and most frequently ordered items.
- **Order Dispatch Workflow**: Progress order statuses and manage safe inventory restock if cancelled.
- **Product Demand Requests Review**: Review clinic requests and convert approved requests directly into catalog items with 1 click.
- **Reports & Analytics**: Recharts visualizations of monthly restocking trends, facility distributions, and one-click downloadable CSV audit reports.

### 4. Platform Owner / Super Admin
- Exclusive privilege to promote eligible users to Platform Admin or demote Admins to standard user roles.
- Suspend or reactivate user accounts with immediate revocation of privileges.
- Comprehensive system audit ledger tracking actor, action, timestamp, and entity details.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Database**: MongoDB with Mongoose ODM
- **Backend API**: Node.js, Express.js (TypeScript with tsx)
- **Authentication**: Firebase Authentication (Google Sign-In) + JWT Session Sync + Demo Instant Role Switcher

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+ or v20+)
- MongoDB running locally at `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI

### 2. Install Dependencies
```bash
# In the project root:
npm run server:install
npm run client:install
```

### 3. Seed Database with Realistic Demo Data
The seed script provisions pre-configured Owner, Admin, sample Hospitals, sample Pharmacies, categorized medical products, inventory batches with expiries, blood donors, and real orders.

```bash
npm run server:seed
```

### 4. Run Development Servers
Open two terminals:

**Terminal 1 (Backend API):**
```bash
npm run server:dev
# Running on http://localhost:5000
```

**Terminal 2 (Frontend Client):**
```bash
npm run client:dev
# Running on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🔑 Pre-Seeded Evaluation Accounts & Authentication

You can sign in using **Email & Password** on `/login` with these pre-seeded accounts (or use the one-click autofill button beside each account on the sign-in screen):

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **Platform Owner** | `owner@medistock.health` | `owner123456` | Full Super Admin & Role Governance |
| **Supply Admin** | `admin@medistock.health` | `admin123456` | Sarah Ahmed (Products, Orders, Approvals) |
| **Hospital Org** | `dhakacentral@medistock.health` | `hospital123456` | Dhaka Central Hospital (Approved, Restock) |
| **Pharmacy Org** | `labaidpharmacy@medistock.health` | `pharma123456` | Labaid Care Pharmacy (Approved, Demands) |
| **Normal User** | `user@medistock.health` | `user123456` | Ayesha Siddiqua (Voluntary Blood Donor) |

You can also use the **Sign In with Google Account** button on `/login` to authenticate using your real Google identity via Firebase Authentication.

---

## 📂 Project Architecture

```
MediStack Project 2/
├── client/                     # Next.js 14 Frontend
│   ├── src/
│   │   ├── app/                # App Router Pages
│   │   │   ├── products/       # Public Catalog & Specs
│   │   │   ├── blood-donation/ # Blood Donor Network & Requests
│   │   │   ├── organization/   # Facility Portal (Cart, Orders, Invoices, Requests)
│   │   │   ├── admin/          # Admin Portal (KPIs, Products, Orders, Alerts, Orgs)
│   │   │   ├── owner/          # Owner Portal (Role Governance & Audits)
│   │   │   └── user/           # User Dashboard
│   │   ├── components/         # Reusable UI (Navbar, Footer, Sidebar, Cards, Invoices)
│   │   ├── context/            # AuthContext & CartContext
│   │   └── lib/                # API client & Firebase config
├── server/                     # Express.js REST API Backend
│   ├── src/
│   │   ├── config/             # MongoDB connection
│   │   ├── models/             # Mongoose Schemas (User, Org, Product, Order, Batch...)
│   │   ├── middleware/         # Auth, RBAC & Audit Logger
│   │   ├── routes/             # REST API Endpoints
│   │   ├── seed.ts             # Comprehensive realistic database seeder
│   │   ├── app.ts              # Express App setup
│   │   └── server.ts           # Server Bootstrapper
└── Requirments.md              # Project Specifications
```

