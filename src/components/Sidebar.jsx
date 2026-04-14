import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
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
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">✦</div>
        <div className="logo-text">LeaveFlow</div>
      </div>

      <nav className="nav-links">
        <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>
          <span className="nav-icon">📊</span>
          <span>Dashboard</span>
        </Link>
        <Link to="/apply-leave" className={`nav-link ${isActive('/apply-leave')}`}>
          <span className="nav-icon">✨</span>
          <span>Apply Leave</span>
        </Link>
        <Link to="/my-leaves" className={`nav-link ${isActive('/my-leaves')}`}>
          <span className="nav-icon">📄</span>
          <span>My Leaves</span>
        </Link>
        <Link to="/incoming-requests" className={`nav-link ${isActive('/incoming-requests')}`}>
          <span className="nav-icon">📨</span>
          <span>Requests</span>
        </Link>
      </nav>

      <div className="sidebar-user">
        <div className="user-avatar">{initials}</div>
        <div className="user-info">
          <div className="user-name">{user.name}</div>
          <div className="user-dept">{user.department}</div>
        </div>
        <button className="logout-btn" onClick={logout} title="Logout">
          🚪
        </button>
      </div>
    </aside>
  );
}
