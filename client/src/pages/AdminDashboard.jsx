import { useState, useEffect } from 'react';
import api from '../services/api.js';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('metrics'); // 'metrics' | 'workers' | 'users'
  const [metrics, setMetrics] = useState(null);
  const [workers, setWorkers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters for users
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');

  const fetchMetrics = async () => {
    try {
      const res = await api.get('/admin/metrics');
      if (res.data.success) {
        setMetrics(res.data.metrics);
      }
    } catch (err) {
      console.error('Failed to load admin metrics:', err);
    }
  };

  const fetchWorkers = async () => {
    try {
      const res = await api.get('/admin/workers');
      if (res.data.success) {
        setWorkers(res.data.workers);
      }
    } catch (err) {
      console.error('Failed to load workers:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (userRoleFilter !== 'all') params.append('role', userRoleFilter);
      if (userSearch) params.append('search', userSearch);

      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([fetchMetrics(), fetchWorkers(), fetchUsers()]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleToggleVerification = async (workerId, currentStatus) => {
    const notes = prompt('Enter admin verification note / license check summary:', 'Verified credentials and trade experience');
    if (notes === null) return;

    try {
      const res = await api.patch(`/workers/${workerId}/verify`, {
        isVerified: !currentStatus,
        verificationNotes: notes,
      });
      if (res.data.success) {
        alert(res.data.message);
        fetchWorkers();
        fetchMetrics();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Verification update failed.');
    }
  };

  const handleToggleUserStatus = async (userId, currentActive) => {
    const action = currentActive ? 'suspend' : 'activate';
    if (!confirm(`Are you sure you want to ${action} this account?`)) return;

    try {
      const res = await api.patch(`/admin/users/${userId}/status`, {
        isActive: !currentActive,
      });
      if (res.data.success) {
        alert(res.data.message);
        fetchUsers();
        fetchMetrics();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  return (
    <div className="container" style={{ padding: '32px 16px' }}>
      {/* Title */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{ fontSize: '24px' }}>🛡️</span>
          <h1 style={{ fontSize: '28px', fontWeight: '800' }}>Administrative Control Console</h1>
        </div>
        <p style={{ color: '#9ca3af', fontSize: '14px' }}>
          Live platform health, trade worker verification approvals, and user governance
        </p>
      </div>

      {/* Metric Cards Row */}
      {metrics && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '4px' }}>
              Platform Users
            </div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#fff' }}>
              {metrics.users.total}
            </div>
            <div style={{ fontSize: '12px', color: '#60a5fa', marginTop: '4px' }}>
              {metrics.users.customers} Customers ({metrics.users.individual} Ind / {metrics.users.business} Biz)
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '4px' }}>
              Trade Workers
            </div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#10b981' }}>
              {metrics.workers.total}
            </div>
            <div style={{ fontSize: '12px', color: '#34d399', marginTop: '4px' }}>
              {metrics.workers.verified} Verified Badge • {metrics.workers.unverified} Pending
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '4px' }}>
              Total Bookings
            </div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#c084fc' }}>
              {metrics.bookings.total}
            </div>
            <div style={{ fontSize: '12px', color: '#a78bfa', marginTop: '4px' }}>
              {metrics.bookings.completed} Completed Jobs ({metrics.reviews.total} Reviews)
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '4px' }}>
              Gross Platform Volume
            </div>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#f59e0b' }}>
              ₹{metrics.bookings.grossPlatformVolume}
            </div>
            <div style={{ fontSize: '12px', color: '#fbbf24', marginTop: '4px' }}>
              Direct Customer-Worker Settlements
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '24px',
          paddingBottom: '8px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('metrics')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            background: activeTab === 'metrics' ? 'rgba(168, 85, 247, 0.2)' : 'none',
            color: activeTab === 'metrics' ? '#c084fc' : '#9ca3af',
            border: activeTab === 'metrics' ? '1px solid rgba(168, 85, 247, 0.4)' : 'none',
          }}
        >
          📊 Booking Status Breakdown
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('workers')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            background: activeTab === 'workers' ? 'rgba(59, 130, 246, 0.2)' : 'none',
            color: activeTab === 'workers' ? '#60a5fa' : '#9ca3af',
            border: activeTab === 'workers' ? '1px solid rgba(59, 130, 246, 0.4)' : 'none',
          }}
        >
          👷 Worker Verifications ({workers.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            background: activeTab === 'users' ? 'rgba(16, 185, 129, 0.2)' : 'none',
            color: activeTab === 'users' ? '#34d399' : '#9ca3af',
            border: activeTab === 'users' ? '1px solid rgba(16, 185, 129, 0.4)' : 'none',
          }}
        >
          👥 User Governance ({users.length})
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9ca3af' }}>Loading admin data...</div>
      ) : activeTab === 'metrics' && metrics ? (
        <div className="glass-panel" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px' }}>
            Booking Workflow Status Distribution
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '14px',
            }}
          >
            {Object.entries(metrics.bookings.statusBreakdown).map(([st, cnt]) => (
              <div
                key={st}
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '12px', color: '#9ca3af', textTransform: 'capitalize', marginBottom: '6px' }}>
                  {st.replace('_', ' ')}
                </div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#fff' }}>{cnt}</div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'workers' ? (
        <div className="glass-panel" style={{ padding: '20px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: '#9ca3af' }}>
                <th style={{ padding: '12px 8px' }}>Worker Name</th>
                <th style={{ padding: '12px 8px' }}>Category</th>
                <th style={{ padding: '12px 8px' }}>Locality</th>
                <th style={{ padding: '12px 8px' }}>Rate</th>
                <th style={{ padding: '12px 8px' }}>Jobs</th>
                <th style={{ padding: '12px 8px' }}>Status</th>
                <th style={{ padding: '12px 8px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((w) => (
                <tr key={w._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{ padding: '12px 8px', fontWeight: '600' }}>
                    {w.userId?.name || 'Worker'}
                    {w.isDemo && (
                      <span style={{ marginLeft: '6px', fontSize: '10px', color: '#facc15' }}>[DEMO]</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 8px', textTransform: 'capitalize' }}>
                    {w.category.replace('_', ' ')}
                  </td>
                  <td style={{ padding: '12px 8px' }}>{w.locality}</td>
                  <td style={{ padding: '12px 8px', color: '#10b981', fontWeight: '700' }}>₹{w.hourlyRate}/h</td>
                  <td style={{ padding: '12px 8px' }}>{w.completedJobs}</td>
                  <td style={{ padding: '12px 8px' }}>
                    {w.isVerified ? (
                      <span style={{ color: '#10b981', fontWeight: '700' }}>✓ Verified</span>
                    ) : (
                      <span style={{ color: '#f59e0b' }}>Pending</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => handleToggleVerification(w._id, w.isVerified)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        background: w.isVerified ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
                        color: w.isVerified ? '#ef4444' : '#10b981',
                        border: `1px solid ${w.isVerified ? '#ef444440' : '#10b98140'}`,
                      }}
                    >
                      {w.isVerified ? 'Revoke Badge' : 'Approve & Verify'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div>
          {/* User Filter Controls */}
          <div
            style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '16px',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <input
              type="text"
              placeholder="Search user name or email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                fontSize: '13px',
                width: '260px',
              }}
            />

            <select
              value={userRoleFilter}
              onChange={(e) => {
                setUserRoleFilter(e.target.value);
              }}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                background: '#111827',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                fontSize: '13px',
              }}
            >
              <option value="all">All Roles</option>
              <option value="customer">Customer Only</option>
              <option value="worker">Worker Only</option>
              <option value="admin">Admin Only</option>
            </select>

            <button
              onClick={fetchUsers}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                background: 'var(--primary)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Apply Filter
            </button>
          </div>

          <div className="glass-panel" style={{ padding: '20px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: '#9ca3af' }}>
                  <th style={{ padding: '12px 8px' }}>Name</th>
                  <th style={{ padding: '12px 8px' }}>Email</th>
                  <th style={{ padding: '12px 8px' }}>Phone</th>
                  <th style={{ padding: '12px 8px' }}>Role</th>
                  <th style={{ padding: '12px 8px' }}>Account Status</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px 8px', fontWeight: '600' }}>{u.name}</td>
                    <td style={{ padding: '12px 8px', color: '#9ca3af' }}>{u.email}</td>
                    <td style={{ padding: '12px 8px' }}>{u.phone}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <span
                        style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          background:
                            u.role === 'admin'
                              ? 'rgba(168, 85, 247, 0.2)'
                              : u.role === 'worker'
                              ? 'rgba(59, 130, 246, 0.2)'
                              : 'rgba(16, 185, 129, 0.2)',
                          color:
                            u.role === 'admin'
                              ? '#c084fc'
                              : u.role === 'worker'
                              ? '#60a5fa'
                              : '#34d399',
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <span style={{ color: u.isActive ? '#10b981' : '#ef4444', fontWeight: '700' }}>
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                      {u.role !== 'admin' && (
                        <button
                          type="button"
                          onClick={() => handleToggleUserStatus(u._id, u.isActive)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            background: u.isActive ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: u.isActive ? '#ef4444' : '#10b981',
                            border: `1px solid ${u.isActive ? '#ef444430' : '#10b98130'}`,
                          }}
                        >
                          {u.isActive ? 'Suspend' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
