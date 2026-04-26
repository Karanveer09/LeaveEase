import { Link } from 'react-router-dom';
import { ArrowLeft, Scale, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="page-container animate-in" style={{ maxWidth: '800px', paddingBottom: '5rem' }}>
      <Link to="/" className="btn btn-ghost btn-sm" style={{ marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        <ArrowLeft size={18} /> Back to Home
      </Link>

      <div className="glass-card" style={{ padding: '3rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            background: 'rgba(216, 124, 36, 0.1)', 
            color: 'var(--accent-primary)', 
            borderRadius: '16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 1.5rem' 
          }}>
            <Scale size={32} />
          </div>
          <h1 className="page-title accent" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Terms of Service</h1>
          <p className="page-subtitle">Last Updated: April 2026</p>
        </div>

        <div className="policy-content" style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Info size={20} style={{ color: 'var(--accent-primary)' }} /> 1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using the LeaveEase platform, you agree to be bound by these Terms of Service. This platform is provided for the exclusive use of institutional faculty and staff for managing academic leaves and lecture substitutions.
            </p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle2 size={20} style={{ color: 'var(--accent-primary)' }} /> 2. User Responsibilities
            </h2>
            <p style={{ marginBottom: '1rem' }}>As a user of LeaveEase, you agree to:</p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
              <li>Provide accurate and truthful information regarding leave reasons and dates.</li>
              <li>Maintain the confidentiality of your login credentials.</li>
              <li>Respect the substitution process and fulfill agreed-upon lecture coverage.</li>
              <li>Not misuse the platform for personal benefit or institutional disruption.</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertTriangle size={20} style={{ color: 'var(--accent-primary)' }} /> 3. Administrative Authority
            </h2>
            <p>
              The System Administrator (Admin Level 1) and assigned Time Table Incharges (Admin Levels 2/3) reserve the right to:
            </p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
              <li>Approve, partially approve, or decline leave applications based on institutional needs.</li>
              <li>Reset user passwords upon verified request.</li>
              <li>Suspend or terminate access for any user found violating institutional policies.</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Scale size={20} style={{ color: 'var(--accent-primary)' }} /> 4. Limitation of Liability
            </h2>
            <p>
              LeaveEase is a management tool. While we strive for 100% uptime and accuracy, the institution is not liable for any academic disruptions caused by technical delays or user-side errors in leave scheduling.
            </p>
          </section>

          <div style={{ 
            marginTop: '4rem', 
            padding: '2rem', 
            background: 'rgba(216, 124, 36, 0.05)', 
            borderRadius: '12px', 
            border: '1px dashed var(--border-color)',
            textAlign: 'center'
          }}>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Policy Agreement</p>
            <p>Your continued use of the platform constitutes your ongoing agreement to these terms.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
