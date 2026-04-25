import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Shield,
  Zap,
  ShieldCheck,
  Calendar,
  ChevronDown,
  ArrowRight,
  GraduationCap
} from 'lucide-react';

export default function LandingPage() {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Removed loading check to allow instant rendering when navigating back
  // if (loading) return null;


  const faqs = [
    { q: "How do I request a substitute?", a: "Simply log into the Faculty Portal, select the 'Apply Leave' module, choose your inactive slots, and select an available teacher from the automated drop-down. LeaveFlow handles the rest!" },
    { q: "Can the Admin override requests?", a: "Yes. Admins have a dedicated dashboard to monitor real-time faculty availability, approve master timetables, and override or reassign substitutions if there's a conflict." },
    { q: "What happens if a teacher declines my request?", a: "If your chosen substitute declines, the system automatically surfaces the next fully available teacher for that specific slot, ensuring your classes are always covered." },
    { q: "How are the initials and timetables generated?", a: "LeaveFlow seamlessly integrates your institution's raw dataset mapping real-time exact working hours to automate your weekly timetables right into your dashboard." }
  ];

  const features = [
    { icon: <Zap size={28} />, title: "Instant Synchronisation", desc: "Leaves are matched with free teachers instantly. No more manual timetable hunting." },
    { icon: <ShieldCheck size={28} />, title: "Complete Admin Control", desc: "Admins oversee everything from passwords to substitute validations seamlessly." },
    { icon: <Calendar size={28} />, title: "Dynamic Grid", desc: "The automated Grid calculates overlaps ensuring no two teachers double-book." }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%', background: 'var(--bg-body)', position: 'relative', overflowX: 'hidden' }}>

      {/* Decorative Background Elements */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(216, 124, 36, 0.08) 0%, rgba(216,124,36,0) 70%)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', top: '40%', right: '-10%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(232, 160, 75, 0.05) 0%, rgba(232,160,75,0) 70%)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }}></div>

      {/* Navbar */}
      <nav style={{
        position: 'fixed', top: 0, width: '100%', zIndex: 50, transition: 'all 0.3s ease',
        background: scrolled ? 'rgba(255,255,255,0.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
        boxShadow: scrolled ? '0 4px 20px rgba(0,0,0,0.05)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(216,124,36,0.1)' : '1px solid transparent'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: scrolled ? '1rem 2rem' : '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.3s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-primary)', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div style={{ width: '36px', height: '36px', background: 'var(--gradient-primary)', borderRadius: '10px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(216,124,36,0.3)' }}>
              <Sparkles size={18} fill="currentColor" />
            </div>
            <span style={{ letterSpacing: '-0.5px' }}>LeaveFlow</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <a href="#vision" style={{ color: 'var(--text-secondary)', fontWeight: 600, display: 'none' }} className="d-md-block">Vision</a>
            <a href="#faq" style={{ color: 'var(--text-secondary)', fontWeight: 600, display: 'none', marginRight: '1rem' }} className="d-md-block">FAQ</a>
            <button onClick={() => navigate('/login')} className="btn btn-outline" style={{ padding: '0.6rem 1.4rem', borderRadius: '20px', fontSize: '0.9rem' }}>
              Faculty Login
            </button>
            <button onClick={() => navigate('/admin/login')} className="btn btn-primary" style={{ padding: '0.6rem 1.4rem', borderRadius: '20px', fontSize: '0.9rem', boxShadow: '0 4px 15px rgba(216,124,36,0.3)' }}>
              Admin Portal
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ flex: 1, paddingTop: '160px', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
        <div style={{ textAlign: 'center', maxWidth: '800px', padding: '0 2rem' }} className="animate-in stagger-1">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'rgba(216,124,36,0.1)', color: 'var(--accent-primary)', borderRadius: '20px', fontWeight: 700, fontSize: '0.85rem', marginBottom: '2rem', border: '1px solid rgba(216,124,36,0.2)' }}>
            <span style={{ width: '8px', height: '8px', background: 'var(--accent-primary)', borderRadius: '50%', display: 'inline-block' }}></span>
            Version 2.0 Now Live
          </div>
          <h1 style={{ fontSize: 'clamp(3rem, 6vw, 4.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '1.5rem', color: 'var(--text-primary)', letterSpacing: '-1px' }}>
            Schedule management <br />
            <span style={{ background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>perfected.</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', marginBottom: '3.5rem', maxWidth: '600px', margin: '0 auto 3.5rem auto', lineHeight: 1.6 }}>
            The smartest way for educational institutions to handle teacher substitutions, automated daily scheduling, and absence tracking.
          </p>
        </div>

        {/* Portal Entry Cards */}
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', justifyContent: 'center', padding: '0 2rem', width: '100%', maxWidth: '1000px', marginBottom: '6rem' }} className="animate-in stagger-2">

          {/* Faculty Card */}
          <div
            onClick={() => navigate('/login')}
            style={{
              flex: '1 1 350px', maxWidth: '450px', background: 'white', borderRadius: '24px', padding: '3rem 2.5rem',
              cursor: 'pointer', border: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
              transform: 'translateY(0)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(216,124,36,0.15)';
              e.currentTarget.style.borderColor = 'var(--accent-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.03)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
            }}
          >
            <div style={{ width: '60px', height: '60px', background: 'rgba(216,124,36,0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>
              <GraduationCap size={32} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Faculty Portal</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>Apply for leaves, view your weekly 8-slot schedule, and coordinate substitution requests directly with your peers.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
              Enter Portal <ArrowRight size={18} />
            </div>
          </div>

          {/* Admin Card */}
          <div
            onClick={() => navigate('/admin/login')}
            style={{
              flex: '1 1 350px', maxWidth: '450px', background: 'var(--text-primary)', borderRadius: '24px', padding: '3rem 2.5rem',
              cursor: 'pointer', position: 'relative', overflow: 'hidden',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              transform: 'translateY(0)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
            }}
          >
            {/* Subtle mesh background on dark card */}
            <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(216,124,36,0.2) 0%, rgba(216,124,36,0) 70%)', opacity: 0.5 }}></div>

            <div style={{ width: '60px', height: '60px', background: 'rgba(255,255,255,0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', marginBottom: '1.5rem', color: 'white', position: 'relative', zIndex: 2 }}>
              <Shield size={32} />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.75rem', color: 'white', position: 'relative', zIndex: 2 }}>Admin Portal</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: '2rem', position: 'relative', zIndex: 2 }}>Validate leave approvals, oversee the master timetable grid, and secure administrative passwords natively.</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white', fontWeight: 700, position: 'relative', zIndex: 2 }}>
              Enter Dashboard <ArrowRight size={18} />
            </div>
          </div>
        </div>
      </main>

      {/* Vision & Features Section */}
      <section id="vision" style={{ padding: '6rem 2rem', background: 'white', zIndex: 10, position: 'relative' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Our Vision</h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
              We're building an ecosystem where educational administration isn't about pushing paper, but about driving focus back to where it belongs — teaching.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {features.map((f, i) => (
              <div key={i} style={{ padding: '2rem', background: 'var(--bg-body)', borderRadius: '20px', border: '1px solid var(--border-color)', transition: 'all 0.3s ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.boxShadow = '0 10px 30px rgba(216,124,36,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-body)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{f.icon}</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" style={{ padding: '6rem 2rem', background: 'var(--bg-body)', zIndex: 10 }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Frequently Asked Questions</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Everything you need to know about the LeaveFlow infrastructure.</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqs.map((faq, i) => (
              <div
                key={i}
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                style={{
                  background: 'white', borderRadius: '16px', padding: '1.5rem 2rem', cursor: 'pointer',
                  border: `1px solid ${activeFaq === i ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  boxShadow: activeFaq === i ? '0 10px 20px rgba(216,124,36,0.05)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: activeFaq === i ? 'var(--accent-primary)' : 'var(--text-primary)' }}>{faq.q}</h3>
                  <div style={{ transform: activeFaq === i ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s ease', color: activeFaq === i ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                    <ChevronDown size={20} />
                  </div>
                </div>
                <div style={{
                  maxHeight: activeFaq === i ? '200px' : '0', overflow: 'hidden',
                  transition: 'max-height 0.3s ease, margin-top 0.3s ease',
                  marginTop: activeFaq === i ? '1rem' : '0'
                }}>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--text-primary)', color: 'white', padding: '4rem 2rem', zIndex: 10 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
            <Sparkles size={24} fill="white" />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>LeaveFlow</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '400px', marginBottom: '2rem' }}>
            Built specifically to solve real university scheduling challenges.
          </p>
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '3rem' }}>
            <span style={{ color: 'rgba(255,255,255,0.8)', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.8)'}>Privacy Policy</span>
            <span style={{ color: 'rgba(255,255,255,0.8)', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.8)'}>Terms of Service</span>
            <span style={{ color: 'rgba(255,255,255,0.8)', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'white'} onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.8)'}>Contact Admin</span>
          </div>
          <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.1)', marginBottom: '2rem' }}></div>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>&copy; {new Date().getFullYear()} LeaveFlow Management Systems. Design by Kavvy09.</p>
        </div>
      </footer>
    </div>
  );
}
