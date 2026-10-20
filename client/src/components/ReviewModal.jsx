import { useState } from 'react';
import api from '../services/api.js';

export const ReviewModal = ({ booking, onClose, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setError('Please provide comments regarding your service experience.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await api.post('/reviews', {
        bookingId: booking._id,
        rating: Number(rating),
        comment: comment.trim(),
      });

      if (res.data.success) {
        alert('Thank you! Your review and rating have been posted.');
        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: '16px',
      }}
    >
      <div className="glass-panel" style={{ maxWidth: '460px', width: '100%', padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700' }}>Review Completed Service</h2>
            <div style={{ fontSize: '12px', color: '#9ca3af' }}>
              Worker: {booking.workerUserId?.name} ({booking.category.replace('_', ' ')})
            </div>
          </div>
          <button onClick={onClose} style={{ color: '#9ca3af', fontSize: '20px', cursor: 'pointer' }}>
            ✕
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '10px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Star Rating Picker */}
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
              Overall Rating:
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  style={{
                    fontSize: '28px',
                    cursor: 'pointer',
                    filter: star <= rating ? 'none' : 'grayscale(100%) opacity(30%)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px' }}>
              Your Feedback & Experience:
            </label>
            <textarea
              required
              rows={4}
              placeholder="How was the worker's punctuality, skill level, and professionalism?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 16px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.06)',
                color: '#d1d5db',
                fontSize: '13px',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '9px 20px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#fff',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              {submitting ? 'Publishing...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
