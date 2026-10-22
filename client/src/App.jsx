import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { SocketProvider } from './context/SocketContext.jsx';
import { Navbar } from './components/Navbar.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';

// Pages
import { Home } from './pages/Home.jsx';
import { Discovery } from './pages/Discovery.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';
import { CustomerBookings } from './pages/CustomerBookings.jsx';
import { CustomerProfile } from './pages/CustomerProfile.jsx';
import { WorkerBookings } from './pages/WorkerBookings.jsx';
import { WorkerProfileEdit } from './pages/WorkerProfileEdit.jsx';
import { AdminDashboard } from './pages/AdminDashboard.jsx';

import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <div className="app-wrapper">
            <Navbar />

            <main style={{ flex: 1 }}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/discovery" element={<Discovery />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Customer Protected Routes */}
                <Route
                  path="/my-bookings"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <CustomerBookings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/customer-profile"
                  element={
                    <ProtectedRoute allowedRoles={['customer']}>
                      <CustomerProfile />
                    </ProtectedRoute>
                  }
                />

                {/* Worker Protected Routes */}
                <Route
                  path="/worker-bookings"
                  element={
                    <ProtectedRoute allowedRoles={['worker']}>
                      <WorkerBookings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/worker-profile"
                  element={
                    <ProtectedRoute allowedRoles={['worker']}>
                      <WorkerProfileEdit />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Protected Routes */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

            <footer className="footer">
              <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <strong>WorkMate</strong> — Find trusted local trade workers on an hourly basis.
                </div>
                <div style={{ color: '#6b7280', fontSize: '13px' }}>
                  © {new Date().getFullYear()} WorkMate. All rights reserved.
                </div>
              </div>
            </footer>
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
