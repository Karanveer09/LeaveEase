import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getAllAdmins, updateTeacherDetails } from '../../services/authService';
import { 
  Shield, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Key,
  User,
  CalendarCog,
  ShieldCheck
} from 'lucide-react';

export default function ManageAdmins() {
  const { user: currentUser } = useAuth();
  const isRootAdmin = currentUser?.email === 'admin1@global.edu';
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resettingId, setResettingId] = useState(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => { fetchAdmins(); }, []);

  const fetchAdmins = async () => {
    try {
      const a = await getAllAdmins();
      setAdmins(a);
    } catch (err) {
      setError('Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (adminId) => {
    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError('');
    setSuccess('');
    try {
      await updateTeacherDetails(currentUser._id, adminId, { password: newPassword });
      setSuccess('Password updated successfully!');
      setResettingId(null);
      setNewPassword('');
      await fetchAdmins();
    } catch (err) {
      setError(err.message);
    }
  };

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let pwd = '';
    for (let i = 0; i < 8; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
    setNewPassword(pwd);
  };

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-container">
          <div className="spinner-lg"></div>
          <p style={{ marginTop: '1rem', fontWeight: 600 }}>Loading administrator accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header animate-in" style={{ textAlign: 'left' }}>
        <h1 className="page-title">Manage Administrators</h1>
        <p className="page-subtitle">Oversee admin accounts and handle credential recovery</p>
      </div>

      {!isRootAdmin && (
        <div className="alert alert-error" style={{ marginBottom: '2rem' }}>
          <AlertCircle size={18} /> You do not have permission to manage administration credentials.
        </div>
      )}

      {error && <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <AlertCircle size={18} /> {error}
      </div>}
      {success && <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <CheckCircle2 size={18} /> {success}
      </div>}

      <div style={{ background: 'rgba(216,124,36,0.05)', border: '1px solid rgba(216,124,36,0.1)', padding: '1rem 1.5rem', borderRadius: 'var(--radius-lg)', marginBottom: '2rem' }} className="animate-in">
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={16} className="text-primary" />
          <strong>Multi-Admin Security:</strong> Having multiple admins allows for credential recovery. If an admin forgets their password, any other admin can reset it here.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {admins.map((admin, i) => (
          <div key={admin._id} className="card-flat animate-in" style={{ animationDelay: `${i * 0.05}s`, border: admin._id === currentUser._id ? '1px solid var(--accent-primary)' : '' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="teacher-avatar" style={{ width: '48px', height: '48px', fontSize: '1rem', background: '#f1f5f9', color: 'var(--accent-primary)' }}>
                {admin.email === 'admin1@global.edu' ? <ShieldCheck size={24} /> : <CalendarCog size={24} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{admin.name}</span>
                  {admin._id === currentUser._id && <span className="badge badge-accepted" style={{ fontSize: '0.7rem' }}>You</span>}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {admin.email === 'admin1@global.edu' ? 'Administrator' : 'Time Table Incharge'}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'var(--bg-body)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Login Email</div>
                <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{admin.email}</div>
              </div>
            </div>

            <div>
              {isRootAdmin && (
                resettingId === admin._id ? (
                  <div className="animate-in" style={{ background: 'var(--bg-input)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>New Secure Password</label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                      <input type="text" className="form-input" style={{ fontSize: '0.9rem' }} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" />
                      <button className="btn btn-outline btn-sm" onClick={generatePassword} title="Generate">
                        <RefreshCw size={14} />
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-success btn-sm" style={{ flex: 1 }} onClick={() => handleResetPassword(admin._id)}>Save</button>
                      <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => { setResettingId(null); setNewPassword(''); }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button className="btn btn-outline btn-sm btn-full" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                    onClick={() => setResettingId(admin._id)}>
                    <Key size={14} /> Reset Password
                  </button>
                )
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
