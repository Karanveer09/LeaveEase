import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, FileText } from 'lucide-react';

export default function PrivacyPolicy() {
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
            <Shield size={32} />
          </div>
          <h1 className="page-title accent" style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Privacy Policy</h1>
          <p className="page-subtitle">Last Updated: April 2026</p>
        </div>

        <div className="policy-content" style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Eye size={20} style={{ color: 'var(--accent-primary)' }} /> 1. Introduction
            </h2>
            <p>
              Welcome to LeaveEase. We value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our leave management platform.
            </p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Lock size={20} style={{ color: 'var(--accent-primary)' }} /> 2. Information We Collect
            </h2>
            <p style={{ marginBottom: '1rem' }}>We collect information necessary to facilitate leave applications and substitutions, including:</p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
              <li><strong>Profile Information:</strong> Name, email address, department, and roll number/ID.</li>
              <li><strong>Academic Data:</strong> Timetable schedules and lecture assignments.</li>
              <li><strong>Leave Details:</strong> Dates, reasons for leave, and substitution preferences.</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FileText size={20} style={{ color: 'var(--accent-primary)' }} /> 3. How We Use Your Information
            </h2>
            <p>Your data is used solely for institutional purposes:</p>
            <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
              <li>Processing leave applications and approvals.</li>
              <li>Matching faculty members for lecture substitutions.</li>
              <li>Generating attendance and leave reports for administrators.</li>
              <li>Sending automated notifications regarding leave status.</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Shield size={20} style={{ color: 'var(--accent-primary)' }} /> 4. Data Security
            </h2>
            <p>
              LeaveEase implements industry-standard security measures, including encryption and secure local storage, to protect your data. Access is strictly limited to authorized institutional personnel (Administrators).
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
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Questions about our Privacy Policy?</p>
            <p>Contact your institutional administrator or the development team at karanveer092004@gmail.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
