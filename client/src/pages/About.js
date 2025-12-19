import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import './About.css';

const About = () => {
  const navigate = useNavigate();

  const testimonials = [
    {
      rating: 5,
      text: "Vocal helped me understand spoken English much better. The listening-first approach is exactly what I needed.",
      name: "Sarah Chen",
      role: "Student"
    },
    {
      rating: 5,
      text: "Simple UI and very effective listening practice. I've improved my confidence in just a few weeks.",
      name: "Michael Rodriguez",
      role: "Professional"
    },
    {
      rating: 4,
      text: "The vocabulary summaries are incredibly helpful. I can finally follow conversations in French!",
      name: "Emma Thompson",
      role: "Learner"
    },
    {
      rating: 5,
      text: "Learning at my own pace without pressure is perfect. Vocal makes language learning enjoyable.",
      name: "David Kim",
      role: "Self-learner"
    }
  ];

  const steps = [
    {
      number: "1",
      title: "Choose a language",
      description: "Select from multiple languages and start your learning journey"
    },
    {
      number: "2",
      title: "Listen or convert text to speech",
      description: "Engage with audio content or transform any text into speech"
    },
    {
      number: "3",
      title: "Read summary & vocabulary",
      description: "Understand key points and learn important words from each lesson"
    },
    {
      number: "4",
      title: "Practice daily",
      description: "Build consistency with regular practice sessions"
    },
    {
      number: "5",
      title: "Improve confidence",
      description: "Gain confidence in understanding and using your new language"
    }
  ];

  const targetAudience = [
    { icon: "🎓", title: "Students", description: "Perfect for academic language learning" },
    { icon: "💼", title: "Professionals", description: "Enhance your career with new languages" },
    { icon: "🌱", title: "Beginners", description: "Start from scratch with confidence" },
    { icon: "✈️", title: "Travelers", description: "Learn practical phrases for your trips" },
    { icon: "📚", title: "Self-learners", description: "Study independently at your own pace" }
  ];

  return (
    <div className="about-page">
      <Header />
      <main>
        {/* Hero Section */}

        {/* Our Mission */}
        <section className="mission-section">
          <div className="mission-container">
            <h2 className="section-title">Our Mission</h2>
            <p className="mission-text">
              Vocal exists to make language learning simple, natural, and effective. 
              We believe that the best way to learn a language is by listening first—just 
              like how we learned our native tongue. Our platform focuses on helping you 
              understand real-world language through audio content, smart summaries, and 
              vocabulary building. We're here to support your journey from beginner to 
              confident speaker, one lesson at a time.
            </p>
          </div>
        </section>

        {/* What Makes Vocal Different */}
        <section className="different-section">
          <div className="different-container">
            <h2 className="section-title">What Makes Vocal Different</h2>
            <div className="different-grid">
              <div className="different-card">
                <div className="different-icon">🎧</div>
                <h3>Listening-first learning</h3>
                <p>
                  Start with your ears, not your eyes. Our approach mimics natural 
                  language acquisition for better retention.
                </p>
              </div>
              <div className="different-card">
                <div className="different-icon">📖</div>
                <h3>Smart summaries & vocabulary</h3>
                <p>
                  Get instant summaries and key vocabulary from every lesson to 
                  reinforce your learning.
                </p>
              </div>
              <div className="different-card">
                <div className="different-icon">🌍</div>
                <h3>Multi-language support</h3>
                <p>
                  Learn multiple languages with the same effective method. 
                  Expand your horizons one language at a time.
                </p>
              </div>
              <div className="different-card">
                <div className="different-icon">🧠</div>
                <h3>Learn at your own pace</h3>
                <p>
                  No pressure, no deadlines. Study when it works for you and 
                  progress at a comfortable speed.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="how-it-works-section">
          <div className="how-it-works-container">
            <h2 className="section-title">How It Works</h2>
            <div className="steps-grid">
              {steps.map((step, index) => (
                <div key={index} className="step-card">
                  <div className="step-number">{step.number}</div>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-description">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="testimonials-section">
          <div className="testimonials-container">
            <h2 className="section-title">What Our Learners Say</h2>
            <div className="testimonials-grid">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="testimonial-card">
                  <div className="testimonial-rating">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <span key={i} className="star">⭐</span>
                    ))}
                  </div>
                  <p className="testimonial-text">"{testimonial.text}"</p>
                  <div className="testimonial-author">
                    <strong>{testimonial.name}</strong>
                    <span className="testimonial-role">{testimonial.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Who Is Vocal For */}
        <section className="audience-section">
          <div className="audience-container">
            <h2 className="section-title">Who Is Vocal For</h2>
            <div className="audience-grid">
              {targetAudience.map((item, index) => (
                <div key={index} className="audience-card">
                  <div className="audience-icon">{item.icon}</div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Vision */}
        <section className="vision-section">
          <div className="vision-container">
            <h2 className="section-title">Our Vision</h2>
            <p className="vision-text">
              We envision a world where language barriers don't limit anyone's potential. 
              Our goal is to make language learning so simple and accessible that anyone 
              can gain confidence in speaking a new language. We're committed to continuously 
              improving our platform, adding more languages, and helping millions of learners 
              achieve their language goals. Together, we're building a community of confident 
              multilingual speakers.
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="final-cta-section">
          <div className="final-cta-container">
            <h2 className="final-cta-title">Ready to start your language journey?</h2>
            <div className="cta-buttons">
              <button 
                className="btn-cta-secondary" 
                onClick={() => navigate('/')}
              >
                Explore Courses
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;

