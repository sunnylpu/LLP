import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser, getCourses } from '../utils/api';
import './Dashboard.css';


const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, coursesData] = await Promise.all([
          getCurrentUser(),
          getCourses(),
        ]);
        setUser(userData);
        setCourses(coursesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  const fluency = user?.progress?.get('French')?.fluency || 0;
  const practiceTime = user?.practiceTime || 0;

  return (
    <div className="dashboard">
      <div className="dashboard-container">
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

        <div className="dashboard-section">
          <h2 className="section-title">Your Learning Dashboard</h2>
          <div className="feature-cards">
            <Link to={"/dashboard/speaking"}>
            <div className="feature-card">
              <div className="feature-icon">📢</div>
              <h3>Speaking Practice</h3>
              <p>Daily goal: 5/10 mins</p>
            </div>
            </Link>
            <div className="feature-card">
              <div className="feature-icon">🎧</div>
              <h3>Listening Practice</h3>
              <p>New audio drills available</p>
            </div>
            <Link to="/vocabulary" className="feature-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="feature-icon">📚</div>
              <h3>Vocabulary</h3>
              <p>Build your vocabulary list</p>
            </Link>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Your Progress</h3>
              <p>Overall fluency: {fluency}%</p>
            </div>
          </div>
        </div>

        <div className="activity-section">
          <div className="activity-card">
            <div className="progress-circle">
              <div className="progress-value">{fluency}%</div>
              <div className="progress-label">Fluency</div>
            </div>
            <div className="activity-content">
              <h3>Weekly Activity</h3>
              <p>
                Great job this week, {user?.name || 'User'}! You've practiced
                for {practiceTime} minutes. Keep up the momentum.
              </p>
              <button className="btn-report">View Detailed Report</button>
            </div>
          </div>
        </div>

        <div className="courses-section">
          <h2 className="section-title">Available Courses</h2>
          <div className="courses-grid">
            {courses.map((course) => (
              <div key={course._id} className="course-card">
                <div className="course-flag">{course.language}</div>
                <h3>{course.name}</h3>
                <p>{course.description}</p>
                <button className="btn-learn-more">Learn More</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

