import React, { useState, useEffect } from 'react';
import './AddCourseModal.css';

const AddCourseModal = ({ onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    totalClasses: 0,
    attendedClasses: 0,
    minAttendance: 75
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{initialData ? 'Edit course' : 'Add new course'}</h2>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label className="field-label">Course name</label>
            <input
              type="text"
              required
              className="field-input"
              placeholder="e.g. Data Structures"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label className="field-label">Course code</label>
              <input
                type="text"
                required
                className="field-input"
                placeholder="CS-201"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            <div className="field">
              <label className="field-label">Target %</label>
              <input
                type="number"
                required
                min="0" max="100"
                className="field-input"
                value={formData.minAttendance}
                onChange={(e) => setFormData({ ...formData, minAttendance: parseFloat(e.target.value) })}
              />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label className="field-label">Total so far</label>
              <input
                type="number"
                min="0"
                className="field-input"
                value={formData.totalClasses}
                onChange={(e) => setFormData({ ...formData, totalClasses: parseInt(e.target.value) })}
              />
            </div>
            <div className="field">
              <label className="field-label">Attended so far</label>
              <input
                type="number"
                min="0"
                className="field-input"
                value={formData.attendedClasses}
                onChange={(e) => setFormData({ ...formData, attendedClasses: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="modal-cancel">Cancel</button>
            <button type="submit" className="modal-save">Save course</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCourseModal;
