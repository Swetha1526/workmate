import { useState, useEffect } from 'react';
import api from '../services/api.js';
import { ChatModal } from '../components/ChatModal.jsx';

export const WorkerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChatBooking, setActiveChatBooking] = useState(null);

  const fetchWorkerBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings/worker-bookings');
      if (res.data.success) {
        setBookings(res.data.bookings);
      }
    } catch (err) {
      console.error('Failed to load worker bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkerBookings();
  }, []);

  const handleUpdateStatus = async (bookingId, newStatus, note = '') => {
    try {
      const res = await api.patch(`/bookings/${bookingId}/status`, {
        status: newStatus,
        note,
      });
      if (res.data.success) {
        fetchWorkerBookings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update job status.');
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', text: 'Pending Your Decision' },
      accepted: { color: '#60a5fa', bg: 'rgba(59, 130, 246, 0.15)', text: 'Accepted' },
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
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '6px' }}>
          Job Requests & Bookings
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '14px' }}>
          Accept or manage booking requests from customers and contractors
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>Loading assigned jobs...</div>
      ) : bookings.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center', maxWidth: '480px', margin: '40px auto' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔧</div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>No Job Requests Yet</h3>
          <p style={{ fontSize: '14px', color: '#9ca3af' }}>
            New booking requests from customers will appear here in real time. Ensure your profile is set to "Available".
          </p>
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
                      Customer: {booking.customerId?.name || 'Customer'}
                    </h3>
                    <span
                      style={{
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        fontWeight: '700',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        color: '#9ca3af',
                      }}
                    >
                      {booking.customerId?.customerType || 'Individual'}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#9ca3af' }}>
                    Scheduled: <strong>{new Date(booking.scheduledDate).toLocaleDateString()}</strong> at{' '}
                    <strong>{booking.scheduledTime}</strong> ({booking.estimatedHours} hrs)
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#10b981' }}>
                      ₹{booking.totalEstimatedCost}
                    </div>
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                      (₹{booking.hourlyRate}/hr × {booking.estimatedHours}h)
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
                  <strong>Service Locality:</strong> {booking.locality}
                </div>
                <div style={{ color: '#d1d5db', marginBottom: '4px' }}>
                  <strong>Job Scope:</strong> {booking.jobDescription}
                </div>
                {booking.customerId?.phone && (
                  <div style={{ color: '#60a5fa' }}>
                    <strong>Customer Contact:</strong> {booking.customerId.phone}
                  </div>
                )}
              </div>

              {/* Actions */}
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

                {booking.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(booking._id, 'accepted', 'Accepted by worker')}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        background: '#10b981',
                        color: '#fff',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      ✓ Accept Job
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(booking._id, 'rejected', 'Declined by worker')}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        background: 'rgba(239, 68, 68, 0.2)',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      ✕ Decline
                    </button>
                  </>
                )}

                {booking.status === 'accepted' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(booking._id, 'in_progress', 'Started job on site')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: 'var(--accent)',
                      color: '#fff',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    🚀 Start Work (In-Progress)
                  </button>
                )}

                {booking.status === 'in_progress' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(booking._id, 'completed', 'Work completed on site')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: '#10b981',
                      color: '#fff',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    ✓ Mark Job Completed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Real-time Chat Modal */}
      {activeChatBooking && (
        <ChatModal
          bookingId={activeChatBooking._id}
          partnerName={activeChatBooking.customerId?.name || 'Customer'}
          onClose={() => setActiveChatBooking(null)}
        />
      )}
    </div>
  );
};
