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
      pending: { color: 'var(--status-pending)', bg: 'var(--status-pending-bg)', border: '#FDE68A', text: 'Pending Decision' },
      accepted: { color: 'var(--status-accepted)', bg: 'var(--status-accepted-bg)', border: '#BFDBFE', text: 'Accepted' },
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
      {/* Title */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-charcoal)', letterSpacing: '-0.5px', marginBottom: '4px' }}>
          Job Requests & Bookings
        </h1>
        <p style={{ color: 'var(--text-slate)', fontSize: '14px' }}>
          Review incoming client requests, update real-time job progress, and chat directly with customers
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-slate)' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
          Loading assigned jobs...
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
          <div style={{ fontSize: '44px', marginBottom: '16px' }}>🔧</div>
          <h3 style={{ fontSize: '19px', fontWeight: '700', color: 'var(--text-charcoal)', marginBottom: '8px' }}>
            No Job Requests Yet
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-slate)', lineHeight: '1.6' }}>
            New booking requests from customers in your locality will appear here in real time. Ensure your profile is marked as "Available" to receive leads.
          </p>
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
                      Customer: {booking.customerId?.name || 'Customer'}
                    </h3>
                    <span
                      style={{
                        fontSize: '11px',
                        textTransform: 'uppercase',
                        fontWeight: '700',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-xs)',
                        background: 'var(--accent-sage)',
                        color: 'var(--primary-forest)',
                        border: '1px solid var(--accent-sage-border)',
                      }}
                    >
                      {booking.customerId?.customerType || 'Individual'}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-slate)' }}>
                    Scheduled:{' '}
                    <strong style={{ color: 'var(--text-charcoal)' }}>
                      {new Date(booking.scheduledDate).toLocaleDateString()}
                    </strong>{' '}
                    at <strong style={{ color: 'var(--text-charcoal)' }}>{booking.scheduledTime}</strong> (
                    {booking.estimatedHours} {booking.estimatedHours === 1 ? 'hr' : 'hrs'})
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary-forest)' }}>
                      ₹{booking.totalEstimatedCost}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-slate)', marginTop: '2px' }}>
                      (₹{booking.hourlyRate}/hr × {booking.estimatedHours}h)
                    </div>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>
              </div>

              {/* Job Scope & Customer Details */}
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
                <div style={{ color: 'var(--text-charcoal)', marginBottom: booking.customerId?.phone ? '4px' : '0' }}>
                  <strong style={{ color: 'var(--text-charcoal)' }}>Job Scope:</strong> {booking.jobDescription}
                </div>
                {booking.customerId?.phone && (
                  <div style={{ color: 'var(--primary-forest)', marginTop: '4px', fontWeight: '500' }}>
                    <strong>Direct Contact:</strong> {booking.customerId.phone}
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

                {booking.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(booking._id, 'accepted', 'Accepted by worker')}
                      style={{
                        padding: '8px 18px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--primary-forest)',
                        color: '#fff',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'background var(--transition-fast)',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.background = 'var(--primary-forest-hover)')}
                      onMouseOut={(e) => (e.currentTarget.style.background = 'var(--primary-forest)')}
                    >
                      ✓ Accept Job
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStatus(booking._id, 'rejected', 'Declined by worker')}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-sm)',
                        background: 'var(--status-danger-bg)',
                        color: 'var(--status-danger)',
                        border: '1px solid #FECACA',
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
                      padding: '8px 18px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--status-progress-bg)',
                      color: 'var(--status-progress)',
                      border: '1px solid #DDD6FE',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>⚡</span> Start Work (In-Progress)
                  </button>
                )}

                {booking.status === 'in_progress' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(booking._id, 'completed', 'Work completed on site')}
                    style={{
                      padding: '8px 18px',
                      borderRadius: 'var(--radius-sm)',
                      background: 'var(--status-completed-bg)',
                      color: 'var(--status-completed)',
                      border: '1px solid #BBF7D0',
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
