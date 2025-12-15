import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="home-page">
      <Header />
      <main>
        <section className="hero">
          <div className="hero-container">
            <div className="hero-content">
              <h1 className="hero-title">Language Learning Courses</h1>
              <p className="hero-subtitle">Explore the World Through Language</p>
              <button className="btn-register" onClick={() => navigate('/signup')}>Register Now</button>
            </div>
            <div className="hero-image">
              <div className="image-placeholder">
                <span>📚</span>
              </div>
            </div>
          </div>
        </section>

        <section className="features">
          <div className="features-container">
            <h2 className="features-title">Why learn with us?</h2>
            <p className="features-description">
              We combine modern technology with proven teaching methods to make
              you fluent faster.
            </p>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">💬</div>
                <h3>Real-World Conversations</h3>
                <p>
                  Practice speaking from day one with our AI-powered conversation
                  partners.
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🎮</div>
                <h3>Interactive 3D Lessons</h3>
                <p>
                  Immerse yourself in virtual environments that make learning fun
                  and effective.
                </p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🎓</div>
                <h3>Expert Tutors</h3>
                <p>
                  Get personalized feedback and guidance from certified language
                  experts.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="cta">
          <div className="cta-container">
            <h2 className="cta-title">Ready to Start Your Language Journey?</h2>
            <p className="cta-subtitle">
              Join thousands of students and start speaking a new language today.
            </p>
            <button className="btn-register">Register Now</button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Home;

