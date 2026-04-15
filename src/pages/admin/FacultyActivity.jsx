import { useEffect, useState } from 'react';
import { getAllTeachers } from '../../services/authService';
import { Activity, Clock, User, AlertCircle } from 'lucide-react';

export default function FacultyActivity() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const allTeachers = await getAllTeachers();
        // Sort by last active descending (newest first), nulls at bottom
        allTeachers.sort((a, b) => {
          if (!a.lastActive) return 1;
          if (!b.lastActive) return -1;
          return new Date(b.lastActive) - new Date(a.lastActive);
        });
        setTeachers(allTeachers);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTeachers();
  }, []);

  const formatLastActive = (dateString) => {
    if (!dateString) return 'Never logged in';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const isOnline = (dateString) => {
    if (!dateString) return false;
    const diffMins = Math.floor((new Date() - new Date(dateString)) / 60000);
    return diffMins < 10; // Consider online if active in last 10 mins
  };

  return (
    <div className="page-container animate-in">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'flex-start' }}>
        <div style={{ padding: '0.5rem', background: 'rgba(216, 124, 36, 0.1)', color: 'var(--accent-primary)', borderRadius: '0.5rem' }}>
          <Activity size={24} />
        </div>
        <div style={{ textAlign: 'left' }}>
          <h1 className="page-title" style={{ margin: 0 }}>Faculty Activity</h1>
          <p className="page-subtitle" style={{ margin: 0, marginTop: '0.2rem' }}>Track recent logins and online status</p>
        </div>
      </div>

      <div className="glass-card shadow-sm">
        {loading ? (
          <div className="loading-container">
            <span className="spinner"></span>
            <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading activity data...</p>
          </div>
        ) : teachers.length === 0 ? (
          <div className="empty-state">
            <AlertCircle size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <h3>No Faculty Found</h3>
            <p>There are no teachers registered in the system yet.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '1rem' }}>Faculty Member</th>
                  <th style={{ padding: '1rem' }}>Department</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem' }}>Last Active</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map(teacher => {
                  const online = isOnline(teacher.lastActive);
                  return (
                    <tr key={teacher._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className="user-avatar" style={{ background: 'var(--bg-input)', width: '36px', height: '36px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                            <User size={18} style={{ color: 'var(--accent-primary)' }} />
                          </div>
                          <div style={{ fontWeight: 600 }}>{teacher.name}</div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{teacher.department}</td>
                      <td style={{ padding: '1rem' }}>
                        <span className={`badge ${online ? 'badge-accepted' : 'badge-pending'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', border: 'none' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: online ? '#10b981' : '#f59e0b', display: 'inline-block' }}></span>
                          {online ? 'Online' : 'Offline'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Clock size={16} style={{ color: 'var(--text-muted)' }} /> 
                          {formatLastActive(teacher.lastActive)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
