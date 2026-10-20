import { useState, useEffect } from 'react';
import api from '../services/api.js';
import { CATEGORIES } from './Discovery.jsx';

export const WorkerProfileEdit = () => {
  const [profile, setProfile] = useState(null);
  const [category, setCategory] = useState('plumbers');
  const [skills, setSkills] = useState('');
  const [experienceYears, setExperienceYears] = useState(3);
  const [locality, setLocality] = useState('');
  const [hourlyRate, setHourlyRate] = useState(350);
  const [bio, setBio] = useState('');
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
        setCategory(p.category);
        setSkills(p.skills?.join(', ') || '');
        setExperienceYears(p.experienceYears);
        setLocality(p.locality);
        setHourlyRate(p.hourlyRate);
        setBio(p.bio || '');
        setIsAvailable(p.isAvailable);
      }
    } catch {
      // Profile not created yet
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const skillsArray = skills
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

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
        setMessage({ type: 'success', text: 'Worker profile updated successfully!' });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to save profile.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-slate)' }}>
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
        Loading worker profile...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '680px', margin: '36px auto', padding: '0 20px' }}>
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
              Manage Worker Profile
            </h1>
            <p style={{ color: 'var(--text-slate)', fontSize: '13px' }}>
              Keep your trade expertise, operating locality, and hourly rates current
            </p>
          </div>

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

        {message.text && (
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '24px',
              background: message.type === 'success' ? 'var(--status-completed-bg)' : 'var(--status-danger-bg)',
              color: message.type === 'success' ? 'var(--status-completed)' : 'var(--status-danger)',
              border: `1px solid ${message.type === 'success' ? '#BBF7D0' : '#FECACA'}`,
              fontSize: '13px',
              fontWeight: '500',
            }}
          >
            {message.type === 'success' ? '✓ ' : '⚠️ '}
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
              placeholder="e.g. Pipe Fitting, Leak Detection, Solar Water Heater, CPVC Welding"
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
              padding: '13px',
              fontSize: '15px',
              marginTop: '4px',
            }}
          >
            {saving ? 'Saving Profile...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};
