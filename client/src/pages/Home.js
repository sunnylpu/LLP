import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    setIsLoggedIn(!!token);
  }, [token]);

  const steps = [
    {
      number: "1",
      icon: "🌍",
      title: "Choose a language",
      description: "Select from multiple languages and start your learning journey"
    },
    {
      number: "2",
      icon: "🎧",
      title: "Listen or convert text to audio",
      description: "Engage with audio content or transform any text into speech"
    },
    {
      number: "3",
      icon: "📖",
      title: "Read summary & vocabulary",
      description: "Understand key points and learn important words from each lesson"
    },
    {
      number: "4",
      icon: "👆",
      title: "Tap words → translate → hear pronunciation",
      description: "Interactive word-level learning for better understanding"
    }
  ];

  const uniqueFeatures = [
    {
      icon: "🎧",
      title: "Convert Any Text into Listening Lessons",
      description: "Paste text → audio → summary → vocabulary"
    },
    {
      icon: "👆",
      title: "Tap Any Word to Translate & Hear Pronunciation",
      description: "Interactive word-level learning"
    },
    {
      icon: "📊",
      title: "Listening Confidence Meter",
      description: "Visual indicator showing listening improvement"
    },
    {
      icon: "🧠",
      title: "Smart Vocabulary Builder",
      description: "Automatically extracts important words"
    }
  ];

  const comparisons = [
    {
      traditional: "Memorization",
      vocal: "Listening-first",
      icon: "❌"
    },
    {
      traditional: "Grammar-heavy",
      vocal: "Real-world language",
      icon: "❌"
    },
    {
      traditional: "Fixed lessons",
      vocal: "Your own text",
      icon: "❌"
    },
    {
      traditional: "Passive learning",
      vocal: "Interactive learning",
      icon: "❌"
    }
  ];

  const targetAudience = [
    { icon: "🎓", title: "Students", description: "Perfect for academic language learning" },
    { icon: "💼", title: "Professionals", description: "Enhance your career with new languages" },
    { icon: "✈️", title: "Travelers", description: "Learn practical phrases for your trips" },
    { icon: "🌱", title: "Beginners", description: "Start from scratch with confidence" }
  ];

  return (
    <div className="home-page">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-container">
            <div className="hero-content">
              <h1 className="hero-title">Learn Languages by Listening, Not Memorizing</h1>
              <p className="hero-subtitle">
                Turn any text into audio, understand real conversations, and build confidence naturally.
              </p>
              <div className="hero-buttons">
                <button 
                  className="btn-hero-primary" 
                  onClick={() => navigate('/vocabulary')}
                >
                  📘 Explore Vocabulary
                </button>
                <button 
                  className="btn-hero-secondary" 
                  onClick={() => navigate('/listening')}
                >
                  ✨ Try Text to Speech
                </button>
              </div>
              {!isLoggedIn && (
                <button 
                  className="btn-register-hero" 
                  onClick={() => navigate('/signup')}
                >
                  Register Now
                </button>
              )}
            </div>
            <div className="hero-icon">
              <div className="icon-glow">🎧</div>
            </div>
          </div>
        </section>

        {/* How Vocal Works */}
        <section className="how-works-section">
          <div className="how-works-container">
            <h2 className="section-title">How Vocal Works</h2>
            <div className="steps-grid">
              {steps.map((step, index) => (
                <div key={index} className="step-card">
                  <div className="step-number">{step.number}</div>
                  <div className="step-icon">{step.icon}</div>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Unique Feature Highlights */}
        <section className="features-section">
          <div className="features-container">
            <h2 className="section-title">Unique Features</h2>
            <div className="features-grid">
              {uniqueFeatures.map((feature, index) => (
                <div key={index} className="feature-card">
                  <div className="feature-icon">{feature.icon}</div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Vocal is Different */}
        <section className="comparison-section">
          <div className="comparison-container">
            <h2 className="section-title">Why Vocal is Different</h2>
            <div className="comparison-grid">
              {comparisons.map((item, index) => (
                <div key={index} className="comparison-card">
                  <div className="comparison-traditional">
                    <span className="comparison-icon">{item.icon}</span>
                    <span className="comparison-text">{item.traditional}</span>
                  </div>
                  <div className="comparison-arrow">→</div>
                  <div className="comparison-vocal">
                    <span className="comparison-check">✅</span>
                    <span className="comparison-text">{item.vocal}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who Is This For */}
        <section className="audience-section">
          <div className="audience-container">
            <h2 className="section-title">Who Is This For?</h2>
            <div className="audience-grid">
              {targetAudience.map((item, index) => (
                <div key={index} className="audience-card">
                  <div className="audience-icon">{item.icon}</div>
                  <h3 className="audience-title">{item.title}</h3>
                  <p className="audience-description">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section - Only if not logged in */}
        {!isLoggedIn && (
          <section className="final-cta-section">
            <div className="final-cta-container">
              <h2 className="final-cta-title">Ready to start your language journey?</h2>
              <div className="cta-buttons">
                <button 
                  className="btn-cta-primary" 
                  onClick={() => navigate('/signup')}
                >
                  Register Now
                </button>
                <button 
                  className="btn-cta-secondary" 
                  onClick={() => navigate('/')}
                >
                  Explore Courses
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Home;
