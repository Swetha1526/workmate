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
    return <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>Loading profile...</div>;
  }

  return (
    <div style={{ maxWidth: '640px', margin: '32px auto', padding: '0 16px' }}>
      <div className="glass-panel" style={{ padding: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800' }}>Manage Worker Profile</h1>
            <p style={{ color: '#9ca3af', fontSize: '13px' }}>
              Keep your trade skills, hourly rate, and availability up to date
            </p>
          </div>

          {/* Verification Badge */}
          {profile?.isVerified ? (
            <span
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                fontSize: '12px',
                fontWeight: '700',
                border: '1px solid rgba(16, 185, 129, 0.3)',
              }}
            >
              ✓ Verified Profile
            </span>
          ) : (
            <span
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#f59e0b',
                fontSize: '12px',
                fontWeight: '700',
                border: '1px solid rgba(245, 158, 11, 0.3)',
              }}
            >
              ⏳ Verification Pending
            </span>
          )}
        </div>

        {message.text && (
          <div
            style={{
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              background: message.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: message.type === 'success' ? '#10b981' : '#ef4444',
              border: `1px solid ${message.type === 'success' ? '#10b98140' : '#ef444440'}`,
              fontSize: '13px',
            }}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>
              Primary Trade Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                background: '#111827',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
              }}
            >
              {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>
              Skills (comma separated)
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Pipe Fitting, Leak Detection, Solar Water Heater"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>
                Years of Experience
              </label>
              <input
                type="number"
                min="0"
                max="50"
                required
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>
                Hourly Rate (₹)
              </label>
              <input
                type="number"
                min="50"
                max="5000"
                required
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>
              Operating Locality / Region
            </label>
            <input
              type="text"
              required
              placeholder="e.g. T. Nagar, Chennai"
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>
              Professional Bio & Highlights
            </label>
            <textarea
              rows={4}
              placeholder="Tell customers about your training, certifications, and specialized tools..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          {/* Availability Toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: '8px',
              background: 'rgba(0,0,0,0.25)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>Accepting New Bookings</div>
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                Toggle off when busy on a job or unavailable for hire
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              <span style={{ fontSize: '13px', fontWeight: '700', color: isAvailable ? '#10b981' : '#ef4444' }}>
                {isAvailable ? 'Available' : 'Busy'}
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              marginTop: '10px',
              padding: '12px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              color: '#fff',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            {saving ? 'Saving Profile...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};
