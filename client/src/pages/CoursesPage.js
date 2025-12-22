import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CourseCard from '../components/CourseCard';
import { getCourses, getCurrentUser } from '../utils/api';
import './CoursesPage.css';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('active');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesData, userData] = await Promise.all([
          getCourses(),
          getCurrentUser().catch(() => null), // Optional, don't fail if not logged in
        ]);
        // Filter out draft courses for public view
        const publicCourses = coursesData.filter(course => course.status !== 'draft');
        setCourses(publicCourses);
        setFilteredCourses(publicCourses);
        setUser(userData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter courses based on selected filters
  useEffect(() => {
    let filtered = [...courses];

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(course => course.type === selectedType);
    }

    // Filter by level
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(course => course.level === selectedLevel);
    }

    // Filter by language
    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(course => 
        course.language.toLowerCase() === selectedLanguage.toLowerCase()
      );
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(course => course.status === selectedStatus);
    }

    setFilteredCourses(filtered);
  }, [selectedType, selectedLevel, selectedLanguage, selectedStatus, courses]);

  // Get unique values for filters
  const getUniqueLanguages = () => {
    const languages = [...new Set(courses.map(course => course.language))];
    return languages.sort();
  };

  const getUniqueTypes = () => {
    return ['listening', 'vocabulary', 'reading', 'speaking', 'mixed'];
  };

  const getUniqueLevels = () => {
    return ['Beginner', 'Intermediate', 'Advanced'];
  };

  // Get courses by category for sections
  const getPopularCourses = () => {
    return filteredCourses
      .filter(course => course.status === 'active')
      .sort((a, b) => (b.studentsEnrolled || 0) - (a.studentsEnrolled || 0))
      .slice(0, 6);
  };

  const getNewCourses = () => {
    return filteredCourses
      .filter(course => course.status === 'active')
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 6);
  };

  const getComingSoonCourses = () => {
    return filteredCourses.filter(course => course.status === 'coming_soon');
  };

  const getMicroCourses = () => {
    return filteredCourses.filter(course => course.isMicroCourse && course.status === 'active');
  };

  if (loading) {
    return (
      <div className="courses-page">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner">Loading courses...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="courses-page">
      <Header />
      <main className="courses-main">
        {/* Hero Section */}
        <section className="courses-hero">
          <div className="courses-hero-container">
            <h1 className="courses-hero-title">Explore Our Courses</h1>
            <p className="courses-hero-subtitle">
              Discover courses designed to help you learn languages naturally through listening and practice.
            </p>
          </div>
        </section>

        {/* Filters Section */}
        <section className="filters-section">
          <div className="filters-container">
            <div className="filter-group">
              <label className="filter-label">Course Type</label>
              <select 
                className="filter-select"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">All Types</option>
                {getUniqueTypes().map(type => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Level</label>
              <select 
                className="filter-select"
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
              >
                <option value="all">All Levels</option>
                {getUniqueLevels().map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Language</label>
              <select 
                className="filter-select"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                <option value="all">All Languages</option>
                {getUniqueLanguages().map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Status</label>
              <select 
                className="filter-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="coming_soon">Coming Soon</option>
              </select>
            </div>

            <button 
              className="btn-reset-filters"
              onClick={() => {
                setSelectedType('all');
                setSelectedLevel('all');
                setSelectedLanguage('all');
                setSelectedStatus('active');
              }}
            >
              Reset Filters
            </button>
          </div>
        </section>

        {/* Courses Sections */}
        <section className="courses-sections">
          <div className="courses-container">
            {/* Popular Courses */}
            {getPopularCourses().length > 0 && (
              <div className="courses-section-block">
                <h2 className="section-title">
                  🔥 Popular Courses
                  <span className="section-count">({getPopularCourses().length})</span>
                </h2>
                <div className="courses-grid">
                  {getPopularCourses().map(course => {
                    const isEnrolled = user?.role === 'admin' || 
                      (user?.enrolledCourses && user.enrolledCourses.some(
                        (ec) => (ec._id || ec).toString() === course._id.toString()
                      ));
                    return (
                      <CourseCard key={course._id} course={course} isEnrolled={isEnrolled} />
                    );
                  })}
                </div>
              </div>
            )}

            {/* New Courses */}
            {getNewCourses().length > 0 && (
              <div className="courses-section-block">
                <h2 className="section-title">
                  🆕 New Courses
                  <span className="section-count">({getNewCourses().length})</span>
                </h2>
                <div className="courses-grid">
                  {getNewCourses().map(course => {
                    const isEnrolled = user?.role === 'admin' || 
                      (user?.enrolledCourses && user.enrolledCourses.some(
                        (ec) => (ec._id || ec).toString() === course._id.toString()
                      ));
                    return (
                      <CourseCard key={course._id} course={course} isEnrolled={isEnrolled} />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Micro Courses */}
            {getMicroCourses().length > 0 && (
              <div className="courses-section-block">
                <h2 className="section-title">
                  ⚡ Micro Courses
                  <span className="section-count">({getMicroCourses().length})</span>
                </h2>
                <div className="courses-grid">
                  {getMicroCourses().map(course => {
                    const isEnrolled = user?.role === 'admin' || 
                      (user?.enrolledCourses && user.enrolledCourses.some(
                        (ec) => (ec._id || ec).toString() === course._id.toString()
                      ));
                    return (
                      <CourseCard key={course._id} course={course} isEnrolled={isEnrolled} />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Coming Soon */}
            {getComingSoonCourses().length > 0 && (
              <div className="courses-section-block">
                <h2 className="section-title">
                  ⏳ Coming Soon
                  <span className="section-count">({getComingSoonCourses().length})</span>
                </h2>
                <div className="courses-grid">
                  {getComingSoonCourses().map(course => {
                    const isEnrolled = user?.role === 'admin' || 
                      (user?.enrolledCourses && user.enrolledCourses.some(
                        (ec) => (ec._id || ec).toString() === course._id.toString()
                      ));
                    return (
                      <CourseCard key={course._id} course={course} isEnrolled={isEnrolled} />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recommended for You (Placeholder) */}
            <div className="courses-section-block placeholder-section">
              <h2 className="section-title">
                🎯 Recommended for You
                <span className="section-count">(Coming Soon)</span>
              </h2>
              <p className="placeholder-text">
                Personalized course recommendations based on your learning progress will appear here.
              </p>
            </div>

            {/* Continue Learning (Placeholder) */}
            <div className="courses-section-block placeholder-section">
              <h2 className="section-title">
                📚 Continue Learning
                <span className="section-count">(Coming Soon)</span>
              </h2>
              <p className="placeholder-text">
                Your enrolled courses and progress will be displayed here.
              </p>
            </div>

            {/* All Courses (if filters applied) */}
            {(selectedType !== 'all' || selectedLevel !== 'all' || selectedLanguage !== 'all' || selectedStatus !== 'all') && (
              <div className="courses-section-block">
                <h2 className="section-title">
                  Filtered Results
                  <span className="section-count">({filteredCourses.length})</span>
                </h2>
                {filteredCourses.length > 0 ? (
                  <div className="courses-grid">
                    {filteredCourses.map(course => {
                      const isEnrolled = user?.role === 'admin' || 
                        (user?.enrolledCourses && user.enrolledCourses.some(
                          (ec) => (ec._id || ec).toString() === course._id.toString()
                        ));
                      return (
                        <CourseCard key={course._id} course={course} isEnrolled={isEnrolled} />
                      );
                    })}
                  </div>
                ) : (
                  <div className="no-results">
                    <p>No courses found matching your filters.</p>
                    <button 
                      className="btn-reset-filters"
                      onClick={() => {
                        setSelectedType('all');
                        setSelectedLevel('all');
                        setSelectedLanguage('all');
                        setSelectedStatus('active');
                      }}
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CoursesPage;

