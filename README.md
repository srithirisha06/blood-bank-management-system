# 🩸 LifeFlow — Enterprise Blood Bank Management System

A production-ready, full-stack **MERN** (MongoDB, Express, React, Node.js) Blood Bank Management System with complete **Role-Based Access Control (RBAC)**, multi-step donation workflows, laboratory testing screening, hospital blood request lifecycle management, real-time stock tracking, and Chart.js analytics dashboards.

---

## 🚀 Quick Start (Prerequisites)

Before running this project, ensure the following are installed on your machine:

| Tool | Version | Download Link |
|------|---------|---------------|
| Node.js | v18+ (LTS) | https://nodejs.org/en/download |
| MongoDB | v7+ (Community Server) | https://www.mongodb.com/try/download/community |
| Git | Latest | https://git-scm.com/downloads |

> **Important**: After installing Node.js, open a **new terminal** for it to register in PATH.

---

## 📁 Project Structure

```
blood bank/
├── server/               ← Node.js + Express.js Backend API
│   ├── config/           ← MongoDB connection
│   ├── controllers/      ← Business logic for all modules
│   ├── middleware/       ← Auth, RBAC, Error, Upload, Validation
│   ├── models/           ← Mongoose schemas (9 collections)
│   ├── routes/           ← REST API route definitions
│   ├── seed/             ← Database seeding script
│   ├── utils/            ← JWT, Email, Activity Logger
│   ├── validators/       ← Express-validator schemas
│   ├── uploads/          ← Multer file upload directory (auto-created)
│   ├── app.js            ← Express application setup
│   ├── server.js         ← Entry point with DB connection
│   └── .env              ← Environment configuration
│
└── client/               ← React 19 + Vite Frontend
    ├── src/
    │   ├── components/   ← Sidebar, Navbar, BloodBadge, StatCard, etc.
    │   ├── context/      ← AuthContext, ToastContext
    │   ├── pages/
    │   │   ├── admin/    ← 11 Admin pages
    │   │   ├── donor/    ← 5 Donor pages
    │   │   ├── hospital/ ← 4 Hospital pages
    │   │   └── staff/    ← 4 Staff pages
    │   ├── routes/       ← AppRoutes.jsx (RBAC-protected)
    │   ├── services/     ← Axios API client
    │   └── styles/       ← Custom CSS (healthcare theme)
    ├── index.html
    └── vite.config.js    ← Proxy to backend :5000
```

---

## ⚙️ Installation & Setup

### Step 1 — Install Node.js
Download and install Node.js LTS from **https://nodejs.org/**

Verify installation after opening a new terminal:
```bash
node -v
npm -v
```

### Step 2 — Install & Start MongoDB
Download MongoDB Community Server and start it as a Windows service, **OR** use MongoDB Atlas (cloud):

**Local MongoDB:**
```bash
# After installing, MongoDB runs on: mongodb://127.0.0.1:27017
# No additional setup needed — the app auto-connects
```

**MongoDB Atlas (Cloud):**
1. Create a free cluster at https://cloud.mongodb.com
2. Get your connection string
3. Update `server/.env` → `MONGODB_URI=mongodb+srv://...`

### Step 3 — Backend Setup
```bash
# Navigate to server directory
cd "blood bank/server"

# Install dependencies
npm install

# Seed the database with sample data (all 5 roles, inventory, camps, requests)
npm run seed

# Start the API server (Port 5000)
npm run dev
```

### Step 4 — Frontend Setup
```bash
# In a separate terminal, navigate to client
cd "blood bank/client"

# Install dependencies
npm install

# Start the React development server (Port 5173)
npm run dev
```

### Step 5 — Open in Browser
Navigate to: **http://localhost:5173**

---

## 🔑 Default Demo Login Credentials (after running seed)

| Role | Email | Password |
|------|-------|----------|
| **Super Admin** | superadmin@bloodbank.com | Admin@123 |
| **Blood Bank Admin** | admin@bloodbank.com | Admin@123 |
| **Lab Staff** | staff@bloodbank.com | Staff@123 |
| **Hospital** | cityhospital@hospital.com | Hospital@123 |
| **Donor** | john.doe@donor.com | Donor@123 |

> Quick fill buttons are available on the Login page — just click a role and press Sign In!

---

## 🏗️ Architecture & Tech Stack

### Backend (REST API)
| Technology | Purpose |
|-----------|---------|
| Node.js + Express.js | REST API server |
| MongoDB + Mongoose | Database + ODM with indexes |
| JWT (Access + Refresh) | Stateless authentication |
| bcryptjs | Password hashing (salt rounds: 10) |
| Helmet | Security HTTP headers |
| CORS | Cross-origin resource sharing |
| express-rate-limit | Rate limiting (300 req / 15 min) |
| express-validator | Input validation |
| multer | File upload (donor profile images) |
| nodemailer | Email notifications (with fallback logger) |
| morgan | HTTP request logging |

### Frontend (SPA)
| Technology | Purpose |
|-----------|---------|
| React 19 + Vite | Fast SPA build toolchain |
| React Router DOM v6 | Client-side routing + protected routes |
| Bootstrap 5 | Responsive UI grid & components |
| React Hook Form | Performant form handling |
| Axios | HTTP client with JWT interceptors |
| Chart.js + react-chartjs-2 | Analytics dashboards |
| React Icons | Healthcare iconography |
| Context API | Global auth + toast state |

---

## 🎭 User Roles & Access Control (RBAC)

### Super Admin
- Full system control: all CRUD, user management, system settings
- Can manage all users, roles, deactivate accounts

