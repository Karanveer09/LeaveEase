import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  GraduationCap, 
  Home, 
  FileEdit, 
  FileText, 
  Inbox, 
  LogOut, 
  User 
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/dashboard" className="navbar-brand" style={{ display: 'flex', alignItems: 'center' }}>
          <img src="/src/assets/LeaveEase_logo.png" alt="LeaveEase Logo" style={{ width: '100px', height: 'auto' }} />
        </Link>

        <ul className="navbar-nav">
          <li>
            <Link to="/dashboard" className={isActive('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Home size={18} /> <span>Dashboard</span>
            </Link>
          </li>
          <li>
            <Link to="/apply-leave" className={isActive('/apply-leave')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileEdit size={18} /> <span>Apply Leave</span>
            </Link>
          </li>
          <li>
            <Link to="/my-leaves" className={isActive('/my-leaves')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={18} /> <span>My Leaves</span>
            </Link>
          </li>
          <li>
            <Link to="/incoming-requests" className={isActive('/incoming-requests')} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Inbox size={18} /> <span>Requests</span>
            </Link>
          </li>
        </ul>

        <div className="navbar-user">
          <div className="navbar-avatar" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={16} />
          </div>
          <button onClick={logout} className="btn btn-ghost btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <LogOut size={16} /> <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
