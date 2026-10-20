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
      </div>

      <nav style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
          <Link
            to="/admin"
            className="nav-link"
            style={{
              color: '#247A52',
              fontWeight: '600',
              background: '#E8F2EA',
              padding: '6px 12px',
              borderRadius: '6px',
            }}
          >
            🛡️ Admin Panel
          </Link>
        )}
      </nav>

      <div className="nav-actions">
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 12px',
                borderRadius: '9999px',
                background: '#F6F5F0',
                border: '1px solid #E7E8E2',
                fontSize: '13px',
                color: '#202923',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: isConnected ? '#247A52' : '#B45309',
                  boxShadow: isConnected ? '0 0 6px rgba(36, 122, 82, 0.4)' : 'none',
                }}
                title={isConnected ? 'Real-time Socket Connected' : 'Socket Reconnecting'}
              ></span>
              <span style={{ fontWeight: '600' }}>{user.name}</span>
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 7px',
                  borderRadius: '4px',
                  background:
                    user.role === 'admin'
                      ? '#EDE9FE'
                      : user.role === 'worker'
                      ? '#E8F2EA'
                      : '#E0E7FF',
                  color:
                    user.role === 'admin'
                      ? '#6D28D9'
                      : user.role === 'worker'
                      ? '#247A52'
                      : '#3730A3',
                  textTransform: 'uppercase',
                  fontWeight: '700',
                  letterSpacing: '0.4px',
                }}
              >
                {user.role}
              </span>
            </div>

            <button
              onClick={handleLogout}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                background: '#FFF1F2',
                color: '#BE123C',
                border: '1px solid #FECDD3',
                fontSize: '13px',
                fontWeight: '600',
                transition: 'all 0.15s ease',
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
                padding: '8px 16px',
                borderRadius: '6px',
                background: '#FFFFFF',
                color: '#202923',
                fontSize: '13px',
                fontWeight: '600',
                border: '1px solid #E7E8E2',
                transition: 'all 0.15s ease',
              }}
            >
              Log In
            </Link>
            <Link
              to="/register"
              style={{
                padding: '8px 18px',
                borderRadius: '6px',
                background: '#247A52',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: '600',
                boxShadow: '0 2px 6px rgba(36, 122, 82, 0.25)',
                transition: 'all 0.15s ease',
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
