import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { CATEGORIES } from './Discovery.jsx';

export const Home = () => {
  const navigate = useNavigate();

  const [apiStatus, setApiStatus] = useState('checking');
  const [apiData, setApiData] = useState(null);
  const [pingLatency, setPingLatency] = useState(null);

  const checkBackendHealth = async () => {
    setApiStatus('checking');
    const startTime = performance.now();
    try {
      const res = await api.get('/health');
      const latency = Math.round(performance.now() - startTime);
      setApiData(res.data);
      setPingLatency(latency);
      setApiStatus('online');
    } catch {
      setApiStatus('offline');
      setApiData(null);
    }
  };

  useEffect(() => {
    checkBackendHealth();
  }, []);

  const handleCategoryClick = (catId) => {
    navigate(`/discovery?category=${catId}`);
  };

  return (
    <div className="container" style={{ padding: '32px 16px 64px' }}>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-tagline">
          <span>⚡ MERN Stack + Socket.IO On-Demand Marketplace</span>
        </div>
        <h1 className="hero-headline">
          Hire Verified Hourly Trade Workers in Your Locality
        </h1>
        <p className="hero-subtext">
          Directly connect with certified plumbers, electricians, carpenters, AC mechanics, welders, and daily-wage trade professionals.
        </p>

        {/* Live System Diagnostics Monitor */}
        <div className="glass-panel monitor-card animate-fade-in" style={{ margin: '0 auto 48px' }}>
          <div className="monitor-header">
            <div className="monitor-title">
              <span>🖥️ Platform & Cloud Database Diagnostics</span>
            </div>
            <button onClick={checkBackendHealth} className="ping-btn" type="button">
              ↻ Re-check Status
            </button>
          </div>

          <div className="monitor-grid">
            <div className="monitor-metric">
              <div className="metric-label">Frontend (Vite + React 19)</div>
              <div className="metric-value" style={{ color: '#10b981' }}>Active (Port 5173)</div>
            </div>
            <div className="monitor-metric">
              <div className="metric-label">Backend (Express + Sockets)</div>
              <div className="metric-value" style={{ color: apiStatus === 'online' ? '#10b981' : '#f59e0b' }}>
                {apiStatus === 'online' ? `Online (${pingLatency}ms)` : 'Connecting...'}
              </div>
            </div>
            <div className="monitor-metric">
              <div className="metric-label">Database Status</div>
              <div className="metric-value" style={{ color: apiData?.database === 'connected' ? '#10b981' : '#f59e0b' }}>
                {apiData?.database === 'connected' ? `Atlas (${apiData.databaseName})` : 'Connecting...'}
              </div>
            </div>
            <div className="monitor-metric">
              <div className="metric-label">Platform Security</div>
              <div className="metric-value" style={{ color: '#60a5fa' }}>JWT + bcryptjs</div>
            </div>
          </div>
        </div>
      </section>

      {/* Trade Worker Categories Section */}
      <section className="categories-section" style={{ marginBottom: '64px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 className="section-title">Essential Trade Worker Categories</h2>
          <p className="section-sub">
            Click any trade category below to browse verified workers and live hourly rates
          </p>
        </div>

        <div className="category-grid">
          {CATEGORIES.filter((c) => c.id !== 'all').map((cat) => (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              className="glass-panel category-card"
              style={{
                cursor: 'pointer',
                transition: 'all 0.25s ease',
              }}
            >
              <div className="category-emoji">{cat.icon}</div>
              <div className="category-name">{cat.name}</div>
              <div className="category-desc">Browse local {cat.name.toLowerCase()} & compare hourly rates ➔</div>
            </div>
          ))}
        </div>
      </section>

      {/* How WorkMate Works Section */}
      <section style={{ marginBottom: '48px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h2 className="section-title">How WorkMate Operates</h2>
          <p className="section-sub">Simple, transparent, on-demand hiring without hidden commission cuts</p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '20px',
          }}
        >
          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🔎</div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>1. Discover</h3>
            <p style={{ fontSize: '13px', color: '#9ca3af' }}>
              Search across 10 trade categories by locality, hourly rates, and verified customer reviews.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>📅</div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>2. Request Booking</h3>
            <p style={{ fontSize: '13px', color: '#9ca3af' }}>
              Specify your job requirements, locality, scheduled date, and estimated duration.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>💬</div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>3. Real-Time Chat</h3>
            <p style={{ fontSize: '13px', color: '#9ca3af' }}>
              Coordinate directly through authenticated Socket.IO rooms with typing indicators and read receipts.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🤝</div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px' }}>4. Pay Direct</h3>
            <p style={{ fontSize: '13px', color: '#9ca3af' }}>
              No intermediary payment holds. Pay workers directly via cash or UPI upon satisfied job completion.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
