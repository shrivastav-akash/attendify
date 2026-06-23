import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaSun, FaMoon, FaUser, FaSignOutAlt } from "react-icons/fa";
import "./Header.css";

const Header = ({ toggleTheme, theme }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="container header-container">
        <Link to={user ? "/dashboard" : "/"} className="logo-link">
          <span className="logo-mark">A</span>
          <span className="logo-word">Attendify</span>
        </Link>

        {user ? (
          <div className="user-nav">
            <span className="welcome-text">Hello, {user.username}</span>

            <button onClick={toggleTheme} className="icon-btn" aria-label="Toggle theme">
              {theme === "light" ? <FaMoon /> : <FaSun />}
            </button>

            <Link to="/profile" className="icon-btn" aria-label="Profile">
              <FaUser />
            </Link>

            <button onClick={handleLogout} className="icon-btn" aria-label="Log out">
              <FaSignOutAlt />
            </button>
          </div>
        ) : (
          <div className="auth-nav">
            <button onClick={toggleTheme} className="icon-btn" aria-label="Toggle theme">
              {theme === "light" ? <FaMoon /> : <FaSun />}
            </button>
            <Link to="/login" className="ghost-btn">
              Login
            </Link>
            <Link to="/signup" className="btn btn-primary">
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
