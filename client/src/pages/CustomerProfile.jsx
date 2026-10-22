import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export const CustomerProfile = () => {
  const { user, updateUserProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [customerType, setCustomerType] = useState(user?.customerType || 'individual');
  const [locality, setLocality] = useState(user?.locality || '');
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || 'Chennai');
  const [pincode, setPincode] = useState(user?.pincode || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar || '👤');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Calculate profile completeness percentage
  const fields = [name, phone, locality, address, city, pincode, bio];
  const filledFields = fields.filter((f) => f && f.trim().length > 0).length;
  const completionPercent = Math.round((filledFields / fields.length) * 100);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await updateUserProfile({
        name,
        phone,
        customerType,
        locality,
        address,
        city,
        pincode,
        bio,
        avatar,
      });

      if (res.success) {
        setMessage({
          type: 'success',
          text: 'Profile updated successfully.',
        });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update profile. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const AVATAR_OPTIONS = ['👤', '🏡', '🏢', '💼', '👷‍♂️', '👩‍💼', '🌟', '🏙️'];

  return (
    <div style={{ maxWidth: '820px', margin: '36px auto', padding: '0 20px' }}>
      {/* Top Banner / Breadcrumb */}
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-charcoal)', letterSpacing: '-0.5px', marginBottom: '4px' }}>
            My Profile
          </h1>
          <p style={{ color: 'var(--text-slate)', fontSize: '14px' }}>
            Manage your contact information and service address
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link
            to="/discovery"
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '13px', textDecoration: 'none' }}
          >
            🔍 Find Workers
          </Link>
          <Link
            to="/my-bookings"
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              borderRadius: 'var(--radius-sm)',
              background: '#FFFFFF',
              color: 'var(--text-charcoal)',
              border: '1px solid var(--border-warm)',
              textDecoration: 'none',
              fontWeight: '600',
            }}
          >
            📅 My Bookings
          </Link>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div
        className="card-surface"
        style={{
          padding: '24px',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '28px',
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'var(--accent-sage)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            border: '2px solid var(--accent-sage-border)',
          }}
        >
          {avatar || '👤'}
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-charcoal)', margin: 0 }}>
              {user?.name || 'Customer Profile'}
            </h2>
            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '9999px',
                background: '#E0E7FF',
                color: '#3730A3',
                fontWeight: '700',
                textTransform: 'uppercase',
              }}
            >
              Customer • {customerType === 'business' ? 'Commercial' : 'Homeowner'}
            </span>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-slate)' }}>
            {user?.email} • {locality ? `📍 ${locality}` : 'No location specified yet'}
          </div>
        </div>

        {/* Completeness Pill */}
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-slate)', marginBottom: '4px' }}>
            Profile Strength
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '100px',
                height: '8px',
                background: '#E5E7EB',
                borderRadius: '9999px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${completionPercent}%`,
                  height: '100%',
                  background: completionPercent >= 75 ? 'var(--primary-forest)' : '#F59E0B',
                  borderRadius: '9999px',
                  transition: 'width 0.3s ease',
                }}
              ></div>
            </div>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-charcoal)' }}>
              {completionPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Feedback Messages */}
      {message.text && (
        <div
          style={{
            padding: '14px 18px',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '24px',
            background: message.type === 'success' ? 'var(--status-completed-bg)' : 'var(--status-danger-bg)',
            color: message.type === 'success' ? 'var(--status-completed)' : 'var(--status-danger)',
            border: `1px solid ${message.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          {message.type === 'success' ? '✓ ' : '⚠️ '}
          {message.text}
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit}>
        <div className="card-surface" style={{ padding: '32px', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Avatar Icon Picker */}
          <div>
            <label className="form-label">Select Profile Icon</label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
              {AVATAR_OPTIONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setAvatar(icon)}
                  style={{
                    width: '44px',
                    height: '44px',
                    fontSize: '20px',
                    borderRadius: '10px',
                    border: avatar === icon ? '2px solid var(--primary-forest)' : '1px solid var(--border-warm)',
                    background: avatar === icon ? 'var(--accent-sage)' : '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Account Details Section */}
          <div style={{ borderTop: '1px solid var(--border-warm)', paddingTop: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-charcoal)', marginBottom: '14px' }}>
              👤 Personal & Contact Info
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Raju"
                />
              </div>

              <div>
                <label className="form-label">Phone Number (Direct Contact for Workers)</label>
                <input
                  type="tel"
                  required
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98401 11223"
                />
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <label className="form-label">Email Address (Registered Account)</label>
              <input
                type="email"
                disabled
                className="form-input"
                value={user?.email || ''}
                style={{ background: 'var(--surface-subtle)', color: 'var(--text-slate)', cursor: 'not-allowed' }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-slate)', marginTop: '4px', display: 'block' }}>
                Email is permanently bound to your account login
              </span>
            </div>
          </div>

          {/* Customer Type Selector */}
          <div style={{ borderTop: '1px solid var(--border-warm)', paddingTop: '20px' }}>
            <label className="form-label">Account Category</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setCustomerType('individual')}
                style={{
                  padding: '14px 16px',
                  borderRadius: '10px',
                  border: customerType === 'individual' ? '2px solid var(--primary-forest)' : '1px solid var(--border-warm)',
                  background: customerType === 'individual' ? 'var(--accent-sage)' : '#FAF9F6',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontWeight: '700', color: 'var(--text-charcoal)', fontSize: '14px' }}>
                  🏡 Individual Homeowner
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-slate)', marginTop: '2px' }}>
                  Hiring for personal apartment, villa, or home maintenance
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCustomerType('business')}
                style={{
                  padding: '14px 16px',
                  borderRadius: '10px',
                  border: customerType === 'business' ? '2px solid var(--primary-forest)' : '1px solid var(--border-warm)',
                  background: customerType === 'business' ? 'var(--accent-sage)' : '#FAF9F6',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontWeight: '700', color: 'var(--text-charcoal)', fontSize: '14px' }}>
                  🏢 Business / General Contractor
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-slate)', marginTop: '2px' }}>
                  Hiring for commercial sites, renovation projects, or subcontracting
                </div>
              </button>
            </div>
          </div>

          {/* Service Location / Address Section */}
          <div style={{ borderTop: '1px solid var(--border-warm)', paddingTop: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-charcoal)', marginBottom: '4px' }}>
              📍 Service Address & Locality
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-slate)', marginBottom: '14px' }}>
              Trade workers will use this location to calculate travel time and service feasibility
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label className="form-label">Operating Locality / Area</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  placeholder="e.g. T. Nagar, Chennai"
                />
              </div>

              <div>
                <label className="form-label">City</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Chennai"
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
              <div>
                <label className="form-label">Street Address & Landmark</label>
                <input
                  type="text"
                  className="form-input"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 42, South Usman Road, Near Bus Stand"
                />
              </div>

              <div>
                <label className="form-label">Pincode</label>
                <input
                  type="text"
                  className="form-input"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="e.g. 600017"
                />
              </div>
            </div>
          </div>

          {/* Bio / Property Notes */}
          <div style={{ borderTop: '1px solid var(--border-warm)', paddingTop: '20px' }}>
            <label className="form-label">Special Notes / Property Instructions (Optional)</label>
            <textarea
              rows={3}
              className="form-input"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Apartment on 3rd floor, lift available. Call on arrival or notify security gate..."
              style={{ resize: 'vertical' }}
            />
          </div>

          {/* Submit Button */}
          <div style={{ paddingTop: '8px' }}>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '15px',
                fontWeight: '700',
              }}
            >
              {saving ? 'Saving Profile...' : 'Save Customer Profile'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
