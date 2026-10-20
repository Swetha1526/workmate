import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export const Register = () => {
  const [role, setRole] = useState('customer'); // 'customer' | 'worker'
  const [customerType, setCustomerType] = useState('individual'); // 'individual' | 'business'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await register({
        name,
        email,
        phone,
        password,
        role,
        customerType: role === 'customer' ? customerType : undefined,
      });

      if (res.success) {
        if (role === 'worker') {
          navigate('/worker-profile');
        } else {
          navigate('/discovery');
        }
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.data?.errors ? Object.values(err.response.data.errors).join(', ') : null) ||
        'Registration failed. Please check your details.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '520px', margin: '40px auto', padding: '0 16px' }}>
      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '36px', marginBottom: '8px' }}>🛠️</div>
          <h2 style={{ fontSize: '24px', fontWeight: '700' }}>Join WorkMate</h2>
          <p style={{ fontSize: '14px', color: '#9ca3af' }}>
            Choose your account role and get started in seconds
          </p>
        </div>

        {/* Role Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => setRole('customer')}
            style={{
              padding: '14px 10px',
              borderRadius: '10px',
              textAlign: 'center',
              border: role === 'customer' ? '2px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.1)',
              background: role === 'customer' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(0, 0, 0, 0.25)',
              color: role === 'customer' ? '#fff' : '#9ca3af',
            }}
          >
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>🏡</div>
            <div style={{ fontSize: '14px', fontWeight: '700' }}>Customer</div>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>Hire trade workers</div>
          </button>

          <button
            type="button"
            onClick={() => setRole('worker')}
            style={{
              padding: '14px 10px',
              borderRadius: '10px',
              textAlign: 'center',
              border: role === 'worker' ? '2px solid #8b5cf6' : '1px solid rgba(255, 255, 255, 0.1)',
              background: role === 'worker' ? 'rgba(139, 92, 246, 0.15)' : 'rgba(0, 0, 0, 0.25)',
              color: role === 'worker' ? '#fff' : '#9ca3af',
            }}
          >
            <div style={{ fontSize: '20px', marginBottom: '4px' }}>🔧</div>
            <div style={{ fontSize: '14px', fontWeight: '700' }}>Trade Worker</div>
            <div style={{ fontSize: '11px', color: '#9ca3af' }}>Find hourly jobs</div>
          </button>
        </div>

        {/* Customer Account Type Sub-Selector */}
        {role === 'customer' && (
          <div
            style={{
              display: 'flex',
              gap: '12px',
              padding: '10px 14px',
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '8px',
              marginBottom: '20px',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '600' }}>Account Type:</span>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="customerType"
                checked={customerType === 'individual'}
                onChange={() => setCustomerType('individual')}
              />
              Individual / Homeowner
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="customerType"
                checked={customerType === 'business'}
                onChange={() => setCustomerType('business')}
              />
              Business / Contractor
            </label>
          </div>
        )}

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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '4px' }}>
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Anand Kumar"
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
            <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '4px' }}>
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
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
            <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '4px' }}>
              Phone Number
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontSize: '13px', color: '#9ca3af' }}>
                Create Password (min. 6 characters)
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  fontSize: '12px',
                  color: '#60a5fa',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {showPassword ? 'Hide Password' : 'Show Password'}
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '10px 40px 10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
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
                  color: '#9ca3af',
                  fontSize: '14px',
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
              marginTop: '10px',
              padding: '12px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              color: '#fff',
              fontWeight: '600',
              fontSize: '14px',
              opacity: submitting ? 0.7 : 1,
              boxShadow: '0 4px 14px var(--primary-glow)',
            }}
          >
            {submitting ? 'Creating Account...' : `Register as ${role === 'worker' ? 'Worker' : 'Customer'}`}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#9ca3af' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#60a5fa', fontWeight: '600' }}>
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};
