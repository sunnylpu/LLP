import React, { useState, useEffect } from 'react'; // Ensure React is used in JSX
import { Link } from 'react-router-dom';

import { getCurrentUser, getCourses, getProgress } from '../utils/api';
import DashboardSkeleton from './dashboard/DashboardSkeleton';
import GamificationDashboard from './gamification/GamificationDashboard';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProgressExpanded, setIsProgressExpanded] = useState(false);
  const [expandedCourseId, setExpandedCourseId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, coursesData] = await Promise.all([
          getCurrentUser(),
          getCourses(),
        ]);
        setUser(userData);
        setCourses(coursesData);

        // Fetch progress data if user is logged in
        if (userData && userData._id) {
          try {
            const progressData = await getProgress(null, userData._id);
            setProgress(progressData);
          } catch (progressError) {
            console.error('Error fetching progress:', progressError);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }; // Ensure this is correctly placed after the component's return statement

    fetchData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }


  const fluencyFromUser = user?.progress?.get?.('French')?.fluency || 0;

  // Get fluency from progress data or fallback to user progress
  const fluency = progress?.progressPercentage || fluencyFromUser || 0;

  const practiceTime = user?.practiceTime || 0;
  const learnedWords = progress?.learnedWords || 0;
  const totalWords = progress?.totalWords || 0;

  return (
    <div className="dashboard">
      <div className="dashboard-container">

        {/* Welcome Section */}
        <div className="welcome-section">
          <h1 className="welcome-title">
            Welcome, {user?.name || 'User'} 👋
          </h1>
          <p className="welcome-subtitle">
            Ready for your next lesson? Let's get started!
          </p>
          <button className="btn-start-lesson">
            <span className="mic-icon">🎤</span>
            Start Lesson
          </button>
        </div>

        {/* Feature Cards */}
        <div className="dashboard-section">
          <h2 className="section-title">Your Learning Dashboard</h2>

          <div className="feature-cards">

            <Link
              to="/dashboard/speaking"
              className="feature-card"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="feature-icon">📢</div>
              <h3>Speaking Practice</h3>
              <p>Daily goal: 5/10 mins</p>
            </Link>

            <Link
              to="/listening"
              className="feature-card"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="feature-icon">🎧</div>
              <h3>Listening Practice</h3>
              <p>New audio drills available</p>
            </Link>

            <Link
              to="/vocabulary"
              className="feature-card"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="feature-icon">📚</div>
              <h3>Vocabulary</h3>
              <p>Build your vocabulary list</p>
            </Link>

            {/* 
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Your Progress</h3>
              <p>Overall fluency: {fluency}%</p>
            </div>  */}

            <div
              className={`feature-card progress-card ${isProgressExpanded ? 'expanded' : ''}`}
              onClick={() => setIsProgressExpanded(!isProgressExpanded)}
              style={{ cursor: 'pointer', position: 'relative' }}
            >
              <div className="progress-card-header">
                <div className="feature-icon">📊</div>
                <h3>Your Progress</h3>
                <button
                  className="expand-toggle"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsProgressExpanded(!isProgressExpanded);
                  }}
                >
                  {isProgressExpanded ? '▼' : '▶'}
                </button>
              </div>

              {/* Summary View (Always Visible) */}
              <div className="progress-summary">
                <p>Vocabulary: {learnedWords}/{totalWords} words</p>
                <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }} className="progress-text">
                  Progress: {fluency}%
                </p>
              </div>

              {/* Expanded Details View */}
              {isProgressExpanded && progress && (
                <div className="progress-details">
                  <div className="progress-overview">
                    <div className="progress-stat-item">
                      <div className="stat-value">{progress.learnedWords || 0}</div>
                      <div className="stat-label">Learned Words</div>
                    </div>
                    <div className="progress-stat-item">
                      <div className="stat-value">{progress.totalWords || 0}</div>
                      <div className="stat-label">Total Words</div>
                    </div>
                    <div className="progress-stat-item">
                      <div className="stat-value">{progress.progressPercentage || 0}%</div>
                      <div className="stat-label">Progress</div>
                    </div>
                  </div>

                  <div className="progress-bar-wrapper">
                    <div className="progress-bar-label">Overall Progress</div>
                    <div className="progress-bar-container-stats">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${progress.progressPercentage || 0}%` }}
                      ></div>
                    </div>
                    <div className="progress-bar-text">
                      {progress.learnedWords || 0} of {progress.totalWords || 0} words learned
                    </div>
                  </div>

                  {progress.byLanguage && Object.keys(progress.byLanguage).length > 0 && (
                    <div className="progress-by-language">
                      <h4 className="language-progress-title">Progress by Language</h4>
                      {Object.entries(progress.byLanguage).map(([lang, langProgress]) => (
                        <div key={lang} className="language-progress-item">
                          <div className="language-progress-header">
                            <span className="language-name">{lang}</span>
                            <span className="language-percentage">{langProgress.progress}%</span>
                          </div>
                          <div className="progress-bar-container-stats small">
                            <div
                              className="progress-bar-fill"
                              style={{ width: `${langProgress.progress}%` }}
                            ></div>
                          </div>
                          <div className="language-progress-details">
                            {langProgress.learned} / {langProgress.total} words
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {(!progress.byLanguage || Object.keys(progress.byLanguage).length === 0) && (
                    <div className="no-progress-data">
                      <p>Start learning to see your progress!</p>
                      <Link
                        to="/vocabulary"
                        className="btn-start-learning"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Add Vocabulary
                      </Link>
                    </div>
                  )}

                  <div className="progress-card-footer">
                    <Link
                      to="/vocabulary"
                      className="btn-view-vocabulary-inline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View Full Vocabulary →
                    </Link>
                  </div>
                </div>
              )}

              {isProgressExpanded && !progress && (
                <div className="progress-loading">
                  <p>Loading progress...</p>
                </div>
              )}

            </div>

          </div>
        </div>


        {/* Activity Section */}
        {/* Gamification Dashboard */}
        <GamificationDashboard onViewReport={() => alert('Detailed report coming soon!')} />

      </div>
    </div>
  );
};

export default Dashboard; // Ensure this is correctly placed after the component's return statement