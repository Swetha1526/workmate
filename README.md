# WorkMate

WorkMate is an on-demand marketplace connecting local homeowners and businesses with skilled hourly trade professionals (plumbers, electricians, carpenters, painters, and more).

Customers can find verified workers in their area, compare rates, book jobs, coordinate directly via built-in real-time chat, and leave reviews once work is done.

---

## Features

- **Worker Discovery & Filters**: Search by trade category, locality, hourly rate, and availability.
- **Booking Management**: Customers request bookings with estimated hours and dates; workers can accept, decline, start, and complete jobs.
- **Real-Time Chat**: Direct in-app messaging between customer and worker powered by Socket.IO.
- **Profiles**:
  - **Customers**: Manage contact details, addresses, and property notes.
  - **Workers**: Manage trade categories, skills, years of experience, hourly pricing, and availability.
- **Admin Dashboard**: Review platform stats, manage users, and approve/verify worker profiles.

---

## Tech Stack

- **Frontend**: React 19, Vite, React Router, Vanilla CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas with Mongoose
- **Real-Time**: Socket.IO
- **Authentication**: JSON Web Tokens (JWT) & bcrypt password hashing

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- A MongoDB Atlas connection string (or local MongoDB)

---

### 1. Backend Setup

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

The API server will run on `http://localhost:5000`.

#### Environment Variables (`server/.env`):
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@workmate.local
ADMIN_PASSWORD=Admin@WorkMate2026!
```

---

### 2. Frontend Setup

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`.

#### Environment Variables (`client/.env`):
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## Test Accounts

The platform includes seed accounts for quick testing:

| Role | Email | Password | What You Can Test |
| :--- | :--- | :--- | :--- |
| **Customer** | `raju@workmate.local` | `Password123!` | Search workers, book jobs, chat, update address & profile |
| **Worker (Plumber)** | `plumber@workmate.local` | `Password123!` | Receive job requests, update rate, toggle availability, manage profile |
| **Admin** | `admin@workmate.local` | `Admin@WorkMate2026!` | View platform stats, verify workers, manage user accounts |

---

## Key API Endpoints

### Auth (`/api/auth`)
- `POST /api/auth/register` - Create new customer or worker account
- `POST /api/auth/login` - User login
- `POST /api/auth/admin/login` - Admin login
- `GET /api/auth/me` - Current user session
- `PUT /api/auth/profile` - Update customer profile / address

### Workers (`/api/workers`)
- `GET /api/workers` - Search workers with filters (category, locality, rate)
- `GET /api/workers/:id` - Worker public profile & reviews
- `GET /api/workers/me/profile` - Current worker's profile
- `POST /api/workers/profile` - Create or update trade worker profile
- `PATCH /api/workers/:id/verify` - Admin verification toggle

### Bookings (`/api/bookings`)
- `POST /api/bookings` - Create booking request
- `GET /api/bookings/my-bookings` - Customer's bookings
- `GET /api/bookings/worker-bookings` - Worker's assigned bookings
- `PATCH /api/bookings/:id/status` - Update status (accept, decline, complete, cancel)
- `PATCH /api/bookings/:id/payment` - Mark direct payment settled

### Chat & Reviews (`/api/chat`, `/api/reviews`)
- `GET /api/chat/booking/:bookingId` - Conversation thread for booking
- `GET /api/chat/:conversationId/messages` - Chat history
- `POST /api/reviews` - Submit review for completed job
- `GET /api/reviews/worker/:workerId` - Get reviews for a worker

### Admin (`/api/admin`)
- `GET /api/admin/metrics` - Aggregated stats (users, bookings, volume)
- `GET /api/admin/users` - Paginated user list
- `PATCH /api/admin/users/:id/status` - Suspend or activate user

---

## Deployment

### Backend (Render)
1. Create a new **Web Service** on [Render](https://render.com) connected to the repo.
2. Set Root Directory to `server`.
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Add Environment Variables:
   - `PORT=5000`
   - `NODE_ENV=production`
   - `CLIENT_URL=https://your-frontend-domain.vercel.app`
   - `MONGODB_URI=your_mongodb_atlas_uri`
   - `JWT_SECRET=your_secret_key`

### Frontend (Vercel)
1. Import repository on [Vercel](https://vercel.com).
2. Set Root Directory to `client`.
3. Add Environment Variables:
   - `VITE_API_URL=https://your-backend.onrender.com/api`
   - `VITE_SOCKET_URL=https://your-backend.onrender.com`
4. Deploy! `client/vercel.json` ensures client-side routing works on page refreshes.

---

## License

MIT
