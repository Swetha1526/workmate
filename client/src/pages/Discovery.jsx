import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export const CATEGORIES = [
  { id: 'all', name: 'All Categories', icon: '🔍' },
  { id: 'plumbers', name: 'Plumbers', icon: '🔧' },
  { id: 'electricians', name: 'Electricians', icon: '⚡' },
  { id: 'carpenters', name: 'Carpenters', icon: '🪚' },
  { id: 'ac_mechanics', name: 'AC Mechanics', icon: '❄️' },
  { id: 'welders', name: 'Welders', icon: '🔥' },
  { id: 'fitters', name: 'Fitters', icon: '🔩' },
  { id: 'drivers', name: 'Drivers', icon: '🚗' },
  { id: 'helpers', name: 'Helpers', icon: '📦' },
  { id: 'masons', name: 'Masons', icon: '🧱' },
  { id: 'mason_helpers', name: 'Mason Helpers', icon: '👷' },
];

export const Discovery = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isCustomer } = useAuth();

  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [locality, setLocality] = useState(searchParams.get('locality') || '');
  const [search, setSearch] = useState('');
  const [maxRate, setMaxRate] = useState('');
  const [isAvailableOnly, setIsAvailableOnly] = useState(false);
  const [isVerifiedOnly, setIsVerifiedOnly] = useState(false);

  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalWorkers, setTotalWorkers] = useState(0);

  // Modals state
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [bookingWorker, setBookingWorker] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    jobDescription: '',
    locality: '',
    scheduledDate: '',
    scheduledTime: '10:00 AM',
    estimatedHours: 2,
  });
  const [bookingStatus, setBookingStatus] = useState({ loading: false, error: '', success: false });

  // Sync category state with searchParams
  useEffect(() => {
    const urlCat = searchParams.get('category');
    if (urlCat && urlCat !== category) {
      setCategory(urlCat);
    }
  }, [searchParams]);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category && category !== 'all') params.append('category', category);
      if (locality) params.append('locality', locality);
      if (search) params.append('search', search);
      if (maxRate) params.append('maxRate', maxRate);
      if (isAvailableOnly) params.append('isAvailable', 'true');
      if (isVerifiedOnly) params.append('isVerified', 'true');

      const res = await api.get(`/workers?${params.toString()}`);
      if (res.data.success) {
        setWorkers(res.data.workers);
        setTotalWorkers(res.data.total);
      }
    } catch (err) {
      console.error('Failed to fetch workers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [category, isAvailableOnly, isVerifiedOnly]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchWorkers();
  };

  const handleCategorySelect = (catId) => {
    setCategory(catId);
    setSearchParams(catId === 'all' ? {} : { category: catId });
  };

  const openBookingModal = (worker) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!isCustomer) {
      alert('Only customers can request a booking. Please log in with a customer account.');
      return;
    }
    setBookingWorker(worker);
    setBookingForm({
      jobDescription: '',
      locality: worker.locality || '',
      scheduledDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      scheduledTime: '10:00 AM',
      estimatedHours: 2,
    });
    setBookingStatus({ loading: false, error: '', success: false });
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    setBookingStatus({ loading: true, error: '', success: false });

    try {
      const res = await api.post('/bookings', {
        workerId: bookingWorker._id,
        jobDescription: bookingForm.jobDescription,
        locality: bookingForm.locality,
        scheduledDate: bookingForm.scheduledDate,
        scheduledTime: bookingForm.scheduledTime,
        estimatedHours: Number(bookingForm.estimatedHours),
      });

      if (res.data.success) {
        setBookingStatus({ loading: false, error: '', success: true });
        setTimeout(() => {
          setBookingWorker(null);
          navigate('/my-bookings');
        }, 1200);
      }
    } catch (err) {
      setBookingStatus({
        loading: false,
        error: err.response?.data?.message || 'Failed to request booking.',
        success: false,
      });
    }
  };

  return (
    <div className="container" style={{ padding: '32px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '8px' }}>
          Find Local Trade Workers
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '15px' }}>
          Compare hourly rates, verify ratings, and book verified workers across Chennai & nearby localities
        </p>
      </div>

      {/* Category Pills Bar */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '12px',
          marginBottom: '24px',
          scrollbarWidth: 'thin',
        }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => handleCategorySelect(cat.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '9999px',
              whiteSpace: 'nowrap',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: category === cat.id ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.08)',
              background: category === cat.id ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.03)',
              color: category === cat.id ? '#60a5fa' : '#9ca3af',
              transition: 'all 0.2s ease',
            }}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <div
        className="glass-panel"
        style={{
          padding: '18px 20px',
          marginBottom: '32px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '14px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px', flex: 1, minWidth: '280px' }}>
          <input
            type="text"
            placeholder="Search skills, services, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
              fontSize: '13px',
              outline: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Locality (e.g. Velachery)"
            value={locality}
            onChange={(e) => setLocality(e.target.value)}
            style={{
              width: '180px',
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#fff',
              fontSize: '13px',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              background: 'var(--primary)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Search
          </button>
        </form>

        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
            <span style={{ color: '#9ca3af' }}>Max Rate:</span>
            <input
              type="number"
              placeholder="₹500"
              value={maxRate}
              onChange={(e) => setMaxRate(e.target.value)}
              onBlur={fetchWorkers}
              style={{
                width: '80px',
                padding: '6px 10px',
                borderRadius: '6px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isAvailableOnly}
              onChange={(e) => setIsAvailableOnly(e.target.checked)}
            />
            Available Now
          </label>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={isVerifiedOnly}
              onChange={(e) => setIsVerifiedOnly(e.target.checked)}
            />
            Verified Only
          </label>
        </div>
      </div>

      {/* Workers Grid */}
      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
          Searching verified workers in MongoDB...
        </div>
      ) : workers.length === 0 ? (
        <div
          className="glass-panel"
          style={{ padding: '48px', textAlign: 'center', maxWidth: '500px', margin: '0 auto' }}
        >
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>No Workers Found</h3>
          <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '20px' }}>
            No worker profiles currently match your search filters. Try clearing locality or expanding rate filters.
          </p>
          <button
            onClick={() => {
              setCategory('all');
              setLocality('');
              setSearch('');
              setMaxRate('');
              setIsAvailableOnly(false);
              setIsVerifiedOnly(false);
              setSearchParams({});
            }}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              background: 'rgba(59, 130, 246, 0.2)',
              color: '#60a5fa',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '16px' }}>
            Showing <strong>{workers.length}</strong> available workers
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px',
            }}
          >
            {workers.map((worker) => (
              <div
                key={worker._id}
                className="glass-panel"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  border: worker.isVerified ? '1px solid rgba(59, 130, 246, 0.25)' : undefined,
                }}
              >
                {/* Demo Badge */}
                {worker.isDemo && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: 'rgba(234, 179, 8, 0.15)',
                      color: '#facc15',
                      border: '1px solid rgba(234, 179, 8, 0.3)',
                      fontWeight: '700',
                    }}
                  >
                    DEMO DATA
                  </span>
                )}

                {/* Worker Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      fontWeight: '700',
                      color: '#fff',
                      flexShrink: 0,
                    }}
                  >
                    {worker.userId?.name?.charAt(0) || 'W'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <h3
                        style={{
                          fontSize: '16px',
                          fontWeight: '700',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {worker.userId?.name || 'Worker'}
                      </h3>
                      {worker.isVerified && (
                        <span title="Verified Trade Professional" style={{ color: '#3b82f6', fontSize: '14px' }}>
                          ✓
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '12px', color: '#60a5fa', textTransform: 'capitalize' }}>
                      {worker.category.replace('_', ' ')} • {worker.experienceYears} yrs exp
                    </div>
                  </div>
                </div>

                {/* Rating & Rate stats */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(0,0,0,0.25)',
                    marginBottom: '12px',
                    fontSize: '13px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: '#f59e0b' }}>⭐</span>
                    <span style={{ fontWeight: '700' }}>
                      {worker.averageRating > 0 ? worker.averageRating.toFixed(1) : 'New'}
                    </span>
                    <span style={{ color: '#6b7280', fontSize: '11px' }}>
                      ({worker.reviewCount || 0} reviews)
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ color: '#10b981', fontWeight: '800', fontSize: '15px' }}>
                      ₹{worker.hourlyRate}
                    </span>
                    <span style={{ color: '#6b7280', fontSize: '11px' }}>/ hour</span>
                  </div>
                </div>

                {/* Locality */}
                <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '12px' }}>
                  📍 {worker.locality}
                </div>

                {/* Bio snippet */}
                <p
                  style={{
                    fontSize: '13px',
                    color: '#d1d5db',
                    lineHeight: '1.4',
                    marginBottom: '14px',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {worker.bio || 'Available for hourly on-demand trade service requests.'}
                </p>

                {/* Skills tags */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '18px' }}>
                  {worker.skills?.slice(0, 3).map((skill, sIdx) => (
                    <span
                      key={sIdx}
                      style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        color: '#9ca3af',
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                  {worker.skills?.length > 3 && (
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>
                      +{worker.skills.length - 3} more
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div style={{ marginTop: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedWorker(worker)}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: '#d1d5db',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Details
                  </button>
                  <button
                    type="button"
                    disabled={!worker.isAvailable}
                    onClick={() => openBookingModal(worker)}
                    style={{
                      padding: '8px',
                      borderRadius: '8px',
                      background: worker.isAvailable
                        ? 'linear-gradient(135deg, var(--primary), var(--accent))'
                        : '#374151',
                      color: '#fff',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: worker.isAvailable ? 'pointer' : 'not-allowed',
                      opacity: worker.isAvailable ? 1 : 0.6,
                    }}
                  >
                    {worker.isAvailable ? 'Book Now' : 'Busy'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Worker Detail Modal */}
      {selectedWorker && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px',
          }}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: '540px',
              width: '100%',
              padding: '28px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '700' }}>{selectedWorker.userId?.name}</h2>
                {selectedWorker.isVerified && (
                  <span style={{ color: '#3b82f6', fontSize: '13px', fontWeight: '600' }}>✓ Verified</span>
                )}
              </div>
              <button onClick={() => setSelectedWorker(null)} style={{ color: '#9ca3af', fontSize: '20px' }}>
                ✕
              </button>
            </div>

            <div style={{ fontSize: '13px', color: '#60a5fa', textTransform: 'capitalize', marginBottom: '12px' }}>
              {selectedWorker.category.replace('_', ' ')} • ₹{selectedWorker.hourlyRate}/hour • {selectedWorker.locality}
            </div>

            <p style={{ fontSize: '14px', color: '#d1d5db', lineHeight: '1.5', marginBottom: '18px' }}>
              {selectedWorker.bio}
            </p>

            <div style={{ marginBottom: '18px' }}>
              <h4 style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>Specialized Skills:</h4>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {selectedWorker.skills?.map((s, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '12px',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: 'rgba(59, 130, 246, 0.15)',
                      color: '#93c5fd',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button
                type="button"
                onClick={() => setSelectedWorker(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#d1d5db',
                }}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const w = selectedWorker;
                  setSelectedWorker(null);
                  openBookingModal(w);
                }}
                style={{
                  padding: '8px 20px',
                  borderRadius: '8px',
                  background: 'var(--primary)',
                  color: '#fff',
                  fontWeight: '600',
                }}
              >
                Proceed to Book
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Request Modal */}
      {bookingWorker && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px',
          }}
        >
          <div
            className="glass-panel"
            style={{
              maxWidth: '500px',
              width: '100%',
              padding: '28px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Request Booking</h2>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                  Booking {bookingWorker.userId?.name} ({bookingWorker.category.replace('_', ' ')})
                </div>
              </div>
              <button onClick={() => setBookingWorker(null)} style={{ color: '#9ca3af', fontSize: '20px' }}>
                ✕
              </button>
            </div>

            {bookingStatus.error && (
              <div
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444',
                  fontSize: '13px',
                  marginBottom: '14px',
                }}
              >
                {bookingStatus.error}
              </div>
            )}

            {bookingStatus.success ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎉</div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#10b981' }}>Booking Requested!</h3>
                <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '6px' }}>
                  Redirecting to your bookings dashboard...
                </p>
              </div>
            ) : (
              <form onSubmit={submitBooking} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>
                    Job Description & Issues
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe the issue or required job in detail..."
                    value={bookingForm.jobDescription}
                    onChange={(e) => setBookingForm({ ...bookingForm, jobDescription: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>
                    Service Locality / Address
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Flat/House No., Street, Locality"
                    value={bookingForm.locality}
                    onChange={(e) => setBookingForm({ ...bookingForm, locality: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>
                      Date
                    </label>
                    <input
                      type="date"
                      required
                      value={bookingForm.scheduledDate}
                      onChange={(e) => setBookingForm({ ...bookingForm, scheduledDate: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                        fontSize: '13px',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>
                      Preferred Time
                    </label>
                    <select
                      value={bookingForm.scheduledTime}
                      onChange={(e) => setBookingForm({ ...bookingForm, scheduledTime: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        background: '#111827',
                        border: '1px solid rgba(255,255,255,0.1)',
                        color: '#fff',
                        fontSize: '13px',
                        outline: 'none',
                      }}
                    >
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:30 AM">11:30 AM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="04:00 PM">04:00 PM</option>
                      <option value="06:00 PM">06:00 PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: '#9ca3af' }}>Estimated Duration:</span>
                    <span style={{ fontWeight: '700' }}>{bookingForm.estimatedHours} Hours</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={bookingForm.estimatedHours}
                    onChange={(e) => setBookingForm({ ...bookingForm, estimatedHours: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Live Cost Summary */}
                <div
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '6px',
                  }}
                >
                  <span style={{ fontSize: '13px', color: '#9ca3af' }}>
                    Estimated Total ({bookingForm.estimatedHours}h × ₹{bookingWorker.hourlyRate}):
                  </span>
                  <span style={{ fontSize: '18px', fontWeight: '800', color: '#10b981' }}>
                    ₹{bookingForm.estimatedHours * bookingWorker.hourlyRate}
                  </span>
                </div>

                <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>
                  ℹ️ Direct Payment: You arrange cash or UPI settlement directly with the worker upon job completion.
                </div>

                <button
                  type="submit"
                  disabled={bookingStatus.loading}
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
                  {bookingStatus.loading ? 'Submitting...' : 'Confirm Booking Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
