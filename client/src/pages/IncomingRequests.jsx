import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const SLOT_TIMES = {
  1: '9:00 - 9:50 AM',
  2: '9:50 - 10:40 AM',
  3: '11:00 - 11:50 AM',
  4: '11:50 - 12:40 PM',
  5: '1:30 - 2:20 PM',
  6: '2:20 - 3:10 PM',
  7: '3:30 - 4:20 PM',
  8: '4:20 - 5:10 PM'
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
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get('/substitutions/incoming');
      setRequests(res.data);
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
      await api.put(`/substitutions/${requestId}/accept`);
      setSuccess('You have accepted the substitution request! 🎉');
      await fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept request');
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
      await api.put(`/substitutions/${rejectModal}/reject`, {
        rejectionReason: rejectionReason || 'Unable to substitute'
      });
      setSuccess('Request rejected. The teacher will be notified.');
      setRejectModal(null);
      setRejectionReason('');
      await fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject request');
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
    });
  };

  const filteredRequests = requests.filter(r => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  // Check if the user has a conflict for a given request
  const hasConflict = (req) => {
    const reqDate = new Date(req.date);
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = days[reqDate.getDay()];
    const myLectures = user.timetable?.[dayName] || [];
    return myLectures.some(l => l.slot === req.lectureSlot);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="spinner spinner-lg"></div>
          <p>Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header animate-in">
        <h1 className="page-title">Incoming Substitution Requests</h1>
        <p className="page-subtitle">
          Review and respond to substitution requests from other teachers
          {pendingCount > 0 && ` — ${pendingCount} pending`}
        </p>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }} className="animate-in">
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
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {filteredRequests.length === 0 ? (
        <div className="card-flat">
          <div className="empty-state">
            <div className="empty-state-icon">📨</div>
            <h3 className="empty-state-title">No {filter !== 'all' ? filter : ''} Requests</h3>
            <p className="empty-state-text">
              {filter === 'pending'
                ? 'You have no pending substitution requests right now.'
                : `No ${filter} requests found.`}
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredRequests.map((req, index) => {
            const conflict = hasConflict(req);

            return (
              <div
                key={req._id}
                className="request-card"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="request-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="teacher-avatar">
                      {req.fromTeacher.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <h3 style={{ fontWeight: 700, fontSize: '1.05rem' }}>{req.fromTeacher.name}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {req.fromTeacher.department}
                      </p>
                    </div>
                  </div>
                  <span className={`badge badge-${req.status}`}>{req.status}</span>
                </div>

                <div className="request-meta">
                  <div className="request-meta-item">📅 {formatDate(req.date)}</div>
                  <div className="request-meta-item">
                    🕐 Slot {req.lectureSlot} ({SLOT_TIMES[req.lectureSlot]})
                  </div>
                  <div className="request-meta-item">📚 {req.subject}</div>
                </div>

                {conflict && req.status === 'pending' && (
                  <div className="alert alert-error" style={{ marginBottom: '0.5rem', padding: '0.5rem 1rem' }}>
                    ⚠️ You have your own lecture at this time slot!
                  </div>
                )}

                {req.status === 'rejected' && req.rejectionReason && (
                  <div style={{ fontSize: '0.85rem', color: '#f87171', marginBottom: '0.5rem' }}>
                    Reason: {req.rejectionReason}
                  </div>
                )}

                {req.status === 'pending' && (
                  <div className="request-actions">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleAccept(req._id)}
                      disabled={actionLoading === req._id}
                    >
                      {actionLoading === req._id ? (
                        <span className="spinner" style={{ width: '16px', height: '16px' }}></span>
                      ) : (
                        '✅ Accept'
                      )}
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
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
            <h3 className="modal-title">Reject Substitution Request</h3>
            <div className="form-group">
              <label className="form-label">Reason for Rejection (optional)</label>
              <textarea
                className="form-textarea"
                placeholder="e.g. I have my own lectures at this time, or I'm unavailable due to other commitments..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                style={{ minHeight: '80px' }}
              />
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-ghost"
                onClick={() => { setRejectModal(null); setRejectionReason(''); }}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleReject}
                disabled={actionLoading === rejectModal}
              >
                {actionLoading === rejectModal ? (
                  <span className="spinner" style={{ width: '16px', height: '16px' }}></span>
                ) : (
                  'Confirm Rejection'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
