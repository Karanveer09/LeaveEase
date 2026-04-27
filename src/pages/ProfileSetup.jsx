import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Hand, CheckCircle2, Plus, X, AlertCircle } from 'lucide-react';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const SLOT_TIMES = {
  1: '9:00 - 9:50', 2: '9:50 - 10:40', 3: '11:00 - 11:50', 4: '11:50 - 12:40',
  5: '1:30 - 2:20', 6: '2:20 - 3:10', 7: '3:30 - 4:20', 8: '4:20 - 5:10'
};

export default function ProfileSetup() {
  const { user, setupProfile } = useAuth();
  const [timetable, setTimetable] = useState({
    monday: [], tuesday: [], wednesday: [],
    thursday: [], friday: []
  });
  const [currentDay, setCurrentDay] = useState('monday');
  const [slotSubject, setSlotSubject] = useState('');
  const [slotNumber, setSlotNumber] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const addSlot = () => {
    if (!slotSubject.trim()) return;
    const existing = timetable[currentDay].find(s => s.slot === slotNumber);
    if (existing) {
      setError(`Slot ${slotNumber} already has a lecture on ${currentDay}`);
      return;
    }
    setTimetable({
      ...timetable,
      [currentDay]: [...timetable[currentDay], { slot: slotNumber, subject: slotSubject.trim() }]
        .sort((a, b) => a.slot - b.slot)
    });
    setSlotSubject('');
    setError('');
  };

  const removeSlot = (day, slotNum) => {
    setTimetable({
      ...timetable,
      [day]: timetable[day].filter(s => s.slot !== slotNum)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await setupProfile(timetable);
    } catch (err) {
      setError(err.message || 'Failed to save profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'var(--bg-body)' }}>
      <div style={{ width: '100%', maxWidth: '700px' }} className="animate-in">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', width: '56px', height: '56px', background: 'var(--gradient-primary)', borderRadius: '16px', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', marginBottom: '1rem' }}>
            <Hand size={28} />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Welcome, {user?.name}!</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
            Set up your weekly timetable to get started with LeaveEase
          </p>
        </div>

        <div className="glass-card">
          {error && <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} /> {error}
          </div>}

          <form onSubmit={handleSubmit}>
            {/* Day selector */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem', justifyContent: 'center' }}>
              {DAYS.map(day => (
                <button key={day} type="button"
                  className={`btn btn-sm ${currentDay === day ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setCurrentDay(day)}
                  style={{ borderRadius: '20px', background: currentDay === day ? '' : 'white' }}>
                  {day.charAt(0).toUpperCase() + day.slice(0, 3)}
                  {timetable[day].length > 0 && ` (${timetable[day].length})`}
                </button>
              ))}
            </div>

            {/* Add slot */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', alignItems: 'flex-end', background: 'var(--bg-input)', padding: '1rem', borderRadius: '1rem' }}>
              <div style={{ flex: '0 0 100px' }}>
                <label className="form-label">Slot</label>
                <select className="form-select" value={slotNumber}
                  onChange={(e) => setSlotNumber(parseInt(e.target.value))}>
                  {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="form-label">Subject</label>
                <input type="text" className="form-input" placeholder="Subject name"
                  value={slotSubject} onChange={(e) => setSlotSubject(e.target.value)} />
              </div>
              <button type="button" className="btn btn-success" onClick={addSlot}
                style={{ height: '48px', padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={18} /> Add
              </button>
            </div>

            {/* Current day slots */}
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', textTransform: 'capitalize' }}>
                {currentDay}'s Lectures ({timetable[currentDay].length})
              </h3>
              {timetable[currentDay].length === 0 ? (
                <div className="empty-state" style={{ padding: '2rem', background: 'var(--bg-input)', borderRadius: '1rem', border: '1px dashed var(--border-color)' }}>
                  <p style={{ color: 'var(--text-muted)' }}>No lectures added for this day</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {timetable[currentDay].map(s => (
                    <div key={s.slot} className="card-flat" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ width: '32px', height: '32px', background: 'rgba(91,126,149,0.1)', color: 'var(--accent-primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                          {s.slot}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{s.subject}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{SLOT_TIMES[s.slot]}</div>
                        </div>
                      </div>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeSlot(currentDay, s.slot)} style={{ color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
              {loading ? <span className="spinner"></span> : <><CheckCircle2 size={18} /> Complete Setup</>}
            </button>
          </form>

          <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            You can update your timetable later through your admin.
          </p>
        </div>
      </div>
    </div>
  );
}
