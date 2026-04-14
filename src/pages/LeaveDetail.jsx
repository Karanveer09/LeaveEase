import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getLeaveById } from '../services/leaveService';
import { getOutgoingRequests, sendSubstitutionRequest, getAvailableTeachers } from '../services/substitutionService';

const SLOT_TIMES = {
  1: '9:00 - 9:50', 2: '9:50 - 10:40', 3: '11:00 - 11:50', 4: '11:50 - 12:40',
  5: '1:30 - 2:20', 6: '2:20 - 3:10', 7: '3:30 - 4:20', 8: '4:20 - 5:10'
};

export default function LeaveDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [leave, setLeave] = useState(null);
  const [requests, setRequests] = useState([]);
  const [availableTeachersList, setAvailableTeachersList] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [sendingTo, setSendingTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [id, user]);

  const fetchData = async () => {
    try {
      const leaveData = await getLeaveById(id);
      const reqsData = await getOutgoingRequests(id, user._id);
      
      setLeave(leaveData);
      setRequests(reqsData);
    } catch (err) {
      setError(err.message || 'Failed to load leave details');
    } finally {
      setLoading(false);
    }
  };

  const findTeachers = async (slot) => {
    setSelectedSlot(slot);
    setAvailableTeachersList([]);
    setError('');

    try {
      const teachers = await getAvailableTeachers(leave.date, slot, user._id);

      // Filter out teachers who have already been sent a pending request for this slot
      const pendingRequestTeacherIds = requests
        .filter(r => r.lectureSlot === slot && r.status === 'pending')
        .map(r => r.toTeacherId);

      const filtered = teachers.filter(t => !pendingRequestTeacherIds.includes(t._id));
      setAvailableTeachersList(filtered);
    } catch (err) {
      setError(err.message || 'Failed to find available teachers');
    }
  };

  const sendRequest = async (teacherId) => {
    setSendingTo(teacherId);
    setError('');
    setSuccess('');

    try {
      const lecture = leave.lecturesOnLeave.find(l => l.slot === selectedSlot);
      await sendSubstitutionRequest({
        leaveApplicationId: leave._id,
        fromTeacherId: user._id,
        toTeacherId: teacherId,
        lectureSlot: selectedSlot,
        subject: lecture.subject,
        date: leave.date
      });

      setSuccess('Substitution request sent successfully!');
      setAvailableTeachersList(prev => prev.filter(t => t._id !== teacherId));
      
      // Refresh outgoing requests
      const newReqs = await getOutgoingRequests(id, user._id);
      setRequests(newReqs);
    } catch (err) {
      setError(err.message || 'Failed to send request');
    } finally {
      setSendingTo(null);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-container">
          <div className="spinner-lg"></div>
          <p style={{ marginTop: '1rem', fontWeight: 600 }}>Loading details...</p>
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
            <Link to="/my-leaves" className="btn btn-primary mt-4">← Back to My Leaves</Link>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = leave.applicantId === user._id;

  return (
    <div className="page-container">
      <div className="page-header animate-in" style={{ textAlign: 'left' }}>
        <Link to="/my-leaves" style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontWeight: 600 }}>
          ← Back to My Leaves
        </Link>
        <h1 className="page-title">Leave Application Details</h1>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}
      {success && <div className="alert alert-success">✅ {success}</div>}

      {/* Leave Info */}
      <div className="glass-card animate-in" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              📅 {formatDate(leave.date)}
            </h2>
            <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)', maxWidth: '600px' }}>
              <strong style={{ color: 'var(--text-primary)' }}>Reason for leave:</strong>
              <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.6 }}>
                {leave.reason}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Status</span>
            <span className={`badge badge-${leave.status}`} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
              {leave.status.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
          <span style={{ color: 'var(--accent-primary)', marginRight: '0.5rem' }}>📚</span> 
          Lectures Needing Substitution
        </h2>
      </div>

      <div className="lecture-slots" style={{ marginBottom: '3rem' }}>
        {leave.lecturesOnLeave.map(lecture => {
          const slotRequests = requests.filter(r => r.lectureSlot === lecture.slot);
          const pendingReqs = slotRequests.filter(r => r.status === 'pending');
          const rejectedReqs = slotRequests.filter(r => r.status === 'rejected');

          return (
            <div key={lecture.slot} className={`lecture-slot ${lecture.covered ? 'covered' : 'uncovered'}`}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div className="timetable-slot-num" style={{ background: lecture.covered ? '#059669' : 'var(--accent-primary)', color: 'white', fontSize: '1rem', width: '36px', height: '36px', margin: 0 }}>
                    {lecture.slot}
                  </div>
                  <div>
                    <div className="slot-subject" style={{ fontSize: '1.1rem', margin: 0 }}>{lecture.subject}</div>
                    <div className="slot-time" style={{ fontWeight: 500 }}>{SLOT_TIMES[lecture.slot]}</div>
                  </div>
                </div>
                <span className={`badge ${lecture.covered ? 'badge-accepted' : 'badge-pending'}`}>
                  {lecture.covered ? 'Covered' : 'Uncovered'}
                </span>
              </div>

              {/* Covered by */}
              {lecture.covered && lecture.coveredBy && (
                <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#059669', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                      {lecture.coveredBy.name.charAt(0)}
                    </div>
                    <div>
                      <p style={{ fontSize: '0.9rem', color: '#059669', fontWeight: 600 }}>
                        Covered by {lecture.coveredBy.name}
                      </p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {lecture.coveredBy.department}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Pending & Rejected requests */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                {pendingReqs.map(r => (
                  <div key={r._id} style={{ fontSize: '0.85rem', color: '#d97706', padding: '0.5rem', background: '#fef3c7', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="spinner" style={{ width: '12px', height: '12px', borderTopColor: '#d97706', borderColor: 'rgba(217, 119, 6, 0.2)', borderWidth: '2px' }}></span>
                    Waiting for {r.toTeacher?.name}
                  </div>
                ))}

                {rejectedReqs.map(r => (
                  <div key={r._id} style={{ fontSize: '0.85rem', color: '#dc2626', padding: '0.5rem', background: '#fef2f2', borderRadius: '8px' }}>
                    <div style={{ fontWeight: 600 }}>❌ {r.toTeacher?.name} declined</div>
                    {r.rejectionReason && <div style={{ marginTop: '2px', opacity: 0.8 }}>"{r.rejectionReason}"</div>}
                  </div>
                ))}
              </div>

              {/* Find substitute button */}
              {isOwner && !lecture.covered && (
                <button
                  className="btn btn-outline btn-full"
                  style={{ marginTop: '1.5rem', background: 'white' }}
                  onClick={() => findTeachers(lecture.slot)}
                >
                  <span style={{ fontSize: '1.2rem' }}>🔍</span> Find Substitutes
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Available Teachers Panel / Modal */}
      {selectedSlot && (
        <div className="modal-overlay" onClick={() => { setSelectedSlot(null); setAvailableTeachersList([]); }}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">
              Available Teachers for Slot {selectedSlot}
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              Time: {SLOT_TIMES[selectedSlot]}
            </p>

            {availableTeachersList.length === 0 ? (
              <div className="empty-state" style={{ padding: '2rem 1rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-lg)' }}>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>No available teachers found.</p>
                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
                  All teachers either have their own lectures or have already been requested.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '400px', overflowY: 'auto' }}>
                {availableTeachersList.map((teacher, index) => (
                  <div key={teacher._id} className="teacher-card" style={{ animationDelay: `${index * 0.05}s` }}>
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
                        'Send Request'
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-actions">
              <button
                className="btn btn-ghost"
                onClick={() => { setSelectedSlot(null); setAvailableTeachersList([]); }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
