import { localCollection } from '../utils/localDb';

const usersCollection = localCollection('users');

// Login User
export const loginUser = async (email, password) => {
  const users = usersCollection.getAll();
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  localStorage.setItem('currentUser', JSON.stringify({ uid: user._id }));
  return user;
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
  const user = usersCollection.getById(uid);
  return user || null;
};

// ====== Admin Functions ======

// Create Teacher Account (Admin only)
export const createTeacherAccount = async (adminId, teacherData) => {
  const admin = usersCollection.getById(adminId);
  if (!admin || admin.role !== 'admin') {
    throw new Error('Unauthorized: Only admins can create teacher accounts');
  }

  const { name, email, password, department } = teacherData;

  // Check if user exists
  const existingUsers = usersCollection.getAll();
  const userExists = existingUsers.find(u => u.email === email);
  if (userExists) {
    throw new Error('A user with this email already exists.');
  }

  const newUser = usersCollection.add({
    email,
    password,
    name,
    department,
    role: 'teacher',
    profileSetup: false,
    timetable: {
      monday: [], tuesday: [], wednesday: [],
      thursday: [], friday: []
    },
    createdAt: new Date().toISOString()
  });

  return newUser;
};

// Update Teacher Profile (timetable setup)
export const updateTeacherProfile = async (uid, updates) => {
  const user = usersCollection.getById(uid);
  if (!user) throw new Error('User not found');

  const updatedUser = usersCollection.update(uid, {
    ...updates,
    profileSetup: true
  });
  return updatedUser;
};

// Update Timetable (admin or self)
export const updateTimetable = async (uid, timetable) => {
  const updatedUser = usersCollection.update(uid, { timetable, profileSetup: true });
  return updatedUser;
};

// Get All Teachers
export const getAllTeachers = async () => {
  const users = usersCollection.getAll();
  return users.filter(u => u.role === 'teacher');
};

// Get All Teachers (except given user)
export const getAllTeachersInfo = async (currentUid) => {
  const users = usersCollection.getAll();
  return users.filter(doc => doc._id !== currentUid && doc.role === 'teacher');
};

// Delete Teacher (Admin only)
export const deleteTeacher = async (adminId, teacherId) => {
  const admin = usersCollection.getById(adminId);
  if (!admin || admin.role !== 'admin') {
    throw new Error('Unauthorized: Only admins can delete teacher accounts');
  }

  const teacher = usersCollection.getById(teacherId);
  if (!teacher || teacher.role !== 'teacher') {
    throw new Error('Teacher not found');
  }

  usersCollection.delete(teacherId);
  return true;
};

// Update teacher details (Admin only)
export const updateTeacherDetails = async (adminId, teacherId, updates) => {
  const admin = usersCollection.getById(adminId);
  if (!admin || admin.role !== 'admin') {
    throw new Error('Unauthorized');
  }

  const updatedUser = usersCollection.update(teacherId, updates);
  return updatedUser;
};

// ====== Password Reset Flows ======
const passReqsCollection = localCollection('passwordRequests');

export const requestPasswordReset = async (email) => {
  const users = usersCollection.getAll();
  const user = users.find(u => u.email === email && u.role === 'teacher');
  if (!user) throw new Error("No teacher account found with this email.");
  
  const existing = passReqsCollection.getAll().find(r => r.email === email);
  if (existing) return existing;
  
  return passReqsCollection.add({ 
    email, 
    status: 'pending', 
    teacherName: user.name,
    createdAt: new Date().toISOString() 
  });
};

export const checkPasswordRequestStatus = async (email) => {
  const req = passReqsCollection.getAll().find(r => r.email === email);
  return req || null;
};

export const submitNewPassword = async (email, newPassword) => {
  const req = passReqsCollection.getAll().find(r => r.email === email && r.status === 'approved');
  if (!req) throw new Error("No approved password reset request found.");
  
  const users = usersCollection.getAll();
  const user = users.find(u => u.email === email);
  if (user) {
    usersCollection.update(user._id, { password: newPassword });
    passReqsCollection.delete(req._id);
    return true;
  }
  throw new Error("User not found.");
};

export const getPasswordRequests = async () => {
  return passReqsCollection.getAll().sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
};

export const approvePasswordRequest = async (requestId) => {
  return passReqsCollection.update(requestId, { status: 'approved' });
};

// ====== Activity Tracking ======
export const updateLastActive = async (uid) => {
  const user = usersCollection.getById(uid);
  if (!user) return null;
  return usersCollection.update(uid, { lastActive: new Date().toISOString() });
};
