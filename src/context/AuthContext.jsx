import { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, logoutUser, getCurrentUserProfile } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const authData = localStorage.getItem('currentUser');
      if (authData) {
        try {
          const { uid } = JSON.parse(authData);
          const profile = await getCurrentUserProfile(uid);
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
    setUser(profile);
    return profile;
  };

  const register = async (userData) => {
    const profile = await registerUser(userData);
    setUser(profile);
    return profile;
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
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
    <AuthContext.Provider value={{ user, loading, login, register, logout, fetchUser }}>
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
