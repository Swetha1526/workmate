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
    <div style={{ backgroundColor: '#FAF9F6', minHeight: '100vh', padding: '36px 0 64px' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#202923', letterSpacing: '-0.5px', marginBottom: '8px' }}>
            Find Verified Local Trade Workers
          </h1>
          <p style={{ color: '#69736D', fontSize: '15px' }}>
            Browse certified trade workers, compare transparent hourly rates, and book directly
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
                border: category === cat.id ? '1px solid #247A52' : '1px solid #E7E8E2',
                background: category === cat.id ? '#E8F2EA' : '#FFFFFF',
                color: category === cat.id ? '#247A52' : '#69736D',
                boxShadow: category === cat.id ? '0 1px 3px rgba(36, 122, 82, 0.15)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Filter & Search Bar */}
        <div
          style={{
            background: '#FFFFFF',
            border: '1px solid #E7E8E2',
            borderRadius: '14px',
            boxShadow: '0 2px 6px rgba(32, 41, 35, 0.04)',
            padding: '16px 20px',
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
                background: '#FAF9F6',
                border: '1px solid #E7E8E2',
                color: '#202923',
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
                background: '#FAF9F6',
                border: '1px solid #E7E8E2',
                color: '#202923',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                background: '#247A52',
                color: '#FFFFFF',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              Filter
            </button>
          </form>

          {/* Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
              <span style={{ color: '#69736D', fontWeight: '500' }}>Max Rate:</span>
              <input
                type="number"
                placeholder="₹500"
                value={maxRate}
                onChange={(e) => setMaxRate(e.target.value)}
                onBlur={fetchWorkers}
                style={{
                  width: '84px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  background: '#FAF9F6',
                  border: '1px solid #E7E8E2',
                  color: '#202923',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#202923', cursor: 'pointer', fontWeight: '500' }}>
              <input
                type="checkbox"
                checked={isAvailableOnly}
                onChange={(e) => setIsAvailableOnly(e.target.checked)}
              />
              Available Now
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#202923', cursor: 'pointer', fontWeight: '500' }}>
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
          <div style={{ padding: '60px', textAlign: 'center', color: '#69736D' }}>
            Loading available trade workers...
          </div>
        ) : workers.length === 0 ? (
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E7E8E2',
              borderRadius: '14px',
              padding: '48px',
              textAlign: 'center',
              maxWidth: '480px',
              margin: '32px auto',
              boxShadow: '0 2px 6px rgba(32, 41, 35, 0.04)',
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#202923', marginBottom: '8px' }}>
              No Workers Found
            </h3>
            <p style={{ fontSize: '14px', color: '#69736D', marginBottom: '24px' }}>
              No trade worker profiles currently match your search criteria. Try broadening your locality or rate filter.
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
                padding: '9px 20px',
                borderRadius: '8px',
                background: '#E8F2EA',
                color: '#247A52',
                border: '1px solid #BCD9BF',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '13px', color: '#69736D', marginBottom: '16px' }}>
              Showing <strong>{workers.length}</strong> matching trade workers
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '22px',
              }}
            >
              {workers.map((worker) => (
                <div
                  key={worker._id}
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #E7E8E2',
                    borderRadius: '14px',
                    padding: '22px',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    boxShadow: '0 2px 8px rgba(32, 41, 35, 0.04)',
                    transition: 'all 0.2s ease',
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
                        padding: '2px 7px',
                        borderRadius: '4px',
                        background: '#FEF3C7',
                        color: '#B45309',
                        border: '1px solid #FDE68A',
                        fontWeight: '700',
                      }}
                    >
                      DEMO PROFILE
                    </span>
                  )}

                  {/* Worker Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: '#E8F2EA',
                        border: '1px solid #BCD9BF',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        fontWeight: '700',
                        color: '#247A52',
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
                            color: '#202923',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            margin: 0,
                          }}
                        >
                          {worker.userId?.name || 'Worker'}
                        </h3>
                        {worker.isVerified && (
                          <span title="Verified Professional" style={{ color: '#247A52', fontSize: '14px', fontWeight: '800' }}>
                            ✓
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '13px', color: '#69736D', textTransform: 'capitalize' }}>
                        {worker.category.replace('_', ' ')} • {worker.experienceYears} yrs exp
                      </div>
                    </div>
                  </div>

                  {/* Rating & Rate Stats */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: '#FAF9F6',
                      border: '1px solid #E7E8E2',
                      marginBottom: '12px',
                      fontSize: '13px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ color: '#F59E0B' }}>⭐</span>
                      <span style={{ fontWeight: '700', color: '#202923' }}>
                        {worker.averageRating > 0 ? worker.averageRating.toFixed(1) : 'New'}
                      </span>
                      <span style={{ color: '#8E9992', fontSize: '12px' }}>
                        ({worker.reviewCount || 0} reviews)
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <span style={{ color: '#247A52', fontWeight: '800', fontSize: '16px' }}>
                        ₹{worker.hourlyRate}
                      </span>
                      <span style={{ color: '#69736D', fontSize: '12px' }}>/hr</span>
                    </div>
                  </div>

                  {/* Locality */}
                  <div style={{ fontSize: '13px', color: '#69736D', marginBottom: '10px' }}>
                    📍 {worker.locality}
                  </div>

                  {/* Bio snippet */}
                  <p
                    style={{
                      fontSize: '13px',
                      color: '#4B554F',
                      lineHeight: '1.45',
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
                          fontWeight: '500',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          background: '#FAF9F6',
                          border: '1px solid #E7E8E2',
                          color: '#4B554F',
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                    {worker.skills?.length > 3 && (
                      <span style={{ fontSize: '11px', color: '#8E9992', alignSelf: 'center' }}>
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
                        padding: '9px',
                        borderRadius: '8px',
                        background: '#FAF9F6',
                        color: '#202923',
                        border: '1px solid #E7E8E2',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      Profile
                    </button>
                    <button
                      type="button"
                      disabled={!worker.isAvailable}
                      onClick={() => openBookingModal(worker)}
                      style={{
                        padding: '9px',
                        borderRadius: '8px',
                        background: worker.isAvailable ? '#247A52' : '#E7E8E2',
                        color: worker.isAvailable ? '#FFFFFF' : '#8E9992',
                        fontSize: '13px',
                        fontWeight: '700',
                        cursor: worker.isAvailable ? 'pointer' : 'not-allowed',
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
      </div>

      {/* Worker Detail Modal */}
      {selectedWorker && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(32, 41, 35, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px',
          }}
        >
          <div
            style={{
              maxWidth: '540px',
              width: '100%',
              background: '#FFFFFF',
              border: '1px solid #E7E8E2',
              borderRadius: '16px',
              padding: '32px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#202923', margin: 0 }}>
                  {selectedWorker.userId?.name}
                </h2>
                {selectedWorker.isVerified && (
                  <span style={{ color: '#247A52', fontSize: '13px', fontWeight: '700', background: '#E8F2EA', padding: '2px 8px', borderRadius: '4px' }}>
                    ✓ Verified
                  </span>
                )}
              </div>
              <button onClick={() => setSelectedWorker(null)} style={{ color: '#69736D', fontSize: '20px', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <div style={{ fontSize: '14px', color: '#247A52', textTransform: 'capitalize', fontWeight: '600', marginBottom: '16px' }}>
              {selectedWorker.category.replace('_', ' ')} • ₹{selectedWorker.hourlyRate}/hour • 📍 {selectedWorker.locality}
            </div>

            <p style={{ fontSize: '14px', color: '#4B554F', lineHeight: '1.6', marginBottom: '20px' }}>
              {selectedWorker.bio}
            </p>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#202923', marginBottom: '8px', textTransform: 'uppercase' }}>
                Specialized Trade Skills:
              </h4>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {selectedWorker.skills?.map((s, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '12px',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: '#E8F2EA',
                      color: '#247A52',
                      border: '1px solid #BCD9BF',
                      fontWeight: '600',
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setSelectedWorker(null)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  background: '#FAF9F6',
                  border: '1px solid #E7E8E2',
                  color: '#69736D',
                  fontSize: '13px',
                  fontWeight: '600',
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
                  padding: '9px 22px',
                  borderRadius: '8px',
                  background: '#247A52',
                  color: '#FFFFFF',
                  fontWeight: '700',
                  fontSize: '13px',
                }}
              >
                Proceed to Book ➔
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
            background: 'rgba(32, 41, 35, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px',
          }}
        >
          <div
            style={{
              maxWidth: '520px',
              width: '100%',
              background: '#FFFFFF',
              border: '1px solid #E7E8E2',
              borderRadius: '16px',
              padding: '32px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#202923', margin: 0 }}>
                  Request Booking
                </h2>
                <div style={{ fontSize: '13px', color: '#69736D', marginTop: '2px' }}>
                  Booking {bookingWorker.userId?.name} ({bookingWorker.category.replace('_', ' ')})
                </div>
              </div>
              <button onClick={() => setBookingWorker(null)} style={{ color: '#69736D', fontSize: '20px', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            {bookingStatus.error && (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: '#FEE2E2',
                  border: '1px solid #FECDD3',
                  color: '#B91C1C',
                  fontSize: '13px',
                  marginBottom: '16px',
                }}
              >
                {bookingStatus.error}
              </div>
            )}

            {bookingStatus.success ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: '42px', marginBottom: '10px' }}>🎉</div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#247A52' }}>
                  Booking Request Sent!
                </h3>
                <p style={{ fontSize: '14px', color: '#69736D', marginTop: '6px' }}>
                  Redirecting to your bookings dashboard...
                </p>
              </div>
            ) : (
              <form onSubmit={submitBooking} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#202923', marginBottom: '6px' }}>
                    Job Description & Specific Requirements
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe the issue or required job in detail..."
                    value={bookingForm.jobDescription}
                    onChange={(e) => setBookingForm({ ...bookingForm, jobDescription: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: '#FAF9F6',
                      border: '1px solid #E7E8E2',
                      color: '#202923',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#202923', marginBottom: '6px' }}>
                    Service Locality / Address
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="House/Door No., Street, Locality"
                    value={bookingForm.locality}
                    onChange={(e) => setBookingForm({ ...bookingForm, locality: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: '#FAF9F6',
                      border: '1px solid #E7E8E2',
                      color: '#202923',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#202923', marginBottom: '6px' }}>
                      Scheduled Date
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
                        background: '#FAF9F6',
                        border: '1px solid #E7E8E2',
                        color: '#202923',
                        fontSize: '13px',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#202923', marginBottom: '6px' }}>
                      Preferred Time
                    </label>
                    <select
                      value={bookingForm.scheduledTime}
                      onChange={(e) => setBookingForm({ ...bookingForm, scheduledTime: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        background: '#FAF9F6',
                        border: '1px solid #E7E8E2',
                        color: '#202923',
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                    <span style={{ color: '#69736D', fontWeight: '600' }}>Estimated Duration:</span>
                    <span style={{ fontWeight: '700', color: '#202923' }}>{bookingForm.estimatedHours} Hours</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={bookingForm.estimatedHours}
                    onChange={(e) => setBookingForm({ ...bookingForm, estimatedHours: e.target.value })}
                    style={{ width: '100%', accentColor: '#247A52' }}
                  />
                </div>

                {/* Live Cost Summary */}
                <div
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    background: '#E8F2EA',
                    border: '1px solid #BCD9BF',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ fontSize: '13px', color: '#202923', fontWeight: '600' }}>
                    Estimated Total ({bookingForm.estimatedHours}h × ₹{bookingWorker.hourlyRate}):
                  </span>
                  <span style={{ fontSize: '20px', fontWeight: '800', color: '#247A52' }}>
                    ₹{bookingForm.estimatedHours * bookingWorker.hourlyRate}
                  </span>
                </div>

                <div style={{ fontSize: '12px', color: '#69736D', lineHeight: '1.4' }}>
                  🤝 <strong>Direct Payment:</strong> Settle payment directly with the worker via cash or UPI upon satisfied completion.
                </div>

                <button
                  type="submit"
                  disabled={bookingStatus.loading}
                  style={{
                    marginTop: '8px',
                    padding: '12px',
                    borderRadius: '8px',
                    background: '#247A52',
                    color: '#FFFFFF',
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(36, 122, 82, 0.25)',
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
