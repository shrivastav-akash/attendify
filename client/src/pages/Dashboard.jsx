import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import CourseCard from '../components/CourseCard';
import AddCourseModal from '../components/AddCourseModal';
import ConfirmationModal from '../components/ConfirmationModal';
import Footer from '../components/Footer';
import api from '../utils/api';
import { FaPlus, FaSadTear } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = ({ toggleTheme, theme }) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreateOrUpdate = async (courseData) => {
    try {
      if (editingCourse) {
        const res = await api.put(`/courses/${editingCourse._id}`, courseData);
        setCourses(courses.map(c => c._id === res.data._id ? res.data : c));
      } else {
        const res = await api.post('/courses', courseData);
        setCourses([res.data, ...courses]);
      }
      setIsModalOpen(false);
      setEditingCourse(null);
    } catch (err) {
      console.error(err);
      alert('Failed to save course');
    }
  };

  const handleUpdateStats = async (id, changes) => {
    try {
      const res = await api.put(`/courses/${id}`, changes);
      setCourses(courses.map(c => c._id === id ? res.data : c));
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDelete = (id) => {
    setCourseToDelete(id);
    setDeleteModalOpen(true);
  };

  const executeDelete = async () => {
    if (!courseToDelete) return;
    try {
      await api.delete(`/courses/${courseToDelete}`);
      setCourses(courses.filter(c => c._id !== courseToDelete));
      setDeleteModalOpen(false);
      setCourseToDelete(null);
    } catch (err) {
      console.error(err);
    }
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  // ---- Derived summary metrics ----
  const isCourseSafe = (c) => {
    const pct = c.totalClasses === 0 ? 100 : (c.attendedClasses / c.totalClasses) * 100;
    return pct >= c.minAttendance;
  };

  const totalAttended = courses.reduce((s, c) => s + c.attendedClasses, 0);
  const totalClasses = courses.reduce((s, c) => s + c.totalClasses, 0);
  const overallPct = totalClasses === 0 ? 100 : Math.round((totalAttended / totalClasses) * 100);
  const safeCount = courses.filter(isCourseSafe).length;
  const atRiskCount = courses.length - safeCount;
  const skipsTotal = courses.reduce((sum, c) => {
    if (c.totalClasses === 0) return sum;
    const target = c.minAttendance / 100;
    const skip = Math.floor(c.attendedClasses / target - c.totalClasses);
    return isCourseSafe(c) && skip > 0 ? sum + skip : sum;
  }, 0);

  const firstName = (user?.username || 'there').split(' ')[0];
  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <div className="dashboard-container">
      <Header toggleTheme={toggleTheme} theme={theme} />

      <main className="container dashboard-main">
        <div className="dashboard-header">
          <div>
            <div className="dashboard-eyebrow">{todayLabel}</div>
            <h1 className="dashboard-greeting">Hi {firstName}, here's your term.</h1>
          </div>
          <button
            onClick={() => { setEditingCourse(null); setIsModalOpen(true); }}
            className="btn btn-primary add-course-btn"
          >
            <FaPlus /> Add course
          </button>
        </div>

        {!loading && courses.length > 0 && (
          <div className="summary-strip">
            <div className="summary-card summary-card-brand">
              <div className="summary-label">Overall attendance</div>
              <div className="summary-value">
                {overallPct}<span className="summary-unit">%</span>
              </div>
              <div className="summary-sub">across {courses.length} courses</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">On track</div>
              <div className="summary-value" style={{ color: 'var(--safe)' }}>{safeCount}</div>
              <div className="summary-sub">courses above target</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">At risk</div>
              <div className="summary-value" style={{ color: 'var(--risk)' }}>{atRiskCount}</div>
              <div className="summary-sub">need attention</div>
            </div>
            <div className="summary-card">
              <div className="summary-label">Skips banked</div>
              <div className="summary-value">{skipsTotal}</div>
              <div className="summary-sub">classes you can miss</div>
            </div>
          </div>
        )}

        <div className="courses-heading">
          <h2 className="section-title">My courses</h2>
          <span className="section-count">{courses.length} active</span>
        </div>

        {loading ? (
          <div className="loading-state">Loading courses...</div>
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <FaSadTear className="empty-state-icon" />
            <p className="empty-state-text">No courses added yet. Start tracking your attendance!</p>
          </div>
        ) : (
          <div className="course-grid">
            {courses.map(course => (
              <CourseCard
                key={course._id}
                course={course}
                onUpdate={handleUpdateStats}
                onDelete={confirmDelete}
                onEdit={openEditModal}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />

      {isModalOpen && (
        <AddCourseModal
          onClose={() => { setIsModalOpen(false); setEditingCourse(null); }}
          onSave={handleCreateOrUpdate}
          initialData={editingCourse}
        />
      )}

      <ConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete Course"
        message="Are you sure you want to delete this course? This action cannot be undone."
        onConfirm={executeDelete}
        onCancel={() => { setDeleteModalOpen(false); setCourseToDelete(null); }}
      />
    </div>
  );
};

export default Dashboard;
