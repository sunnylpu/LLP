import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, register, loginWithGoogle } from '../utils/api';
import './Login.css';

const Login = ({ isLogin = true }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  // Load Google Identity Services
  useEffect(() => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      console.warn('Google Client ID is not configured. Google sign-in will not work.');
      return;
    }

    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (window.google && window.google.accounts) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            handleGoogleSignIn(response);
          },
        });
      }
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, []);

  const handleGoogleSignIn = async (response) => {
    try {
      setGoogleLoading(true);
      setError('');
      
      // If response has credential (ID token flow)
      if (response.credential) {
        await loginWithGoogle(response.credential);
        navigate('/dashboard');
        window.location.reload();
      }
      // Otherwise, userInfo is handled in handleGoogleClick
    } catch (err) {
      console.error('Google sign in error:', err);
      setError(err.response?.data?.message || 'Google sign in failed. Please try again.');
      setGoogleLoading(false);
    }
  };

  const handleGoogleClick = () => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      setError('Google Client ID is not configured. Please check GOOGLE_SETUP.md for instructions.');
      return;
    }

    if (!window.google || !window.google.accounts) {
      setError('Google sign in is loading. Please wait a moment and try again.');
      return;
    }

    try {
      // Use Google's One Tap or popup flow
      window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile',
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            setError('Google sign in failed: ' + tokenResponse.error);
            return;
          }
          
          // Get user info using the access token
          try {
            const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
              headers: {
                Authorization: `Bearer ${tokenResponse.access_token}`
              }
            });
            const userInfo = await userInfoResponse.json();
            
            // Send user info directly to backend
            setGoogleLoading(true);
            setError('');
            await loginWithGoogle(null, userInfo);
            navigate('/dashboard');
            window.location.reload(); // Refresh to update user state
          } catch (err) {
            console.error('Error fetching user info:', err);
            setError('Failed to get user information from Google.');
            setGoogleLoading(false);
          }
        },
      }).requestAccessToken();
    } catch (error) {
      console.error('Error triggering Google sign-in:', error);
      setError('Failed to start Google sign-in. Please try again.');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login({ email: formData.email, password: formData.password });
      } else {
        await register(formData);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Start Learning Today</h1>
        <p className="login-subtitle">
          {isLogin ? 'Log in to continue your language journey.' : 'Create an account to get started.'}
        </p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input">
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
              />
              {isLogin && (
                <a href="/forgot-password" className="forgot-password">
                  Forgot Password?
                </a>
              )}
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Loading...' : 'Continue'}
          </button>

          <button 
            type="button" 
            className="btn-google" 
            onClick={handleGoogleClick}
            disabled={googleLoading || loading}
          >
            <span className="google-icon">G</span>
            {googleLoading ? 'Signing in...' : 'Continue with Google'}
          </button>
        </form>

        <p className="signup-link">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <Link to={isLogin ? '/signup' : '/login'}>
            {isLogin ? 'Sign Up' : 'Login'}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

