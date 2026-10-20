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
    const notes = prompt(
      'Enter administrative verification note / license check summary:',
      'Verified credentials and active trade experience'
    );
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
    <div className="container" style={{ padding: '36px 20px', maxWidth: '1100px' }}>
      {/* Title */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
          <span style={{ fontSize: '26px' }}>🛡️</span>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-charcoal)', letterSpacing: '-0.5px' }}>
            Administrative Control Console
          </h1>
        </div>
        <p style={{ color: 'var(--text-slate)', fontSize: '14px' }}>
          Live platform health, trade worker verification approvals, and account governance
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
          <div className="card-surface" style={{ padding: '22px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-slate)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.4px', marginBottom: '6px' }}>
              Platform Users
            </div>
            <div style={{ fontSize: '30px', fontWeight: '800', color: 'var(--text-charcoal)' }}>
              {metrics.users.total}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-slate)', marginTop: '6px' }}>
              {metrics.users.customers} Customers ({metrics.users.individual} Ind / {metrics.users.business} Biz)
            </div>
          </div>

          <div className="card-surface" style={{ padding: '22px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-slate)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.4px', marginBottom: '6px' }}>
              Trade Workers
            </div>
            <div style={{ fontSize: '30px', fontWeight: '800', color: 'var(--primary-forest)' }}>
              {metrics.workers.total}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--primary-forest)', marginTop: '6px', fontWeight: '600' }}>
              {metrics.workers.verified} Verified • {metrics.workers.unverified} Pending
            </div>
          </div>

          <div className="card-surface" style={{ padding: '22px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-slate)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.4px', marginBottom: '6px' }}>
              Total Bookings
            </div>
            <div style={{ fontSize: '30px', fontWeight: '800', color: 'var(--status-progress)' }}>
              {metrics.bookings.total}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-slate)', marginTop: '6px' }}>
              {metrics.bookings.completed} Completed ({metrics.reviews.total} Reviews)
            </div>
          </div>

          <div className="card-surface" style={{ padding: '22px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-slate)', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.4px', marginBottom: '6px' }}>
              Gross Platform Volume
            </div>
            <div style={{ fontSize: '30px', fontWeight: '800', color: '#B45309' }}>
              ₹{metrics.bookings.grossPlatformVolume}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-slate)', marginTop: '6px' }}>
              Direct Customer-Worker Settlements
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid var(--border-warm)',
          marginBottom: '24px',
          paddingBottom: '8px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('metrics')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            background: activeTab === 'metrics' ? 'var(--accent-sage)' : 'transparent',
            color: activeTab === 'metrics' ? 'var(--primary-forest)' : 'var(--text-slate)',
            border: activeTab === 'metrics' ? '1px solid var(--accent-sage-border)' : '1px solid transparent',
            transition: 'all var(--transition-fast)',
          }}
        >
          📊 Booking Status Breakdown
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('workers')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            background: activeTab === 'workers' ? 'var(--accent-sage)' : 'transparent',
            color: activeTab === 'workers' ? 'var(--primary-forest)' : 'var(--text-slate)',
            border: activeTab === 'workers' ? '1px solid var(--accent-sage-border)' : '1px solid transparent',
            transition: 'all var(--transition-fast)',
          }}
        >
          👷 Worker Verifications ({workers.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('users')}
          style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-sm)',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            background: activeTab === 'users' ? 'var(--accent-sage)' : 'transparent',
            color: activeTab === 'users' ? 'var(--primary-forest)' : 'var(--text-slate)',
            border: activeTab === 'users' ? '1px solid var(--accent-sage-border)' : '1px solid transparent',
            transition: 'all var(--transition-fast)',
          }}
        >
          👥 User Governance ({users.length})
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '64px', color: 'var(--text-slate)' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
          Loading administrative console...
        </div>
      ) : activeTab === 'metrics' && metrics ? (
        <div className="card-surface" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-charcoal)', marginBottom: '18px' }}>
            Booking Workflow Status Distribution
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '14px',
            }}
          >
            {Object.entries(metrics.bookings.statusBreakdown).map(([st, cnt]) => (
              <div
                key={st}
                style={{
                  padding: '18px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--surface-subtle)',
                  border: '1px solid var(--border-warm)',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '12px', color: 'var(--text-slate)', textTransform: 'capitalize', fontWeight: '600', marginBottom: '6px' }}>
                  {st.replace('_', ' ')}
                </div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-charcoal)' }}>{cnt}</div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'workers' ? (
        <div className="card-surface" style={{ padding: '8px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--surface-subtle)', borderBottom: '1px solid var(--border-warm)', color: 'var(--text-slate)' }}>
                <th style={{ padding: '12px 14px', fontWeight: '700' }}>Worker Name</th>
                <th style={{ padding: '12px 14px', fontWeight: '700' }}>Category</th>
                <th style={{ padding: '12px 14px', fontWeight: '700' }}>Locality</th>
                <th style={{ padding: '12px 14px', fontWeight: '700' }}>Rate</th>
                <th style={{ padding: '12px 14px', fontWeight: '700' }}>Jobs</th>
                <th style={{ padding: '12px 14px', fontWeight: '700' }}>Verification</th>
                <th style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '700' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((w) => (
                <tr
                  key={w._id}
                  style={{ borderBottom: '1px solid var(--border-warm)', transition: 'background var(--transition-fast)' }}
                  onMouseOver={(e) => (e.currentTarget.style.background = 'var(--surface-subtle)')}
                  onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '12px 14px', fontWeight: '600', color: 'var(--text-charcoal)' }}>
                    {w.userId?.name || 'Worker'}
                    {w.isDemo && (
                      <span
                        style={{
                          marginLeft: '6px',
                          fontSize: '10px',
                          fontWeight: '700',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: '#FEF3C7',
                          color: '#B45309',
                        }}
                      >
                        DEMO
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px 14px', textTransform: 'capitalize', color: 'var(--text-charcoal)' }}>
                    {w.category.replace('_', ' ')}
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-slate)' }}>{w.locality}</td>
                  <td style={{ padding: '12px 14px', color: 'var(--primary-forest)', fontWeight: '700' }}>
                    ₹{w.hourlyRate}/h
                  </td>
                  <td style={{ padding: '12px 14px', color: 'var(--text-charcoal)' }}>{w.completedJobs}</td>
                  <td style={{ padding: '12px 14px' }}>
                    {w.isVerified ? (
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '11px',
                          fontWeight: '700',
                          background: 'var(--accent-sage)',
                          color: 'var(--primary-forest)',
                          border: '1px solid var(--accent-sage-border)',
                        }}
                      >
                        ✓ Verified
                      </span>
                    ) : (
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '11px',
                          fontWeight: '700',
                          background: 'var(--status-pending-bg)',
                          color: 'var(--status-pending)',
                          border: '1px solid #FDE68A',
                        }}
                      >
                        Pending
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => handleToggleVerification(w._id, w.isVerified)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        background: w.isVerified ? 'var(--status-danger-bg)' : 'var(--accent-sage)',
                        color: w.isVerified ? 'var(--status-danger)' : 'var(--primary-forest)',
                        border: `1px solid ${w.isVerified ? '#FECACA' : 'var(--accent-sage-border)'}`,
                        transition: 'all var(--transition-fast)',
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
              className="form-input"
              style={{ width: '280px' }}
            />

            <select
              value={userRoleFilter}
              onChange={(e) => {
                setUserRoleFilter(e.target.value);
              }}
              className="form-input"
              style={{ width: '160px', cursor: 'pointer' }}
            >
              <option value="all">All Roles</option>
              <option value="customer">Customer Only</option>
              <option value="worker">Worker Only</option>
              <option value="admin">Admin Only</option>
            </select>

            <button
              onClick={fetchUsers}
              className="btn-primary"
              style={{ padding: '9px 18px', fontSize: '13px' }}
            >
              Filter Users
            </button>
          </div>

          <div className="card-surface" style={{ padding: '8px', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--surface-subtle)', borderBottom: '1px solid var(--border-warm)', color: 'var(--text-slate)' }}>
                  <th style={{ padding: '12px 14px', fontWeight: '700' }}>Name</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700' }}>Email</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700' }}>Phone</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700' }}>Role</th>
                  <th style={{ padding: '12px 14px', fontWeight: '700' }}>Account Status</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right', fontWeight: '700' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u._id}
                    style={{ borderBottom: '1px solid var(--border-warm)', transition: 'background var(--transition-fast)' }}
                    onMouseOver={(e) => (e.currentTarget.style.background = 'var(--surface-subtle)')}
                    onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '12px 14px', fontWeight: '600', color: 'var(--text-charcoal)' }}>{u.name}</td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-slate)' }}>{u.email}</td>
                    <td style={{ padding: '12px 14px', color: 'var(--text-charcoal)' }}>{u.phone}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-xs)',
                          fontSize: '11px',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          background:
                            u.role === 'admin'
                              ? 'var(--status-progress-bg)'
                              : u.role === 'worker'
                              ? 'var(--accent-sage)'
                              : 'var(--surface-subtle)',
                          color:
                            u.role === 'admin'
                              ? 'var(--status-progress)'
                              : u.role === 'worker'
                              ? 'var(--primary-forest)'
                              : 'var(--text-charcoal)',
                          border: `1px solid ${
                            u.role === 'admin'
                              ? '#DDD6FE'
                              : u.role === 'worker'
                              ? 'var(--accent-sage-border)'
                              : 'var(--border-warm)'
                          }`,
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          color: u.isActive ? 'var(--status-completed)' : 'var(--status-danger)',
                          fontWeight: '700',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: u.isActive ? 'var(--status-completed)' : 'var(--status-danger)',
                          }}
                        ></span>
                        {u.isActive ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      {u.role !== 'admin' && (
                        <button
                          type="button"
                          onClick={() => handleToggleUserStatus(u._id, u.isActive)}
                          style={{
                            padding: '4px 12px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            background: u.isActive ? 'var(--status-danger-bg)' : 'var(--accent-sage)',
                            color: u.isActive ? 'var(--status-danger)' : 'var(--primary-forest)',
                            border: `1px solid ${u.isActive ? '#FECACA' : 'var(--accent-sage-border)'}`,
                            transition: 'all var(--transition-fast)',
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
