import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const SLOT_TIMES = {
  1: '9:00 - 9:50', 2: '9:50 - 10:40', 3: '11:00 - 11:50', 4: '11:50 - 12:40',
  5: '1:30 - 2:20', 6: '2:20 - 3:10', 7: '3:30 - 4:20', 8: '4:20 - 5:10'
};

export default function Register() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [timetable, setTimetable] = useState({
    monday: [], tuesday: [], wednesday: [],
    thursday: [], friday: [], saturday: []
  });
  const [currentDay, setCurrentDay] = useState('monday');
  const [slotSubject, setSlotSubject] = useState('');
  const [slotNumber, setSlotNumber] = useState(1);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

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
      await register({ name, email, password, department, timetable });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* Visual Sidebar for Auth */}
      <div className="auth-sidebar" style={{ background: 'var(--gradient-secondary)' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', position: 'relative', zIndex: 2 }}>
          Join LeaveFlow today.
        </h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9, maxWidth: '400px', lineHeight: 1.6, position: 'relative', zIndex: 2 }}>
          Coordinate substitutions and manage your timetable in one connected workspace designed for teachers.
        </p>
      </div>

      {/* Form Container */}
      <div className="auth-form-container">
        <div style={{ width: '100%', maxWidth: step === 2 ? '640px' : '440px', transition: 'max-width 0.3s ease' }} className="animate-in">
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', width: '48px', height: '48px', background: 'var(--gradient-secondary)', borderRadius: '12px', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', marginBottom: '1rem' }}>✦</div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Create Account</h2>
            <p style={{ color: 'var(--text-secondary)' }}>{step === 1 ? 'Step 1: Your Details' : 'Step 2: Set Weekly Timetable'}</p>
          </div>

          {error && <div className="alert alert-error">⚠️ {error}</div>}

          {step === 1 && (
            <form onSubmit={(e) => { e.preventDefault(); setStep(2); }}>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-name">Full Name</label>
                <input
                  id="reg-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Prof. Rajesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">Email Address</label>
                <input
                  id="reg-email"
                  type="email"
                  className="form-input"
                  placeholder="e.g. rajesh@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">Password</label>
                <input
                  id="reg-password"
                  type="password"
                  className="form-input"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-dept">Department</label>
                <input
                  id="reg-dept"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Computer Science"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-lg btn-full" style={{ marginTop: '1rem' }}>
                Next: Set Timetable →
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit}>
              {/* Day selector */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem', justifyContent: 'center' }}>
                {DAYS.map(day => (
                  <button
                    key={day}
                    type="button"
                    className={`btn btn-sm ${currentDay === day ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setCurrentDay(day)}
                    style={{ borderRadius: '20px' }}
                  >
                    {day.charAt(0).toUpperCase() + day.slice(0, 3)}
                    {timetable[day].length > 0 && ` (${timetable[day].length})`}
                  </button>
                ))}
              </div>

              {/* Add slot */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', alignItems: 'flex-end', background: 'var(--bg-input)', padding: '1rem', borderRadius: '1rem' }}>
                <div style={{ flex: '0 0 100px' }}>
                  <label className="form-label">Slot</label>
                  <select
                    className="form-select"
                    value={slotNumber}
                    onChange={(e) => setSlotNumber(parseInt(e.target.value))}
                  >
                    {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Subject name"
                    value={slotSubject}
                    onChange={(e) => setSlotSubject(e.target.value)}
                  />
                </div>
                <button type="button" className="btn btn-success" onClick={addSlot} style={{ height: '48px', padding: '0 1.5rem' }}>
                  + Add
                </button>
              </div>

              {/* Current day slots */}
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', textTransform: 'capitalize' }}>
                  {currentDay}'s Lectures ({timetable[currentDay].length})
                </h3>
                {timetable[currentDay].length === 0 ? (
                  <div className="empty-state" style={{ padding: '2rem', background: '#fafafa', borderRadius: '1rem', border: '1px dashed var(--border-color)' }}>
                    <p style={{ color: 'var(--text-muted)' }}>No lectures added for this day</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {timetable[currentDay].map(s => (
                      <div key={s.slot} className="card-flat" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                          <div style={{ width: '32px', height: '32px', background: 'rgba(234,88,12,0.1)', color: 'var(--accent-primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {s.slot}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{s.subject}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{SLOT_TIMES[s.slot]}</div>
                          </div>
                        </div>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => removeSlot(currentDay, s.slot)} style={{ color: 'var(--accent-danger)' }}>
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" className="btn btn-outline btn-lg" onClick={() => setStep(1)} style={{ flex: 1 }}>
                  ← Back
                </button>
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ flex: 2 }}>
                  {loading ? <span className="spinner"></span> : '✅ Complete Registration'}
                </button>
              </div>
            </form>
          )}

          <div style={{ marginTop: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
