import { useState, useEffect } from 'react';
import './App.css';

const CATEGORIES = [
  { id: 'plumbers', name: 'Plumbers', icon: '🔧', desc: 'Pipes, leaks, fittings & sanitary works' },
  { id: 'electricians', name: 'Electricians', icon: '⚡', desc: 'Wiring, switches, fixtures & power backups' },
  { id: 'carpenters', name: 'Carpenters', icon: '🪚', desc: 'Furniture repairs, woodwork & installations' },
  { id: 'ac_mechanics', name: 'AC Mechanics', icon: '❄️', desc: 'AC servicing, gas refills & duct repairs' },
  { id: 'welders', name: 'Welders', icon: '🔥', desc: 'Gates, grills, fabrication & structural welding' },
  { id: 'fitters', name: 'Fitters', icon: '🔩', desc: 'Machinery assembly, alignment & plant maintenance' },
  { id: 'drivers', name: 'Drivers', icon: '🚗', desc: 'Hourly personal & commercial transport drivers' },
  { id: 'helpers', name: 'Helpers', icon: '📦', desc: 'Loading, moving, event assistance & manual labor' },
  { id: 'masons', name: 'Masons', icon: '🧱', desc: 'Brickwork, plastering, tiling & structural civil jobs' },
  { id: 'mason_helpers', name: 'Mason Helpers', icon: '👷', desc: 'Mortar mixing, material shifting & civil support' },
];

const PHASES = [
  { num: 'Phase 1', title: 'Authentication & Roles', items: ['JWT + bcrypt security', 'Customer (Ind/Biz) & Worker roles', 'Protected routes & refresh logic'] },
  { num: 'Phase 2', title: 'Worker Profiles', items: ['Rates, skills & experience', 'Locality & availability toggle', 'Admin verification badge'] },
  { num: 'Phase 3', title: 'Worker Discovery', items: ['Category & locality search', 'Hourly rate & rating filters', 'Responsive cards & pagination'] },
  { num: 'Phase 4', title: 'Booking Lifecycle', items: ['Booking request workflow', 'Accept / Reject actions', 'Pending, In-Progress, Completed'] },
  { num: 'Phase 5', title: 'Real-Time Chat', items: ['Socket.IO authenticated rooms', 'Typing indicators & read receipts', 'MongoDB message persistence'] },
  { num: 'Phase 6', title: 'Reviews & Admin', items: ['Post-completion worker reviews', 'Admin dashboard & metrics', 'Account suspension controls'] },
];

function App() {
  const [apiStatus, setApiStatus] = useState('checking'); // 'online' | 'offline' | 'checking'
  const [apiData, setApiData] = useState(null);
  const [pingLatency, setPingLatency] = useState(null);

  const checkBackendHealth = async () => {
    setApiStatus('checking');
    const startTime = performance.now();
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${apiUrl}/health`);
      if (response.ok) {
        const data = await response.json();
        const latency = Math.round(performance.now() - startTime);
        setApiData(data);
        setPingLatency(latency);
        setApiStatus('online');
      } else {
        setApiStatus('offline');
      }
    } catch {
      setApiStatus('offline');
      setApiData(null);
    }
  };

  useEffect(() => {
    checkBackendHealth();
  }, []);

  return (
    <div className="app-wrapper">
      {/* Navbar */}
      <header className="navbar">
        <div className="brand">
          <div className="brand-icon">🛠️</div>
          <div>
            <span className="brand-title">WorkMate</span>
          </div>
          <span className="brand-badge">GUVI Capstone</span>
        </div>

        <div className="nav-actions">
          <div className="status-pill">
            <span className={`status-dot ${apiStatus === 'online' ? 'online' : apiStatus === 'offline' ? 'offline' : 'connecting'}`}></span>
            <span>
              Backend: {apiStatus === 'online' ? `Online (${pingLatency}ms)` : apiStatus === 'offline' ? 'Offline (Run Server)' : 'Checking...'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container">
        {/* Hero */}
        <section className="hero-section">
          <div className="hero-tagline">
            <span>⚡ MERN Stack + Socket.IO Marketplace</span>
          </div>
          <h1 className="hero-headline">
            On-Demand Hourly Worker Hiring Marketplace
          </h1>
          <p className="hero-subtext">
            Connecting local customers & businesses with verified hourly trade professionals: plumbers, electricians, carpenters, welders, and daily-wage workers.
          </p>

          {/* System Status Monitor */}
          <div className="glass-panel monitor-card animate-fade-in">
            <div className="monitor-header">
              <div className="monitor-title">
                <span>🖥️ Environment & Service Diagnostics</span>
              </div>
              <button onClick={checkBackendHealth} className="ping-btn" type="button">
                ↻ Re-check Backend
              </button>
            </div>

            <div className="monitor-grid">
              <div className="monitor-metric">
                <div className="metric-label">Frontend (Vite + React)</div>
                <div className="metric-value" style={{ color: '#10b981' }}>Active (Port 5173)</div>
              </div>
              <div className="monitor-metric">
                <div className="metric-label">Backend (Express API)</div>
                <div className="metric-value" style={{ color: apiStatus === 'online' ? '#10b981' : '#f59e0b' }}>
                  {apiStatus === 'online' ? `Connected (Port 5000)` : 'Not Started Yet'}
                </div>
              </div>
              <div className="monitor-metric">
                <div className="metric-label">Node Runtime</div>
                <div className="metric-value">v24.19.0 (Verified)</div>
              </div>
              <div className="monitor-metric">
                <div className="metric-label">Database Target</div>
                <div className="metric-value">MongoDB Atlas (M0)</div>
              </div>
            </div>

            {apiStatus === 'offline' && (
              <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '8px', fontSize: '13px' }}>
                💡 <strong>Tip to start backend:</strong> Open a second PowerShell terminal in <code>workmate/server</code> and run: <code>npm run dev</code>
              </div>
            )}

            {apiStatus === 'online' && apiData && (
              <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '8px', fontSize: '13px' }}>
                ✅ <strong>API Connected!</strong> Server uptime: <code>{apiData.uptime}</code> • Endpoint: <code>/api/health</code>
              </div>
            )}
          </div>
        </section>

        {/* Worker Categories */}
        <section className="categories-section">
          <h2 className="section-title">Covered Trade Worker Categories</h2>
          <p className="section-sub">10 essential blue-collar & trade categories supported by the platform</p>
          <div className="category-grid">
            {CATEGORIES.map((cat) => (
              <div key={cat.id} className="glass-panel category-card">
                <div className="category-emoji">{cat.icon}</div>
                <div className="category-name">{cat.name}</div>
                <div className="category-desc">{cat.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Capstone Implementation Roadmap */}
        <section className="roadmap-section">
          <h2 className="section-title">Capstone Development Roadmap</h2>
          <p className="section-sub">Systematic step-by-step milestone delivery</p>
          <div className="roadmap-grid">
            {PHASES.map((phase, idx) => (
              <div key={idx} className="glass-panel roadmap-card">
                <div className="phase-number">{phase.num}</div>
                <div className="phase-name">{phase.title}</div>
                <ul className="phase-items">
                  {phase.items.map((item, itemIdx) => (
                    <li key={itemIdx}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>WorkMate — GUVI MERN Stack Capstone Project • Ready for Milestone Execution</p>
      </footer>
    </div>
  );
}

export default App;
