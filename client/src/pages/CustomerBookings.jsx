import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api.js';
import { ChatModal } from '../components/ChatModal.jsx';
import { ReviewModal } from '../components/ReviewModal.jsx';

export const CustomerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChatBooking, setActiveChatBooking] = useState(null);
  const [reviewBooking, setReviewBooking] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings/my-bookings');
      if (res.data.success) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    const reason = prompt('Please enter cancellation reason:');
    if (!reason || !reason.trim()) return;

    try {
      const res = await api.patch(`/bookings/${bookingId}/status`, {
        status: 'cancelled',
        cancellationReason: reason.trim(),
      });
      if (res.data.success) {
        fetchBookings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  const handleMarkPaymentDirect = async (bookingId) => {
    if (!confirm('Confirm you have directly settled payment with the worker via cash or UPI?')) return;
    try {
      const res = await api.patch(`/bookings/${bookingId}/payment`);
      if (res.data.success) {
        fetchBookings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record payment.');
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: { color: 'var(--status-pending)', bg: 'var(--status-pending-bg)', border: '#FDE68A', text: 'Pending Confirmation' },
      accepted: { color: 'var(--status-accepted)', bg: 'var(--status-accepted-bg)', border: '#BFDBFE', text: 'Accepted by Worker' },
      in_progress: { color: 'var(--status-progress)', bg: 'var(--status-progress-bg)', border: '#DDD6FE', text: 'In Progress' },
      completed: { color: 'var(--status-completed)', bg: 'var(--status-completed-bg)', border: '#BBF7D0', text: 'Completed' },
      cancelled: { color: 'var(--status-danger)', bg: 'var(--status-danger-bg)', border: '#FECACA', text: 'Cancelled' },
      rejected: { color: '#4B5563', bg: '#F3F4F6', border: '#E5E7EB', text: 'Declined' },
    };
    const s = map[status] || { color: 'var(--text-charcoal)', bg: 'var(--surface-subtle)', border: 'var(--border-warm)', text: status };
    return (
      <span
        style={{
          padding: '4px 12px',
          borderRadius: 'var(--radius-full)',
          fontSize: '12px',
          fontWeight: '700',
          color: s.color,
          background: s.bg,
          border: `1px solid ${s.border}`,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
        }}
      >
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: s.color }}></span>
        {s.text}
      </span>
    );
  };

  return (
    <div className="container" style={{ padding: '36px 20px', maxWidth: '1000px' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-charcoal)', letterSpacing: '-0.5px', marginBottom: '4px' }}>
            My Bookings
          </h1>
          <p style={{ color: 'var(--text-slate)', fontSize: '14px' }}>
            Track your requested trade jobs, communicate in real time, and confirm completed services
          </p>
        </div>
        <Link
          to="/discovery"
          className="btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
          }}
        >
          <span>+</span> Book Another Worker
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-slate)' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
          Loading your bookings...
        </div>
      ) : bookings.length === 0 ? (
        <div
          className="card-surface"
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            maxWidth: '520px',
            margin: '40px auto',
          }}
        >
          <div style={{ fontSize: '44px', marginBottom: '16px' }}>📋</div>
          <h3 style={{ fontSize: '19px', fontWeight: '700', color: 'var(--text-charcoal)', marginBottom: '8px' }}>
            No Bookings Yet
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-slate)', lineHeight: '1.6', marginBottom: '24px' }}>
            You haven't requested any trade workers yet. Browse our verified categories to find experienced local help.
          </p>
          <Link to="/discovery" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>
            Explore Verified Workers
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="card-surface"
              style={{
                padding: '24px',
                borderRadius: 'var(--radius-md)',
              }}
            >
              {/* Top Row: Worker, Category, Schedule, and Cost/Status */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '16px',
                  marginBottom: '16px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-charcoal)' }}>
                      {booking.workerUserId?.name || 'Worker'}
                    </h3>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: 'var(--primary-forest)',
                        textTransform: 'capitalize',
                        background: 'var(--accent-sage)',
                        border: '1px solid var(--accent-sage-border)',
                        padding: '2px 10px',
                        borderRadius: 'var(--radius-full)',
                      }}
                    >
                      {booking.category.replace('_', ' ')}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-slate)' }}>
                    Scheduled for:{' '}
                    <strong style={{ color: 'var(--text-charcoal)' }}>
                      {new Date(booking.scheduledDate).toLocaleDateString()}
                    </strong>{' '}
                    at <strong style={{ color: 'var(--text-charcoal)' }}>{booking.scheduledTime}</strong> (
                    {booking.estimatedHours} {booking.estimatedHours === 1 ? 'hour' : 'hours'})
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary-forest)' }}>
                      ₹{booking.totalEstimatedCost}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-slate)', marginTop: '2px' }}>
                      {booking.paymentStatus === 'paid_direct' ? (
                        <span style={{ color: 'var(--status-completed)', fontWeight: '600' }}>
                          ✓ Direct Payment Settled
                        </span>
                      ) : (
                        <span>Direct Cash / UPI on site</span>
                      )}
                    </div>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>
              </div>

              {/* Job Details Card */}
              <div
                style={{
                  padding: '14px 18px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface-subtle)',
                  border: '1px solid var(--border-warm)',
                  fontSize: '13px',
                  marginBottom: '18px',
                  lineHeight: '1.5',
                }}
              >
                <div style={{ color: 'var(--text-slate)', marginBottom: '4px' }}>
                  <strong style={{ color: 'var(--text-charcoal)' }}>Service Locality:</strong> {booking.locality}
                </div>
                <div style={{ color: 'var(--text-charcoal)' }}>
                  <strong style={{ color: 'var(--text-charcoal)' }}>Job Scope:</strong> {booking.jobDescription}
                </div>
                {booking.cancellationReason && (
                  <div style={{ color: 'var(--status-danger)', marginTop: '8px', fontWeight: '500' }}>
                    <strong>Cancellation Note:</strong> {booking.cancellationReason}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => setActiveChatBooking(booking)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--accent-sage)',
                    color: 'var(--primary-forest)',
                    border: '1px solid var(--accent-sage-border)',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = 'var(--accent-sage-dark)')}
                  onMouseOut={(e) => (e.currentTarget.style.background = 'var(--accent-sage)')}
                >
                  <span>💬</span> Real-Time Chat
                </button>

                {['pending', 'accepted'].includes(booking.status) && (
                  <button
                    type="button"
                    onClick={() => handleCancelBooking(booking._id)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--status-danger-bg)',
                      color: 'var(--status-danger)',
                      border: '1px solid #FECACA',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    Cancel Booking
                  </button>
                )}

                {booking.status === 'completed' && booking.paymentStatus !== 'paid_direct' && (
                  <button
                    type="button"
                    onClick={() => handleMarkPaymentDirect(booking._id)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--status-completed-bg)',
                      color: 'var(--status-completed)',
                      border: '1px solid #BBF7D0',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    ✓ Mark Direct Payment Done
                  </button>
                )}

                {booking.status === 'completed' && (
                  <button
                    type="button"
                    onClick={() => setReviewBooking(booking)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: 'var(--radius-sm)',
                      background: '#FEF3C7',
                      color: '#B45309',
                      border: '1px solid #FDE68A',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <span>⭐</span> Rate & Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Real-Time Chat Modal */}
      {activeChatBooking && (
        <ChatModal
          bookingId={activeChatBooking._id}
          partnerName={activeChatBooking.workerUserId?.name || 'Worker'}
          onClose={() => setActiveChatBooking(null)}
        />
      )}

      {/* Rate & Review Modal */}
      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onSuccess={() => {
            setReviewBooking(null);
            fetchBookings();
          }}
        />
      )}
    </div>
  );
};
