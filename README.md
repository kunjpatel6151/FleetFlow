# 🚛 FleetFlow — Fleet & Logistics Management System

> A production-grade, full-stack fleet and logistics management system with real-time vehicle tracking, trip dispatch, maintenance scheduling, fuel analytics, and role-based access control.

![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18-000000?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?style=flat&logo=mongodb&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-r134-000000?style=flat&logo=three.js&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-4.4-FF6384?style=flat&logo=chart.js&logoColor=white)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Default Credentials](#-default-credentials)
- [Role-Based Access Control](#-role-based-access-control)
- [Pages & Modules](#-pages--modules)
- [API Endpoints](#-api-endpoints)
- [Environment Variables](#-environment-variables)
- [Currency](#-currency)

---

## ✨ Features

- **8 Fully Interactive Pages** — Command Center, Vehicle Registry, Trip Dispatcher, Maintenance Logs, Expenses & Fuel, Driver Profiles, Analytics, and Settings
- **3D Globe Fleet Map** — Interactive Three.js globe with geo-positioned vehicle pins, drag-to-rotate, and real-time status indicators
- **Real-Time Dashboard** — KPI counters with animations, live vehicle status table, fleet composition charts
- **Trip Lifecycle Management** — Full workflow: Draft → Dispatched → Completed/Cancelled with automatic vehicle status updates
- **Maintenance & Service Tracking** — Service logs, overdue warnings based on odometer intervals, in-shop vehicle management
- **Fuel & Expense Analytics** — Per-vehicle operational cost breakdown, fuel logging with live total calculation
- **Driver Safety Profiles** — Safety scores, license expiry tracking, suspension management
- **Financial Analytics** — Revenue, fuel costs, maintenance costs, net profit, and per-vehicle profitability tables
- **Role-Based Access Control (RBAC)** — 4 roles with different UI permissions
- **JWT Authentication** — Secure login/registration with encrypted passwords
- **Dark Industrial UI** — Premium aesthetic with glassmorphism, micro-animations, and responsive design
- **Indian Rupee (₹) Currency** — All monetary values formatted in INR with Indian locale (`en-IN`)

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **HTML5 / CSS3 / Vanilla JS** | Core frontend — no framework overhead |
| **Three.js** (r134) | 3D globe visualization on dashboard |
| **Chart.js** (4.4) | Fleet composition & analytics charts |
| **Google Fonts** | Barlow Condensed, JetBrains Mono, Inter |

### Backend
| Technology | Purpose |
|---|---|
| **Node.js** | Runtime environment |
| **Express.js** (4.18) | REST API framework |
| **MongoDB** + **Mongoose** (7.3) | Database & ODM |
| **JWT** (jsonwebtoken) | Authentication tokens |
| **bcryptjs** | Password hashing |
| **cors** | Cross-origin resource sharing |
| **dotenv** | Environment variable management |

---

## 📁 Project Structure

```
fleetflow/
├── index.html                  # Main HTML entry point
├── style.css                   # Complete application styles (1800+ lines)
├── data.js                     # Global DB store, helpers, formatters
├── api-service.js              # Frontend ↔ Backend API communication
├── app-core.js                 # App shell, auth, sidebar, navigation
├── page-dashboard.js           # Command Center / Dashboard page
├── page-vehicles-trips.js      # Vehicle Registry + Trip Dispatcher
├── page-maintenance-fuel.js    # Maintenance Logs + Expenses & Fuel
├── page-drivers-analytics.js   # Driver Profiles + Analytics
├── three-effects.js            # Three.js login particles + 3D globe
├── modals.js                   # All modal dialogs (add/edit forms)
├── START-SERVER.bat             # Windows batch file to start server
├── server.ps1                  # PowerShell script to start server
├── requirements.txt            # Dependency list
├── README.md                   # This file
│
└── backend/
    ├── server.js               # Express server + static file serving
    ├── package.json            # Node.js dependencies
    ├── .env                    # Environment variables
    ├── config/
    │   └── db.js               # MongoDB connection setup
    ├── controllers/
    │   ├── authController.js   # Login, Register, Profile
    │   └── businessController.js # CRUD + Seed data
    ├── middleware/
    │   └── authMiddleware.js   # JWT verification + role authorization
    ├── models/
    │   ├── User.js             # User schema (email, password, role)
    │   ├── Vehicle.js          # Vehicle schema
    │   ├── Driver.js           # Driver schema
    │   ├── Trip.js             # Trip schema
    │   ├── Maintenance.js      # Maintenance record schema
    │   └── Fuel.js             # Fuel entry schema
    └── routes/
        ├── authRoutes.js       # /api/auth/* endpoints
        └── businessRoutes.js   # /api/* CRUD endpoints
```

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) — [Download](https://nodejs.org/)
- **MongoDB** (v6/v7) — [Download](https://www.mongodb.com/try/download/community) or use MongoDB Atlas
- **Git** (optional) — for cloning the repository

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd fleetflow
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Environment Variables

Create or verify `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/fleetflow
JWT_SECRET=fleetflow_supersecret_jwt_key_2024
```

### 4. Start MongoDB

Ensure MongoDB is running locally:

```bash
# Windows (if installed as service)
net start MongoDB

# Or start mongod manually
mongod --dbpath "C:\data\db"
```

### 5. Start the Server

```bash
cd backend
npm start
```

Or use the development mode with auto-restart:

```bash
npm run dev
```

Alternatively, double-click **`START-SERVER.bat`** on Windows.

### 6. Open in Browser

Navigate to: **[http://localhost:5000](http://localhost:5000)**

The database will auto-seed with sample data on first login.

---

## 🔐 Default Credentials

The server auto-seeds two default users on first launch:

| Email | Password | Role |
|---|---|---|
| `admin@fleetflow.io` | `fleet2024` | Manager |
| `dispatch@fleetflow.io` | `fleet2024` | Dispatcher |

You can register additional accounts via the **Create Account** page with any of the 4 available roles.

---

## 👥 Role-Based Access Control

FleetFlow implements role-based access control (RBAC) with **4 roles**:

| Role | Dashboard | Vehicles | Trips | Maintenance | Fuel | Drivers | Analytics |
|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Manager** | ✅ Full | ✅ CRUD | ✅ CRUD | ✅ CRUD | ✅ CRUD | ✅ CRUD | ✅ Full |
| **Dispatcher** | ✅ Full | ✅ View | ✅ CRUD | ✅ View | ✅ CRUD | ✅ View | ❌ Hidden |
| **Safety Officer** | ✅ Full | ✅ View Only | ✅ View Only | ✅ View Only | ✅ View Only | ✅ View Only | ✅ View |
| **Financial Analyst** | ✅ Full | ✅ View Only | ✅ View Only | ✅ View Only | ✅ View Only | ✅ View Only | ✅ View |

> **View Only** = Can see all data but cannot add, edit, or delete records. The create/add buttons are hidden.

---

## 📄 Pages & Modules

### 1. 🏠 Command Center (Dashboard)
- **KPI Cards** — Active fleet count, alerts, utilization rate, pending trips (animated counters)
- **Live Vehicle Status Table** — Real-time status with filter pills
- **3D Fleet Map** — Interactive Three.js globe with geo-positioned vehicle pins
- **Fleet Composition Charts** — Doughnut + bar charts via Chart.js

### 2. 🚚 Vehicle Registry
- Full vehicle CRUD (add, edit, delete)
- Searchable and sortable table
- Out-of-service toggle (marks vehicle "In Shop")
- Tracks: name, plate, type, capacity, odometer, acquisition cost

### 3. 🗺 Trip Dispatcher
- Create trips with vehicle/driver assignment
- Cargo capacity validation against vehicle limits
- Status workflow: `Draft → Dispatched → Completed/Cancelled`
- Auto-updates vehicle status on dispatch/completion
- Filter by trip status

### 4. 🔧 Maintenance & Service Logs
- Log maintenance services with cost tracking
- **Overdue Service Warnings** — Automatic alerts when vehicles exceed 15,000 km since last service
- Critical vs. Due classification with progress bars
- Release vehicles from shop after service

### 5. ⛽ Expenses & Fuel
- Per-vehicle operational expense cards (fuel + maintenance breakdown)
- Fuel entry logging with live total calculation
- Sorted fuel log table
- Total OpEx tracking

### 6. 👤 Driver Profiles & Safety
- Driver cards with safety scores and visual progress bars
- License expiry warnings (⚠️ expiring within 30 days, 🔴 expired)
- Status management (On Duty / Off Duty / Suspended)
- Trip completion rates

### 7. 📊 Analytics
- **Financial KPIs** — Total revenue, fuel costs, maintenance costs, net profit
- **Revenue vs Costs Chart** — Monthly bar chart
- **Fleet Cost Distribution** — Doughnut chart
- **Per-Vehicle Profitability Table** — Detailed breakdown with acquisition costs
- Restricted to Manager and Financial Analyst roles

### 8. ⚙️ Settings
- Account information display
- Role display
- Notification preferences (visual only)

---

## 🔌 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|:---:|
| `POST` | `/api/auth/register` | Register new user | ❌ |
| `POST` | `/api/auth/login` | Login & get JWT token | ❌ |
| `GET` | `/api/auth/profile` | Get current user profile | ✅ |

### Business (`/api`)

| Method | Endpoint | Description | Roles |
|---|---|---|---|
| `POST` | `/api/seed` | Seed database with sample data | Public |
| `GET` | `/api/vehicles` | List all vehicles | All |
| `POST` | `/api/vehicles` | Create vehicle | Manager |
| `PUT` | `/api/vehicles/:id` | Update vehicle | Manager |
| `DELETE` | `/api/vehicles/:id` | Delete vehicle | Manager |
| `GET` | `/api/drivers` | List all drivers | All |
| `POST` | `/api/drivers` | Create driver | Manager, Safety Officer |
| `PUT` | `/api/drivers/:id` | Update driver | Manager, Safety Officer |
| `GET` | `/api/trips` | List all trips | All |
| `POST` | `/api/trips` | Create trip | Manager, Dispatcher |
| `PUT` | `/api/trips/:id` | Update trip status | Manager, Dispatcher |
| `GET` | `/api/maintenance` | List maintenance records | All |
| `POST` | `/api/maintenance` | Log maintenance service | Manager, Safety Officer |
| `GET` | `/api/fuel` | List fuel entries | All |
| `POST` | `/api/fuel` | Log fuel entry | Manager, Dispatcher |
| `GET` | `/api/analytics` | Get analytics data | Manager, Financial Analyst |

---

## ⚙️ Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Server port |
| `MONGO_URI` | `mongodb://127.0.0.1:27017/fleetflow` | MongoDB connection string |
| `JWT_SECRET` | `fleetflow_supersecret_jwt_key_2024` | JWT signing secret |

---

## 💰 Currency

All monetary values are displayed in **Indian Rupees (₹)** using the `en-IN` locale for proper formatting:

- Numbers use Indian grouping: `₹7,05,500.00` (lakh/crore separators)
- Fuel cost per liter: ~₹105.72/L (realistic Indian diesel prices)
- Vehicle costs: ₹6.6L – ₹91.3L
- Service costs: ₹14,940 – ₹3,48,600

To change the currency, modify the `fmtCurrency()` function in `data.js`:

```javascript
// Current (INR)
function fmtCurrency(n) {
  return '₹' + Number(n).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

// Example: Switch to USD
function fmtCurrency(n) {
  return '$' + Number(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
```

---

## 🎨 Design System

FleetFlow uses a **dark industrial/utilitarian aesthetic** with:

- **Color Palette** — Dark backgrounds (`#0F1117`, `#1A1D27`) with amber (`#F59E0B`) accents
- **Typography** — Barlow Condensed (display), Inter (UI), JetBrains Mono (data/code)
- **Components** — Cards, pills, toggles, progress bars, data tables, filter pills
- **Effects** — Three.js particle network on login, 3D globe on dashboard, micro-animations throughout
- **Responsive** — Sidebar collapses, grid adapts to screen size

---

## 📝 License

This project is for educational and demonstration purposes.

---

<p align="center">
  Built with ❤️ using Node.js, Express, MongoDB, Three.js & Chart.js
</p>
