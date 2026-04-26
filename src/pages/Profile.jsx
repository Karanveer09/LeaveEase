import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Building2, ShieldCheck, Link as LinkIcon, CheckCircle2, CalendarCog } from 'lucide-react';
import { getAllTeachers, linkAdminToTeacher, unlinkAdminFromTeacher, getCurrentUserProfile } from '../services/authService';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const SLOTS = [1, 2, 3, 4, 5, 6, 7, 8];
const SLOT_TIMES = {
  1: '8:50 - 9:40', 2: '9:40 - 10:30', 3: '10:30 - 11:20', 4: '11:20 - 12:10',
  5: '12:50 - 1:30', 6: '1:30 - 2:10', 7: '2:10 - 2:50', 8: '2:50 - 3:30'
};

export default function Profile() {
  const { user, fetchUser } = useAuth();
  const [timetable, setTimetable] = useState(user?.timetable);
  const [teachers, setTeachers] = useState([]);
  const [linkedId, setLinkedId] = useState(user?.linkedTeacherId || '');
  const [savingLink, setSavingLink] = useState(false);
  const [linkMsg, setLinkMsg] = useState('');

  useEffect(() => {
    if (!user) return;
    setLinkedId(user.linkedTeacherId || '');
    if (user.role === 'admin') {
      getAllTeachers().then(t => setTeachers(t));
      if (user.linkedTeacherId) {
        getCurrentUserProfile(user.linkedTeacherId).then(t => {
          if (t && t.timetable) setTimetable(t.timetable);
        });
      } else {
        setTimetable(user.timetable);
      }
    } else if (user.timetable) {
      setTimetable(user.timetable);
    }
  }, [user]);

  const handleLink = async () => {
    if (!linkedId) return;
    setSavingLink(true);
    setLinkMsg('');
    try {
      await linkAdminToTeacher(user._id, linkedId);
      await fetchUser(); 
      setLinkMsg('Faculty linked successfully! Timetable updated.');
    } catch (e) {
      setLinkMsg('Failed to link: ' + e.message);
    } finally {
      setSavingLink(false);
    }
  };

  const handleUnlink = async () => {
    setSavingLink(true);
    setLinkMsg('');
    try {
      await unlinkAdminFromTeacher(user._id);
      await fetchUser();
      setLinkedId('');
      setTimetable({ monday: [], tuesday: [], wednesday: [], thursday: [], friday: [] });
      setLinkMsg('Faculty successfully unlinked.');
    } catch (e) {
      setLinkMsg('Failed to unlink: ' + e.message);
    } finally {
      setSavingLink(false);
    }
  };

  if (!user) return null;

  return (
    <div className="page-container">
      <div className="page-header animate-in">
        <h1 className="page-title accent">My Profile</h1>
        <p className="page-subtitle">Your personal details and weekly schedule</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Profile Card */}
        <div className="card-flat animate-in stagger-1" style={{ padding: '2rem', display: 'flex', gap: '2rem', alignItems: 'center', background: 'var(--bg-panel)' }}>
          <div style={{ 
            width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(216, 124, 36, 0.1)', 
            color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            fontSize: '2.5rem', fontWeight: 800, flexShrink: 0, border: '1px solid var(--border-color)'
          }}>
            <User size={48} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>{user.name}</h2>
            <div style={{ color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Mail size={16} /> <strong>Email:</strong> {user.email}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}><Building2 size={16} /> <strong>Department:</strong> {user.department || 'Computer Science'}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                {user.email === 'admin1@global.edu' ? <ShieldCheck size={16} /> : <CalendarCog size={16} />} 
                <strong>Role:</strong> 
                <span style={{ textTransform: 'capitalize' }}>
                  {user.role === 'admin' ? (user.email === 'admin1@global.edu' ? 'Admin' : 'Time Table Incharge') : user.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Linking Card */}
        {user.role === 'admin' && (
          <div className="card-flat animate-in stagger-2" style={{ padding: '2rem', background: 'var(--bg-panel)', borderLeft: '4px solid var(--accent-primary)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <LinkIcon size={20} className="text-primary" /> Faculty Association Link
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Link your administrator account to a specific faculty profile. This will automatically import and display their timetable on your dashboard.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
              <select className="form-input" style={{ flex: 1, minWidth: '250px' }} value={linkedId} onChange={e => setLinkedId(e.target.value)}>
                <option value="">-- Select Faculty to Link --</option>
                {teachers.map(t => (
                  <option key={t._id} value={t._id}>{t.name} ({t.email})</option>
                ))}
              </select>
              <button className="btn btn-primary" onClick={handleLink} disabled={savingLink || !linkedId}>
                {savingLink ? <span className="spinner"></span> : 'Link Faculty'}
              </button>
              {user.linkedTeacherId && (
                <button className="btn btn-outline" style={{ color: '#dc2626', borderColor: 'rgba(220,38,38,0.3)' }} onClick={handleUnlink} disabled={savingLink}>
                  Unlink
                </button>
              )}
            </div>
            {linkMsg && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: '#059669', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                <CheckCircle2 size={18} /> {linkMsg}
              </div>
            )}
          </div>
        )}

        {/* Timetable Card */}
        <div className="card-flat animate-in stagger-3" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-glass)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
              {user.role === 'admin' && user.linkedTeacherId ? 'Linked Faculty Timetable' : 'My Weekly Timetable'}
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0.25rem 0 0 0' }}>
              {user.role === 'admin' && user.linkedTeacherId ? 'Imported from your linked faculty account.' : 'Your busy slots where you host lectures.'}
            </p>
          </div>
          
          <div style={{ overflowX: 'auto', padding: '1.5rem' }}>
            <table className="timetable-table" style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ width: '120px', padding: '1rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', textAlign: 'center', fontWeight: 'bold' }}>Day / Period</th>
                  {[1,2,3,4].map(slot => (
                    <th key={slot} style={{ padding: '0.75rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', textAlign: 'center', fontWeight: 'bold' }}>
                      Lec {slot}<br/>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>{SLOT_TIMES[slot]}</span>
                    </th>
                  ))}
                  <th style={{ width: '40px', padding: '0.5rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', textAlign: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
                    BREAK<br/><span style={{fontSize:'0.6rem', fontWeight:'normal', color: 'var(--text-muted)'}}>12:10 - 12:50</span>
                  </th>
                  {[5,6,7,8].map(slot => (
                    <th key={slot} style={{ padding: '0.75rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', textAlign: 'center', fontWeight: 'bold' }}>
                      Lec {slot}<br/>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>{SLOT_TIMES[slot]}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map((day, rowIdx) => (
                  <tr key={day}>
                    <td style={{ padding: '1rem', background: 'var(--bg-body)', border: '1px solid var(--border-color)', textAlign: 'center', fontWeight: 600, textTransform: 'capitalize' }}>
                      {day}
                    </td>
                    {[1,2,3,4].map(slot => {
                      const hasClass = timetable?.[day]?.some(s => s.slot === slot);
                      return (
                        <td key={slot} style={{ 
                          padding: '0.75rem', 
                          border: '1px solid var(--border-color)', 
                          textAlign: 'center',
                          background: hasClass ? 'rgba(216, 124, 36, 0.05)' : 'transparent'
                        }}>
                          {hasClass ? (
                            <div style={{ 
                              display: 'flex', flexDirection: 'column', gap: '0.1rem',
                              background: 'var(--accent-primary)', color: 'white', 
                              borderRadius: '6px', padding: '0.4rem 0.5rem',
                            }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>{timetable?.[day]?.find(s => s.slot === slot)?.subject || 'Class'}</span>
                              <span style={{ fontSize: '0.65rem', opacity: 1, fontWeight: 700 }}>{timetable?.[day]?.find(s => s.slot === slot)?.class || 'N/A'}</span>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>-</span>
                          )}
                        </td>
                      );
                    })}

                    {rowIdx === 0 && (
                      <td rowSpan={5} style={{ 
                        padding: '0', 
                        border: '1px solid var(--border-color)', 
                        background: 'var(--bg-input)', 
                        textAlign: 'center', 
                        verticalAlign: 'middle', 
                        fontWeight: 'bold', 
                        letterSpacing: '4px', 
                        fontSize: '0.8rem', 
                        color: 'var(--text-secondary)'
                      }}>
                        <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', margin: 'auto' }}>BREAK</div>
                      </td>
                    )}

                    {[5,6,7,8].map(slot => {
                      const hasClass = timetable?.[day]?.some(s => s.slot === slot);
                      return (
                        <td key={slot} style={{ 
                          padding: '0.75rem', 
                          border: '1px solid var(--border-color)', 
                          textAlign: 'center',
                          background: hasClass ? 'rgba(216, 124, 36, 0.05)' : 'transparent'
                        }}>
                          {hasClass ? (
                            <div style={{ 
                              display: 'flex', flexDirection: 'column', gap: '0.1rem',
                              background: 'var(--accent-primary)', color: 'white', 
                              borderRadius: '6px', padding: '0.4rem 0.5rem',
                            }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>{timetable?.[day]?.find(s => s.slot === slot)?.subject || 'Class'}</span>
                              <span style={{ fontSize: '0.65rem', opacity: 1, fontWeight: 700 }}>{timetable?.[day]?.find(s => s.slot === slot)?.class || 'N/A'}</span>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
