import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const SLOT_TIMES = {
  1: '9:00 - 9:50',
  2: '9:50 - 10:40',
  3: '11:00 - 11:50',
  4: '11:50 - 12:40',
  5: '1:30 - 2:20',
  6: '2:20 - 3:10',
  7: '3:30 - 4:20',
  8: '4:20 - 5:10'
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
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass-card" style={{ maxWidth: step === 2 ? '640px' : '440px' }}>
        <div className="auth-logo">
          <div className="auth-logo-icon">📋</div>
          <h1>Join LeaveFlow</h1>
          <p>{step === 1 ? 'Create your account' : 'Set up your weekly timetable'}</p>
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
            <button type="submit" className="btn btn-primary btn-lg btn-full">
              Next: Set Timetable →
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit}>
            {/* Day selector */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
              {DAYS.map(day => (
                <button
                  key={day}
                  type="button"
                  className={`btn btn-sm ${currentDay === day ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setCurrentDay(day)}
                >
                  {day.charAt(0).toUpperCase() + day.slice(0, 3)}
                  {timetable[day].length > 0 && ` (${timetable[day].length})`}
                </button>
              ))}
            </div>

            {/* Add slot */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', alignItems: 'flex-end' }}>
              <div style={{ flex: '0 0 80px' }}>
                <label className="form-label">Slot</label>
                <select
                  className="form-select"
                  value={slotNumber}
                  onChange={(e) => setSlotNumber(parseInt(e.target.value))}
                >
                  {[1,2,3,4,5,6,7,8].map(n => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
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
              <button type="button" className="btn btn-success btn-sm" onClick={addSlot}>
                + Add
              </button>
            </div>

            {/* Current day slots */}
            <div style={{ marginBottom: '1.5rem' }}>
              <p className="form-label" style={{ textTransform: 'capitalize' }}>
                {currentDay}'s Lectures ({timetable[currentDay].length})
              </p>
              {timetable[currentDay].length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No lectures added yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {timetable[currentDay].map(s => (
                    <div key={s.slot} className="teacher-card">
                      <div className="teacher-info">
                        <div className="slot-number">{s.slot}</div>
                        <div>
                          <div className="teacher-name">{s.subject}</div>
                          <div className="teacher-dept">{SLOT_TIMES[s.slot]}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => removeSlot(currentDay, s.slot)}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="button"
                className="btn btn-outline btn-lg"
                onClick={() => setStep(1)}
                style={{ flex: 1 }}
              >
                ← Back
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
                style={{ flex: 2 }}
              >
                {loading ? <span className="spinner"></span> : '✅ Complete Registration'}
              </button>
            </div>
          </form>
        )}

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
