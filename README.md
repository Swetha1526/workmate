# 🛠️ WorkMate — On-Demand Hourly Worker Hiring Marketplace

> **Production-Ready Local Trade Worker Marketplace**  
> A premium, light-themed web platform connecting local customers and businesses with verified hourly trade professionals. Built with React 19, Vite, Node.js, Express, MongoDB Atlas, Mongoose, Socket.IO, JWT, and bcrypt.

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue.svg)](https://react.dev)
[![Socket.IO](https://img.shields.io/badge/RealTime-Socket.IO-black.svg)](https://socket.io)
[![MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB%20Atlas-green.svg)](https://www.mongodb.com/atlas)
[![UI Theme](https://img.shields.io/badge/Design-Light%20%26%20Premium-247A52.svg)](https://github.com/Swetha1526/workmate)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📌 1. Project Purpose & Core Features

WorkMate addresses the difficulty of finding reliable, skilled blue-collar workers on an hourly or daily-wage basis. Customers discover verified workers, compare transparent hourly rates, request bookings, coordinate in real-time via Socket.IO chat, and arrange direct settlements without middleman cuts.

### Supported Trade Categories
1. 🔧 **Plumbers** — Pipes, leak repairs, bathroom fittings & sanitary setup
2. ⚡ **Electricians** — Rewiring, switchboards, inverters & power distribution
3. 🪚 **Carpenters** — Furniture repairs, woodwork, locks & fittings
4. ❄️ **AC Mechanics** — Split AC servicing, gas refills & compressor repairs
5. 🔥 **Welders** — Iron gates, grills, ARC welding & fabrication
6. 🔩 **Fitters** — Machinery assembly, alignment & preventive maintenance
7. 🚗 **Drivers** — Hourly personal & commercial transport drivers
8. 📦 **Helpers** — Household shifting, luggage loading & manual labor
9. 🧱 **Masons** — Brickwork, plastering, tiling & civil repairs
10. 👷 **Mason Helpers** — Mortar mixing, material shifting & civil support

### 🎨 Light & Premium Design System
WorkMate features a human-crafted light visual identity:
- **Background**: Warm ivory `#FAF9F6`
- **Cards & Surfaces**: Crisp white `#FFFFFF` with fine borders (`#E7E8E2`)
- **Primary Typography**: Deep charcoal `#202923`
- **Secondary Typography**: Slate `#69736D`
- **Primary Brand Accent**: Forest green `#247A52` (hover `#1C6241`)
- **Soft Accent Surfaces**: Sage `#E8F2EA` with border `#BCD9BF`
- **Accessible Semantic Statuses**:
  - Pending: `#B45309` on `#FEF3C7`
  - Accepted: `#1D4ED8` on `#DBEAFE`
  - In Progress: `#6D28D9` on `#EDE9FE`
  - Completed: `#15803D` on `#DCFCE7`
  - Cancelled: `#B91C1C` on `#FEE2E2`

---

## 🏗️ 2. Architecture & File Structure

```text
workmate/
├── client/                     # React 19 + Vite frontend
│   ├── src/
│   │   ├── components/         # Navbar, ChatModal, ReviewModal, ProtectedRoute
│   │   ├── context/            # AuthContext (JWT session), SocketContext (Real-time)
│   │   ├── pages/              # Home, Discovery, Login, Register, Bookings, Profile, Admin
│   │   ├── services/           # Axios instance with Bearer token injection (api.js)
│   │   ├── App.css             # Glassmorphism, animations & component styling
│   │   ├── App.jsx             # React Router 7 setup & route guards
│   │   └── main.jsx
│   ├── .env.example
│   ├── vercel.json             # Vercel SPA rewrite configuration
│   └── package.json
│
├── server/                     # Node.js + Express + Socket.IO backend
│   ├── src/
│   │   ├── config/             # MongoDB Atlas connection with Mongoose (db.js)
│   │   ├── controllers/        # Auth, Worker, Booking, Chat, Review, Admin handlers
│   │   ├── middleware/         # JWT Protect & Role-Based Authorization
│   │   ├── models/             # User, WorkerProfile, Booking, Conversation, Message, Review
│   │   ├── routes/             # REST API endpoint definitions
│   │   ├── sockets/            # Authenticated Socket.IO event handlers (chatSocket.js)
│   │   ├── utils/              # 10-category demo worker seed script (seedData.js)
│   │   ├── validators/         # Auth & payload validators (authValidator.js)
│   │   ├── app.js              # Express app factory & middleware pipeline
│   │   └── server.js           # Server bootstrap, DB connect & Socket.IO attachment
│   ├── test/                   # Automated end-to-end integration test suite
│   │   ├── runAllTests.js      # Master 18-step test runner (npm test)
│   │   ├── testAuth.js         # Phase 1 unit tests
│   │   ├── testWorkers.js      # Phase 2 & 3 unit tests
│   │   └── testFullWorkflow.js # Phases 4–6 unit tests
│   ├── .env.example
│   └── package.json
│
├── docs/                       # Project documentation & status reports
│   ├── IMPLEMENTATION_STATUS.md
│   └── SETUP_GUIDE.md
├── render.yaml                 # Render cloud deployment blueprint
├── .gitignore                  # Security shield ignoring .env & node_modules
└── README.md
```

---

## 💾 3. MongoDB Data Collections

| Collection | Schema Details | Key Indexes & Features |
| :--- | :--- | :--- |
| **`users`** | `name`, `email`, `password` (hashed), `phone`, `role` (`customer`, `worker`, `admin`), `customerType` (`individual`, `business`), `isActive`, `avatar` | Unique `email`, `select: false` on password |
| **`workerProfiles`** | `userId` (ref User), `category`, `skills`, `experienceYears`, `locality`, `hourlyRate`, `isAvailable`, `isVerified`, `averageRating`, `reviewCount`, `completedJobs` | Compound index on `(category, locality, isAvailable, hourlyRate)` |
| **`bookings`** | `customerId`, `workerId`, `workerUserId`, `category`, `jobDescription`, `locality`, `scheduledDate`, `scheduledTime`, `estimatedHours`, `hourlyRate`, `totalEstimatedCost`, `status`, `paymentStatus` | Index on `(customerId, status)`, state machine validation |
| **`conversations`** | `bookingId` (unique), `participants` ([User]), `lastMessage` | Unique `bookingId`, indexed `participants` |
| **`messages`** | `conversationId`, `sender`, `text`, `readBy` ([User]), `createdAt` | Index on `(conversationId, createdAt)` |
| **`reviews`** | `bookingId` (unique), `customerId`, `workerId`, `rating` (1-5), `comment` | Post-save hook auto-recalculates worker `averageRating` |

---

## ⚡ 4. Real-Time Socket.IO Events

All socket connections require JWT authentication during handshake:

| Event | Direction | Payload / Description |
| :--- | :--- | :--- |
| `conversation:join` | Client ➔ Server | `{ conversationId }` — Verifies user is an authorized participant before joining room |
| `conversation:joined` | Server ➔ Client | `{ conversationId, room }` — Confirms room membership |
| `message:send` | Client ➔ Server | `{ conversationId, text }` — Persists to MongoDB, broadcasts to room |
| `message:new` | Server ➔ Room | `{ conversationId, message }` — Real-time delivery to participants |
| `typing:start` | Client ➔ Room | `{ conversationId, userName }` — Shows "Worker is typing..." indicator |
| `typing:stop` | Client ➔ Room | `{ conversationId }` — Hides typing indicator |
| `message:read` | Client ➔ Server | `{ conversationId, messageId }` — Updates read receipts in DB and emits `message:read_update` |
| `notification:new` | Server ➔ Client | `{ type, title, body, conversationId }` — Toast alerts for incoming messages |

---

## 📡 5. REST API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register Customer (Individual/Business) or Worker
- `POST /api/auth/login` — Sign in as Customer or Worker
- `POST /api/auth/admin/login` — Dedicated administrator sign in
- `GET /api/auth/me` — Retrieve current authenticated session

### Worker Profiles & Discovery (`/api/workers`)
- `GET /api/workers` — Discover workers with category, locality, rate & availability filters
- `GET /api/workers/:id` — Get worker profile details & ratings
- `GET /api/workers/me/profile` — Get logged-in worker's profile
- `POST /api/workers/profile` — Create or update worker trade profile
- `PATCH /api/workers/:id/verify` — Admin: Approve or revoke verification badge

### Booking Workflow (`/api/bookings`)
- `POST /api/bookings` — Customer: Request booking (Server calculates total cost)
- `GET /api/bookings/my-bookings` — Customer: View placed bookings
- `GET /api/bookings/worker-bookings` — Worker: View assigned job requests
- `PATCH /api/bookings/:id/status` — Transition status (`accepted`, `rejected`, `in_progress`, `completed`, `cancelled`)
- `PATCH /api/bookings/:id/payment` — Mark direct cash/UPI settlement complete

### Real-Time Chat History (`/api/chat`)
- `GET /api/chat/booking/:bookingId` — Get or provision conversation for booking
- `GET /api/chat/:conversationId/messages` — Get persisted chat history & sync read receipts
- `POST /api/chat/:conversationId/messages` — REST fallback message send

### Reviews (`/api/reviews`)
- `POST /api/reviews` — Submit review for completed booking (One review per job)
- `GET /api/reviews/worker/:workerId` — Get reviews for worker profile

### Admin Console (`/api/admin`)
- `GET /api/admin/metrics` — Real DB aggregated metrics (users, bookings, platform volume)
- `GET /api/admin/users` — Paginated user list with role filters and search
- `PATCH /api/admin/users/:id/status` — Suspend or reactivate user account
- `GET /api/admin/workers` — Worker verification overview

---

## 🚀 6. Local Setup & Running Instructions

### Prerequisites
- Node.js `>= 18.x` (Tested on `v24.19.0`)
- npm `>= 9.x` (Tested on `11.17.0`)
- MongoDB Atlas free tier cluster

### 1. Backend Server Setup
```powershell
cd server
Copy-Item .env.example .env    # Windows PowerShell
npm install
npm run dev                    # Starts API on http://localhost:5000
```

### 2. Frontend Client Setup
```powershell
cd client
Copy-Item .env.example .env    # Windows PowerShell
npm install
npm run dev                    # Starts Vite on http://localhost:5173
```

### 3. Run Automated Integration Test Suite
```powershell
cd server
npm test                       # Runs all 18 automated tests across Phases 1-7
```

---

## 🔑 7. Ready-to-Test Evaluation Credentials

The login page includes **Quick-Fill buttons** for one-click evaluator convenience:

| Role | Email | Password | Access / Dashboard |
| :--- | :--- | :--- | :--- |
| **Customer** | `flow.customer@workmate.local` | `Password123!` | Worker Discovery, Booking requests, Chat, Direct Payment, Reviews |
| **Worker** | `flow.worker@workmate.local` | `Password123!` | Job Requests, Accept/Decline, In-Progress, Profile Management |
| **Admin** | `admin@workmate.local` | `Admin@WorkMate2026!` | Admin Console, Real-time DB Metrics, Verifications, User Governance |

---

## 🌐 8. Cloud Deployment Guide

### Deploying Backend to Render
1. Push code to your GitHub repository.
2. In Render, create a new **Web Service** from GitHub repo using `server` as the root directory.
3. Set environment variables:
   - `PORT=5000`
   - `NODE_ENV=production`
   - `CLIENT_URL=https://your-frontend.vercel.app`
   - `MONGODB_URI=your_mongodb_atlas_connection_string`
   - `JWT_SECRET=your_production_jwt_secret_key`
4. Deploy!

### Deploying Frontend to Vercel
1. In Vercel, import your repository and set Root Directory to `client`.
2. Set Environment Variables:
   - `VITE_API_URL=https://your-backend.onrender.com/api`
   - `VITE_SOCKET_URL=https://your-backend.onrender.com`
3. Deploy! [client/vercel.json](file:///e:/workmate/client/vercel.json) ensures client-side routing works on refresh.

---

## 🔒 9. Security & Production Standards
- **Zero Secrets Committed**: Root and child `.gitignore` rules prevent `.env` from ever reaching Git.
- **Password Protection**: Passwords salted and hashed with `bcryptjs` (never stored in plain text).
- **Protected Queries**: `select: false` on password field prevents unintentional exposure in API responses.
- **Server-Side Validation**: All state transitions and prices are strictly verified and calculated on the server.
- **No Self-Assigned Admins**: Public registration forbids assigning the `admin` role.
