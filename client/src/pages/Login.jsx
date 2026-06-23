import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Login.css';

const Login = ({ toggleTheme, theme }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
    }
  };

  return (
    <div className="auth-page">
      <Header toggleTheme={toggleTheme} theme={theme} />

      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-mark">A</div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Log in to pick up where you left off.</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <label className="field-label">Email address</label>
            <input
              type="email"
              required
              placeholder="you@university.edu"
              className="field-input auth-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <label className="field-label">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              className="field-input auth-input"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />

            <button type="submit" className="auth-submit">Log in</button>
          </form>

          <p className="auth-switch">
            New here? <Link to="/signup" className="auth-link">Create an account</Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
