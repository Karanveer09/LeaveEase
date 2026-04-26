import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllTeachers, updateTimetable } from '../../services/authService';
import { setSaturdayOverride, getSaturdayOverrides, deleteSaturdayOverride } from '../../services/adminService';
import { 
  User, 
  ClipboardList, 
  Upload, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  CalendarDays,
  Trash2,
  Clock
} from 'lucide-react';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const SLOT_TIMES = {
  1: '8:50 - 9:40', 2: '9:40 - 10:30', 3: '10:30 - 11:20', 4: '11:20 - 12:10',
  5: '12:50 - 1:30', 6: '1:30 - 2:10', 7: '2:10 - 2:50', 8: '2:50 - 3:30'
};

export default function ManageTimetable() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editModal, setEditModal] = useState(null); // { day, slot }
  const [editSubject, setEditSubject] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('teacher'); // teacher | overview
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadJson, setUploadJson] = useState('');

  // Saturday Overrides
  const [overrides, setOverrides] = useState([]);
  const [satDate, setSatDate] = useState('');
  const [satFollows, setSatFollows] = useState('monday');
  const [isSettingSat, setIsSettingSat] = useState(false);

  useEffect(() => { 
    fetchTeachers(); 
    fetchOverrides();
  }, []);

  const fetchOverrides = async () => {
    const o = await getSaturdayOverrides();
    setOverrides(o);
  };

  const fetchTeachers = async () => {
    try {
      const t = await getAllTeachers();
      setTeachers(t);
      if (t.length > 0) {
        selectTeacher(t[0]);
      }
    } catch (err) {
      setError('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const selectTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setTimetable(JSON.parse(JSON.stringify(teacher.timetable || {
      monday: [], tuesday: [], wednesday: [],
      thursday: [], friday: []
    })));
    setSuccess('');
    setError('');
  };

  const openEditModal = (day, slotNum) => {
    const existing = timetable[day]?.find(s => s.slot === slotNum);
    setEditSubject(existing ? existing.subject : '');
    setEditModal({ day, slot: slotNum });
  };

  const saveSlot = () => {
    if (!editModal) return;
    const { day, slot } = editModal;
    const newTimetable = { ...timetable };

    if (editSubject.trim()) {
      // Add or update
      const existing = newTimetable[day].findIndex(s => s.slot === slot);
      if (existing >= 0) {
        newTimetable[day][existing] = { slot, subject: editSubject.trim() };
      } else {
        newTimetable[day] = [...newTimetable[day], { slot, subject: editSubject.trim() }].sort((a, b) => a.slot - b.slot);
      }
    } else {
      // Remove
      newTimetable[day] = newTimetable[day].filter(s => s.slot !== slot);
    }

    setTimetable(newTimetable);
    setEditModal(null);
  };

  const handleSave = async () => {
    if (!selectedTeacher) return;
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await updateTimetable(selectedTeacher._id, timetable);
      setSuccess(`Timetable saved for ${selectedTeacher.name}!`);
      // Refresh
      const updated = await getAllTeachers();
      setTeachers(updated);
      const refreshed = updated.find(t => t._id === selectedTeacher._id);
      if (refreshed) setSelectedTeacher(refreshed);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Count total lectures for a teacher
  const lectureCount = (tt) => Object.values(tt || {}).flat().length;
  const freeSlotCount = (tt) => 48 - lectureCount(tt); // 8 slots × 6 days = 48

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-container">
          <div className="spinner-lg"></div>
          <p style={{ marginTop: '1rem', fontWeight: 600 }}>Loading timetables...</p>
        </div>
      </div>
    );
  }


  const handleUpload = () => {
    try {
      const parsed = JSON.parse(uploadJson);
      // Basic validation
      const requiredDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
      for (const day of requiredDays) {
        if (!Array.isArray(parsed[day])) {
          throw new Error(`Missing or invalid array for ${day}`);
        }
      }
      setTimetable(parsed);
      setSuccess('Timetable imported! Click "Save Changes" to commit.');
      setShowUploadModal(false);
      setUploadJson('');
    } catch (err) {
      alert(`Invalid JSON format: ${err.message}`);
    }
  };

  const handleSetSaturday = async (e) => {
    e.preventDefault();
    if (!satDate) return;

    // Check if it's actually a Saturday
    const d = new Date(satDate + 'T00:00:00');
    if (d.getDay() !== 6) {
      setError('Please select a Saturday date.');
      return;
    }

    setIsSettingSat(true);
    setSuccess('');
    setError('');
    try {
      await setSaturdayOverride(user._id, { date: satDate, followsDay: satFollows });
      setSuccess(`Saturday ${satDate} set to follow ${satFollows} timetable.`);
      setSatDate('');
      fetchOverrides();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSettingSat(false);
    }
  };

  const handleDeleteOverride = async (id) => {
    try {
      await deleteSaturdayOverride(user._id, id);
      fetchOverrides();
    } catch (err) {
      setError(err.message);
    }
  };

  const copyCurrentJson = () => {
    navigator.clipboard.writeText(JSON.stringify(timetable, null, 2));
    alert('Timetable JSON copied to clipboard!');
  };

  return (
    <div className="page-container">
      <div className="page-header animate-in" style={{ textAlign: 'left' }}>
        <h1 className="page-title">Manage Timetable</h1>
        <p className="page-subtitle">View and edit teacher timetables — click any cell to add or edit a lecture</p>
      </div>

      {error && <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <AlertCircle size={18} /> {error}
      </div>}
      {success && <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <CheckCircle2 size={18} /> {success}
      </div>}

      {/* View Toggle */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }} className="animate-in">
        <button className={`btn btn-sm ${viewMode === 'teacher' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setViewMode('teacher')} style={{ borderRadius: '20px', background: viewMode === 'teacher' ? '' : 'white', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <User size={14} /> Per Teacher
        </button>
        <button className={`btn btn-sm ${viewMode === 'overview' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setViewMode('overview')} style={{ borderRadius: '20px', background: viewMode === 'overview' ? '' : 'white', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ClipboardList size={14} /> Free Slot Overview
        </button>
      </div>

      {viewMode === 'teacher' ? (
        <>
          {/* Teacher Selector */}
          <div className="animate-in" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {teachers.map(t => (
                <button key={t._id}
                  className={`btn btn-sm ${selectedTeacher?._id === t._id ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => selectTeacher(t)}
                  style={{ borderRadius: '20px', background: selectedTeacher?._id === t._id ? '' : 'white' }}>
                  {t.name.split(' ').pop()}
                  <span style={{ opacity: 0.7, marginLeft: '4px' }}>({lectureCount(t.timetable)})</span>
                </button>
              ))}
            </div>
          </div>

          {selectedTeacher && timetable && (
            <div className="card-flat animate-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontWeight: 700, fontSize: '1.15rem' }}>{selectedTeacher.name}</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {lectureCount(timetable)} lectures · {freeSlotCount(timetable)} free slots
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button className="btn btn-outline btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={() => {
                    setUploadJson(JSON.stringify(timetable, null, 2));
                    setShowUploadModal(true);
                  }}>
                    <Upload size={16} /> Bulk Upload
                  </button>
                  <button className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={handleSave} disabled={saving}>
                    {saving ? <span className="spinner"></span> : <><Save size={16} /> Save Changes</>}
                  </button>
                </div>
              </div>

              {/* Timetable Grid — scrollable on mobile */}
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', margin: '0 -1rem', padding: '0 1rem' }}>
              <div className="admin-timetable-grid">
                <div className="tt-header-cell"></div>
                {[1,2,3,4].map(slotNum => (
                  <div key={slotNum} className="tt-header-cell">
                    Lec {slotNum} <span style={{display:'block', fontSize:'0.65rem', color:'var(--text-muted)', fontWeight:'normal'}}>{SLOT_TIMES[slotNum]}</span>
                  </div>
                ))}
                <div className="tt-header-cell break" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span>Break</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>12:10 - 12:50</span>
                </div>
                {[5,6,7,8].map(slotNum => (
                  <div key={slotNum} className="tt-header-cell">
                    Lec {slotNum} <span style={{display:'block', fontSize:'0.65rem', color:'var(--text-muted)', fontWeight:'normal'}}>{SLOT_TIMES[slotNum]}</span>
                  </div>
                ))}

                {DAYS.map((day, rowIndex) => (
                  <div key={day} className="tt-row-fragment">
                    <div className="tt-slot-label">
                      <strong>{day.charAt(0).toUpperCase() + day.slice(1, 3)}</strong>
                    </div>
                    {[1,2,3,4].map(slotNum => {
                      const lecture = timetable[day]?.find(s => s.slot === slotNum);
                      return (
                        <div key={slotNum}
                          className={`tt-cell ${lecture ? 'has-lecture' : 'free'}`}
                          onClick={() => openEditModal(day, slotNum)}
                          title={lecture ? `${lecture.subject} — Click to edit` : 'Free — Click to add'}>
                          {lecture ? (
                            <span className="tt-subject">{lecture.subject}</span>
                          ) : (
                            <span className="tt-free">FREE</span>
                          )}
                        </div>
                      );
                    })}
                    <div className="tt-cell" style={{ background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--text-secondary)' }}>
                      {['B', 'R', 'E', 'A', 'K', ''][rowIndex] || ''}
                    </div>
                    {[5,6,7,8].map(slotNum => {
                      const lecture = timetable[day]?.find(s => s.slot === slotNum);
                      return (
                        <div key={slotNum}
                          className={`tt-cell ${lecture ? 'has-lecture' : 'free'}`}
                          onClick={() => openEditModal(day, slotNum)}
                          title={lecture ? `${lecture.subject} — Click to edit` : 'Free — Click to add'}>
                          {lecture ? (
                            <span className="tt-subject">{lecture.subject}</span>
                          ) : (
                            <span className="tt-free">FREE</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* Overview Mode - Free slots for all teachers */
        <div className="card-flat animate-in">
          <h2 style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: '1.5rem' }}>
            Free Slot Overview — All Teachers
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Numbers show how many teachers are free for each slot. Click to see names.
          </p>

          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', margin: '0 -1rem', padding: '0 1rem' }}>
          <div className="admin-timetable-grid">
            <div className="tt-header-cell"></div>
            {[1,2,3,4].map(slotNum => (
              <div key={slotNum} className="tt-header-cell">
                Lec {slotNum} <span style={{display:'block', fontSize:'0.65rem', color:'var(--text-muted)', fontWeight:'normal'}}>{SLOT_TIMES[slotNum]}</span>
              </div>
            ))}
            <div className="tt-header-cell break" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <span>Break</span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>12:10 - 12:50</span>
            </div>
            {[5,6,7,8].map(slotNum => (
              <div key={slotNum} className="tt-header-cell">
                Lec {slotNum} <span style={{display:'block', fontSize:'0.65rem', color:'var(--text-muted)', fontWeight:'normal'}}>{SLOT_TIMES[slotNum]}</span>
              </div>
            ))}

            {DAYS.map((day, rowIndex) => (
              <div key={day} className="tt-row-fragment">
                <div className="tt-slot-label">
                  <strong>{day.charAt(0).toUpperCase() + day.slice(1, 3)}</strong>
                </div>
                {[1,2,3,4].map(slotNum => {
                  const freeTeachers = teachers.filter(t => {
                    const daySchedule = t.timetable?.[day] || [];
                    return !daySchedule.some(s => s.slot === slotNum);
                  });
                  return (
                    <div key={slotNum}
                      className="tt-cell overview" style={{ padding: '4px', minHeight: '60px', alignItems: 'center', justifyContent: 'center' }}
                      title={freeTeachers.map(t => t.name).join(', ') || 'No one free'}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', justifyContent: 'center', width: '100%' }}>
                        {freeTeachers.map(t => (
                          <span key={t._id} style={{ fontSize: '0.65rem', fontWeight: 600, background: 'rgba(16, 185, 129, 0.1)', color: '#059669', padding: '1px 4px', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                            {t.name.split(' ')[0]} {t.name.split(' ')[1]}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
                <div className="tt-cell" style={{ background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--text-secondary)' }}>
                  {['B', 'R', 'E', 'A', 'K', ''][rowIndex] || ''}
                </div>
                {[5,6,7,8].map(slotNum => {
                  const freeTeachers = teachers.filter(t => {
                    const daySchedule = t.timetable?.[day] || [];
                    return !daySchedule.some(s => s.slot === slotNum);
                  });
                  return (
                    <div key={slotNum}
                      className="tt-cell overview" style={{ padding: '4px', minHeight: '60px', alignItems: 'center', justifyContent: 'center' }}
                      title={freeTeachers.map(t => t.name).join(', ') || 'No one free'}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', justifyContent: 'center', width: '100%' }}>
                        {freeTeachers.map(t => (
                          <span key={t._id} style={{ fontSize: '0.65rem', fontWeight: 600, background: 'rgba(16, 185, 129, 0.1)', color: '#059669', padding: '1px 4px', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                            {t.name.split(' ')[0]} {t.name.split(' ')[1]}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(16, 185, 129, 0.15)' }}></div>
              4+ free (good)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(245, 158, 11, 0.15)' }}></div>
              2-3 free (ok)
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'rgba(239, 68, 68, 0.15)' }}></div>
              0-1 free (tight)
            </div>
          </div>
        </div>
      )}

      {/* Edit Slot Modal */}
      {editModal && (
        <div className="modal-overlay" onClick={() => setEditModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>
              {editModal.day.charAt(0).toUpperCase() + editModal.day.slice(1)} — Slot {editModal.slot}
              <span style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '0.5rem' }}>
                ({SLOT_TIMES[editModal.slot]})
              </span>
            </h3>
            <div className="form-group">
              <label className="form-label">Subject Name</label>
              <input type="text" className="form-input" placeholder="Leave empty to mark as FREE"
                value={editSubject} onChange={e => setEditSubject(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveSlot()}
                autoFocus />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setEditModal(null)}>Cancel</button>
              {editSubject.trim() === '' && timetable[editModal.day]?.find(s => s.slot === editModal.slot) && (
                <button className="btn btn-danger" onClick={saveSlot}>Remove Lecture</button>
              )}
              <button className="btn btn-primary" onClick={saveSlot}>
                {editSubject.trim() ? 'Save' : 'Mark as Free'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Bulk Timetable Upload</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Paste a JSON array of daily slots to set the entire timetable at once.
            </p>
            <div className="form-group">
              <textarea 
                className="form-textarea" 
                style={{ height: '300px', fontFamily: 'monospace', fontSize: '0.8rem' }}
                value={uploadJson}
                onChange={e => setUploadJson(e.target.value)}
                placeholder='{ "monday": [ { "slot": 1, "subject": "DSA" } ], ... }'
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={copyCurrentJson}>Copy Current JSON</button>
              <div style={{ flex: 1 }}></div>
              <button className="btn btn-outline" onClick={() => setShowUploadModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleUpload}>Apply JSON</button>
            </div>
          </div>
        </div>
      )}
      {/* Saturday Management Section */}
      <div className="card-flat animate-in stagger-4" style={{ marginTop: '2rem', borderTop: '4px solid #f59e0b' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <CalendarDays size={20} className="text-warning" style={{ color: '#f59e0b' }} /> Configure Working Saturday
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <form onSubmit={handleSetSaturday} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Select Saturday</label>
                <input type="date" className="form-input" value={satDate} onChange={e => setSatDate(e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Follows Timetable</label>
                <select className="form-input" value={satFollows} onChange={e => setSatFollows(e.target.value)}>
                  {DAYS.map(d => (
                    <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={isSettingSat} style={{ background: '#f59e0b', borderColor: '#f59e0b' }}>
              {isSettingSat ? <span className="spinner"></span> : 'Set Working Saturday'}
            </button>
          </form>

          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-secondary)' }}>Upcoming Configured Saturdays</h3>
            {overrides.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No Saturdays configured as working days.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {overrides.map(o => (
                  <div key={o._id} className="teacher-card" style={{ padding: '0.75rem 1rem', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.1)' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Saturday, {new Date(o.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Clock size={12} /> Follows {o.followsDay}
                      </div>
                    </div>
                    <button className="btn btn-ghost btn-sm" style={{ color: '#ef4444' }} onClick={() => handleDeleteOverride(o._id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

