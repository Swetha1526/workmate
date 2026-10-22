import { useState, useEffect } from 'react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { CATEGORIES } from './Discovery.jsx';

export const WorkerProfileEdit = () => {
  const { user, updateUserProfile } = useAuth();

  const [profile, setProfile] = useState(null);
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [category, setCategory] = useState('plumbers');
  const [skills, setSkills] = useState('');
  const [experienceYears, setExperienceYears] = useState(3);
  const [locality, setLocality] = useState(user?.locality || '');
  const [hourlyRate, setHourlyRate] = useState(350);
  const [bio, setBio] = useState(user?.bio || '');
  const [isAvailable, setIsAvailable] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/workers/me/profile');
      if (res.data.success && res.data.profile) {
        const p = res.data.profile;
        setProfile(p);
        setCategory(p.category || 'plumbers');
        setSkills(p.skills?.join(', ') || '');
        setExperienceYears(p.experienceYears || 1);
        setLocality(p.locality || user?.locality || '');
        setHourlyRate(p.hourlyRate || 350);
        setBio(p.bio || user?.bio || '');
        setIsAvailable(p.isAvailable !== undefined ? p.isAvailable : true);
      }
    } catch {
      // Profile not created yet - user will create it
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const skillsArray = skills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      // 1. Update basic user details
      if (updateUserProfile && (name !== user?.name || phone !== user?.phone || locality !== user?.locality)) {
        await updateUserProfile({ name, phone, locality, bio });
      }

      // 2. Create or update trade worker profile
      const res = await api.post('/workers/profile', {
        category,
        skills: skillsArray,
        experienceYears: Number(experienceYears),
        locality,
        hourlyRate: Number(hourlyRate),
        bio,
        isAvailable,
      });

      if (res.data.success) {
        setProfile(res.data.profile);
        setMessage({
          type: 'success',
          text: profile
            ? 'Worker profile updated successfully!'
            : 'Trade profile created successfully! Customers can now discover and hire you.',
        });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save worker profile.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-slate)' }}>
        <div style={{ fontSize: '28px', marginBottom: '8px' }}>⏳</div>
        Loading worker profile...
      </div>
    );
  }

  const isCreating = !profile;

  return (
    <div style={{ maxWidth: '740px', margin: '36px auto', padding: '0 20px' }}>
      {/* Creation Helper Alert if profile not created yet */}
      {isCreating && (
        <div
          style={{
            padding: '16px 20px',
            borderRadius: 'var(--radius-md)',
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            color: '#1E40AF',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '20px' }}>🔧</span>
          <div>
            <div style={{ fontWeight: '700', fontSize: '15px', marginBottom: '2px' }}>
              Set Up Your Worker Profile
            </div>
            <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
              Add your trade category, skills, location, and hourly rate so local customers can find and book your services.
            </div>
          </div>
        </div>
      )}

      <div className="card-surface" style={{ padding: '36px', borderRadius: 'var(--radius-lg)' }}>
        {/* Header & Verification Pill */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '12px',
            marginBottom: '24px',
            borderBottom: '1px solid var(--border-warm)',
            paddingBottom: '20px',
          }}
        >
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-charcoal)', letterSpacing: '-0.4px', marginBottom: '4px' }}>
              {isCreating ? 'Create Worker Profile' : 'Edit Worker Profile'}
            </h1>
            <p style={{ color: 'var(--text-slate)', fontSize: '13px' }}>
              {isCreating
                ? 'Set up your trade profile to start receiving bookings'
                : 'Update your trade skills, hourly rate, and service area'}
            </p>
          </div>

          {!isCreating && (
            <div>
              {profile?.isVerified ? (
                <span
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--accent-sage)',
                    color: 'var(--primary-forest)',
                    fontSize: '12px',
                    fontWeight: '700',
                    border: '1px solid var(--accent-sage-border)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  ✓ Verified Profile
                </span>
              ) : (
                <span
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--status-pending-bg)',
                    color: 'var(--status-pending)',
                    fontSize: '12px',
                    fontWeight: '700',
                    border: '1px solid #FDE68A',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  ⏳ Verification Pending
                </span>
              )}
            </div>
          )}
        </div>

        {message.text && (
          <div
            style={{
              padding: '14px 18px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '24px',
              background: message.type === 'success' ? 'var(--status-completed-bg)' : 'var(--status-danger-bg)',
              color: message.type === 'success' ? 'var(--status-completed)' : 'var(--status-danger)',
              border: `1px solid ${message.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
              fontSize: '13px',
              fontWeight: '600',
            }}
          >
            {message.type === 'success' ? '✓ ' : '⚠️ '}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Worker Contact Details */}
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-charcoal)', marginBottom: '12px' }}>
              👷 Personal & Contact Information
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
                  placeholder="e.g. Ramesh Plumber"
                />
              </div>

              <div>
                <label className="form-label">Direct Phone</label>
                <input
                  type="tel"
                  required
                  className="form-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98402 22334"
                />
              </div>
            </div>
          </div>

          {/* Trade Details */}
          <div style={{ borderTop: '1px solid var(--border-warm)', paddingTop: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-charcoal)', marginBottom: '12px' }}>
              🛠️ Trade Expertise & Pricing
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="form-label">Primary Trade Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="form-input"
                  style={{ cursor: 'pointer' }}
                >
                  {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Skills & Specializations (comma separated)</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Pipe Fitting, Leak Detection, Solar Water Heater, Sanitary Fix"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label className="form-label">Years of Experience</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    required
                    className="form-input"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                  />
                </div>

                <div>
                  <label className="form-label">Hourly Rate (₹)</label>
                  <input
                    type="number"
                    min="50"
                    max="5000"
                    required
                    className="form-input"
                    value={hourlyRate}
                    onChange={(e) => setHourlyRate(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Operating Locality / Region</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. T. Nagar, Chennai"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">Professional Bio & Highlights</label>
                <textarea
                  rows={4}
                  className="form-input"
                  style={{ resize: 'vertical' }}
                  placeholder="Tell customers about your training, apprenticeships, certifications, and high-precision tools..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Availability Toggle Box */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 18px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--surface-subtle)',
              border: '1px solid var(--border-warm)',
            }}
          >
            <div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-charcoal)' }}>
                Accepting New Bookings
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-slate)' }}>
                Toggle off when busy with an existing contract or temporarily off-duty
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary-forest)' }}
              />
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: isAvailable ? 'var(--status-completed)' : 'var(--status-danger)',
                }}
              >
                {isAvailable ? 'Available' : 'Busy'}
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
            style={{
              padding: '14px',
              fontSize: '15px',
              fontWeight: '700',
              marginTop: '6px',
            }}
          >
            {saving
              ? 'Saving Profile...'
              : isCreating
              ? 'Create Trade Worker Profile'
              : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};
