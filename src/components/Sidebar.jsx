import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  PlusSquare, 
  FileText, 
  Inbox, 
  User, 
  LogOut, 
  ShieldCheck, 
  GraduationCap,
  Power,
  Sparkles,
  Activity,
  Palmtree,
  CalendarCog,
  Menu,
  X
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (!user) return null;

  const admin1 = user.email === 'admin1@global.edu';
  const initials = user.name.split('(')[0].trim();

  const isActive = (path) => location.pathname === path ? 'active' : '';
  const isActivePrefix = (prefix) => location.pathname.startsWith(prefix) ? 'active' : '';

  const handleLogout = () => {
    logout();
    navigate(isAdmin ? '/admin/login' : '/login');
    setShowLogoutModal(false);
    setIsMobileOpen(false);
  };

  const toggleMobileMenu = () => setIsMobileOpen(!isMobileOpen);
  const closeMobileMenu = () => setIsMobileOpen(false);

  return (
    <>
      {/* Mobile Hamburger Button — hidden when sidebar is open */}
      {!isMobileOpen && (
        <button 
          className="mobile-menu-toggle" 
          onClick={toggleMobileMenu}
          aria-label="Open Menu"
        >
          <Menu size={24} />
        </button>
      )}

      {/* Backdrop for mobile */}
      {isMobileOpen && (
        <div className="sidebar-overlay" onClick={closeMobileMenu}></div>
      )}

      <aside className={`sidebar ${isMobileOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon"><Sparkles size={20} fill="currentColor" /></div>
          <div className="logo-text">LeaveFlow</div>
          <button className="mobile-close-btn" onClick={closeMobileMenu}>
            <X size={20} />
          </button>
        </div>

        <nav className="nav-links">
          {isAdmin ? (
            <>
              <Link to="/admin/dashboard" className={`nav-link ${isActive('/admin/dashboard')}`} onClick={closeMobileMenu}>
                <span className="nav-icon"><LayoutDashboard size={20} /></span>
                <span>Reports</span>
              </Link>
              <Link to="/admin/manage-teachers" className={`nav-link ${isActive('/admin/manage-teachers')}`} onClick={closeMobileMenu}>
                <span className="nav-icon"><GraduationCap size={20} /></span>
                <span>Teachers</span>
              </Link>
              <Link to="/admin/manage-admins" className={`nav-link ${isActive('/admin/manage-admins')}`} onClick={closeMobileMenu}>
                <span className="nav-icon"><ShieldCheck size={20} /></span>
                <span>Admins</span>
              </Link>
              <Link to="/admin/holidays" className={`nav-link ${isActive('/admin/holidays')}`} onClick={closeMobileMenu}>
                <span className="nav-icon"><Palmtree size={20} /></span>
                <span>Holidays</span>
              </Link>
              <Link to="/admin/timetable" className={`nav-link ${isActive('/admin/timetable')}`} onClick={closeMobileMenu}>
                <span className="nav-icon"><Calendar size={20} /></span>
                <span>Timetable</span>
              </Link>
              <Link to="/admin/activity" className={`nav-link ${isActive('/admin/activity')}`} onClick={closeMobileMenu}>
                <span className="nav-icon"><Activity size={20} /></span>
                <span>Activity</span>
              </Link>
            </>
          ) : (
            <>
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`} onClick={closeMobileMenu}>
                <span className="nav-icon"><LayoutDashboard size={20} /></span>
                <span>Dashboard</span>
              </Link>
              <Link to="/apply-leave" className={`nav-link ${isActive('/apply-leave')}`} onClick={closeMobileMenu}>
                <span className="nav-icon"><PlusSquare size={20} /></span>
                <span>Apply Leave</span>
              </Link>
              <Link to="/my-leaves" className={`nav-link ${isActive('/my-leaves')}`} onClick={closeMobileMenu}>
                <span className="nav-icon"><FileText size={20} /></span>
                <span>My Leaves</span>
              </Link>
              <Link to="/incoming-requests" className={`nav-link ${isActive('/incoming-requests')}`} onClick={closeMobileMenu}>
                <span className="nav-icon"><Inbox size={20} /></span>
                <span>Requests</span>
              </Link>
            </>
          )}
        </nav>

        <div className="sidebar-user">
          <div 
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, cursor: 'pointer' }}
            onClick={() => {
              navigate(isAdmin ? '/admin/profile' : '/profile');
              closeMobileMenu();
            }}
            title="View Profile"
          >
            <div className="user-avatar" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
              <User size={20} style={{ color: 'var(--accent-primary)' }} />
            </div>
            <div className="user-info">
              <div className="user-name">{user.name}</div>
              <div className="user-role-badge">
                {isAdmin ? (
                  admin1 ? (
                    <><ShieldCheck size={12} /> Admin</>
                  ) : (
                    <><CalendarCog size={12} /> Time Table Incharge</>
                  )
                ) : (
                  <><GraduationCap size={12} /> Teacher</>
                )}
              </div>
            </div>
          </div>
          <button 
            className="signout-btn" 
            onClick={() => {
              setShowLogoutModal(true);
            }} 
            title="Sign Out"
          >
            <span className="signout-icon"><Power size={18} /></span>
            <span className="signout-text">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '380px', textAlign: 'center' }}>
            <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: '80px', height: '80px', background: 'rgba(216, 124, 36, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                <LogOut size={40} />
              </div>
            </div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>Sign Out?</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Are you sure you want to sign out of LeaveFlow?
            </p>
            <div className="modal-actions" style={{ justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setShowLogoutModal(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
