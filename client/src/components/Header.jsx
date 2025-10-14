// src/components/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Header.css';

const Header = () => {
  const userRole = localStorage.getItem('userRole'); // 'seeker' or 'recruiter'
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark'
  );

  // Apply theme when toggled
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <header className={`header ${darkMode ? 'dark' : ''}`}>
      <div className="logo">
        <Link to="/">
          <span className="logo-icon">🚀</span>
          <span className="logo-text">FirstStepJob<span>.com</span></span>
        </Link>
      </div>

      <nav className="nav-links">
        <button
          className="nav-btn"
          onClick={() => {
            if (userRole === 'seeker') navigate('/main-seeker');
            else if (userRole === 'recruiter') navigate('/main-provider');
          }}
        >
          Home
        </button>

        <Link to="/available-jobs">Jobs</Link>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>

        {/* 🌗 Dark mode toggle button */}
        {/* <button className="theme-toggle" onClick={toggleTheme}>
          {darkMode ? '🌙 Dark' : '☀️ Light'}
        </button> */}
      </nav>
    </header>
  );
};

export default Header;
