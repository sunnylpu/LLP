import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../utils/api';
import './Header.css';

const Header = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Error fetching user:', error);
          // If token is invalid, remove it
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setDropdownOpen(false);
    navigate('/login');
  };

  const getUserInitial = () => {
    if (!user) return 'U';
    const name = user.name || user.email || 'User';
    return name.charAt(0).toUpperCase();
  };

  const getUserDisplayName = () => {
    if (!user) return 'User';
    return user.name || user.email?.split('@')[0] || 'User';
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <div className="logo-icon">V</div>
          <span className="logo-text">Vocal</span>
        </Link>
        <nav className="nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/" className="nav-link">Courses</Link>
          <Link to="/about" className="nav-link">About</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
          {token && (
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
          )}
        </nav>
        {token && !loading && user ? (
          <div className="user-section" ref={dropdownRef}>
            <button
              className="profile-chip"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <div className="profile-avatar">
                {getUserInitial()}
              </div>
              <span className="profile-name">{getUserDisplayName()}</span>
              <span className={`dropdown-arrow ${dropdownOpen ? 'open' : ''}`}>⌄</span>
            </button>
            {dropdownOpen && (
              <div className="profile-dropdown">
                <Link
                  to="/dashboard"
                  className="dropdown-item"
                  onClick={() => setDropdownOpen(false)}
                >
                  <span className="dropdown-icon">📊</span>
                  Dashboard
                </Link>
                <button
                  className="dropdown-item dropdown-item-logout"
                  onClick={handleLogout}
                >
                  <span className="dropdown-icon">🚪</span>
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : !token ? (
          <div className="auth-buttons">
            <Link to="/login" className="btn-login">
              Login
            </Link>
            <Link to="/signup" className="btn-register">
              Register
            </Link>
          </div>
        ) : null}
      </div>
    </header>
  );
};

export default Header;

