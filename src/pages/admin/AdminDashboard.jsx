import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllLeaves } from '../../services/leaveService';
import { getAllTeachers, getPasswordRequests, approvePasswordRequest } from '../../services/authService';
import { 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Key, 
  AlertCircle, 
  AlertTriangle,
  User,
  ShieldCheck,
  BookOpen,
  Download
} from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const isRootAdmin = user?.email === 'admin1@global.edu';
  const [leaves, setLeaves] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [passwordReqs, setPasswordReqs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedTeacherId, setSelectedTeacherId] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [allLeaves, allTeachers, pReqs] = await Promise.all([
        getAllLeaves(),
        getAllTeachers(),
        getPasswordRequests()
      ]);
      setLeaves(allLeaves);
      setTeachers(allTeachers.filter(t => t.role === 'teacher'));
      setPasswordReqs(pReqs);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter leaves by month and teacher
  const getFilteredLeaves = () => {
    let result = leaves.filter(l => {
      const leaveDate = new Date(l.date);
      return leaveDate.getMonth() === selectedMonth;
    });

    if (selectedTeacherId !== 'all') {
      result = result.filter(l => l.applicantId === selectedTeacherId);
    }
    return result;
  };

  const filteredLeaves = getFilteredLeaves();

  // Flatten lectures for the feed list format
  const feedItems = [];
  filteredLeaves.forEach(leave => {
    leave.lecturesOnLeave.forEach(lec => {
      feedItems.push({
        id: `${leave._id}-${lec.slot}`,
        date: leave.date,
        applicantName: leave.applicant?.name || 'Unknown',
        coveredByName: lec.coveredBy?.name || 'No one',
        isCovered: lec.covered,
        slotNum: lec.slot,
        type: leave.type,
        reason: leave.reason,
        documentProof: leave.documentProof
      });
    });
  });

  // Sort by date (descending)
  feedItems.sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalLeaves = filteredLeaves.length;
  const fullyCovered = filteredLeaves.filter(l => l.status === 'fully_covered').length;
  const partiallyCovered = filteredLeaves.filter(l => l.status === 'partially_covered').length;
  const uncovered = filteredLeaves.filter(l => l.status === 'pending').length;

  const handleApprovePassword = async (reqId) => {
    try {
      await approvePasswordRequest(reqId);
      const refreshReqs = await getPasswordRequests();
      setPasswordReqs(refreshReqs);
    } catch(err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-container">
          <div className="spinner-lg"></div>
          <p style={{ marginTop: '1rem', fontWeight: 600 }}>Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header animate-in" style={{ textAlign: 'left' }}>
        <h1 className="page-title accent">Admin Dashboard</h1>
        <p className="page-subtitle">Professional leave reporting and department overview</p>
      </div>

      {/* Filters (Month & Teacher) */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }} className="animate-in">
        <select 
          className="form-select" 
          style={{ width: 'auto', minWidth: '150px', margin: 0, padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 600 }}
          value={selectedMonth} 
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
        >
          {MONTHS.map((month, idx) => (
            <option key={idx} value={idx}>{month}</option>
          ))}
        </select>
        
        <select 
          className="form-select" 
          style={{ width: 'auto', minWidth: '200px', margin: 0, padding: '0.5rem 1rem', borderRadius: '20px' }}
          value={selectedTeacherId} 
          onChange={(e) => setSelectedTeacherId(e.target.value)}
        >
          <option value="all">All Teachers</option>
          {teachers.map(t => (
            <option key={t._id} value={t._id}>{t.name}</option>
          ))}
        </select>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid animate-in stagger-1" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: 'var(--accent-primary)', background: 'var(--bg-glass-hover)' }}>
            <ClipboardList size={22} />
          </div>
          <div className="stat-value">{totalLeaves}</div>
          <div className="stat-label">Total Leaves</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: '#059669', background: 'rgba(16, 185, 129, 0.1)' }}>
            <CheckCircle2 size={22} />
          </div>
          <div className="stat-value">{fullyCovered}</div>
          <div className="stat-label">Fully Covered</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: '#d97706', background: 'rgba(245, 158, 11, 0.1)' }}>
            <Clock size={22} />
          </div>
          <div className="stat-value">{partiallyCovered}</div>
          <div className="stat-label">Partially Covered</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ color: '#dc2626', background: 'rgba(239, 68, 68, 0.1)' }}>
            <XCircle size={22} />
          </div>
          <div className="stat-value">{uncovered}</div>
          <div className="stat-label">Uncovered</div>
        </div>
      </div>

      {/* Password Reset Requests Section */}
      {isRootAdmin && passwordReqs.length > 0 && (
        <div className="card-flat animate-in stagger-2" style={{ padding: '0', background: 'transparent', boxShadow: 'none', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ color: 'var(--accent-primary)', display: 'flex' }}><Key size={20} /></span> 
            <span>Password Reset Requests</span>
            {passwordReqs.filter(r => r.status === 'pending').length > 0 && (
              <span style={{ background: '#dc2626', color: 'white', padding: '0.1rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                {passwordReqs.filter(r => r.status === 'pending').length} Actions Required
              </span>
            )}
          </h2>
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            {passwordReqs.map(req => (
              <div key={req._id} className="card-flat" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-color)', background: 'var(--bg-panel)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{req.teacherName}</div>
                    <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', padding: '0.2rem 0.5rem', borderRadius: '4px', background: req.role === 'admin' ? 'rgba(30, 41, 59, 0.1)' : 'rgba(216, 124, 36, 0.1)', color: req.role === 'admin' ? '#1e293b' : 'var(--accent-primary)', fontWeight: 800 }}>
                      {req.role || 'faculty'}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>{req.email}</div>
                  <div style={{ marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={12} /> Requested: {new Date(req.createdAt).toLocaleString()}
                  </div>
                </div>
                <div style={{ paddingLeft: '1.5rem' }}>
                  {req.status === 'pending' ? (
                    <button className="btn btn-primary btn-sm" onClick={() => handleApprovePassword(req._id)} style={{ padding: '0.5rem 1.5rem', fontWeight: 700, borderRadius: '8px' }}>
                      Approve Request
                    </button>
                  ) : (
                    <span style={{ color: '#059669', background: 'rgba(16, 185, 129, 0.15)', padding: '0.5rem 1rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 700, border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                      Reset Enabled
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '2rem' }}>
        <div className="card-flat animate-in stagger-2" style={{ padding: '0', background: 'transparent', boxShadow: 'none' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Lecture Substitutions
          </h2>
          {feedItems.length === 0 ? (
            <div className="empty-state card-flat" style={{ padding: '2rem 1rem' }}>
              <p className="empty-state-text">No records found for the selected month.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '600px', overflowY: 'auto', paddingRight: '10px' }}>
              {feedItems.map((item, idx) => {
                // cycle through pastel background classes for the aesthetic
                const pastelColors = ['pastel-blue', 'pastel-green', 'pastel-pink'];
                const cardColor = pastelColors[idx % pastelColors.length];
                
                return (
                  <div key={item.id} className={`admin-feed-card ${cardColor}`} style={{ padding: '1rem 1.25rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className="feed-icon" style={{ display: 'flex' }}>
                      {item.isCovered ? (
                        <CheckCircle2 size={18} style={{ color: '#059669' }} />
                      ) : (
                        <AlertTriangle size={18} style={{ color: '#dc2626' }} />
                      )}
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-primary)', flex: 1, lineHeight: 1.5 }}>
                      <div>
                        <span style={{ fontWeight: 700 }}>{item.applicantName}</span> on ({item.type ? item.type : 'leave'}), <span style={{ fontWeight: 700 }}>{item.coveredByName}</span> {item.isCovered ? 'covered' : 'did not cover'} that lecture, with lecture number <strong style={{ color: 'var(--accent-primary)' }}>S{item.slotNum}</strong> of the day, with date <strong>{item.date}</strong>.
                      </div>
                      {(item.reason || item.documentProof) && (
                        <div style={{ marginTop: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.4)', borderRadius: '8px', fontSize: '0.85rem' }}>
                          {item.reason && <div style={{ color: 'var(--text-secondary)' }}><strong>Reason:</strong> {item.reason}</div>}
                          {item.documentProof && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.4rem' }}>
                              <div style={{ color: 'var(--accent-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                <BookOpen size={14} /> 
                                {item.documentProof.name || (typeof item.documentProof === 'string' ? item.documentProof : 'Document')}
                                {item.documentProof.data && (
                                  <a 
                                    href={item.documentProof.data} 
                                    download={item.documentProof.name || 'proof'} 
                                    className="btn btn-primary"
                                    style={{ 
                                      padding: '0.2rem 0.6rem', 
                                      fontSize: '0.75rem', 
                                      borderRadius: '6px', 
                                      marginLeft: '0.5rem',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '0.3rem',
                                      textDecoration: 'none'
                                    }}
                                  >
                                    <Download size={12} /> Download
                                  </a>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
