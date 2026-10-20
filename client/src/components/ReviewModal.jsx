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
        background: 'rgba(32, 41, 35, 0.45)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: '16px',
      }}
    >
      <div
        className="card-surface"
        style={{
          maxWidth: '480px',
          width: '100%',
          padding: '30px',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-modal)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-charcoal)', letterSpacing: '-0.4px', marginBottom: '4px' }}>
              Review Completed Service
            </h2>
            <div style={{ fontSize: '13px', color: 'var(--text-slate)' }}>
              Worker: <strong style={{ color: 'var(--text-charcoal)' }}>{booking.workerUserId?.name}</strong> (
              {booking.category.replace('_', ' ')})
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close review dialog"
            style={{
              color: 'var(--text-slate)',
              fontSize: '18px',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 'var(--radius-sm)',
              background: 'transparent',
            }}
          >
            ✕
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--status-danger-bg)',
              border: '1px solid #FECACA',
              color: 'var(--status-danger)',
              fontSize: '13px',
              marginBottom: '16px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Star Rating Picker */}
          <div>
            <label className="form-label">
              Overall Rating ({rating} of 5 stars):
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  style={{
                    fontSize: '28px',
                    cursor: 'pointer',
                    filter: star <= rating ? 'none' : 'grayscale(100%) opacity(30%)',
                    transition: 'transform 0.15s ease, filter 0.15s ease',
                    transform: star <= rating ? 'scale(1.05)' : 'scale(0.95)',
                  }}
                >
                  ⭐
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label">
              Your Feedback & Experience
            </label>
            <textarea
              required
              rows={4}
              className="form-input"
              placeholder="How was the worker's punctuality, trade skill, communication, and professionalism?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary"
            >
              {submitting ? 'Publishing...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
