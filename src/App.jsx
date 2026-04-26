import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Sidebar from './components/Sidebar';
import LandingPage from './pages/LandingPage';
import FacultyLogin from './pages/FacultyLogin';
import AdminLogin from './pages/AdminLogin';
import ProfileSetup from './pages/ProfileSetup';
import Dashboard from './pages/Dashboard';
import ApplyLeave from './pages/ApplyLeave';
import MyLeaves from './pages/MyLeaves';
import LeaveDetail from './pages/LeaveDetail';
import IncomingRequests from './pages/IncomingRequests';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageTeachers from './pages/admin/ManageTeachers';
import ManageAdmins from './pages/admin/ManageAdmins';
import ManageTimetable from './pages/admin/ManageTimetable';
import ManageHolidays from './pages/admin/ManageHolidays';
import FacultyActivity from './pages/admin/FacultyActivity';
import Profile from './pages/Profile';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Footer from './components/Footer';

function SetupGuard({ children }) {
  const { needsSetup } = useAuth();
  if (needsSetup) {
    return <Navigate to="/setup" replace />;
  }
  return children;
}

function AppContent() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<FacultyLogin />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      
      {/* Profile Setup Route (teacher first login) */}
      <Route path="/setup" element={
        <ProtectedRoute>
          <ProfileSetup />
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin/*" element={
        <AdminRoute>
          <div className="app-layout">
            <Sidebar />
            <main className="main-content">
              <Routes>
                <Route path="/dashboard" element={<AdminDashboard />} />
                <Route path="/manage-teachers" element={<ManageTeachers />} />
                <Route path="/manage-admins" element={<ManageAdmins />} />
                <Route path="/holidays" element={<ManageHolidays />} />
                <Route path="/timetable" element={<ManageTimetable />} />
                <Route path="/activity" element={<FacultyActivity />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<AdminDashboard />} />
              </Routes>
            </main>
          </div>
        </AdminRoute>
      } />

      {/* Teacher Routes */}
      <Route path="/*" element={
        <ProtectedRoute>
          <SetupGuard>
            <div className="app-layout">
              <Sidebar />
              <main className="main-content">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/apply-leave" element={<ApplyLeave />} />
                  <Route path="/my-leaves" element={<MyLeaves />} />
                  <Route path="/leave/:id" element={<LeaveDetail />} />
                  <Route path="/incoming-requests" element={<IncomingRequests />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="*" element={<Dashboard />} />
                </Routes>
              </main>
            </div>
          </SetupGuard>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
