import React, { useState, useEffect, useRef } from 'react';
import { FaCheck, FaEllipsisH } from 'react-icons/fa';
import './CourseCard.css';

const RING_RADIUS = 30;
const RING_CIRC = 2 * Math.PI * RING_RADIUS;

const CourseCard = ({ course, onUpdate, onDelete, onEdit }) => {
  const { _id, name, code, totalClasses, attendedClasses, minAttendance } = course;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  const pct = totalClasses === 0 ? 100 : (attendedClasses / totalClasses) * 100;
  const target = minAttendance / 100;
  const isSafe = pct >= minAttendance;

  // Status messaging mirrors the attendance math:
  //  - safe: how many classes can still be skipped
  //  - at risk: how many must be attended to recover (impossible at 100% target)
  let statusMsg;
  if (isSafe) {
    const skip = Math.floor(attendedClasses / target - totalClasses);
    statusMsg = skip > 0 ? `Can skip ${skip}` : 'On track';
  } else if (target >= 1) {
    statusMsg = 'Cannot recover';
  } else {
    const need = Math.ceil((totalClasses * target - attendedClasses) / (1 - target));
    statusMsg = `Attend next ${need}`;
  }

  const statusColor = isSafe ? 'var(--safe)' : 'var(--risk)';
  const statusTint = isSafe ? 'var(--safe-tint)' : 'var(--risk-tint)';
  const ringOffset = RING_CIRC * (1 - Math.min(pct, 100) / 100);

  const handleAttend = () =>
    onUpdate(_id, { attendedClasses: attendedClasses + 1, totalClasses: totalClasses + 1 });
  const handleSkip = () => onUpdate(_id, { totalClasses: totalClasses + 1 });
  const handleOD = () => onUpdate(_id, { attendedClasses: attendedClasses + 1 });

  return (
    <div className="course-card">
      <div className="course-top">
        <div className="ring-wrap">
          <svg width="76" height="76" viewBox="0 0 76 76" className="ring-svg">
            <circle cx="38" cy="38" r={RING_RADIUS} fill="none" stroke="var(--ring-track)" strokeWidth="7" />
            <circle
              cx="38"
              cy="38"
              r={RING_RADIUS}
              fill="none"
              stroke={statusColor}
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={RING_CIRC.toFixed(2)}
              strokeDashoffset={ringOffset.toFixed(2)}
              className="ring-progress"
            />
          </svg>
          <div className="ring-label">
            <span className="ring-pct" style={{ color: statusColor }}>{Math.round(pct)}</span>
            <span className="ring-unit">percent</span>
          </div>
        </div>

        <div className="course-meta">
          <div className="course-headline">
            <div className="course-title-block">
              <h3 className="course-title">{name}</h3>
              <div className="course-code">{code}</div>
            </div>

            <div className="kebab-wrap" ref={menuRef}>
              <button
                className="kebab-btn"
                aria-label="More"
                onClick={() => setMenuOpen((o) => !o)}
              >
                <FaEllipsisH />
              </button>
              {menuOpen && (
                <div className="kebab-menu">
                  <button
                    className="kebab-item"
                    onClick={() => { setMenuOpen(false); onEdit(course); }}
                  >
                    Edit course
                  </button>
                  <button
                    className="kebab-item kebab-item-danger"
                    onClick={() => { setMenuOpen(false); onDelete(_id); }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="status-pill" style={{ background: statusTint, color: statusColor }}>
            <span className="status-dot" style={{ background: statusColor }}></span>
            {statusMsg}
          </div>
        </div>
      </div>

      <div className="course-stats">
        <div className="stat">
          <div className="stat-label">Attended</div>
          <div className="stat-value">{attendedClasses}</div>
        </div>
        <div className="stat">
          <div className="stat-label">Total</div>
          <div className="stat-value">{totalClasses}</div>
        </div>
        <div className="stat stat-end">
          <div className="stat-label">Target</div>
          <div className="stat-value">{minAttendance}%</div>
        </div>
      </div>

      <div className="course-actions">
        <button onClick={handleAttend} className="act-btn act-attend">
          <FaCheck /> Attend
        </button>
        <button onClick={handleSkip} className="act-btn act-ghost">Skip</button>
        <button onClick={handleOD} className="act-btn act-ghost">OD</button>
      </div>
    </div>
  );
};

export default CourseCard;
