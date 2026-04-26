import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { addHoliday, getHolidays, deleteHoliday } from '../../services/adminService';
import { 
  Calendar, 
  Plus, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  Palmtree,
  Info
} from 'lucide-react';

export default function ManageHolidays() {
  const { user } = useAuth();
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [newDate, setNewDate] = useState('');
  const [newReason, setNewReason] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ show: false, id: null, name: '' });

  useEffect(() => { fetchHolidays(); }, []);

  const fetchHolidays = async () => {
    try {
      const h = await getHolidays();
      setHolidays(h);
    } catch (err) {
      setError('Failed to load holidays');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newDate || !newReason) return;
    
    setIsAdding(true);
    setError('');
    setSuccess('');

    try {
      await addHoliday(user._id, { date: newDate, reason: newReason });
      setSuccess('Holiday added successfully!');
      setNewDate('');
      setNewReason('');
      fetchHolidays();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id) => {
    const holiday = holidays.find(h => h._id === id);
    setConfirmModal({ show: true, id, name: holiday?.reason || 'this holiday' });
  };

  const handleConfirmDelete = async () => {
    const id = confirmModal.id;
    setConfirmModal({ show: false, id: null, name: '' });
    
    try {
      await deleteHoliday(user._id, id);
      setSuccess('Holiday deleted');
      fetchHolidays();
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-container">
          <div className="spinner-lg"></div>
          <p style={{ marginTop: '1rem', fontWeight: 600 }}>Loading holidays...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header animate-in" style={{ textAlign: 'left' }}>
        <h1 className="page-title">Manage Public Holidays</h1>
        <p className="page-subtitle">Declare and oversee official holidays to keep scheduling accurate.</p>
      </div>

      {error && <div className="alert alert-error animate-in" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <AlertCircle size={18} /> {error}
      </div>}
      {success && <div className="alert alert-success animate-in" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <CheckCircle2 size={18} /> {success}
      </div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {/* Add Form */}
        <div className="card-flat animate-in stagger-1" style={{ height: 'fit-content' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Plus size={20} className="text-primary" /> Declare New Holiday
          </h2>
          <form onSubmit={handleAdd}>
            <div className="form-group">
              <label className="form-label">Holiday Date</label>
              <input 
                type="date" 
                className="form-input" 
                value={newDate} 
                onChange={e => setNewDate(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Reason / Name</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="e.g. Diwali, Independence Day" 
                value={newReason} 
                onChange={e => setNewReason(e.target.value)} 
                required 
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={isAdding}>
              {isAdding ? <span className="spinner"></span> : 'Add Holiday'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', gap: '0.5rem', margin: 0 }}>
              <Info size={16} /> 
              Adding a holiday will automatically prevent faculty from applying for leave on that day.
            </p>
          </div>
        </div>

        {/* List */}
        <div className="card-flat animate-in stagger-2">
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Calendar size={20} className="text-primary" /> Active Holidays
          </h2>
          
          {holidays.length === 0 ? (
            <div className="empty-state" style={{ padding: '3rem 1rem' }}>
              <Palmtree size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p className="empty-state-text">No public holidays declared yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {holidays.map(h => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const holidayDate = new Date(h.date);
                const isPast = holidayDate < today;

                return (
                  <div 
                    key={h._id} 
                    className="teacher-card" 
                    style={{ 
                      padding: '1rem',
                      opacity: isPast ? 0.6 : 1,
                      filter: isPast ? 'grayscale(1)' : 'none',
                      background: isPast ? 'rgba(0,0,0,0.02)' : 'white',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: isPast ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                          {h.reason}
                        </div>
                        {isPast && (
                          <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '4px', background: '#e2e8f0', color: '#64748b', fontWeight: 600 }}>
                            PASSED
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{formatDate(h.date)}</div>
                    </div>
                    <button 
                      className="btn btn-ghost btn-sm" 
                      style={{ color: '#ef4444' }}
                      onClick={() => handleDelete(h._id)}
                      title="Remove Holiday"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {/* Custom Confirmation Modal */}
      {confirmModal.show && (
        <div className="modal-overlay" onClick={() => setConfirmModal({ show: false, id: null, name: '' })}>
          <div className="modal animate-in" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: '64px', height: '64px', background: 'rgba(239, 68, 68, 0.1)', color: '#dc2626', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
                <Trash2 size={32} />
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Delete Holiday?</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Are you sure you want to delete the holiday <strong>{confirmModal.name}</strong>? 
                <br/>This action will re-allow faculty to apply for leave on this date.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                className="btn btn-outline" 
                style={{ flex: 1 }} 
                onClick={() => setConfirmModal({ show: false, id: null, name: '' })}
              >
                No, Keep it
              </button>
              <button 
                className="btn btn-danger" 
                style={{ flex: 1 }} 
                onClick={handleConfirmDelete}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
