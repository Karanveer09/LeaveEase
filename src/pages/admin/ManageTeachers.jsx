import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllTeachers, createTeacherAccount, deleteTeacher } from '../../services/authService';
import { 
  UserPlus, 
  Trash2, 
  RefreshCw, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle,
  X
} from 'lucide-react';

export default function ManageTeachers() {
  const { user } = useAuth();
  const isRootAdmin = user?.email === 'admin1@global.edu';
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', department: 'Computer Science' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createdCreds, setCreatedCreds] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  useEffect(() => { fetchTeachers(); }, []);

  const fetchTeachers = async () => {
    try {
      const t = await getAllTeachers();
      setTeachers(t);
    } catch (err) {
      setError('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCreatedCreds(null);

    if (!form.name || !form.email || !form.password) {
      setError('All fields are required');
      return;
    }

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      const newTeacher = await createTeacherAccount(user._id, form);
      setCreatedCreds({ email: form.email, password: form.password, name: form.name });
      setSuccess(`Account created for ${form.name}!`);
      setForm({ name: '', email: '', password: '', department: 'Computer Science' });
      setShowForm(false);
      await fetchTeachers();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (teacherId) => {
    setError('');
    setSuccess('');
    try {
      await deleteTeacher(user._id, teacherId);
      setSuccess('Teacher account deleted.');
      setDeleteModal(null);
      await fetchTeachers();
    } catch (err) {
      setError(err.message);
    }
  };

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let pwd = '';
    for (let i = 0; i < 8; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
    setForm({ ...form, password: pwd });
  };

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-container">
          <div className="spinner-lg"></div>
          <p style={{ marginTop: '1rem', fontWeight: 600 }}>Loading teachers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header animate-in" style={{ textAlign: 'left' }}>
        <h1 className="page-title">Manage Teachers</h1>
        <p className="page-subtitle">Create, view, and manage teacher accounts</p>
      </div>

      {error && <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <AlertCircle size={18} /> {error}
      </div>}
      {success && <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <CheckCircle2 size={18} /> {success}
      </div>}

      {/* Created Credentials Card */}
      {createdCreds && (
        <div className="card-flat animate-in" style={{ marginBottom: '2rem', background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
          <h3 style={{ fontWeight: 700, color: '#059669', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <CheckCircle2 size={24} /> Account Created — Share These Credentials
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'white', padding: '1.25rem', borderRadius: 'var(--radius-lg)' }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Name</div>
              <div style={{ fontWeight: 700 }}>{createdCreds.name}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Department</div>
              <div style={{ fontWeight: 700 }}>Computer Science</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Email (Login ID)</div>
              <div style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '1rem' }}>{createdCreds.email}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Password</div>
              <div style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '1rem' }}>{createdCreds.password}</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => setCreatedCreds(null)} style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <X size={14} /> Dismiss
          </button>
        </div>
      )}

      {/* Action Bar */}
      {isRootAdmin && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }} className="animate-in">
          <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{teachers.length} teacher{teachers.length !== 1 ? 's' : ''} registered</span>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {showForm ? <><X size={18} /> Cancel</> : <><UserPlus size={18} /> Create Teacher Account</>}
          </button>
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <div className="card-flat animate-in" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Create New Teacher Account</h3>
          <form onSubmit={handleCreate}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="t-name">Full Name</label>
                <input id="t-name" type="text" className="form-input" placeholder="e.g. Prof. John Doe"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="t-dept">Department</label>
                <input id="t-dept" type="text" className="form-input" value={form.department}
                  onChange={e => setForm({ ...form, department: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="t-email">Email Address</label>
                <input id="t-email" type="email" className="form-input" placeholder="e.g. john@global.edu"
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="t-password">Password</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input id="t-password" type="text" className="form-input" placeholder="Min 6 characters"
                    value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
                  <button type="button" className="btn btn-outline btn-sm" onClick={generatePassword} title="Generate random password" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px' }}>
                    <RefreshCw size={16} />
                  </button>
                </div>
              </div>
            </div>
            <button type="submit" className="btn btn-success btn-lg" style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <CheckCircle2 size={20} /> Create Account
            </button>
          </form>
        </div>
      )}

      {/* Teachers List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {teachers.map((teacher, i) => (
          <div key={teacher._id} className="card-flat animate-in" style={{ animationDelay: `${i * 0.05}s` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div className="teacher-avatar" style={{ width: '48px', height: '48px', fontSize: '1rem', background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--accent-primary)' }}>
                <User size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <div className="teacher-name" style={{ fontSize: '1.05rem' }}>{teacher.name}</div>
                <div className="teacher-dept">{teacher.department}</div>
              </div>
              <span className={`badge ${teacher.profileSetup ? 'badge-accepted' : 'badge-pending'}`}>
                {teacher.profileSetup ? 'Active' : 'Setup Pending'}
              </span>
            </div>
            
            <div style={{ background: 'var(--bg-body)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Login Email</div>
              <div style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '0.9rem' }}>{teacher.email}</div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ flex: 1, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {Object.values(teacher.timetable || {}).flat().length} lectures/week
              </div>
              {isRootAdmin && (
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--accent-danger)', display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.2rem 0.5rem' }}
                  onClick={() => setDeleteModal(teacher)}>
                  <Trash2 size={14} /> Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {deleteModal && (
        <div className="modal-overlay" onClick={() => setDeleteModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ textAlign: 'center', maxWidth: '400px' }}>
            <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: '80px', height: '80px', background: 'rgba(220, 38, 38, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
                <AlertTriangle size={40} />
              </div>
            </div>
            <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Delete Teacher Account?</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              This will permanently remove <strong>{deleteModal.name}</strong>'s account. This action cannot be undone.
            </p>
            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setDeleteModal(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteModal._id)}>Delete Account</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
