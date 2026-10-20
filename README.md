# 🛠️ WorkMate — On-Demand Hourly Worker Hiring Marketplace

> **GUVI MERN Stack Capstone Project**  
> A full-stack marketplace connecting local customers and businesses with skilled hourly and daily-wage workers (plumbers, electricians, carpenters, AC mechanics, welders, drivers, masons, and helpers).

---

## 📌 Project Overview

WorkMate simplifies the process of discovering verified local blue-collar and trade professionals, comparing transparent hourly rates and customer ratings, requesting bookings, communicating in real-time, and arranging direct payments upon job completion.

### Key Features
- **Role-Based Access**: Customers (Individual / Business), Workers, and Admins.
- **Worker Discovery**: Filter by trade category, locality, hourly rate, and real-time availability.
- **Booking Workflow**: End-to-end lifecycle tracking (`pending` ➔ `accepted`/`rejected` ➔ `in-progress` ➔ `completed` / `cancelled`).
- **Real-Time Communication**: Socket.IO powered instant messaging with room authorization and persistent chat history.
- **Direct Settlements**: Transparent direct-to-worker payments without hidden marketplace markups.
- **Admin Verification & Oversight**: Profile verification badges, dispute management, and platform metrics.

---

## 🏗️ Architecture & Directory Structure

```text
workmate/
├── client/                     # Frontend (React 19, Vite, React Router, Axios)
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── context/            # Auth & Socket state contexts
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Routed pages (Home, Discovery, Bookings, Chat, Admin)
│   │   ├── services/           # Axios API service instances
│   │   ├── App.jsx             # Main Router and Layout
│   │   ├── index.css           # Global modern design system & styles
│   │   └── main.jsx            # Entry point
│   ├── .env.example            # Client environment template
│   └── package.json
│
├── server/                     # Backend (Node.js, Express, Socket.IO, Mongoose)
│   ├── src/
│   │   ├── config/             # DB & environment configuration
│   │   ├── controllers/        # Request handlers
│   │   ├── middleware/         # Auth, validation, role-checking, error handlers
│   │   ├── models/             # Mongoose schemas (User, WorkerProfile, Booking, etc.)
│   │   ├── routes/             # RESTful API route definitions
│   │   ├── services/           # Business logic & notification handlers
│   │   ├── sockets/            # Socket.IO connection & event handlers
│   │   ├── validators/         # Input validation schemas
│   │   ├── app.js              # Express app setup & middleware
│   │   └── server.js           # Server bootstrap & DB connection
│   ├── .env.example            # Server environment template
│   └── package.json
│
├── docs/                       # Capstone documentation, diagrams, & guides
├── .gitignore                  # Root gitignore protecting secrets & node_modules
└── README.md
```

---

## ⚙️ Prerequisites & Verification

Ensure you have the following installed on your machine:

| Tool | Minimum Version | Verified Local Version |
| :--- | :--- | :--- |
| **Node.js** | `>= 18.x` | `v24.19.0` ✅ |
| **npm** | `>= 9.x` | `11.17.0` ✅ |
| **Git** | `>= 2.x` | `2.51.1` ✅ |
| **VS Code** | Modern | `1.141.0` ✅ |

Verify with PowerShell:
```powershell
node -v
npm -v
git --version
code --version
```

---

## 🚀 Quickstart & Local Development

### 1. Backend Setup
```powershell
cd server
Copy-Item .env.example .env    # On Windows PowerShell
npm install
npm run dev                    # Starts API on http://localhost:5000
```

### 2. Frontend Setup
```powershell
cd client
Copy-Item .env.example .env    # On Windows PowerShell
npm install
npm run dev                    # Starts Vite server on http://localhost:5173
```

---

## 🔒 Security Best Practices
- Strict `.gitignore` rules prevent `.env` or credential leakage to Git.
- Passwords hashed using `bcryptjs` with salt rounds.
- Stateless authentication with signed JWTs.
- Parameterized MongoDB queries via Mongoose schemas to avoid injection.
