import { localCollection } from '../utils/localDb';

const usersCollection = localCollection('users');

const generateRandomId = () => Math.random().toString(36).substr(2, 9);

// Register User
export const registerUser = async (userData) => {
  const { name, email, password, department, timetable } = userData;
  
  // Check if user exists
  const existingUsers = usersCollection.getAll();
  const userExists = existingUsers.find(u => u.email === email);
  if (userExists) {
    throw new Error('User with this email already exists.');
  }

  // Generate an ID (mock Firebase Auth UID)
  const uid = generateRandomId();
  
  const newUserData = {
    email,
    password, // Storing password raw just for demo since there's no backend
    name,
    department,
    timetable,
    createdAt: new Date().toISOString()
  };

  const savedUser = usersCollection.addWithId(uid, newUserData);
  
  // Save active login state
  localStorage.setItem('currentUser', JSON.stringify({ uid: savedUser._id }));
  
  return savedUser;
};

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

// Update Timetable
export const updateTimetable = async (uid, timetable) => {
  const updatedUser = usersCollection.update(uid, { timetable });
  return updatedUser;
};

// Get All Teachers (except current)
export const getAllTeachersInfo = async (currentUid) => {
  const users = usersCollection.getAll();
  return users.filter(doc => doc._id !== currentUid);
};