### Blood Bank Admin
- Inventory management, request approval & allocation
- Camp scheduling, donation monitoring, report generation
- Access to all admin pages and lab testing records

### Lab Staff
- Donor collection pipeline: Registered → Screening → Collected → Testing
- Laboratory test entry: HIV, Hep B/C, Malaria, Syphilis, Hemoglobin
- Auto-inventory update on test approval

### Hospital
- Blood unit request submission with priority level (Normal/Urgent/Emergency)
- Request history tracking: Pending → Approved → Allocated → Completed
- Hospital profile management

### Donor
- Blood compatibility checker (interactive matrix)
- Donation scheduling & camp selection
- Donation history with pipeline status tracking
- Personal health profile management (blood group, weight, age)

---

## 🔬 Blood Testing Workflow

```
Donor Registered
       ↓
  Screening (vitals check, BP, weight eligibility)
       ↓
  Blood Collected (sample taken)
       ↓
  Lab Testing (HIV, HepB, HepC, Malaria, Syphilis, Hb)
       ↓
  [ALL NEGATIVE + Hb ≥ 12.5 g/dL]
  ↓ YES                  ↓ NO
Stored in Inventory    Rejected & Discarded
```

---

## 🏥 Hospital Request Lifecycle

```
Hospital Submits Request (Pending)
        ↓
  Admin Reviews (Approved / Rejected)
        ↓ Approved
  Inventory Allocation (Allocated — stock reserved)
        ↓
  Blood Dispatched (Completed)
```

---

## 📊 Dashboard Features

- **Real-time stats**: Donors, Hospitals, Blood Units, Low Stock Count, Today's Donations
- **Chart.js Graphs**:
  - Doughnut Chart: Blood Group Distribution across 8 groups
  - Bar Chart: Monthly Donation vs Hospital Request trends (6-month window)
- **Low Stock Alerts**: Highlighted banner when any blood group < 5 units
- **Blood Compatibility Matrix**: Interactive blood group compatibility lookup

---

## 📡 REST API Endpoints

```
Authentication
  POST   /api/auth/register
  POST   /api/auth/login
  POST   /api/auth/logout
  GET    /api/auth/profile
  POST   /api/auth/forgot-password
  POST   /api/auth/reset-password/:token

Users (Admin only)
  GET    /api/users
  POST   /api/users
  PUT    /api/users/:id
  DELETE /api/users/:id

Donors
  GET    /api/donors          (search, filter, paginate, sort)
  POST   /api/donors
  GET    /api/donors/:id      (includes history)
  PUT    /api/donors/:id      (supports profile image upload)
  DELETE /api/donors/:id

Hospitals
  GET    /api/hospitals
  POST   /api/hospitals
  GET    /api/hospitals/:id
  PUT    /api/hospitals/:id
  DELETE /api/hospitals/:id

Blood Inventory
  GET    /api/inventory        (summary + batches + low-stock groups)
  POST   /api/inventory
  PUT    /api/inventory/:id
  DELETE /api/inventory/:id

Donations
  GET    /api/donations
  POST   /api/donations
  PUT    /api/donations/:id/status

Blood Tests (Lab)
  GET    /api/blood-tests
  POST   /api/blood-tests     (auto-updates inventory on approval)

Blood Requests
  GET    /api/requests
  POST   /api/requests
  PUT    /api/requests/:id/status  (Approved → Allocated deducts stock)

Blood Camps
  GET    /api/camps            (public)
  GET    /api/camps/:id
  POST   /api/camps
  PUT    /api/camps/:id
  DELETE /api/camps/:id

Dashboard & Reports
  GET    /api/dashboard/stats
  GET    /api/reports?timeframe=monthly

Notifications
  GET    /api/notifications
  PUT    /api/notifications/:id/read

Health Check
  GET    /api/health
```

---

## 🔒 Security Features

- **JWT Authentication** with token-based session management
- **bcrypt Password Hashing** (10 salt rounds)
- **RBAC Middleware** — role-checked on every protected route
- **Rate Limiting** — 300 requests per 15 minutes per IP
- **Helmet.js** — 15+ security HTTP response headers
- **CORS** — whitelisted frontend origin only
- **Input Validation** — express-validator on all POST/PUT routes
- **Global Error Handler** — structured JSON error responses
- **Environment Variables** — no secrets in source code

---

## 🌟 Additional Features

- 🩸 **Blood Compatibility Checker** — Interactive matrix (donor/recipient groups)
- 📦 **Batch Expiry Tracking** — 35-day shelf life auto-calculation
- 📊 **Activity Logging** — All user actions logged with IP address
- 🔔 **Notification System** — Role-targeted alerts (stock, requests, general)
- 📄 **Report Generation** — Daily/Weekly/Monthly/Annual aggregations
- 🖼️ **Profile Image Upload** — Multer-powered donor photo uploads
- 📱 **Fully Responsive** — Bootstrap 5 responsive grid layout

---

## ⚠️ Troubleshooting

### MongoDB not connecting?
```bash
# Start MongoDB service manually
net start MongoDB

# Or check if running:
Get-Service -Name MongoDB
```

### Port conflicts?
```bash
# Change server port in server/.env
PORT=5001

# Update vite.config.js proxy target accordingly
```

### npm not found?
Download and install Node.js LTS from: **https://nodejs.org/**
Then restart your terminal/IDE.

---

## 📧 Email Notifications
If `SMTP_USER` and `SMTP_PASS` are not configured in `.env`, all email actions fallback to **console log preview mode** — safe for development without SMTP setup.

---

*Built with ❤️ using MERN Stack — Production-Grade Enterprise Architecture*
