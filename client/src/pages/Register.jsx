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
    <div style={{ maxWidth: '540px', margin: '40px auto', padding: '0 16px' }}>
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
              background: '#E8F2EA',
              color: '#247A52',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              margin: '0 auto 12px',
            }}
          >
            🛠️
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#202923', letterSpacing: '-0.4px', marginBottom: '4px' }}>
            Join WorkMate
          </h2>
          <p style={{ fontSize: '14px', color: '#69736D' }}>
            Choose your account role to get started
          </p>
        </div>

        {/* Role Selector Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => setRole('customer')}
            style={{
              padding: '16px 12px',
              borderRadius: '10px',
              textAlign: 'center',
              border: role === 'customer' ? '2px solid #247A52' : '1px solid #E7E8E2',
              background: role === 'customer' ? '#E8F2EA' : '#FAF9F6',
              color: role === 'customer' ? '#202923' : '#69736D',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ fontSize: '22px', marginBottom: '4px' }}>🏡</div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: role === 'customer' ? '#247A52' : '#202923' }}>
              Customer
            </div>
            <div style={{ fontSize: '11px', color: '#69736D' }}>Hire trade workers</div>
          </button>

          <button
            type="button"
            onClick={() => setRole('worker')}
            style={{
              padding: '16px 12px',
              borderRadius: '10px',
              textAlign: 'center',
              border: role === 'worker' ? '2px solid #247A52' : '1px solid #E7E8E2',
              background: role === 'worker' ? '#E8F2EA' : '#FAF9F6',
              color: role === 'worker' ? '#202923' : '#69736D',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ fontSize: '22px', marginBottom: '4px' }}>🔧</div>
            <div style={{ fontSize: '14px', fontWeight: '700', color: role === 'worker' ? '#247A52' : '#202923' }}>
              Trade Worker
            </div>
            <div style={{ fontSize: '11px', color: '#69736D' }}>Find hourly jobs</div>
          </button>
        </div>

        {/* Customer Account Type Sub-Selector */}
        {role === 'customer' && (
          <div
            style={{
              display: 'flex',
              gap: '16px',
              padding: '12px 16px',
              background: '#FAF9F6',
              borderRadius: '8px',
              border: '1px solid #E7E8E2',
              marginBottom: '20px',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '12px', color: '#69736D', fontWeight: '700', textTransform: 'uppercase' }}>
              Type:
            </span>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#202923', cursor: 'pointer', fontWeight: '500' }}>
              <input
                type="radio"
                name="customerType"
                checked={customerType === 'individual'}
                onChange={() => setCustomerType('individual')}
              />
              Individual / Homeowner
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#202923', cursor: 'pointer', fontWeight: '500' }}>
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#202923', marginBottom: '6px' }}>
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
                background: '#FFFFFF',
                border: '1px solid #E7E8E2',
                color: '#202923',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#202923', marginBottom: '6px' }}>
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
                background: '#FFFFFF',
                border: '1px solid #E7E8E2',
                color: '#202923',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#202923', marginBottom: '6px' }}>
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
                background: '#FFFFFF',
                border: '1px solid #E7E8E2',
                color: '#202923',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: '#202923' }}>
                Create Password (min. 6 characters)
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
                minLength={6}
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
              marginTop: '10px',
              padding: '12px',
              borderRadius: '8px',
              background: '#247A52',
              color: '#FFFFFF',
              fontWeight: '700',
              fontSize: '14px',
              cursor: submitting ? 'not-allowed' : 'pointer',
              opacity: submitting ? 0.7 : 1,
              boxShadow: '0 2px 8px rgba(36, 122, 82, 0.25)',
              transition: 'background 0.15s ease',
            }}
          >
            {submitting ? 'Creating Account...' : `Register as ${role === 'worker' ? 'Trade Worker' : 'Customer'}`}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#69736D' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#247A52', fontWeight: '700' }}>
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};
