import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { CATEGORIES } from './Discovery.jsx';

export const Home = () => {
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [localityQuery, setLocalityQuery] = useState('');
  const [featuredWorkers, setFeaturedWorkers] = useState([]);
  const [loadingWorkers, setLoadingWorkers] = useState(true);

  useEffect(() => {
    const fetchFeaturedWorkers = async () => {
      try {
        const res = await api.get('/workers?limit=3&isVerified=true');
        if (res.data.success) {
          setFeaturedWorkers(res.data.workers);
        }
      } catch (err) {
        console.error('Failed to load featured workers:', err);
      } finally {
        setLoadingWorkers(false);
      }
    };

    fetchFeaturedWorkers();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedCategory && selectedCategory !== 'all') params.append('category', selectedCategory);
    if (localityQuery.trim()) params.append('locality', localityQuery.trim());
    navigate(`/discovery?${params.toString()}`);
  };

  const handleCategoryClick = (catId) => {
    navigate(`/discovery?category=${catId}`);
  };

  return (
    <div style={{ backgroundColor: '#FAF9F6', minHeight: '100vh' }}>
      {/* Hero Section */}
      <section className="container" style={{ padding: '64px 20px 48px', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 16px',
            background: '#E8F2EA',
            border: '1px solid #BCD9BF',
            borderRadius: '9999px',
            color: '#247A52',
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '20px',
            letterSpacing: '0.2px',
          }}
        >
          <span>🌱 Verified Local Trade Professionals</span>
        </div>

        <h1
          style={{
            fontSize: '48px',
            fontWeight: '800',
            lineHeight: '1.16',
            letterSpacing: '-1.2px',
            color: '#202923',
            maxWidth: '780px',
            margin: '0 auto 16px',
          }}
        >
          Skilled local hands for your hourly home and trade jobs.
        </h1>

        <p
          style={{
            fontSize: '18px',
            color: '#69736D',
            maxWidth: '620px',
            margin: '0 auto 36px',
            lineHeight: '1.6',
          }}
        >
          Directly connect with certified plumbers, electricians, carpenters, AC mechanics, welders, and daily-wage trade professionals in your neighborhood.
        </p>

        {/* Prominent Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          style={{
            maxWidth: '780px',
            margin: '0 auto 48px',
            background: '#FFFFFF',
            border: '1px solid #E7E8E2',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(32, 41, 35, 0.06)',
            padding: '10px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              flex: 1,
              minWidth: '200px',
              display: 'flex',
              flexDirection: 'column',
              padding: '8px 14px',
              background: '#FAF9F6',
              borderRadius: '8px',
              border: '1px solid #E7E8E2',
              textAlign: 'left',
            }}
          >
            <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#69736D', letterSpacing: '0.5px', marginBottom: '2px' }}>
              Service Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#202923',
                fontSize: '14px',
                fontWeight: '600',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              flex: 1,
              minWidth: '200px',
              display: 'flex',
              flexDirection: 'column',
              padding: '8px 14px',
              background: '#FAF9F6',
              borderRadius: '8px',
              border: '1px solid #E7E8E2',
              textAlign: 'left',
            }}
          >
            <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#69736D', letterSpacing: '0.5px', marginBottom: '2px' }}>
              Operating Locality
            </label>
            <input
              type="text"
              placeholder="e.g. T. Nagar, Velachery..."
              value={localityQuery}
              onChange={(e) => setLocalityQuery(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#202923',
                fontSize: '14px',
                fontWeight: '500',
                outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              padding: '16px 30px',
              borderRadius: '10px',
              background: '#247A52',
              color: '#FFFFFF',
              fontSize: '15px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(36, 122, 82, 0.25)',
              transition: 'background 0.15s ease',
            }}
          >
            Search Workers
          </button>
        </form>
      </section>

      {/* 10 Category Tiles */}
      <section className="container" style={{ padding: '0 20px 64px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#202923', letterSpacing: '-0.5px', marginBottom: '8px' }}>
            Browse by Trade Category
          </h2>
          <p style={{ fontSize: '15px', color: '#69736D' }}>
            Click on any trade below to explore live profiles, hourly rates, and verified reviews
          </p>
        </div>

        <div className="category-grid">
          {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className="category-card"
            >
              <div className="category-emoji">{cat.icon}</div>
              <div className="category-name">{cat.name}</div>
              <div className="category-desc">Compare verified {cat.name.toLowerCase()} & book directly ➔</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Workers Section (from MongoDB) */}
      <section style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #E7E8E2', borderBottom: '1px solid #E7E8E2', padding: '64px 20px' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '36px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: '#247A52', letterSpacing: '0.6px', marginBottom: '4px' }}>
                Verified Professionals
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#202923', letterSpacing: '-0.5px' }}>
                Featured Trade Workers Available Now
              </h2>
            </div>
            <button
              onClick={() => navigate('/discovery')}
              style={{
                fontSize: '14px',
                fontWeight: '700',
                color: '#247A52',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
            >
              View all workers ➔
            </button>
          </div>

          {loadingWorkers ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#69736D' }}>Loading top rated workers...</div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '24px',
              }}
            >
              {featuredWorkers.map((worker) => (
                <div
                  key={worker._id}
                  style={{
                    background: '#FAF9F6',
                    border: '1px solid #E7E8E2',
                    borderRadius: '14px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 2px 6px rgba(32, 41, 35, 0.04)',
                    transition: 'all 0.2s ease',
                  }}
                >
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
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#202923', margin: 0 }}>
                          {worker.userId?.name}
                        </h3>
                        {worker.isVerified && (
                          <span style={{ color: '#247A52', fontSize: '14px', fontWeight: '800' }} title="Verified Profile">
                            ✓
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '13px', color: '#69736D', textTransform: 'capitalize' }}>
                        {worker.category.replace('_', ' ')} • {worker.experienceYears} yrs exp
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      background: '#FFFFFF',
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

                  <div style={{ fontSize: '12px', color: '#69736D', marginBottom: '12px' }}>
                    📍 {worker.locality}
                  </div>

                  <p
                    style={{
                      fontSize: '13px',
                      color: '#4B554F',
                      lineHeight: '1.45',
                      marginBottom: '16px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {worker.bio}
                  </p>

                  <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => navigate(`/discovery?category=${worker.category}`)}
                      style={{
                        flex: 1,
                        padding: '9px',
                        borderRadius: '8px',
                        background: '#247A52',
                        color: '#FFFFFF',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                      }}
                    >
                      Book Worker ➔
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3-Step Process: Discover -> Book -> Complete */}
      <section className="container" style={{ padding: '64px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#202923', letterSpacing: '-0.5px', marginBottom: '8px' }}>
            How WorkMate Works
          </h2>
          <p style={{ fontSize: '15px', color: '#69736D' }}>
            Three simple steps to hiring verified trade professionals for your hourly requirements
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
          }}
        >
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E7E8E2',
              borderRadius: '14px',
              padding: '32px 24px',
              textAlign: 'center',
              boxShadow: '0 2px 6px rgba(32, 41, 35, 0.04)',
            }}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: '#E8F2EA',
                color: '#247A52',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                margin: '0 auto 16px',
                fontWeight: '800',
              }}
            >
              1
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#202923', marginBottom: '8px' }}>
              Discover & Compare
            </h3>
            <p style={{ fontSize: '14px', color: '#69736D', lineHeight: '1.5' }}>
              Filter by 10 trade categories, operating locality, transparent hourly rates, and genuine customer feedback.
            </p>
          </div>

          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E7E8E2',
              borderRadius: '14px',
              padding: '32px 24px',
              textAlign: 'center',
              boxShadow: '0 2px 6px rgba(32, 41, 35, 0.04)',
            }}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: '#E8F2EA',
                color: '#247A52',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                margin: '0 auto 16px',
                fontWeight: '800',
              }}
            >
              2
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#202923', marginBottom: '8px' }}>
              Book & Chat in Real Time
            </h3>
            <p style={{ fontSize: '14px', color: '#69736D', lineHeight: '1.5' }}>
              Set your preferred schedule and estimated hours. Coordinate job details directly via authenticated Socket.IO chat.
            </p>
          </div>

          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E7E8E2',
              borderRadius: '14px',
              padding: '32px 24px',
              textAlign: 'center',
              boxShadow: '0 2px 6px rgba(32, 41, 35, 0.04)',
            }}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: '#E8F2EA',
                color: '#247A52',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                margin: '0 auto 16px',
                fontWeight: '800',
              }}
            >
              3
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#202923', marginBottom: '8px' }}>
              Complete & Pay Direct
            </h3>
            <p style={{ fontSize: '14px', color: '#69736D', lineHeight: '1.5' }}>
              No intermediary payment cuts or holds. Settle directly with the worker via cash or UPI upon satisfied job completion.
            </p>
          </div>
        </div>
      </section>

      {/* Trust & Safety Section */}
      <section style={{ backgroundColor: '#E8F2EA', padding: '48px 20px', borderTop: '1px solid #BCD9BF', borderBottom: '1px solid #BCD9BF' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
          <div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#202923', marginBottom: '6px' }}>
              🔒 Trust, Safety & Transparent Pricing
            </h3>
            <p style={{ fontSize: '14px', color: '#4B554F', maxWidth: '640px' }}>
              All worker accounts undergo administrator verification checks. Hourly rates are clearly agreed before arrival with zero platform markups.
            </p>
          </div>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              background: '#247A52',
              color: '#FFFFFF',
              fontSize: '14px',
              fontWeight: '700',
              boxShadow: '0 2px 8px rgba(36, 122, 82, 0.25)',
              cursor: 'pointer',
            }}
          >
            Create Your Account ➔
          </button>
        </div>
      </section>
    </div>
  );
};
