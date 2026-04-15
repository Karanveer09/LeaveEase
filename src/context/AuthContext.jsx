import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, logoutUser, getCurrentUserProfile, updateTeacherProfile, updateLastActive } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';
  const needsSetup = isTeacher && !user?.profileSetup;

  useEffect(() => {
    const initAuth = async () => {
      const authData = localStorage.getItem('currentUser');
      if (authData) {
        try {
          const { uid } = JSON.parse(authData);
          const profile = await getCurrentUserProfile(uid);
          if (profile) {
            await updateLastActive(uid);
            profile.lastActive = new Date().toISOString();
          }
          setUser(profile);
        } catch (err) {
          console.error("Failed to fetch user profile:", err);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const profile = await loginUser(email, password);
    await updateLastActive(profile._id);
    profile.lastActive = new Date().toISOString();
    setUser(profile);
    return profile;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  const setupProfile = async (timetable) => {
    if (!user) throw new Error('Not logged in');
    const updated = await updateTeacherProfile(user._id, { timetable });
    setUser(updated);
    return updated;
  };

  const fetchUser = async () => {
    const authData = localStorage.getItem('currentUser');
    if (authData) {
      const { uid } = JSON.parse(authData);
      const profile = await getCurrentUserProfile(uid);
      setUser(profile);
      return profile;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, fetchUser, setupProfile, isAdmin, isTeacher, needsSetup }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
