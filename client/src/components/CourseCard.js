import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './CourseCard.css';

/**
 * Reusable CourseCard Component
 * 
 * Supports:
 * - Different course types (listening, vocabulary, reading, speaking, mixed)
 * - Different statuses (active, coming_soon, draft)
 * - Locked/unlocked state
 * - Progress bar (if enrolled)
 * - Estimated time & duration
 * - Free preview indicator
 * - Micro-course badges
 * - Skill tags
 * 
 * @param {Object} course - Course data object
 * @param {boolean} showProgress - Whether to show progress bar (if enrolled)
 * @param {number} progress - Progress percentage (0-100)
 * @param {boolean} isEnrolled - Whether user is enrolled
 */
const CourseCard = ({ 
  course, 
  showProgress = false, 
  progress = 0,
  isEnrolled = false 
}) => {
  const location = useLocation();
  const from = location.pathname.includes('/dashboard') ? 'dashboard' : 'courses';

  // Don't render draft courses for public
  if (course.status === 'draft') {
    return null;
  }

  const getTypeIcon = (type) => {
    const icons = {
      listening: '🎧',
      vocabulary: '📖',
      reading: '📝',
      speaking: '🗣',
      mixed: '🔁'
    };
    return icons[type] || '📚';
  };

  const getTypeLabel = (type) => {
    const labels = {
      listening: 'Listening',
      vocabulary: 'Vocabulary',
      reading: 'Reading',
      speaking: 'Speaking',
      mixed: 'Mixed'
    };
    return labels[type] || 'Course';
  };

  const getLevelColor = (level) => {
    const colors = {
      Beginner: '#10b981',
      Intermediate: '#f59e0b',
      Advanced: '#ef4444'
    };
    return colors[level] || '#667eea';
  };

  const formatTime = (hours) => {
    if (!hours) return null;
    if (hours < 1) return `${Math.round(hours * 60)} min`;
    return `~${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  };

  const formatDuration = (days) => {
    if (!days) return null;
    return `${days} ${days === 1 ? 'day' : 'days'}`;
  };

  // Course is locked if:
  // 1. Status is coming_soon
  // 2. User is not enrolled AND no free preview available
  const isLocked = course.status === 'coming_soon' || (!isEnrolled && course.freePreviewLessons === 0);
  const hasFreePreview = course.freePreviewLessons > 0 && !isEnrolled;
  
  // Handle locked course click
  const handleCourseClick = (e) => {
    if (isLocked && course.status !== 'coming_soon' && !hasFreePreview) {
      e.preventDefault();
      alert('🔒 This course is locked. Please contact an administrator to gain access.');
    }
  };

  return (
    <div className={`course-card ${isLocked ? 'locked' : ''} ${course.isMicroCourse ? 'micro-course' : ''}`}>
      {/* Course Header */}
      <div className="course-card-header">
        <div className="course-type-badge">
          <span className="course-type-icon">{getTypeIcon(course.type || 'mixed')}</span>
          <span className="course-type-label">{getTypeLabel(course.type || 'mixed')}</span>
        </div>
        
        {course.status === 'coming_soon' && (
          <div className="course-status-badge coming-soon">
            ⏳ Coming Soon
          </div>
        )}
        
        {course.isMicroCourse && (
          <div className="course-status-badge micro-badge">
            ⚡ Micro Course
          </div>
        )}
      </div>

      {/* Course Content */}
      <div className="course-card-content">
        <div className="course-level-badge" style={{ backgroundColor: getLevelColor(course.level) }}>
          {course.level}
        </div>
        
        <h3 className="course-title">{course.name}</h3>
        <p className="course-description">{course.description}</p>
        
        {/* Language Badge */}
        <div className="course-language">
          <span className="language-flag">🌍</span>
          <span>{course.language}</span>
        </div>

        {/* Skill Tags */}
        {course.skillTags && course.skillTags.length > 0 && (
          <div className="course-tags">
            {course.skillTags.slice(0, 3).map((tag, index) => (
              <span key={index} className="skill-tag">{tag}</span>
            ))}
            {course.skillTags.length > 3 && (
              <span className="skill-tag">+{course.skillTags.length - 3}</span>
            )}
          </div>
        )}

        {/* Course Metadata */}
        <div className="course-metadata">
          {course.lessonCount > 0 && (
            <div className="metadata-item">
              <span className="metadata-icon">📚</span>
              <span>{course.lessonCount} {course.lessonCount === 1 ? 'lesson' : 'lessons'}</span>
            </div>
          )}
          {course.estimatedTimeHours && (
            <div className="metadata-item">
              <span className="metadata-icon">⏱</span>
              <span>{formatTime(course.estimatedTimeHours)}</span>
            </div>
          )}
          {course.durationInDays && (
            <div className="metadata-item">
              <span className="metadata-icon">📆</span>
              <span>{formatDuration(course.durationInDays)}</span>
            </div>
          )}
        </div>

        {/* Progress Bar (if enrolled) */}
        {showProgress && isEnrolled && (
          <div className="course-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="progress-text">{progress}% Complete</span>
          </div>
        )}

        {/* Free Preview Indicator */}
        {hasFreePreview && (
          <div className="free-preview-badge">
            🎁 First {course.freePreviewLessons} {course.freePreviewLessons === 1 ? 'lesson' : 'lessons'} free
          </div>
        )}

        {/* Locked Indicator */}
        {isLocked && course.status !== 'coming_soon' && (
          <div className="locked-indicator">
            🔒 Locked
          </div>
        )}
      </div>

      {/* Course Footer */}
      <div className="course-card-footer">
        {course.status === 'coming_soon' ? (
          <button className="btn-course btn-coming-soon" disabled>
            Coming Soon
          </button>
        ) : isLocked && !hasFreePreview ? (
          <button className="btn-course btn-locked" disabled>
            🔒 Locked
          </button>
        ) : (
          <Link 
            to={`/courses/${course._id}`} 
            state={{ from }}
            className="btn-course btn-primary"
            onClick={handleCourseClick}
          >
            {isEnrolled ? 'Continue Learning' : hasFreePreview ? 'Start Free Preview' : 'Start Course'}
          </Link>
        )}
        
        {course.studentsEnrolled > 0 && (
          <div className="enrollment-count">
            👥 {course.studentsEnrolled} {course.studentsEnrolled === 1 ? 'student' : 'students'}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseCard;

