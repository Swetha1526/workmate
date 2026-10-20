import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export const Login = () => {
  const [isAdminTab, setIsAdminTab] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      setEmail('flow.customer@workmate.local');
      setPassword('Password123!');
    } else if (type === 'worker') {
      setIsAdminTab(false);
      setEmail('flow.worker@workmate.local');
      setPassword('Password123!');
    } else if (type === 'admin') {
      setIsAdminTab(true);
      setEmail('admin@workmate.local');
      setPassword('Admin@WorkMate2026!');
    }
  };

  return (
    <div style={{ maxWidth: '460px', margin: '48px auto', padding: '0 16px' }}>
      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>
            {isAdminTab ? '🛡️' : '🔐'}
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '700' }}>
            {isAdminTab ? 'Administrator Access' : 'Sign in to WorkMate'}
          </h2>
          <p style={{ fontSize: '14px', color: '#9ca3af' }}>
            {isAdminTab
              ? 'Authorized administrative portal'
              : 'Access bookings, worker profiles, and chat'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div
          style={{
            display: 'flex',
            borderRadius: '10px',
            background: 'rgba(0,0,0,0.3)',
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
              padding: '8px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              color: !isAdminTab ? '#fff' : '#9ca3af',
              background: !isAdminTab ? 'rgba(59, 130, 246, 0.25)' : 'none',
              border: !isAdminTab ? '1px solid rgba(59, 130, 246, 0.4)' : 'none',
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
              padding: '8px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              color: isAdminTab ? '#c084fc' : '#9ca3af',
              background: isAdminTab ? 'rgba(168, 85, 247, 0.25)' : 'none',
              border: isAdminTab ? '1px solid rgba(168, 85, 247, 0.4)' : 'none',
            }}
          >
            🛡️ Admin Login
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '12px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              fontSize: '13px',
              marginBottom: '18px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>
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
                background: 'rgba(0, 0, 0, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(0, 0, 0, 0.25)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              marginTop: '8px',
              padding: '12px',
              borderRadius: '8px',
              background: isAdminTab
                ? 'linear-gradient(135deg, #7c3aed, #9333ea)'
                : 'linear-gradient(135deg, var(--primary), var(--accent))',
              color: '#fff',
              fontWeight: '600',
              fontSize: '14px',
              opacity: submitting ? 0.7 : 1,
              boxShadow: '0 4px 14px var(--primary-glow)',
            }}
          >
            {submitting ? 'Authenticating...' : isAdminTab ? 'Enter Admin Console' : 'Sign In'}
          </button>
        </form>

        {/* Quick Fill Test Credentials */}
        <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '10px' }}>
            ⚡ Quick-Fill Demo Accounts (GUVI Evaluator Convenience)
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => handleQuickFill('customer')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                fontSize: '12px',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              Fill Customer
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('worker')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                background: 'rgba(59, 130, 246, 0.15)',
                color: '#60a5fa',
                fontSize: '12px',
                border: '1px solid rgba(59, 130, 246, 0.3)',
              }}
            >
              Fill Worker
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                background: 'rgba(168, 85, 247, 0.15)',
                color: '#c084fc',
                fontSize: '12px',
                border: '1px solid rgba(168, 85, 247, 0.3)',
              }}
            >
              Fill Admin
            </button>
          </div>
        </div>

        {!isAdminTab && (
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#9ca3af' }}>
            Don't have an account yet?{' '}
            <Link to="/register" style={{ color: '#60a5fa', fontWeight: '600' }}>
              Create an account
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
