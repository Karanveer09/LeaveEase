import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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

export default function LeaveDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [leave, setLeave] = useState(null);
  const [requests, setRequests] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [sendingTo, setSendingTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [leaveRes, requestsRes] = await Promise.all([
        api.get(`/leaves/${id}`),
        api.get(`/substitutions/outgoing/${id}`)
      ]);
      setLeave(leaveRes.data);
      setRequests(requestsRes.data);
    } catch (err) {
      setError('Failed to load leave details');
    } finally {
      setLoading(false);
    }
  };

  const findAvailableTeachers = async (slot) => {
    setSelectedSlot(slot);
    setAvailableTeachers([]);
    setError('');

    try {
      const res = await api.get('/substitutions/available-teachers', {
        params: { date: leave.date, slot }
      });

      // Filter out teachers who have already been sent a pending request for this slot
      const pendingRequestTeacherIds = requests
        .filter(r => r.lectureSlot === slot && r.status === 'pending')
        .map(r => r.toTeacher._id);

      const filtered = res.data.filter(t => !pendingRequestTeacherIds.includes(t._id));
      setAvailableTeachers(filtered);
    } catch (err) {
      setError('Failed to find available teachers');
    }
  };

  const sendRequest = async (teacherId) => {
    setSendingTo(teacherId);
    setError('');
    setSuccess('');

    try {
      const lecture = leave.lecturesOnLeave.find(l => l.slot === selectedSlot);
      await api.post('/substitutions', {
        leaveApplicationId: leave._id,
        toTeacherId: teacherId,
        lectureSlot: selectedSlot,
        subject: lecture.subject,
        date: leave.date
      });

      setSuccess('Substitution request sent successfully!');
      setAvailableTeachers(prev => prev.filter(t => t._id !== teacherId));
      
      // Refresh data
      const requestsRes = await api.get(`/substitutions/outgoing/${id}`);
      setRequests(requestsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send request');
    } finally {
      setSendingTo(null);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="spinner spinner-lg"></div>
          <p>Loading leave details...</p>
        </div>
      </div>
    );
  }

  if (!leave) {
    return (
      <div className="page-container">
        <div className="card-flat">
          <div className="empty-state">
            <div className="empty-state-icon">❌</div>
            <h3 className="empty-state-title">Leave Not Found</h3>
            <Link to="/my-leaves" className="btn btn-primary">← Back to My Leaves</Link>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = leave.applicant._id === user._id;

  return (
    <div className="page-container">
      <div className="page-header animate-in">
        <Link to="/my-leaves" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'inline-block', marginBottom: '0.5rem' }}>
          ← Back to My Leaves
        </Link>
        <h1 className="page-title">Leave Application Details</h1>
        <p className="page-subtitle">Manage substitution requests for your leave</p>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}

      {/* Leave Info */}
      <div className="glass-card animate-in" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              📅 {formatDate(leave.date)}
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <strong>Reason:</strong> {leave.reason}
            </p>
          </div>
          <span className={`badge badge-${leave.status}`}>
            {leave.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Lecture Slots */}
      <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>
        📚 Lectures Needing Substitution
      </h2>

      <div className="lecture-slots" style={{ marginBottom: '2rem' }}>
        {leave.lecturesOnLeave.map(lecture => {
          const slotRequests = requests.filter(r => r.lectureSlot === lecture.slot);
          const acceptedReq = slotRequests.find(r => r.status === 'accepted');
          const pendingReqs = slotRequests.filter(r => r.status === 'pending');
          const rejectedReqs = slotRequests.filter(r => r.status === 'rejected');

          return (
            <div
              key={lecture.slot}
              className={`lecture-slot ${lecture.covered ? 'covered' : 'uncovered'}`}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="slot-number">{lecture.slot}</div>
                  <div className="slot-subject">{lecture.subject}</div>
                  <div className="slot-time">{SLOT_TIMES[lecture.slot]}</div>
                </div>
                <span className={`badge ${lecture.covered ? 'badge-accepted' : 'badge-pending'}`}>
                  {lecture.covered ? 'Covered' : 'Uncovered'}
                </span>
              </div>

              {/* Covered by */}
              {lecture.covered && lecture.coveredBy && (
                <div style={{ marginTop: '0.75rem', padding: '0.75rem', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)' }}>
                  <p style={{ fontSize: '0.85rem', color: 'var(--accent-success)' }}>
                    ✅ Covered by <strong>{lecture.coveredBy.name}</strong> ({lecture.coveredBy.department})
                  </p>
                </div>
              )}

              {/* Pending requests */}
              {pendingReqs.length > 0 && (
                <div style={{ marginTop: '0.75rem' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    ⏳ Pending requests ({pendingReqs.length}):
                  </p>
                  {pendingReqs.map(r => (
                    <div key={r._id} style={{ fontSize: '0.85rem', color: '#fbbf24', padding: '0.25rem 0' }}>
                      → {r.toTeacher.name}
                    </div>
                  ))}
                </div>
              )}

              {/* Rejected requests */}
              {rejectedReqs.length > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                    ❌ Rejected ({rejectedReqs.length}):
                  </p>
                  {rejectedReqs.map(r => (
                    <div key={r._id} style={{ fontSize: '0.8rem', color: '#f87171', padding: '0.15rem 0' }}>
                      {r.toTeacher.name} — {r.rejectionReason}
                    </div>
                  ))}
                </div>
              )}

              {/* Find substitute button */}
              {isOwner && !lecture.covered && (
                <button
                  className="btn btn-primary btn-sm btn-full"
                  style={{ marginTop: '1rem' }}
                  onClick={() => findAvailableTeachers(lecture.slot)}
                >
                  🔍 Find Available Teachers
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Available Teachers Panel */}
      {selectedSlot && (
        <div className="glass-card animate-in" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
            🔍 Available Teachers for Slot {selectedSlot} ({SLOT_TIMES[selectedSlot]})
          </h3>

          {availableTeachers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
              <p>No available teachers found for this slot.</p>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                All teachers either have their own lectures or have already been requested.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {availableTeachers.map((teacher, index) => (
                <div
                  key={teacher._id}
                  className="teacher-card"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="teacher-info">
                    <div className="teacher-avatar">
                      {teacher.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <div className="teacher-name">{teacher.name}</div>
                      <div className="teacher-dept">{teacher.department}</div>
                    </div>
                  </div>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => sendRequest(teacher._id)}
                    disabled={sendingTo === teacher._id}
                  >
                    {sendingTo === teacher._id ? (
                      <span className="spinner" style={{ width: '16px', height: '16px' }}></span>
                    ) : (
                      '📤 Send Request'
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            className="btn btn-ghost btn-sm"
            style={{ marginTop: '1rem' }}
            onClick={() => { setSelectedSlot(null); setAvailableTeachers([]); }}
          >
            ✕ Close
          </button>
        </div>
      )}
    </div>
  );
}
