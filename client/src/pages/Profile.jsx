import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Footer from '../components/Footer';
import './Profile.css';

const Profile = ({ toggleTheme, theme }) => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    university: ''
  });
  const [status, setStatus] = useState({ type: '', msg: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        university: user.university || ''
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: 'info', msg: 'Updating...' });

    try {
      const res = await api.put('/users/profile', {
        name: formData.username,
        university: formData.university
      });
      updateUser(res.data);
      setStatus({ type: 'success', msg: 'Profile updated successfully!' });
    } catch (err) {
      setStatus({ type: 'error', msg: 'Failed to update profile.' });
    }
  };

  const getStatusClass = (type) => {
    switch (type) {
      case 'success': return 'status-success';
      case 'error': return 'status-error';
      default: return 'status-info';
    }
  };

  const initials = (formData.username || 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="profile-container">
      <Header toggleTheme={toggleTheme} theme={theme} />

      <main className="profile-main">
        <h1 className="profile-title">Profile</h1>

        <div className="profile-identity">
          <div className="profile-avatar">{initials}</div>
          <div className="profile-identity-text">
            <div className="profile-name">{formData.username || 'Your name'}</div>
            <div className="profile-email">{formData.email}</div>
          </div>
        </div>

        <div className="profile-card">
          {status.msg && (
            <div className={`status-message ${getStatusClass(status.type)}`}>
              {status.msg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label className="field-label">Full name</label>
            <input
              type="text"
              className="field-input profile-input"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />

            <label className="field-label">
              Email <span className="field-hint">(read only)</span>
            </label>
            <input
              type="email"
              disabled
              className="field-input profile-input"
              value={formData.email}
            />

            <label className="field-label">University</label>
            <input
              type="text"
              className="field-input profile-input"
              value={formData.university}
              onChange={(e) => setFormData({ ...formData, university: e.target.value })}
            />

            <button type="submit" className="profile-save">Save changes</button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
