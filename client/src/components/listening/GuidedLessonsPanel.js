import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LessonCard from './LessonCard';
import './GuidedLessonsPanel.css';

const GuidedLessonsPanel = ({ lessons, listeningLanguage, user, onLessonComplete }) => {
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [playingLessonId, setPlayingLessonId] = useState(null);

  const categories = ['All', 'Story', 'Conversation', 'Podcast', 'Practice', 'Real-life'];

  const filteredLessons = categoryFilter === 'All' 
    ? lessons 
    : lessons.filter(lesson => lesson.category === categoryFilter);

  // Get user's lesson progress from localStorage (client-side tracking)
  const getLessonProgress = (lessonId) => {
    const progress = localStorage.getItem(`lessonProgress_${lessonId}`);
    return progress ? JSON.parse(progress) : { status: 'not_started', progress: 0 };
  };

  const handleLessonPlay = (lessonId) => {
    setPlayingLessonId(lessonId);
  };

  const handleLessonComplete = (lessonId, duration) => {
    // Mark lesson as completed in localStorage
    localStorage.setItem(`lessonProgress_${lessonId}`, JSON.stringify({
      status: 'completed',
      progress: 100,
      completedAt: new Date().toISOString(),
    }));
    
    // Call parent callback
    if (onLessonComplete) {
      onLessonComplete(lessonId, duration);
    }
    
    setPlayingLessonId(null);
  };

  if (!lessons || lessons.length === 0) {
    return (
      <div className="guided-lessons-panel">
        <div className="empty-state">
          <div className="empty-icon">🎧</div>
          <h3>No lessons available</h3>
          <p>Check back soon for new listening lessons!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="guided-lessons-panel">
      {/* Category Filters */}
      <div className="category-filters">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-filter-btn ${categoryFilter === cat ? 'active' : ''}`}
            onClick={() => setCategoryFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Lessons Grid */}
      <div className="lessons-grid">
        {filteredLessons.map((lesson) => {
          const progress = getLessonProgress(lesson._id);
          return (
            <LessonCard
              key={lesson._id}
              lesson={lesson}
              progress={progress}
              listeningLanguage={listeningLanguage}
              isPlaying={playingLessonId === lesson._id}
              onPlay={() => handleLessonPlay(lesson._id)}
              onComplete={(duration) => handleLessonComplete(lesson._id, duration)}
              showDetailsLink={false}
            />
          );
        })}
      </div>
    </div>
  );
};

export default GuidedLessonsPanel;

