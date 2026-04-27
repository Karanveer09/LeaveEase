import { sendAdminResetNotification } from './emailService';
import { apiCall } from '../utils/api';

// Login User
export const loginUser = async (email, password) => {
  const response = await apiCall('/auth/login', 'POST', { email, password });
  localStorage.setItem('currentUser', JSON.stringify({ uid: response._id }));
  return response;
};

// Logout User
export const logoutUser = async () => {
  localStorage.removeItem('currentUser');
};

// Get Current User Profile
export const getCurrentUserProfile = async (uid) => {
  if (!uid) {
    const authData = localStorage.getItem('currentUser');
    if (!authData) return null;
    uid = JSON.parse(authData).uid;
  }
  return await apiCall(`/users/${uid}`);
};

// Link Admin to a Teacher Profile
export const linkAdminToTeacher = async (adminId, teacherId) => {
  const admin = await apiCall(`/users/${adminId}`);
  if (!admin || admin.role !== 'admin') {
    throw new Error('Unauthorized');
  }
  return await apiCall(`/users/${adminId}`, 'PUT', { linkedTeacherId: teacherId });
};

// Unlink Admin from Teacher Profile
export const unlinkAdminFromTeacher = async (adminId) => {
  const admin = await apiCall(`/users/${adminId}`);
  if (!admin || admin.role !== 'admin') {
    throw new Error('Unauthorized');
  }
  return await apiCall(`/users/${adminId}`, 'PUT', { linkedTeacherId: null });
};

// Create Teacher Account (Admin only)
export const createTeacherAccount = async (adminId, teacherData) => {
  const admin = await apiCall(`/users/${adminId}`);
  if (!admin || admin.role !== 'admin') {
    throw new Error('Unauthorized: Only admins can create teacher accounts');
  }

  const { name, email, password, department } = teacherData;

  // Check if user exists
  const allUsers = await apiCall('/users');
  const userExists = allUsers.find(u => u.email === email);
  if (userExists) {
    throw new Error('A user with this email already exists.');
  }

  const newUser = await apiCall('/users', 'POST', {
    email,
    password,
    name,
    department,
    role: 'teacher',
    profileComplete: false,
  });

  return newUser;
};

// Update Teacher Profile (timetable setup)
export const updateTeacherProfile = async (uid, updates) => {
  const user = await apiCall(`/users/${uid}`);
  if (!user) throw new Error('User not found');

  const updatedUser = await apiCall(`/users/${uid}`, 'PUT', {
    ...updates,
    profileComplete: true,
  });
  return updatedUser;
};

// Get All Teachers
export const getAllTeachers = async () => {
  const users = await apiCall('/users');
  return users.filter(u => u.role === 'teacher');
};

// Get All Admins
export const getAllAdmins = async () => {
  const users = await apiCall('/users');
  return users.filter(u => u.role === 'admin');
};

// Get All Teachers (except given user)
export const getAllTeachersInfo = async (currentUid) => {
  const users = await apiCall('/users');
  return users.filter(doc => doc._id !== currentUid && doc.role === 'teacher');
};

// Delete Teacher (Admin only)
export const deleteTeacher = async (adminId, teacherId) => {
  const admin = await apiCall(`/users/${adminId}`);
  if (!admin || admin.role !== 'admin') {
    throw new Error('Unauthorized: Only admins can delete teacher accounts');
  }

  const teacher = await apiCall(`/users/${teacherId}`);
  if (!teacher || teacher.role !== 'teacher') {
    throw new Error('Teacher not found');
  }

  await apiCall(`/users/${teacherId}`, 'DELETE');
  return true;
};

// Update teacher details (Admin only)
export const updateTeacherDetails = async (adminId, teacherId, updates) => {
  const admin = await apiCall(`/users/${adminId}`);
  if (!admin || admin.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const updatedUser = await apiCall(`/users/${teacherId}`, 'PUT', updates);
  return updatedUser;
};

// Activity Tracking
export const updateLastActive = async (uid) => {
  if (!uid) return null;
  return await apiCall(`/users/${uid}`, 'PUT', { lastActive: new Date().toISOString() });
};

// Password Reset Functions
export const requestPasswordReset = async (email) => {
  return await apiCall('/auth/request-reset', 'POST', { email });
};

export const checkPasswordRequestStatus = async (email) => {
  return await apiCall(`/auth/reset-status/${encodeURIComponent(email)}`);
};

export const submitNewPassword = async (email, newPassword) => {
  return await apiCall('/auth/submit-password', 'POST', { email, newPassword });
};

// Admin Password Request Management
export const getPasswordRequests = async () => {
  return await apiCall('/auth/password-requests');
};

export const approvePasswordRequest = async (requestId) => {
  return await apiCall(`/auth/approve-request/${requestId}`, 'POST');
};

export const clearPasswordRequest = async (requestId) => {
  return await apiCall(`/auth/clear-request/${requestId}`, 'DELETE');
};

// Timetable Management
export const updateTimetable = async (teacherId, timetableData) => {
  return await apiCall(`/users/${teacherId}/timetable`, 'PUT', timetableData);
};
