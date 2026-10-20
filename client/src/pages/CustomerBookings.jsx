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
      pending: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', text: 'Pending Confirmation' },
      accepted: { color: '#60a5fa', bg: 'rgba(59, 130, 246, 0.15)', text: 'Accepted by Worker' },
      in_progress: { color: '#c084fc', bg: 'rgba(192, 132, 252, 0.15)', text: 'In Progress' },
      completed: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', text: 'Completed' },
      cancelled: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', text: 'Cancelled' },
      rejected: { color: '#9ca3af', bg: 'rgba(156, 163, 175, 0.15)', text: 'Declined' },
    };
    const s = map[status] || { color: '#fff', bg: '#333', text: status };
    return (
      <span
        style={{
          padding: '4px 10px',
          borderRadius: '9999px',
          fontSize: '12px',
          fontWeight: '700',
          color: s.color,
          background: s.bg,
          border: `1px solid ${s.color}40`,
        }}
      >
        {s.text}
      </span>
    );
  };

  return (
    <div className="container" style={{ padding: '32px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '6px' }}>My Bookings</h1>
          <p style={{ color: '#9ca3af', fontSize: '14px' }}>
            Track the status of your requested trade service jobs and communicate with workers in real time
          </p>
        </div>
        <Link
          to="/discovery"
          style={{
            padding: '10px 18px',
            borderRadius: '8px',
            background: 'var(--primary)',
            color: '#fff',
            fontSize: '13px',
            fontWeight: '600',
          }}
        >
          + Book Another Worker
        </Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>Loading your bookings...</div>
      ) : bookings.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', maxWidth: '480px', margin: '40px auto' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📋</div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>No Bookings Yet</h3>
          <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '24px' }}>
            You haven't requested any trade workers yet. Browse our verified categories to find help.
          </p>
          <Link
            to="/discovery"
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--primary), var(--accent))',
              color: '#fff',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            Explore Workers
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {bookings.map((booking) => (
            <div key={booking._id} className="glass-panel" style={{ padding: '20px' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '12px',
                  marginBottom: '14px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '17px', fontWeight: '700' }}>
                      {booking.workerUserId?.name || 'Worker'}
                    </h3>
                    <span
                      style={{
                        fontSize: '12px',
                        color: '#60a5fa',
                        textTransform: 'capitalize',
                        background: 'rgba(59, 130, 246, 0.1)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      {booking.category.replace('_', ' ')}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#9ca3af' }}>
                    Scheduled for: <strong>{new Date(booking.scheduledDate).toLocaleDateString()}</strong> at{' '}
                    <strong>{booking.scheduledTime}</strong> ({booking.estimatedHours} hrs)
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#10b981' }}>
                      ₹{booking.totalEstimatedCost}
                    </div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                      {booking.paymentStatus === 'paid_direct' ? '✅ Paid Direct' : 'Direct Payment Pending'}
                    </div>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>
              </div>

              {/* Job Details */}
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: 'rgba(0,0,0,0.25)',
                  fontSize: '13px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ color: '#9ca3af', marginBottom: '4px' }}>
                  <strong>Address:</strong> {booking.locality}
                </div>
                <div style={{ color: '#d1d5db' }}>
                  <strong>Description:</strong> {booking.jobDescription}
                </div>
                {booking.cancellationReason && (
                  <div style={{ color: '#ef4444', marginTop: '6px' }}>
                    <strong>Cancellation Reason:</strong> {booking.cancellationReason}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setActiveChatBooking(booking)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: 'rgba(59, 130, 246, 0.2)',
                    color: '#60a5fa',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>💬</span> Real-Time Chat
                </button>

                {['pending', 'accepted'].includes(booking.status) && (
                  <button
                    type="button"
                    onClick={() => handleCancelBooking(booking._id)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: '#ef4444',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
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
                      borderRadius: '8px',
                      background: 'rgba(16, 185, 129, 0.2)',
                      color: '#10b981',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Mark Direct Payment Done
                  </button>
                )}

                {booking.status === 'completed' && (
                  <button
                    type="button"
                    onClick={() => setReviewBooking(booking)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: '#fff',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    ⭐ Rate & Review
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
