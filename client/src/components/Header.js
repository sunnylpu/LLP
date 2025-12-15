import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser } from '../utils/api';
import './Header.css';

const Header = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <div className="logo-icon">V</div>
          <span className="logo-text">Vocal</span>
        </Link>
        <nav className="nav">
          <Link to="/" className="nav-link">Courses</Link>
          <Link to="/" className="nav-link">About Us</Link>
          <Link to="/contact" className="nav-link">Contact</Link>
          {token ? (
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
          ) : (
            <Link to="/login" className="nav-link">Login</Link>
          )}
        </nav>
        {token && !loading && user ? (
          <div className="user-section">
            <span className="username">{user.name || user.email || 'User'}</span>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : !token ? (
          <Link to="/signup" className="btn-signup">
            Sign Up
          </Link>
        ) : null}
      </div>
    </header>
  );
};

export default Header;

