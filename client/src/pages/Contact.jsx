import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { submitContactForm } from '../utils/api';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
  const [openFaq, setOpenFaq] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage({ type: '', text: '' });

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await submitContactForm({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        category: formData.category || '',
        message: formData.message
      });
      
      // Show success message from backend or default
      setSubmitMessage({
        type: 'success',
        text: response?.message || 'Message sent successfully!'
      });
      
      // Reset form after successful submission
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: '',
        message: ''
      });
    } catch (error) {
      // Show error message from backend or default
      setSubmitMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to send message. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: 'How to reset password?',
      answer: 'To reset your password, go to the login page and click on "Forgot Password". Enter your email address and you will receive a password reset link. Follow the instructions in the email to create a new password.'
    },
    {
      question: 'How to access courses?',
      answer: 'After logging in, navigate to your Dashboard. You will see all available courses there. Click on any course to start learning. Make sure you are enrolled in the course to access its content.'
    },
    {
      question: 'How to fix login issues?',
      answer: 'If you are experiencing login issues, try the following: 1) Clear your browser cache and cookies, 2) Make sure you are using the correct email and password, 3) Check if your account is verified, 4) Try using a different browser or incognito mode. If problems persist, contact our support team.'
    },
    {
      question: 'How to improve speaking skills?',
      answer: 'To improve your speaking skills, practice regularly using our listening lessons and vocabulary exercises. Engage with our interactive conversation features, repeat phrases out loud, and try to use new words in context. Consistent daily practice is key to improvement.'
    },
    {
      question: 'How to contact support?',
      answer: 'You can contact our support team by filling out the contact form on this page, sending an email to support@vocal.com, or calling us at +91-80-1234-5678 during our support hours (Mon-Sat, 10 AM - 7 PM IST).'
    }
  ];

  return (
    <div className="contact-page">
      <Header />
      <main className="contact-main">
        {/* Hero Section */}
        <section className="contact-hero">
          <div className="contact-hero-container">
            <h1 className="contact-hero-title">Get in Touch</h1>
            <p className="contact-hero-subtitle">
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </section>

        {/* Main Contact Section */}
        <section className="contact-section">
          <div className="contact-container">
            <div className="contact-grid">
              {/* Contact Form - Left Side */}
              <div className="contact-form-wrapper">
                <h2 className="contact-form-title">Send us a Message</h2>
                <form className="contact-form" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`form-input ${errors.name ? 'error' : ''}`}
                      placeholder=" "
                      required
                    />
                    <label htmlFor="name" className="form-label">
                      Full Name <span className="required">*</span>
                    </label>
                    {errors.name && <span className="error-message">{errors.name}</span>}
                  </div>

                  <div className="form-group">
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`form-input ${errors.email ? 'error' : ''}`}
                      placeholder=" "
                      required
                    />
                    <label htmlFor="email" className="form-label">
                      Email <span className="required">*</span>
                    </label>
                    {errors.email && <span className="error-message">{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <input
                      type="text"
                      name="subject"
                      id="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className={`form-input ${errors.subject ? 'error' : ''}`}
                      placeholder=" "
                      required
                    />
                    <label htmlFor="subject" className="form-label">
                      Subject <span className="required">*</span>
                    </label>
                    {errors.subject && <span className="error-message">{errors.subject}</span>}
                  </div>

                  <div className="form-group">
                    <select
                      name="category"
                      id="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="form-input form-select"
                    >
                      <option value="">Select Category (Optional)</option>
                      <option value="general">General Inquiry</option>
                      <option value="technical">Technical Issue</option>
                      <option value="feedback">Feedback</option>
                      <option value="business">Business Collaboration</option>
                    </select>
                    <label htmlFor="category" className="form-label">
                      Category
                    </label>
                  </div>

                  <div className="form-group">
                    <textarea
                      name="message"
                      id="message"
                      value={formData.message}
                      onChange={handleChange}
                      className={`form-input form-textarea ${errors.message ? 'error' : ''}`}
                      placeholder=" "
                      rows="6"
                      required
                    />
                    <label htmlFor="message" className="form-label">
                      Message <span className="required">*</span>
                    </label>
                    {errors.message && <span className="error-message">{errors.message}</span>}
                  </div>

                  <button
                    type="submit"
                    className="btn-submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>

                  {submitMessage.text && (
                    <div className={`submit-message ${submitMessage.type}`}>
                      {submitMessage.text}
                    </div>
                  )}
                </form>
              </div>

              {/* Contact Info - Right Side */}
              <div className="contact-info-wrapper">
                <h2 className="contact-info-title">Contact Information</h2>
                <div className="contact-info-card">
                  <div className="contact-info-item">
                    <div className="contact-info-icon">📧</div>
                    <div className="contact-info-content">
                      <h3>Email</h3>
                      <p>support@vocal.com</p>
                    </div>
                  </div>

                  <div className="contact-info-item">
                    <div className="contact-info-icon">📞</div>
                    <div className="contact-info-content">
                      <h3>Phone</h3>
                      <p>+91-80-1234-5678</p>
                    </div>
                  </div>

                  <div className="contact-info-item">
                    <div className="contact-info-icon">📍</div>
                    <div className="contact-info-content">
                      <h3>Location</h3>
                      <p>Punjab, India</p>
                    </div>
                  </div>

                  <div className="contact-info-item">
                    <div className="contact-info-icon">🕐</div>
                    <div className="contact-info-content">
                      <h3>Support Hours</h3>
                      <p>Mon - Sat, 10 AM - 7 PM IST</p>
                    </div>
                  </div>
                </div>

                <div className="social-media">
                  <h3 className="social-title">Follow Us</h3>
                  <div className="social-icons">
                    <a
                      href="https://facebook.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-icon"
                      aria-label="Facebook"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                    <a
                      href="https://instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-icon"
                      aria-label="Instagram"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                    </a>
                    <a
                      href="https://linkedin.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-icon"
                      aria-label="LinkedIn"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                    <a
                      href="https://youtube.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-icon"
                      aria-label="YouTube"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="faq-section">
          <div className="faq-container">
            <h2 className="faq-title">Frequently Asked Questions</h2>
            <div className="faq-list">
              {faqs.map((faq, index) => (
                <div key={index} className={`faq-item ${openFaq === index ? 'open' : ''}`}>
                  <button
                    className="faq-question"
                    onClick={() => toggleFaq(index)}
                  >
                    <span>{faq.question}</span>
                    <span className="faq-icon">{openFaq === index ? '−' : '+'}</span>
                  </button>
                  <div className="faq-answer">
                    <p>{faq.answer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="map-section">
          <div className="map-container">
            <h2 className="map-title">Find Us</h2>
            <div className="map-wrapper">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m16!1m12!1m3!1d6821.540067988189!2d75.69942184378513!3d31.254788869117043!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!2m1!1sLovely%20Professional%20University!5e0!3m2!1sen!2sin!4v1765564614118!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: '16px' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Vocal Office Location"
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;

