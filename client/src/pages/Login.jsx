import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export const Login = () => {
  const [isAdminTab, setIsAdminTab] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, adminLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      let res;
      if (isAdminTab) {
        res = await adminLogin(email, password);
        if (res.success) {
          navigate('/admin');
        }
      } else {
        res = await login(email, password);
        if (res.success) {
          if (res.user.role === 'worker') {
            navigate('/worker-bookings');
          } else {
            navigate('/discovery');
          }
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Login failed. Please check your credentials.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickFill = (type) => {
    setError('');
    if (type === 'customer') {
      setIsAdminTab(false);
      setEmail('raju@workmate.local');
      setPassword('Password123!');
    } else if (type === 'worker') {
      setIsAdminTab(false);
      setEmail('plumber@workmate.local');
      setPassword('Password123!');
    } else if (type === 'admin') {
      setIsAdminTab(true);
      setEmail('admin@workmate.local');
      setPassword('Admin@WorkMate2026!');
    }
  };

  return (
    <div style={{ maxWidth: '460px', margin: '48px auto', padding: '0 16px' }}>
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E7E8E2',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(32, 41, 35, 0.06)',
          padding: '36px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: isAdminTab ? '#EDE9FE' : '#E8F2EA',
              color: isAdminTab ? '#6D28D9' : '#247A52',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              margin: '0 auto 12px',
            }}
          >
            {isAdminTab ? '🛡️' : '🔐'}
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#202923', letterSpacing: '-0.4px', marginBottom: '4px' }}>
            {isAdminTab ? 'Administrator Portal' : 'Sign In to WorkMate'}
          </h2>
          <p style={{ fontSize: '14px', color: '#69736D' }}>
            {isAdminTab
              ? 'Sign in to access admin tools'
              : 'Sign in to manage your bookings and messages'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            borderRadius: '10px',
            background: '#FAF9F6',
            border: '1px solid #E7E8E2',
            padding: '4px',
            marginBottom: '24px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setIsAdminTab(false);
              setError('');
            }}
            style={{
              flex: 1,
              padding: '9px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              color: !isAdminTab ? '#202923' : '#69736D',
              background: !isAdminTab ? '#FFFFFF' : 'none',
              boxShadow: !isAdminTab ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              border: !isAdminTab ? '1px solid #E7E8E2' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            User Login
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAdminTab(true);
              setError('');
            }}
            style={{
              flex: 1,
              padding: '9px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              color: isAdminTab ? '#6D28D9' : '#69736D',
              background: isAdminTab ? '#FFFFFF' : 'none',
              boxShadow: isAdminTab ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              border: isAdminTab ? '1px solid #E7E8E2' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            🛡️ Admin Login
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '8px',
              background: '#FEE2E2',
              border: '1px solid #FECDD3',
              color: '#B91C1C',
              fontSize: '13px',
              marginBottom: '20px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#202923', marginBottom: '6px' }}>
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isAdminTab ? 'admin@workmate.local' : 'name@example.com'}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                background: '#FFFFFF',
                border: '1px solid #E7E8E2',
                color: '#202923',
                fontSize: '14px',
                outline: 'none',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#202923' }}>
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#247A52',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {showPassword ? 'Hide Password' : 'Show Password'}
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '10px 42px 10px 14px',
                  borderRadius: '8px',
                  background: '#FFFFFF',
                  border: '1px solid #E7E8E2',
                  color: '#202923',
                  fontSize: '14px',
                  outline: 'none',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#69736D',
                  fontSize: '15px',
                  cursor: 'pointer',
                  padding: '2px',
                }}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: '6px',
              padding: '12px',
              borderRadius: '8px',
              background: isAdminTab ? '#6D28D9' : '#247A52',
              color: '#FFFFFF',
              fontWeight: '700',
              fontSize: '14px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
              boxShadow: '0 2px 8px rgba(36, 122, 82, 0.25)',
              transition: 'background 0.15s ease',
            }}
          >
            {submitting ? 'Authenticating...' : isAdminTab ? 'Enter Admin Console' : 'Sign In'}
          </button>
        </form>

        {/* Quick Fill Test Credentials */}
        <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid #E7E8E2' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#69736D', marginBottom: '10px' }}>
            Quick test accounts:
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleQuickFill('customer')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                background: '#E8F2EA',
                color: '#247A52',
                fontSize: '12px',
                fontWeight: '600',
                border: '1px solid #BCD9BF',
                cursor: 'pointer',
              }}
            >
              Raju (Customer)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('worker')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                background: '#EFF6FF',
                color: '#1D4ED8',
                fontSize: '12px',
                fontWeight: '600',
                border: '1px solid #BFDBFE',
                cursor: 'pointer',
              }}
            >
              Ramesh (Plumber)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                background: '#EDE9FE',
                color: '#6D28D9',
                fontSize: '12px',
                fontWeight: '600',
                border: '1px solid #DDD6FE',
                cursor: 'pointer',
              }}
            >
              Admin
            </button>
          </div>
        </div>

        {!isAdminTab && (
          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#69736D' }}>
            Don't have an account yet?{' '}
            <Link to="/register" style={{ color: '#247A52', fontWeight: '700' }}>
              Create an account
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
