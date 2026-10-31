# OrderCraft - Manufacturing Order Management System

> **P_001** | Full Stack Development | Manufacturing Industry

A web-based Order Management System (OMS) automating order processing, bill-of-materials generation, purchase orders, invoicing and payment tracking.

---

## 🚀 Live Demo

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ordercraft.com | Admin@123 |
| Employee | emp1@ordercraft.com | Emp@123 |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Custom CSS (Dark Industrial Theme) |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Node.js + Express |
| Database | SQLite (better-sqlite3) |
| Auth | JWT (JSON Web Tokens) |
| Password | bcryptjs |

---

## 📦 Project Structure

```
ordercraft/
├── frontend/          # React Vite app
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── admin/      # Admin portal pages
│   │   │   └── employee/   # Employee portal pages
│   │   ├── components/     # Shared components
│   │   ├── context/        # Auth context
│   │   └── styles/         # Global CSS
│   └── package.json
├── backend/           # Express API server
│   ├── routes/        # API routes
│   ├── middleware/    # Auth middleware
│   ├── db/           # Database setup
│   └── server.js
└── README.md
```

---

## 🛠️ Setup & Installation

### Prerequisites
- Node.js >= 18
- npm or pnpm

### Backend Setup
```bash
cd backend
npm install
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 👤 Admin Portal Features

- 📊 **Dashboard** — Overview with KPIs, charts, and recent activity
- 👥 **Customer Management** — Add, edit, manage customers
- 🏭 **Employee Management** — Manage staff and roles
- 📋 **Order Management** — Create and track manufacturing orders
- 🔩 **Bill of Materials (BOM)** — Generate material lists per order
- 🛒 **Purchase Orders** — Manage supplier POs
- 🧾 **Invoices** — Generate and send invoices
- 💳 **Payment Tracking** — Monitor payment status
- 📦 **Inventory** — Stock management with alerts
- 🚛 **Suppliers** — Supplier database management
- 📈 **Reports & Analytics** — Business intelligence

## 👷 Employee Portal Features

- 📋 **Assigned Orders** — View orders assigned to you
- ✅ **Tasks** — Update task status and progress
- 🔄 **Order Status** — Update manufacturing progress
- 📦 **Inventory Check** — View stock availability
- 📜 **Work History** — Past completed orders/tasks

---

## 🚀 Deployment

### GitHub
```bash
git init
git add .
git commit -m "Initial commit: OrderCraft OMS"
git remote add origin https://github.com/YOUR_USERNAME/ordercraft.git
git push -u origin main
```

### Deploy Backend (Railway/Render)
- Connect GitHub repo
- Set root directory to `backend/`
- Add environment variables from `.env`

### Deploy Frontend (Vercel/Netlify)
- Connect GitHub repo
- Set root directory to `frontend/`
- Set build command: `npm run build`
- Update API URL to deployed backend URL

---

## 📝 License
MIT License - Project P_001
