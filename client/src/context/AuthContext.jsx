import React, { createContext, useState, useEffect, useContext } from 'react';
import api, { initCsrf } from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const boot = async () => {
      // Get a CSRF token first, then restore the session from the auth cookie.
      await initCsrf();
      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    boot();
  }, []);

  // The server sets the httpOnly auth cookie on success; we just hold the user.
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    setUser(res.data.user);
  };

  const signup = async (username, email, password, university) => {
    const res = await api.post('/auth/signup', { username, email, password, university });
    setUser(res.data.user);
  };

  const googleLogin = async (credential) => {
    const res = await api.post('/auth/google', { credential });
    setUser(res.data.user);
  };

  const logout = async () => {
    // Clear the cookie server-side; drop local state regardless of the outcome.
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // ignore — we still clear client state below
    }
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser(userData);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, googleLogin, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
