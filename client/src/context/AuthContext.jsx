import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
      } catch (err) {
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  };

  const signup = async (username, email, password, university) => {
    const res = await api.post('/auth/signup', { username, email, password, university });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  };

  const googleLogin = async (credential) => {
    const res = await api.post('/auth/google', { credential });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('token');
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
