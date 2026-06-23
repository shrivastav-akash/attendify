import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import { FaSun, FaMoon, FaRegClock, FaBullseye, FaPenNib } from 'react-icons/fa';
import './LandingPage.css';

const features = [
  {
    icon: <FaRegClock />,
    title: 'Skip math, solved',
    desc: 'Attendify tells you exactly how many classes you can miss while staying above target.',
  },
  {
    icon: <FaBullseye />,
    title: 'Stay above the line',
    desc: 'Color-coded rings and pills make at-risk courses impossible to ignore.',
  },
  {
    icon: <FaPenNib />,
    title: 'Built for your term',
    desc: 'Add courses, set per-course targets, and log ODs in a single tap.',
  },
];

const LandingPage = ({ toggleTheme, theme }) => {
  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="container landing-nav-container">
          <Link to="/" className="logo-link">
            <span className="logo-mark">A</span>
            <span className="logo-word">Attendify</span>
          </Link>
          <div className="landing-nav-links">
            <button onClick={toggleTheme} className="icon-btn" aria-label="Toggle theme">
              {theme === 'light' ? <FaMoon /> : <FaSun />}
            </button>
            <Link to="/login" className="ghost-btn">Login</Link>
            <Link to="/signup" className="btn btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      <main className="landing-main">
        <div className="landing-badge">★ Trusted by students at 40+ campuses</div>
        <h1 className="hero-title">Never lose track of a class again.</h1>
        <p className="hero-subtitle">
          Attendify does the math for you — see exactly how many lectures you can skip
          and how many you must attend to hold your target.
        </p>

        <div className="cta-container">
          <Link to="/signup" className="cta-primary">Start tracking free</Link>
          <Link to="/login" className="cta-secondary">I have an account</Link>
        </div>

        <div className="features-grid">
          {features.map((f) => (
            <div key={f.title} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3 className="feature-title">{f.title}</h3>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
