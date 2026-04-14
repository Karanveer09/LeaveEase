import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user, loading } = useAuth();

  if (loading) return null;
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'center', position: 'relative' }}>
      
      {/* Navbar for Landing Page */}
      <nav style={{ width: '100%', maxWidth: '1200px', padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-primary)' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--gradient-primary)', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✦</div>
          LeaveFlow
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/login" className="btn btn-ghost" style={{ fontWeight: 600 }}>Login</Link>
          <Link to="/register" className="btn btn-primary" style={{ fontWeight: 600 }}>Get Started →</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '4rem 2rem', maxWidth: '800px', zIndex: 10 }}>
        
        <div className="badge badge-accepted" style={{ marginBottom: '2rem', padding: '0.5rem 1rem', background: '#ffe4e6', color: '#e11d48', border: '1px solid #fecdd3' }}>
          ✨ The modern way to manage substitutions
        </div>

        <h1 style={{ fontSize: '4rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
          Don't Let Leaves Disrupt Your Schedule Ever Again.
        </h1>
        
        <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '3rem', maxWidth: '600px' }}>
          LeaveFlow connects you with your colleagues seamlessly. Apply for leave, find available substitutes, and manage your department's workload without the spreadsheet chaos.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/register" className="btn btn-primary btn-lg" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
            Get Started For Free
          </Link>
          <a href="#features" className="btn btn-outline btn-lg" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem', background: 'white' }}>
            Learn More
          </a>
        </div>
      </main>

      {/* Decorative Elements */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '5%',
        width: '400px',
        height: '400px',
        background: 'radial-gradient(circle, rgba(234, 88, 12, 0.08) 0%, rgba(234, 88, 12, 0) 70%)',
        borderRadius: '50%',
        zIndex: 1,
        pointerEvents: 'none'
      }}></div>
      
      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '10%',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(251, 191, 36, 0.08) 0%, rgba(251, 191, 36, 0) 70%)',
        borderRadius: '50%',
        zIndex: 1,
        pointerEvents: 'none'
      }}></div>
    </div>
  );
}
