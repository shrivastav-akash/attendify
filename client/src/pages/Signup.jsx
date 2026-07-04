import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './Signup.css';

const Signup = ({ toggleTheme, theme }) => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', university: '' });
  const [error, setError] = useState('');
  const { signup, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signup(formData.username, formData.email, formData.password, formData.university);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Signup failed');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await googleLogin(credentialResponse.credential);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.msg || 'Google sign-in failed');
    }
  };

  return (
    <div className="auth-page">
      <Header toggleTheme={toggleTheme} theme={theme} />

      <main className="auth-main">
        <div className="auth-card">
          <div className="auth-mark">A</div>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Start tracking your attendance in minutes.</p>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit}>
            <label className="field-label">Username</label>
            <input
              type="text"
              required
              placeholder="Your name"
              className="field-input auth-input"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />

            <label className="field-label">Email address</label>
            <input
              type="email"
              required
              placeholder="you@university.edu"
              className="field-input auth-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />

            <label className="field-label">University <span className="field-hint">(optional)</span></label>
            <input
              type="text"
              placeholder="Your university"
              className="field-input auth-input"
              value={formData.university}
              onChange={(e) => setFormData({ ...formData, university: e.target.value })}
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

            <button type="submit" className="auth-submit">Sign up</button>
          </form>

          <div className="auth-divider"><span>or</span></div>

          <div className="google-btn-wrap">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google sign-in failed')}
              text="signup_with"
            />
          </div>

          <p className="auth-switch">
            Already have an account? <Link to="/login" className="auth-link">Login</Link>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Signup;
