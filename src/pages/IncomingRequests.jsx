import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getIncomingRequests, acceptRequest, rejectRequest } from '../services/substitutionService';

const SLOT_TIMES = {
  1: '9:00 - 9:50 AM', 2: '9:50 - 10:40 AM', 3: '11:00 - 11:50 AM', 4: '11:50 - 12:40 PM',
  5: '1:30 - 2:20 PM', 6: '2:20 - 3:10 PM', 7: '3:30 - 4:20 PM', 8: '4:20 - 5:10 PM'
};

export default function IncomingRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      const incReqs = await getIncomingRequests(user._id);
      setRequests(incReqs);
    } catch (err) {
      setError('Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    setActionLoading(requestId);
    setError('');
    setSuccess('');

    try {
      await acceptRequest(requestId, user._id);
      setSuccess('You have accepted the substitution request! 🎉');
      await fetchRequests();
    } catch (err) {
      setError(err.message || 'Failed to accept request');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading(rejectModal);
    setError('');
    setSuccess('');

    try {
      await rejectRequest(rejectModal, user._id, rejectionReason || 'Unable to substitute');
      setSuccess('Request rejected. The teacher will be notified.');
      setRejectModal(null);
      setRejectionReason('');
      await fetchRequests();
    } catch (err) {
      setError(err.message || 'Failed to reject request');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const filteredRequests = requests.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  const hasConflict = (req) => {
    const reqDate = new Date(req.date + 'T00:00:00');
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = days[reqDate.getDay()];
    const myLectures = user.timetable?.[dayName] || [];
    return myLectures.some(l => l.slot === req.lectureSlot);
  };

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-container">
          <div className="spinner-lg"></div>
          <p style={{ marginTop: '1rem', fontWeight: 600 }}>Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header animate-in" style={{ textAlign: 'left' }}>
        <h1 className="page-title">Incoming Requests</h1>
        <p className="page-subtitle">
          Review substitution requests from other teachers
          {pendingCount > 0 && <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}> — {pendingCount} pending</span>}
        </p>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }} className="animate-in">
        {[
          { key: 'pending', label: 'Pending', count: requests.filter(r => r.status === 'pending').length },
          { key: 'accepted', label: 'Accepted', count: requests.filter(r => r.status === 'accepted').length },
          { key: 'rejected', label: 'Rejected', count: requests.filter(r => r.status === 'rejected').length },
          { key: 'all', label: 'All', count: requests.length }
        ].map(tab => (
          <button
            key={tab.key}
            className={`btn btn-sm ${filter === tab.key ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter(tab.key)}
            style={{ borderRadius: '20px', padding: '0.4rem 1.2rem', background: filter === tab.key ? '' : 'white' }}
          >
            {tab.label} <span style={{ opacity: 0.7, marginLeft: '4px' }}>({tab.count})</span>
          </button>
        ))}
      </div>

      {filteredRequests.length === 0 ? (
        <div className="card-flat animate-in">
          <div className="empty-state">
            <div className="empty-state-icon">📨</div>
            <h3 className="empty-state-title">No {filter !== 'all' ? filter : ''} Requests</h3>
            <p className="empty-state-text">
              {filter === 'pending'
                ? 'Great! You have no pending requests right now.'
                : `No ${filter} requests found.`}
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {filteredRequests.map((req, index) => {
            const conflict = hasConflict(req);

            return (
              <div key={req._id} className="card-flat animate-in" style={{ animationDelay: `${index * 0.05}s`, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="teacher-avatar">
                      {req.fromTeacher?.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{req.fromTeacher?.name}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{req.fromTeacher?.department}</p>
                    </div>
                  </div>
                  <span className={`badge badge-${req.status}`}>{req.status}</span>
                </div>

                <div style={{ flex: 1, background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-lg)', marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    <span style={{ fontSize: '1.2rem', color: 'var(--accent-primary)' }}>📅</span> {formatDate(req.date)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                    <span style={{ fontSize: '1.2rem' }}>🕐</span> Slot {req.lectureSlot} ({SLOT_TIMES[req.lectureSlot]})
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                    <span style={{ fontSize: '1.2rem' }}>📚</span> {req.subject}
                  </div>
                </div>

                {conflict && req.status === 'pending' && (
                  <div className="alert alert-error" style={{ padding: '0.75rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    ⚠️ You have a schedule conflict for this slot.
                  </div>
                )}

                {req.status === 'rejected' && req.rejectionReason && (
                  <div style={{ padding: '0.75rem', fontSize: '0.85rem', color: '#dc2626', background: '#fef2f2', borderRadius: '8px', marginBottom: '1rem' }}>
                    <strong style={{ display: 'block', marginBottom: '4px' }}>Reason:</strong> {req.rejectionReason}
                  </div>
                )}

                {req.status === 'pending' && (
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
                    <button
                      className="btn btn-success"
                      style={{ flex: 1 }}
                      onClick={() => handleAccept(req._id)}
                      disabled={actionLoading === req._id}
                    >
                      {actionLoading === req._id ? <span className="spinner"></span> : '✅ Accept'}
                    </button>
                    <button
                      className="btn btn-outline"
                      style={{ flex: 1, background: 'white' }}
                      onClick={() => setRejectModal(req._id)}
                      disabled={actionLoading === req._id}
                    >
                      ❌ Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="modal-overlay" onClick={() => setRejectModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Decline Substitution</h3>
            <div className="form-group">
              <label className="form-label">Reason (optional)</label>
              <textarea
                className="form-textarea"
                placeholder="e.g. Schedule conflict, previously committed..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => { setRejectModal(null); setRejectionReason(''); }}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleReject} disabled={actionLoading === rejectModal}>
                {actionLoading === rejectModal ? <span className="spinner"></span> : 'Decline Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
