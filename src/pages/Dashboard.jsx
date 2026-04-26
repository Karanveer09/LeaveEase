import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyLeaves } from '../services/leaveService';
import { getIncomingRequests } from '../services/substitutionService';
import { getHolidays, getSaturdayOverrides } from '../services/adminService';
import { 
  FileText, 
  Clock, 
  Inbox, 
  CheckCircle2, 
  PlusCircle, 
  Calendar,
  AlertCircle,
  User,
  Palmtree,
  CalendarDays,
  Bell
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ leaves: 0, pending: 0, incoming: 0, accepted: 0 });
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const refresh = () => {
      fetchDashboardData();
    };

    const intervalId = setInterval(refresh, 10000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [leaves, incoming, h, o] = await Promise.all([
        getMyLeaves(user._id),
        getIncomingRequests(user._id),
        getHolidays(),
        getSaturdayOverrides()
      ]);

      setStats({
        leaves: leaves.length,
        pending: leaves.filter(l => l.status === 'pending' || l.status === 'partially_covered').length,
        incoming: incoming.filter(r => r.status === 'pending').length,
        accepted: incoming.filter(r => r.status === 'accepted').length
      });

      setRecentLeaves(leaves.slice(0, 5));
      setRecentRequests(incoming.filter(r => r.status === 'pending').slice(0, 5));
      
      const today = new Date().toISOString().split('T')[0];
      setHolidays(h.filter(holiday => holiday.date >= today).slice(0, 3));
      setOverrides(o.filter(override => override.date >= today).slice(0, 3));
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
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-container">
          <div className="spinner-lg"></div>
          <p style={{ marginTop: '1rem', fontWeight: 600 }}>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header animate-in" style={{ textAlign: 'left' }}>
        <h1 className="page-title accent">{getGreeting()}, {user.name.split(' ').pop()}</h1>
        <p className="page-subtitle">{user.department} Department — Here's your leave overview</p>
      </div>

      {/* Announcements */}
      {(holidays.length > 0 || overrides.length > 0) && (
        <div className="animate-in" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
            <Bell size={18} />
            <span style={{ fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Announcements</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {holidays.map(h => (
              <div key={h._id} style={{ background: 'rgba(5, 150, 105, 0.05)', border: '1px solid rgba(5, 150, 105, 0.1)', padding: '1rem', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', background: 'rgba(5, 150, 105, 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                  <Palmtree size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#059669', fontSize: '0.95rem' }}>Public Holiday: {h.reason}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDate(h.date)}</div>
                </div>
              </div>
            ))}
            {overrides.map(o => (
              <div key={o._id} style={{ background: 'rgba(217, 119, 6, 0.05)', border: '1px solid rgba(217, 119, 6, 0.1)', padding: '1rem', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', background: 'rgba(217, 119, 6, 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
                  <CalendarDays size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#d97706', fontSize: '0.95rem' }}>Working Saturday</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDate(o.date)} — Follows {o.followsDay}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card animate-in stagger-1">
          <div className="stat-icon" style={{ color: 'var(--accent-primary)', background: 'rgba(91, 126, 149, 0.1)' }}>
            <FileText size={20} />
          </div>
          <div className="stat-value">{stats.leaves}</div>
          <div className="stat-label">Total Applications</div>
        </div>
        <div className="stat-card animate-in stagger-2">
          <div className="stat-icon" style={{ color: '#d97706', background: 'rgba(245, 158, 11, 0.1)' }}>
            <Clock size={20} />
          </div>
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-label">Pending Coverage</div>
        </div>
        <div className="stat-card animate-in stagger-3">
          <div className="stat-icon" style={{ color: '#dc2626', background: 'rgba(239, 68, 68, 0.1)' }}>
            <Inbox size={20} />
          </div>
          <div className="stat-value">{stats.incoming}</div>
          <div className="stat-label">Incoming Requests</div>
        </div>
        <div className="stat-card animate-in stagger-4">
          <div className="stat-icon" style={{ color: '#059669', background: 'rgba(16, 185, 129, 0.1)' }}>
            <CheckCircle2 size={20} />
          </div>
          <div className="stat-value">{stats.accepted}</div>
          <div className="stat-label">Substitutions Accepted</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', flexWrap: 'wrap' }} className="animate-in stagger-2">
        <Link to="/apply-leave" className="btn btn-primary btn-lg" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <PlusCircle size={20} /> Apply for Leave
        </Link>
        <Link to="/incoming-requests" className="btn btn-outline btn-lg" style={{ background: 'white', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Inbox size={20} /> View Incoming Requests {stats.incoming > 0 && <span style={{ background: 'var(--accent-primary)', color: 'white', padding: '2px 8px', borderRadius: '12px', marginLeft: '4px', fontSize: '0.8rem' }}>{stats.incoming}</span>}
        </Link>
      </div>

      {/* Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
        {/* Recent Leaves */}
        <div className="card-flat animate-in stagger-3">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ color: 'var(--accent-primary)', display: 'flex' }}><FileText size={22} /></span> Recent Leave Applications
          </h2>
          {recentLeaves.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <p className="empty-state-text" style={{ marginBottom: '1.5rem' }}>No leave applications yet</p>
              <Link to="/apply-leave" className="btn btn-outline btn-sm">Apply for Leave</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                      {leave.lecturesOnLeave.length} lecture(s) — {leave.reason.substring(0, 35)}
                      {leave.reason.length > 35 ? '...' : ''}
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
        <div className="card-flat animate-in stagger-4">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ color: 'var(--accent-primary)', display: 'flex' }}><Inbox size={22} /></span> Pending Substitution Requests
          </h2>
          {recentRequests.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <p className="empty-state-text">No pending requests</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentRequests.map(req => (
                <Link
                  key={req._id}
                  to="/incoming-requests"
                  className="teacher-card"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="teacher-info">
                    <div className="teacher-avatar" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--accent-primary)' }}>
                      <User size={18} />
                    </div>
                    <div>
                      <div className="teacher-name">{req.fromTeacher?.name}</div>
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
