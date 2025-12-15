import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-links">
          <a href="/">Courses</a>
          <a href="/">About Us</a>
          <a href="/">Contact</a>
          <a href="/">Privacy Policy</a>
          <a href="/">Terms of Service</a>
        </div>
        <div className="footer-social">
          <a href="/" className="social-icon">📘</a>
          <a href="/" className="social-icon">🐦</a>
          <a href="/" className="social-icon">📷</a>
        </div>
        <div className="footer-copyright">
          © 2025 Vocal Language Learning. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

