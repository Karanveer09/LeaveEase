import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--text-primary)',
      color: 'white',
      padding: '4rem 2rem',
      zIndex: 10,
      marginTop: 'auto'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '1.5rem',
          marginBottom: '1.5rem'
        }}>
          <Sparkles size={24} fill="white" />
        </div>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem', color: 'white' }}>LeaveFlow</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '400px', marginBottom: '2rem' }}>
          Built specifically to solve real university scheduling challenges.
        </p>
        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link
            to="/privacy-policy"
            style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = 'white'}
            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.8)'}
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms-of-service"
            style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = 'white'}
            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.8)'}
          >
            Terms of Service
          </Link>
          <a
            href="mailto:karanveer092004@gmail.com"
            style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = 'white'}
            onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.8)'}
          >
            Contact Admin
          </a>
        </div>
        <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '2rem' }}></div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
          &copy; {new Date().getFullYear()} LeaveEase Management Systems. Design by Kavvy09.
        </p>
      </div>
    </footer>
  );
}
