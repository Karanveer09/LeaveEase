import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { requestPasswordReset, checkPasswordRequestStatus, submitNewPassword } from '../services/authService';
import { 
  Sparkles, 
  Key, 
  AlertCircle, 
  ArrowRight, 
  GraduationCap,
  ArrowLeft
} from 'lucide-react';

export default function FacultyLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user, isTeacher } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && isTeacher) {
      if (!user.profileSetup) {
        navigate('/setup', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, isTeacher, navigate]);

  // Forgot password states
  const [showForgot, setShowForgot] = useState(false);
  const [forgotStep, setForgotStep] = useState('email'); // email, pending, new_password
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotMsg, setForgotMsg] = useState({ type: '', text: '' });
  const [forgotLoading, setForgotLoading] = useState(false);

  const quotes = [
    { text: "Teaching is the greatest act of optimism.", author: "Colleen Wilcox" },
    { text: "A good teacher can inspire hope, ignite the imagination, and instill a love of learning.", author: "Brad Henry" },
    { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
    { text: "The art of teaching is the art of assisting discovery.", author: "Mark Van Doren" }
  ];

  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [quotes.length]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const profile = await login(email, password);
      if (profile.role !== 'teacher') {
        throw new Error('Please use the Admin Portal for administrator accounts.');
      }
      
      if (!profile.profileSetup) {
        navigate('/setup');
      } else {
        navigate('/dashboard');
      }
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
        const req = await checkPasswordRequestStatus(forgotEmail);
        if (req && req.status === 'approved') {
          setForgotStep('new_password');
        } else if (req && req.status === 'pending') {
          setForgotStep('pending');
          setForgotMsg({ type: 'success', text: "A request has already been sent to the admin. Please wait for them to allow it."});
        } else {
          await requestPasswordReset(forgotEmail);
          setForgotStep('pending');
          setForgotMsg({ type: 'success', text: "Request sent to Admin! Once allowed, you can set a new password here."});
        }
      } else if (forgotStep === 'new_password') {
        if (!newPassword || newPassword.length < 6) throw new Error("Password must be at least 6 characters.");
        if (newPassword !== confirmPassword) throw new Error("Passwords do not match.");
        
        await submitNewPassword(forgotEmail, newPassword);
        setForgotMsg({ type: 'success', text: "Password reset correctly! You can now log in."});
        setTimeout(() => {
          setShowForgot(false);
          setForgotStep('email');
          setForgotEmail('');
          setNewPassword('');
          setConfirmPassword('');
          setForgotMsg({ type: '', text: '' });
        }, 2500);
      }
    } catch(err) {
      setForgotMsg({ type: 'error', text: err.message });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* Visual Sidebar */}
      <div className="auth-sidebar" style={{ padding: '3rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 2 }}>
          <div style={{ width: '40px', height: '40px', background: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)', fontSize: '1.2rem', fontWeight: 800, boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
            <Sparkles size={20} fill="currentColor" />
          </div>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>LeaveFlow</span>
        </div>

        <div style={{ marginTop: 'auto', marginBottom: 'auto', position: 'relative', zIndex: 2, width: '100%', maxWidth: '480px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', color: 'white', fontWeight: 700, fontSize: '0.8rem', marginBottom: '1.5rem', backdropFilter: 'blur(8px)' }}>
            <GraduationCap size={16} /> FACULTY PORTAL
          </div>
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.1, textShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            Focus on <br/> teaching, we'll <br/> handle the rest.
          </h1>
          <p style={{ fontSize: '1.15rem', opacity: 0.9, lineHeight: 1.6, marginBottom: '3rem', maxWidth: '400px' }}>
            A dedicated space for faculty to manage leaves and synchronize class substitutions effortlessly.
          </p>

          <div style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.25)', padding: '2rem 2.5rem', borderRadius: '1.5rem', position: 'relative', minHeight: '160px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: '4rem', opacity: 0.15, position: 'absolute', top: '0.5rem', left: '1.5rem', fontFamily: 'serif', lineHeight: 1 }}>"</div>
            <div style={{ transition: 'opacity 0.6s ease-in-out', opacity: 1, position: 'relative', zIndex: 2 }} key={quoteIndex}>
              <p style={{ fontSize: '1.1rem', fontStyle: 'italic', fontWeight: 500, lineHeight: 1.6, margin: '0 0 1rem 0' }}>{quotes[quoteIndex].text}</p>
              <p style={{ fontSize: '0.85rem', fontWeight: 700, opacity: 0.9, textTransform: 'uppercase', letterSpacing: '1px', margin: 0 }}>— {quotes[quoteIndex].author}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="auth-form-container">
        <div style={{ width: '100%', maxWidth: '440px' }} className="animate-in">
          <button 
            className="btn btn-ghost" 
            onClick={() => navigate('/')}
            style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}
          >
            <ArrowLeft size={16} /> Back to Home
          </button>
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', width: '48px', height: '48px', background: 'var(--gradient-primary)', borderRadius: '12px', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', marginBottom: '1rem' }}>
              <GraduationCap size={24} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Faculty Sign In</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Welcome back, Professor!</p>
          </div>

          {error && <div className="alert alert-error" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} /> {error}
          </div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Work Email</label>
              <input type="email" className="form-input" placeholder="e.g. t01@global.edu"
                value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" className="form-input" placeholder="••••••••"
                value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading} style={{ marginTop: '1rem' }}>
              {loading ? <span className="spinner"></span> : <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>Enter Portal <ArrowRight size={18} /></span>}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <button type="button" onClick={() => setShowForgot(true)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600 }}>
              Forgot Password?
            </button>
          </div>

          <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border-color)' }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Key size={14} /> Demo Faculty Account
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Email: t01@global.edu</span>
              <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>password123</span>
            </div>
          </div>
        </div>
      </div>

      {showForgot && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div className="card-flat" style={{ width: '90%', maxWidth: '400px', background: 'white', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>Reset Password</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              {forgotStep === 'new_password' ? 'Set a new password for your account.' : 'Send a reset request to your college administrator.'}
            </p>

            {forgotMsg.text && (
              <div className={`alert alert-${forgotMsg.type === 'error' ? 'error' : 'success'}`} style={{ marginBottom: '1rem' }}>
                {forgotMsg.text}
              </div>
            )}

            <form onSubmit={handleForgotSubmit}>
              {forgotStep !== 'new_password' && (
                <div className="form-group">
                  <label className="form-label">Work Email</label>
                  <input type="email" className="form-input" placeholder="e.g. t01@global.edu" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required disabled={forgotStep === 'pending'} />
                </div>
              )}
              {forgotStep === 'new_password' && (
                <>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
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
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={forgotLoading}>
                    {forgotLoading ? 'Processing...' : (forgotStep === 'new_password' ? 'Save Password' : 'Send Request')}
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
