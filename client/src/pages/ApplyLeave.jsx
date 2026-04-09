import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

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
      prev.includes(slot)
        ? prev.filter(s => s !== slot)
        : [...prev, slot]
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
      setError('Please select at least one lecture slot');
      return;
    }

    setLoading(true);

    try {
      const lecturesOnLeave = selectedSlots.map(slotNum => {
        const lecture = dayLectures.find(l => l.slot === slotNum);
        return { slot: slotNum, subject: lecture.subject };
      });

      const res = await api.post('/leaves', {
        date,
        reason,
        lecturesOnLeave
      });

      navigate(`/leave/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave application');
    } finally {
      setLoading(false);
    }
  };

  // Get today's date as minimum
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="page-container">
      <div className="page-header animate-in">
        <h1 className="page-title">Apply for Leave</h1>
        <p className="page-subtitle">Fill in the details below and select your lectures that need substitution</p>
      </div>

      <div className="glass-card animate-in" style={{ maxWidth: '800px' }}>
        {error && <div className="alert alert-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="leave-date">📅 Leave Date</label>
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
              placeholder="Please provide a reason for your leave..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          {/* Lecture slots from timetable */}
          {date && dayLectures.length > 0 && (
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <label className="form-label" style={{ margin: 0 }}>
                  📚 Your Lectures on This Day ({dayLectures.length} total, out of 8 slots)
                </label>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={selectAll}
                >
                  {selectedSlots.length === dayLectures.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {/* 8-slot grid showing all slots */}
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
                      style={{ cursor: hasLecture ? 'pointer' : 'default', opacity: hasLecture ? 1 : 0.4 }}
                    >
                      <div className="timetable-slot-num">{slotNum}</div>
                      <div className="timetable-slot-subject">
                        {hasLecture ? lecture.subject : 'Free'}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {SLOT_TIMES[slotNum]}
                      </div>
                      {isSelected && (
                        <div style={{ color: 'var(--accent-primary)', fontSize: '0.8rem', marginTop: '4px' }}>✓</div>
                      )}
                    </div>
                  );
                })}
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                Click on your lectures to select them for substitution. Selected: {selectedSlots.length} lecture(s)
              </p>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-full"
            disabled={loading || dayLectures.length === 0}
          >
            {loading ? <span className="spinner"></span> : '📤 Submit Leave Application'}
          </button>
        </form>
      </div>
    </div>
  );
}
