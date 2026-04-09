import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

export default function MyLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      const res = await api.get('/leaves/my');
      setLeaves(res.data);
    } catch (err) {
      console.error('Failed to fetch leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="spinner spinner-lg"></div>
          <p>Loading your leaves...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header animate-in">
        <h1 className="page-title">My Leave Applications</h1>
        <p className="page-subtitle">Track all your leave applications and their substitution status</p>
      </div>

      {leaves.length === 0 ? (
        <div className="card-flat">
          <div className="empty-state">
            <div className="empty-state-icon">📄</div>
            <h3 className="empty-state-title">No Leave Applications</h3>
            <p className="empty-state-text">You haven't applied for any leaves yet.</p>
            <Link to="/apply-leave" className="btn btn-primary">✏️ Apply for Leave</Link>
          </div>
        </div>
      ) : (
        <div className="table-container animate-in">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Reason</th>
                <th>Lectures</th>
                <th>Coverage</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map(leave => {
                const coveredCount = leave.lecturesOnLeave.filter(l => l.covered).length;
                const totalCount = leave.lecturesOnLeave.length;

                return (
                  <tr key={leave._id}>
                    <td style={{ fontWeight: 600 }}>{formatDate(leave.date)}</td>
                    <td style={{ maxWidth: '200px' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {leave.reason}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        {leave.lecturesOnLeave.map(l => (
                          <span
                            key={l.slot}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              background: l.covered
                                ? 'rgba(16, 185, 129, 0.15)'
                                : 'rgba(245, 158, 11, 0.15)',
                              color: l.covered ? '#34d399' : '#fbbf24',
                              border: `1px solid ${l.covered ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                            }}
                          >
                            {l.slot}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        {coveredCount}/{totalCount}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${leave.status}`}>
                        {leave.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <Link to={`/leave/${leave._id}`} className="btn btn-outline btn-sm">
                        View Details →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
