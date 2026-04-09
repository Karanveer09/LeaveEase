import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ApplyLeave from './pages/ApplyLeave';
import MyLeaves from './pages/MyLeaves';
import LeaveDetail from './pages/LeaveDetail';
import IncomingRequests from './pages/IncomingRequests';

function AppContent() {
  return (
    <div className="app-layout">
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/apply-leave" element={
          <ProtectedRoute><ApplyLeave /></ProtectedRoute>
        } />
        <Route path="/my-leaves" element={
          <ProtectedRoute><MyLeaves /></ProtectedRoute>
        } />
        <Route path="/leave/:id" element={
          <ProtectedRoute><LeaveDetail /></ProtectedRoute>
        } />
        <Route path="/incoming-requests" element={
          <ProtectedRoute><IncomingRequests /></ProtectedRoute>
        } />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
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
