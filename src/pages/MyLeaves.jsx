import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyLeaves } from '../services/leaveService';

export default function MyLeaves() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchLeaves();
    }
  }, [user]);

  const fetchLeaves = async () => {
    try {
      const myLeaves = await getMyLeaves(user._id);
      setLeaves(myLeaves);
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
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-container">
          <div className="spinner-lg"></div>
          <p style={{ marginTop: '1rem', fontWeight: 600 }}>Loading your leaves...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header animate-in" style={{ textAlign: 'left' }}>
        <h1 className="page-title">My Leaves</h1>
        <p className="page-subtitle">Track your leave applications and their coverage statuses</p>
      </div>

      {leaves.length === 0 ? (
        <div className="card-flat animate-in">
          <div className="empty-state">
            <div className="empty-state-icon">📄</div>
            <h3 className="empty-state-title">No Leave Applications</h3>
            <p className="empty-state-text">You haven't applied for any leaves yet.</p>
            <Link to="/apply-leave" className="btn btn-primary btn-lg mt-4">
              ✨ Apply for Leave
            </Link>
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
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatDate(leave.date)}</td>
                    <td style={{ maxWidth: '250px' }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                        {leave.reason}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {leave.lecturesOnLeave.map(l => (
                          <span
                            key={l.slot}
                            title={l.covered ? `Covered by ${l.coveredBy?.name}` : 'Uncovered'}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              background: l.covered
                                ? 'rgba(16, 185, 129, 0.1)'
                                : 'rgba(245, 158, 11, 0.1)',
                              color: l.covered ? '#059669' : '#d97706',
                              border: `1px solid ${l.covered ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                            }}
                          >
                            {l.slot}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: coveredCount === totalCount ? '#059669' : 'var(--text-secondary)' }}>
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
