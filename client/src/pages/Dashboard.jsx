import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ leaves: 0, pending: 0, incoming: 0, accepted: 0 });
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [leavesRes, incomingRes] = await Promise.all([
        api.get('/leaves/my'),
        api.get('/substitutions/incoming')
      ]);

      const leaves = leavesRes.data;
      const incoming = incomingRes.data;

      setStats({
        leaves: leaves.length,
        pending: leaves.filter(l => l.status === 'pending' || l.status === 'partially_covered').length,
        incoming: incoming.filter(r => r.status === 'pending').length,
        accepted: incoming.filter(r => r.status === 'accepted').length
      });

      setRecentLeaves(leaves.slice(0, 5));
      setRecentRequests(incoming.filter(r => r.status === 'pending').slice(0, 5));
      setLoading(false);
    } catch (err) {
      console.error('Dashboard load error:', err);
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="spinner spinner-lg"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header animate-in">
        <h1 className="page-title">{getGreeting()}, {user.name.split(' ').pop()} 👋</h1>
        <p className="page-subtitle">{user.department} Department — Here's your leave overview</p>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card purple animate-in stagger-1">
          <div className="stat-icon">📄</div>
          <div className="stat-value">{stats.leaves}</div>
          <div className="stat-label">Total Leave Applications</div>
        </div>
        <div className="stat-card blue animate-in stagger-2">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending Coverage</div>
        </div>
        <div className="stat-card red animate-in stagger-3">
          <div className="stat-icon">📨</div>
          <div className="stat-value">{stats.incoming}</div>
          <div className="stat-label">Incoming Requests</div>
        </div>
        <div className="stat-card green animate-in stagger-4">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{stats.accepted}</div>
          <div className="stat-label">Substitutions Accepted</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <Link to="/apply-leave" className="btn btn-primary btn-lg">
          ✏️ Apply for Leave
        </Link>
        <Link to="/incoming-requests" className="btn btn-outline btn-lg">
          📨 View Incoming Requests {stats.incoming > 0 && `(${stats.incoming})`}
        </Link>
      </div>

      {/* Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Recent Leaves */}
        <div className="card-flat animate-in">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>
            📄 Recent Leave Applications
          </h2>
          {recentLeaves.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <p className="empty-state-text">No leave applications yet</p>
              <Link to="/apply-leave" className="btn btn-primary btn-sm">Apply for Leave</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentLeaves.map(leave => (
                <Link
                  key={leave._id}
                  to={`/leave/${leave._id}`}
                  className="teacher-card"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div>
                    <div className="teacher-name">{formatDate(leave.date)}</div>
                    <div className="teacher-dept">
                      {leave.lecturesOnLeave.length} lecture(s) — {leave.reason.substring(0, 40)}
                      {leave.reason.length > 40 ? '...' : ''}
                    </div>
                  </div>
                  <span className={`badge badge-${leave.status}`}>
                    {leave.status.replace('_', ' ')}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Incoming Requests */}
        <div className="card-flat animate-in">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem' }}>
            📨 Pending Substitution Requests
          </h2>
          {recentRequests.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <p className="empty-state-text">No pending requests</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentRequests.map(req => (
                <Link
                  key={req._id}
                  to="/incoming-requests"
                  className="teacher-card"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="teacher-info">
                    <div className="teacher-avatar">
                      {req.fromTeacher.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div className="teacher-name">{req.fromTeacher.name}</div>
                      <div className="teacher-dept">
                        Slot {req.lectureSlot} — {req.subject} — {formatDate(req.date)}
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-pending">Pending</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
