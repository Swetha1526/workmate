import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useSocket } from '../context/SocketContext.jsx';

export const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isWorker, isCustomer } = useAuth();
  const { isConnected } = useSocket();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="brand">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="brand-icon">🛠️</div>
          <span className="brand-title">WorkMate</span>
        </Link>
        <span className="brand-badge">GUVI Capstone</span>
      </div>

      <nav style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link to="/" className="nav-link">
          Home
        </Link>
        <Link to="/discovery" className="nav-link">
          Find Workers
        </Link>

        {isAuthenticated && isCustomer && (
          <Link to="/my-bookings" className="nav-link">
            My Bookings
          </Link>
        )}

        {isAuthenticated && isWorker && (
          <>
            <Link to="/worker-bookings" className="nav-link">
              Job Requests
            </Link>
            <Link to="/worker-profile" className="nav-link">
              My Profile
            </Link>
          </>
        )}

        {isAuthenticated && isAdmin && (
          <Link to="/admin" className="nav-link" style={{ color: '#c084fc', fontWeight: '600' }}>
            🛡️ Admin Panel
          </Link>
        )}
      </nav>

      <div className="nav-actions">
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                borderRadius: '9999px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                fontSize: '13px',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: isConnected ? '#10b981' : '#f59e0b',
                  boxShadow: isConnected ? '0 0 8px #10b981' : 'none',
                }}
                title={isConnected ? 'Real-time Socket Connected' : 'Socket Reconnecting'}
              ></span>
              <span style={{ fontWeight: '600' }}>{user.name}</span>
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background:
                    user.role === 'admin'
                      ? 'rgba(168, 85, 247, 0.2)'
                      : user.role === 'worker'
                      ? 'rgba(59, 130, 246, 0.2)'
                      : 'rgba(16, 185, 129, 0.2)',
                  color:
                    user.role === 'admin'
                      ? '#c084fc'
                      : user.role === 'worker'
                      ? '#60a5fa'
                      : '#34d399',
                  textTransform: 'uppercase',
                  fontWeight: '700',
                }}
              >
                {user.role}
              </span>
            </div>

            <button
              onClick={handleLogout}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                fontSize: '13px',
                fontWeight: '600',
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link
              to="/login"
              style={{
                padding: '7px 16px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.06)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: '600',
                border: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              Log In
            </Link>
            <Link
              to="/register"
              style={{
                padding: '7px 16px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                color: '#fff',
                fontSize: '13px',
                fontWeight: '600',
                boxShadow: '0 4px 12px var(--primary-glow)',
              }}
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
