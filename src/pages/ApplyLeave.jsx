import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createLeave } from '../services/leaveService';

const SLOT_TIMES = {
  1: '9:00 - 9:50', 2: '9:50 - 10:40', 3: '11:00 - 11:50', 4: '11:50 - 12:40',
  5: '1:30 - 2:20', 6: '2:20 - 3:10', 7: '3:30 - 4:20', 8: '4:20 - 5:10'
};

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export default function ApplyLeave() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [dayLectures, setDayLectures] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    setDate(selectedDate);
    setSelectedSlots([]);

    if (!selectedDate) {
      setDayLectures([]);
      return;
    }

    const dateObj = new Date(selectedDate + 'T00:00:00');
    const dayName = DAYS[dateObj.getDay()];

    if (dayName === 'sunday') {
      setDayLectures([]);
      setError('Sunday is a holiday. Please select a working day.');
      return;
    }

    setError('');
    const lectures = user.timetable?.[dayName] || [];
    setDayLectures(lectures);

    if (lectures.length === 0) {
      setError(`You don't have any lectures scheduled on ${dayName}. No leave application needed.`);
    }
  };

  const toggleSlot = (slot) => {
    setSelectedSlots(prev =>
      prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
    );
  };

  const selectAll = () => {
    if (selectedSlots.length === dayLectures.length) {
      setSelectedSlots([]);
    } else {
      setSelectedSlots(dayLectures.map(l => l.slot));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (selectedSlots.length === 0) {
      setError('Please select at least one lecture slot to request substitution.');
      return;
    }

    setLoading(true);

    try {
      const lecturesOnLeave = selectedSlots.map(slotNum => {
        const lecture = dayLectures.find(l => l.slot === slotNum);
        return { slot: slotNum, subject: lecture.subject };
      });

      const res = await createLeave(user._id, {
        date,
        reason,
        lecturesOnLeave
      });

      navigate(`/leave/${res._id}`);
    } catch (err) {
      setError(err.message || 'Failed to submit leave application');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="page-container">
      <div className="page-header animate-in">
        <h1 className="page-title">Apply for Leave</h1>
        <p className="page-subtitle">Select dates and lectures needing substitution</p>
      </div>

      <div className="glass-card animate-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="leave-date">📅 Select Leave Date</label>
            <input
              id="leave-date"
              type="date"
              className="form-input"
              value={date}
              onChange={handleDateChange}
              min={today}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="leave-reason">📝 Reason for Leave</label>
            <textarea
              id="leave-reason"
              className="form-textarea"
              placeholder="e.g. Medical emergency, Family function..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          {date && dayLectures.length > 0 && (
            <div className="form-group" style={{ marginTop: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ margin: 0 }}>
                  📚 Your Lectures on This Day
                </label>
                <button type="button" className="btn btn-outline btn-sm" onClick={selectAll}>
                  {selectedSlots.length === dayLectures.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              <div className="timetable-grid">
                {[1,2,3,4,5,6,7,8].map(slotNum => {
                  const lecture = dayLectures.find(l => l.slot === slotNum);
                  const isSelected = selectedSlots.includes(slotNum);
                  const hasLecture = !!lecture;

                  return (
                    <div
                      key={slotNum}
                      className={`timetable-slot ${hasLecture ? 'has-lecture' : ''} ${isSelected ? 'selected' : ''}`}
                      onClick={() => hasLecture && toggleSlot(slotNum)}
                      style={{ cursor: hasLecture ? 'pointer' : 'not-allowed', opacity: hasLecture ? 1 : 0.5 }}
                    >
                      <div className="timetable-slot-num">{slotNum}</div>
                      <div className="timetable-slot-subject">
                        {hasLecture ? lecture.subject : 'Free'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {SLOT_TIMES[slotNum]}
                      </div>
                      {isSelected && (
                        <div style={{ position: 'absolute', top: '8px', right: '8px', color: 'var(--accent-primary)', fontSize: '1.2rem' }}>
                          ✓
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '1rem', textAlign: 'center' }}>
                Click on the highlighted slots to select which lectures need substitution
              </p>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-full"
            disabled={loading || dayLectures.length === 0}
            style={{ marginTop: '2rem' }}
          >
            {loading ? <span className="spinner"></span> : '📤 Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
}
