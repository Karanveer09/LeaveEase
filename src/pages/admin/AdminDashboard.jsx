import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllLeaves } from '../../services/leaveService';
import { getAllTeachers, getPasswordRequests, approvePasswordRequest, clearPasswordRequest } from '../../services/authService';
import { 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Key, 
  AlertCircle, 
  AlertTriangle,
  User,
  Users,
  ShieldCheck,
  BookOpen,
  Download,
  CalendarDays,
  Calendar,
  BarChart3
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
  
  const [viewMode, setViewMode] = useState('daily'); // 'daily' or 'monthly'
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedTeacherId, setSelectedTeacherId] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const refresh = () => {
      fetchData();
    };

    const intervalId = setInterval(refresh, 10000);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
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

  // Filter leaves based on view mode
  const getFilteredLeaves = () => {
    let result;
    
    if (viewMode === 'daily') {
      const today = new Date().toISOString().split('T')[0];
      result = leaves.filter(l => l.date === today && l.status !== 'cancelled');
    } else {
      result = leaves.filter(l => {
        const leaveDate = new Date(l.date);
        return leaveDate.getMonth() === selectedMonth && l.status !== 'cancelled';
      });
    }

    if (selectedTeacherId !== 'all') {
      result = result.filter(l => l.applicantId === selectedTeacherId);
    }
    return result;
  };

  const filteredLeaves = getFilteredLeaves();

  // Compute accurate stats
  const computeStats = () => {
    const totalLeaves = filteredLeaves.length;
    
    // Unique teachers on leave
    const teacherIdsOnLeave = [...new Set(filteredLeaves.map(l => l.applicantId))];
    const teachersOnLeave = teacherIdsOnLeave.length;

    // Total lectures from all leaves (only active, not cancelled)
    let totalLectures = 0;
    let coveredLectures = 0;
    let uncoveredLectures = 0;

    filteredLeaves.forEach(leave => {
      const activeLectures = (leave.lecturesOnLeave || []).filter(l => !l.cancelled);
      totalLectures += activeLectures.length;
      coveredLectures += activeLectures.filter(l => l.covered).length;
      uncoveredLectures += activeLectures.filter(l => !l.covered).length;
    });

    return {
      totalLeaves,
      teachersOnLeave,
      totalLectures,
      coveredLectures,
      uncoveredLectures
    };
  };

  const stats = computeStats();

  // Flatten lectures for the feed list format
  const feedItems = [];
  filteredLeaves.forEach(leave => {
    (leave.lecturesOnLeave || []).forEach(lec => {
      if (lec.cancelled) return; // skip cancelled slots
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

  const handleApprovePassword = async (reqId) => {
    try {
      await approvePasswordRequest(reqId);
      const refreshReqs = await getPasswordRequests();
      setPasswordReqs(refreshReqs);
    } catch(err) {
      alert(err.message);
    }
  };
  
  const handleClearPassword = async (reqId) => {
    try {
      await clearPasswordRequest(reqId);
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

  const todayStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="page-container">
      <div className="page-header animate-in" style={{ textAlign: 'left' }}>
        <h1 className="page-title accent">Admin Dashboard</h1>
        <p className="page-subtitle">Professional leave reporting and department overview</p>
      </div>

      {/* View Mode Toggle + Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center' }} className="animate-in">
        {/* Toggle Daily / Monthly */}
        <div style={{ 
          display: 'inline-flex', 
          background: 'var(--bg-card)', 
          border: '1px solid var(--border-color)', 
          borderRadius: '25px', 
          padding: '0.25rem',
          gap: '0.25rem'
        }}>
          <button 
            onClick={() => setViewMode('daily')}
            style={{ 
              padding: '0.5rem 1.25rem', 
              borderRadius: '20px', 
              border: 'none', 
              cursor: 'pointer',
              fontWeight: 700, 
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: viewMode === 'daily' ? 'var(--accent-primary)' : 'transparent',
              color: viewMode === 'daily' ? 'white' : 'var(--text-secondary)',
              transition: 'all 0.25s ease'
            }}
          >
            <Calendar size={15} /> Today
          </button>
          <button 
            onClick={() => setViewMode('monthly')}
            style={{ 
              padding: '0.5rem 1.25rem', 
              borderRadius: '20px', 
              border: 'none', 
              cursor: 'pointer',
              fontWeight: 700, 
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: viewMode === 'monthly' ? 'var(--accent-primary)' : 'transparent',
              color: viewMode === 'monthly' ? 'white' : 'var(--text-secondary)',
              transition: 'all 0.25s ease'
            }}
          >
            <CalendarDays size={15} /> Monthly
          </button>
        </div>

        {viewMode === 'monthly' && (
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
        )}
        
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

        {viewMode === 'daily' && (
          <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={14} /> {todayStr}
          </div>
        )}
      </div>

      {/* Stats Grid — 5 cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
        gap: '1rem', 
        marginBottom: '2rem' 
      }} className="animate-in stagger-1">
        {/* Teachers on Leave */}
        <div className="stat-card">
          <div className="stat-icon" style={{ color: '#6366f1', background: 'rgba(99, 102, 241, 0.1)' }}>
            <Users size={22} />
          </div>
          <div className="stat-value">{stats.teachersOnLeave}</div>
          <div className="stat-label">Teachers on Leave</div>
        </div>
        {/* Total Leave Applications */}
        <div className="stat-card">
          <div className="stat-icon" style={{ color: 'var(--accent-primary)', background: 'var(--bg-glass-hover)' }}>
            <ClipboardList size={22} />
          </div>
          <div className="stat-value">{stats.totalLeaves}</div>
          <div className="stat-label">Leave Applications</div>
        </div>
        {/* Total Lectures on Leave */}
        <div className="stat-card">
          <div className="stat-icon" style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' }}>
            <BookOpen size={22} />
          </div>
          <div className="stat-value">{stats.totalLectures}</div>
          <div className="stat-label">Total Lectures</div>
        </div>
        {/* Lectures Covered */}
        <div className="stat-card">
          <div className="stat-icon" style={{ color: '#059669', background: 'rgba(16, 185, 129, 0.1)' }}>
            <CheckCircle2 size={22} />
          </div>
          <div className="stat-value">{stats.coveredLectures}</div>
          <div className="stat-label">Lectures Covered</div>
        </div>
        {/* Lectures Not Covered */}
        <div className="stat-card">
          <div className="stat-icon" style={{ color: '#dc2626', background: 'rgba(239, 68, 68, 0.1)' }}>
            <XCircle size={22} />
          </div>
          <div className="stat-value">{stats.uncoveredLectures}</div>
          <div className="stat-label">Lectures Not Covered</div>
        </div>
      </div>

      {/* Coverage Progress Bar */}
      {stats.totalLectures > 0 && (
        <div className="animate-in stagger-2" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <BarChart3 size={14} /> Coverage Rate
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: stats.coveredLectures === stats.totalLectures ? '#059669' : 'var(--accent-primary)' }}>
              {Math.round((stats.coveredLectures / stats.totalLectures) * 100)}%
            </span>
          </div>
          <div style={{ width: '100%', height: '10px', background: 'rgba(239, 68, 68, 0.12)', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ 
              width: `${(stats.coveredLectures / stats.totalLectures) * 100}%`, 
              height: '100%', 
              background: 'linear-gradient(90deg, #059669, #10b981)', 
              borderRadius: '8px',
              transition: 'width 0.5s ease'
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#059669', display: 'inline-block' }}></span>
              Covered: {stats.coveredLectures}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626', display: 'inline-block' }}></span>
              Not Covered: {stats.uncoveredLectures}
            </span>
          </div>
        </div>
      )}

      {/* Password Reset Requests Section */}
      {isRootAdmin && passwordReqs.length > 0 && (
        <div className="animate-in stagger-2" style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ color: 'var(--accent-primary)', display: 'flex' }}><Key size={20} /></span> 
            <span>Password Reset Requests</span>
            {passwordReqs.filter(r => r.status === 'pending').length > 0 && (
              <span style={{ background: '#dc2626', color: 'white', padding: '0.1rem 0.6rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700 }}>
                {passwordReqs.filter(r => r.status === 'pending').length} Actions Required
              </span>
            )}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {passwordReqs.map(req => (
              <div key={req._id} className="card-flat animate-in" style={{ 
                padding: '2rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                flexWrap: 'wrap', 
                gap: '1.5rem', 
                border: '1px solid var(--border-color)', 
                background: 'var(--bg-card)', 
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)', 
                margin: 0 
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{req.teacherName}</span>
                    <span style={{ 
                      fontSize: '0.65rem', 
                      textTransform: 'uppercase', 
                      padding: '0.15rem 0.5rem', 
                      borderRadius: '6px', 
                      background: req.role === 'admin' ? 'rgba(30, 41, 59, 0.06)' : 'rgba(216, 124, 36, 0.06)', 
                      color: req.role === 'admin' ? '#1e293b' : 'var(--accent-primary)', 
                      fontWeight: 700, 
                      letterSpacing: '0.05em'
                    }}>
                      {req.role === 'admin' ? 'Time Table Incharge' : 'Faculty'}
                    </span>
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{req.email}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
                    <Clock size={12} /> Requested: {new Date(req.createdAt).toLocaleString()}
                  </div>
                </div>
                <div>
                  {req.status === 'pending' ? (
                    <button className="btn btn-primary" onClick={() => handleApprovePassword(req._id)} style={{ padding: '0.65rem 1.5rem', fontWeight: 700, borderRadius: '12px' }}>
                      Approve Request
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ color: '#059669', background: 'rgba(16, 185, 129, 0.08)', padding: '0.55rem 1.1rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 700, border: '1px solid rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <CheckCircle2 size={15} /> Reset Enabled
                      </div>
                      <button 
                        className="btn btn-ghost" 
                        onClick={() => handleClearPassword(req._id)} 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                        title="Clear from list"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '2rem' }}>
        <div className="animate-in stagger-2">
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Lecture Substitutions
            <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>
              ({feedItems.length} record{feedItems.length !== 1 ? 's' : ''})
            </span>
          </h2>
          {feedItems.length === 0 ? (
            <div className="empty-state card-flat" style={{ padding: '3rem 1.5rem' }}>
              <p className="empty-state-text">
                {viewMode === 'daily' 
                  ? 'No leave records for today.' 
                  : 'No records found for the selected month.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '600px', overflowY: 'auto', paddingRight: '12px' }}>
              {feedItems.map((item, idx) => {
                // cycle through pastel background classes for the aesthetic
                const pastelColors = ['pastel-blue', 'pastel-green', 'pastel-pink'];
                const cardColor = pastelColors[idx % pastelColors.length];
                
                return (
                  <div key={item.id} className={`admin-feed-card ${cardColor} animate-in`} style={{ padding: '1.25rem 1.5rem', borderRadius: '20px', display: 'flex', alignItems: 'flex-start', gap: '1.25rem', border: '1px solid rgba(0,0,0,0.03)' }}>
                    <div className="feed-icon" style={{ display: 'flex', marginTop: '0.25rem', background: 'rgba(255,255,255,0.5)', padding: '0.5rem', borderRadius: '10px' }}>
                      {item.isCovered ? (
                        <CheckCircle2 size={20} style={{ color: '#059669' }} />
                      ) : (
                        <AlertTriangle size={20} style={{ color: '#dc2626' }} />
                      )}
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)', flex: 1, lineHeight: 1.6 }}>
                      <div style={{ marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{item.applicantName}</span> on <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{item.type || 'leave'}</span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)' }}>
                        <span style={{ fontWeight: 700 }}>{item.coveredByName}</span> {item.isCovered ? 'successfully covered' : 'did not cover'} lecture <strong style={{ color: 'var(--accent-primary)', background: 'rgba(216, 124, 36, 0.1)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>S{item.slotNum}</strong> on <strong>{item.date}</strong>.
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
