import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { requestPasswordReset, checkPasswordRequestStatus, submitNewPassword } from '../services/authService';
import {
  Shield,
  Key,
  AlertCircle,
  ArrowRight,
  Lock,
  ArrowLeft
} from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && isAdmin) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [user, isAdmin, navigate]);

  // Forgot password states
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState('email'); // email, new_password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState({ type: '', text: '' });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const profile = await login(email, password);
      if (profile.role !== 'admin') {
        throw new Error('Unauthorized. This portal is for administrators only.');
      }
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setForgotMsg({ type: '', text: '' });
    setForgotLoading(true);
    try {
      if (forgotStep === 'email') {
        // FORCE DEVELOPER CHECK FIRST
        if (forgotEmail === 'admin1@global.edu') {
          const result = await requestPasswordReset(forgotEmail);
          setForgotStep('pending');
          setForgotMsg({ 
            type: 'success', 
            text: result.message || "Request sent! The developer has been notified automatically." 
          });
          return;
        }

        const req = await checkPasswordRequestStatus(forgotEmail);
        if (req && req.status === 'approved') {
          setForgotStep('new_password');
        } else if (req && req.status === 'pending') {
          setForgotStep('pending');
          setForgotMsg({ type: 'success', text: "A request has already been sent to Admin 1. Please wait for them to allow it." });
        } else {
          const result = await requestPasswordReset(forgotEmail);
          setForgotStep('pending');
          setForgotMsg({ type: 'success', text: "Request sent to Admin 1! Once allowed, you can set a new password here." });
        }
      } else if (forgotStep === 'new_password') {
        if (!newPassword || newPassword.length < 6) throw new Error("Password must be at least 6 characters.");
        if (newPassword !== confirmPassword) throw new Error("Passwords do not match.");

        await submitNewPassword(forgotEmail, newPassword);
        setForgotMsg({ type: 'success', text: "Password reset correctly! You can now log in." });
        setTimeout(() => {
          setShowForgot(false);
          setForgotStep('email');
          setForgotEmail('');
          setNewPassword('');
          setConfirmPassword('');
          setForgotMsg({ type: '', text: '' });
        }, 2500);
      }
    } catch (err) {
      setForgotMsg({ type: 'error', text: err.message });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="auth-layout" style={{ background: '#0f172a' }}>
      {/* Visual Sidebar - Darker Theme */}
      <div className="auth-sidebar" style={{ padding: '3rem', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 2 }}>
          <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1e293b', fontSize: '1.2rem', fontWeight: 800, boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <Shield size={20} />
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>LeaveFlow</span>
        </div>

        <div style={{ marginTop: 'auto', marginBottom: 'auto', position: 'relative', zIndex: 2, width: '100%', maxWidth: '480px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', color: 'white', fontWeight: 700, fontSize: '0.8rem', marginBottom: '1.5rem', backdropFilter: 'blur(8px)' }}>
            <Lock size={16} /> SECURE ADMIN CONSOLE
          </div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.1, textShadow: '0 2px 10px rgba(0,0,0,0.1)', color: 'white' }}>
            Centralized Control, <br /> Total <span style={{ color: 'var(--accent-primary)' }}>Security.</span>
          </h1>
          <p style={{ fontSize: '1.15rem', opacity: 0.9, color: 'white', lineHeight: 1.6, marginBottom: '3rem', maxWidth: '400px' }}>
            Manage faculty, oversee timetables, and maintain administrative integrity from one secure hub.
          </p>

          <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.25)', padding: '2rem 2.5rem', borderRadius: '1.5rem', position: 'relative', minHeight: '160px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '4rem', opacity: 0.15, position: 'absolute', top: '0.5rem', left: '1.5rem', fontFamily: 'serif', lineHeight: 1, color: 'white' }}>"</div>
            <div style={{ opacity: 1, position: 'relative', zIndex: 2 }}>
              <p style={{ fontSize: '1.1rem', fontStyle: 'italic', fontWeight: 500, lineHeight: 1.6, color: 'white', margin: '0 0 1rem 0' }}>
                Efficiency is doing things right; effectiveness is doing the right things.
              </p>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>
                — Peter Drucker
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-form-container" style={{ background: 'white' }}>
        <div style={{ width: '100%', maxWidth: '440px' }} className="animate-in">
          <button
            className="btn btn-ghost"
            onClick={() => navigate('/')}
            style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b' }}
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', width: '48px', height: '48px', background: '#1e293b', borderRadius: '12px', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', marginBottom: '1rem' }}>
              <Shield size={24} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#0f172a' }}>Admin Dashboard</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Sign in to access administrative controls</p>
          </div>

          {error && <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} /> {error}
          </div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Administrator Email</label>
              <input type="email" className="form-input" placeholder="admin1@global.edu"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Secure Password</label>
              <input type="password" className="form-input" placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading} style={{ background: '#1e293b', borderColor: '#1e293b', marginTop: '1rem' }}>
              {loading ? <span className="spinner"></span> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>Access Dashboard <ArrowRight size={18} /></span>}
            </button>
          </form>

          <div style={{ marginTop: '2rem', textAlign: 'center' }}>
            <button type="button" onClick={() => { setShowForgot(true); setForgotStep('email'); }} style={{ background: 'none', border: 'none', color: '#1e293b', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
              Forgot Secure Password?
            </button>
          </div>

          <div style={{ marginTop: '2rem', padding: '1.25rem', background: '#f8fafc', borderRadius: 'var(--radius-lg)', border: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Key size={14} /> Root Admin Credentials
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: '#64748b' }}>Email: admin1@global.edu</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#0f172a' }}>admin123</span>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal for Admins */}
      {showForgot && (
        <div className="modal-overlay" style={{ zIndex: 1000 }}>
          <div className="card-flat" style={{ width: '90%', maxWidth: '400px', background: 'white', padding: '2rem', borderTop: '4px solid #1e293b' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={20} /> Secure Reset
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              {forgotStep === 'new_password' ? 'Reset your administrator password below.' : 'Provide your registered administrator email to proceed.'}
            </p>

            {forgotMsg.text && (
              <div className={`alert alert-${forgotMsg.type === 'error' ? 'error' : 'success'}`} style={{ marginBottom: '1rem' }}>
                {forgotMsg.text}
              </div>
            )}

            <form onSubmit={handleForgotSubmit}>
              {forgotStep === 'email' && (
                <div className="form-group">
                  <label className="form-label">Admin Email</label>
                  <input type="email" className="form-input" placeholder="admin1@global.edu" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required />
                </div>
              )}
              {forgotStep === 'new_password' && (
                <>
                  <div className="form-group">
                    <label className="form-label">New Secure Password</label>
                    <input type="password" className="form-input" placeholder="Min 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input type="password" className="form-input" placeholder="Repeat password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowForgot(false)}>Cancel</button>
                {forgotStep !== 'pending' && (
                  <button type="submit" className="btn btn-primary" style={{ flex: 1, background: '#1e293b' }} disabled={forgotLoading}>
                    {forgotLoading ? 'Verifying...' : (forgotStep === 'new_password' ? 'Save Changes' : 'Verify Email')}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
