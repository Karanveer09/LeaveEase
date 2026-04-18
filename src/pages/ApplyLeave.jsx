import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createLeave, getMyLeaves } from '../services/leaveService';
import { getHolidays, getSaturdayOverrides } from '../services/adminService';

import { 
  Calendar, 
  FileText, 
  CheckCircle2, 
  Send, 
  AlertCircle,
  BookOpen,
  Palmtree,
  CalendarDays
} from 'lucide-react';

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
  const [myExistingLeaves, setMyExistingLeaves] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [error, setError] = useState('');
  const [holidayMsg, setHolidayMsg] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchMyLeaves();
      fetchAdminData();
    }
  }, [user]);

  const fetchAdminData = async () => {
    try {
      const [h, o] = await Promise.all([getHolidays(), getSaturdayOverrides()]);
      setHolidays(h);
      setOverrides(o);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    }
  };

  const fetchMyLeaves = async () => {
    try {
      const leaves = await getMyLeaves(user._id);
      setMyExistingLeaves(leaves);
    } catch (err) {
      console.error('Failed to fetch leaves for validation:', err);
    }
  };

  const handleDateChange = (e) => {

    const selectedDate = e.target.value;
    setDate(selectedDate);
    setSelectedSlots([]);

    if (!selectedDate) {
      setDayLectures([]);
      return;
    }

    const dateObj = new Date(selectedDate + 'T00:00:00');
    let dayName = DAYS[dateObj.getDay()];
    
    // Check for Public Holiday
    const holiday = holidays.find(h => h.date === selectedDate);
    if (holiday) {
      setDayLectures([]);
      setHolidayMsg(`Public Holiday: ${holiday.reason}`);
      setError(`This day is a public holiday (${holiday.reason}). No leave application needed.`);
      return;
    } else {
      setHolidayMsg('');
    }

    // Check for Saturday Override
    const override = overrides.find(o => o.date === selectedDate);
    if (override) {
      dayName = override.followsDay;
      setError(''); // Clear any Sunday error if it was Saturday
    } else if (dayName === 'sunday') {
      setDayLectures([]);
      setError('Sunday is a holiday. Please select a working day.');
      return;
    } else if (dayName === 'saturday') {
      setDayLectures([]);
      setError('Saturday is a holiday unless configured by admin.');
      return;
    }

    setError('');

    // Filter active leaves on this date
    const leavesOnDate = myExistingLeaves.filter(l => l.date === selectedDate && l.status !== 'cancelled');
    const takenSlots = leavesOnDate.flatMap(l => l.lecturesOnLeave.filter(lec => !lec.cancelled).map(lec => lec.slot));

    const lectures = user.timetable?.[dayName] || [];
    // Mark lectures as already managed if they exist in takenSlots
    const processedLectures = lectures.map(l => ({
      ...l,
      isAlreadyManaged: takenSlots.includes(l.slot)
    }));

    setDayLectures(processedLectures);

    if (processedLectures.length === 0) {
      setError(`You don't have any lectures scheduled on ${dayName}. No leave application needed.`);
    } else if (processedLectures.every(l => l.isAlreadyManaged)) {
      setError(`All your lectures on ${selectedDate} are already included in other leave applications.`);
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
        {error && <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={18} /> {error}
        </div>}

        {holidayMsg && (
          <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#059669' }}>
            <Palmtree size={18} /> {holidayMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="leave-date" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={16} /> Select Leave Date
            </label>
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
            <label className="form-label" htmlFor="leave-reason" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileText size={16} /> Reason for Leave
            </label>
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
                <label className="form-label" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <BookOpen size={16} /> Your Lectures on This Day
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
                  const isManaged = lecture?.isAlreadyManaged;

                  return (
                    <div
                      key={slotNum}
                      className={`timetable-slot ${hasLecture ? 'has-lecture' : ''} ${isSelected ? 'selected' : ''} ${isManaged ? 'managed' : ''}`}
                      onClick={() => hasLecture && !isManaged && toggleSlot(slotNum)}
                      style={{ 
                        cursor: (hasLecture && !isManaged) ? 'pointer' : 'not-allowed', 
                        opacity: (hasLecture && !isManaged) ? 1 : 0.5,
                        position: 'relative'
                      }}
                    >
                      <div className="timetable-slot-num">{slotNum}</div>
                      <div className="timetable-slot-subject">
                        {isManaged ? 'Managed' : (hasLecture ? lecture.subject : 'Free')}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {SLOT_TIMES[slotNum]}
                      </div>
                      {isManaged && (
                        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '4px', fontStyle: 'italic' }}>
                          Already Applied
                        </div>
                      )}
                      {isSelected && (
                        <div style={{ position: 'absolute', top: '8px', right: '8px', color: 'var(--accent-primary)', display: 'flex' }}>
                          <CheckCircle2 size={16} />
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
              {loading ? <span className="spinner"></span> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}><Send size={18} /> Submit Application</span>}
            </button>
        </form>
      </div>
    </div>
  );
}
