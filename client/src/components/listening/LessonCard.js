import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LessonCard.css';

const LessonCard = ({ lesson, progress, listeningLanguage, isPlaying, onPlay, onComplete, showDetailsLink = true }) => {
  const audioRef = useRef(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [markedUnderstood, setMarkedUnderstood] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsAudioPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isAudioPlaying) {
      audio.pause();
      setIsAudioPlaying(false);
    } else {
      audio.play();
      setIsAudioPlaying(true);
      if (onPlay) onPlay();
    }
  };

  const handleMarkUnderstood = () => {
    if (markedUnderstood) return;
    
    setMarkedUnderstood(true);
    // Mark as completed only if audio fully played
    if (currentTime >= duration - 1 && duration > 0) {
      if (onComplete) {
        onComplete(duration);
      }
    }
  };

  const getStatusBadge = () => {
    if (progress.status === 'completed') {
      return <span className="status-badge completed">✓ Completed</span>;
    } else if (progress.status === 'in_progress') {
      return <span className="status-badge in-progress">▶ In Progress</span>;
    }
    return <span className="status-badge not-started">○ Not Started</span>;
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : progress.progress || 0;

  return (
    <div className={`lesson-card ${progress.status === 'completed' ? 'completed' : ''}`}>
      <div className="lesson-card-header">
        <div className="lesson-icon">🎧</div>
        <div className="lesson-header-content">
          <h3 className="lesson-title">{lesson.title}</h3>
          <div className="lesson-meta">
            <span className="lesson-level">{lesson.level}</span>
            <span className="lesson-category">{lesson.category}</span>
            {lesson.duration && (
              <span className="lesson-duration">⏱ {formatTime(lesson.duration)}</span>
            )}
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Progress Bar */}
      {progress.status !== 'not_started' && (
        <div className="lesson-progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      )}

      {/* Audio Player */}
      <div className="lesson-audio-section">
        <audio
          ref={audioRef}
          src={lesson.audio}
          preload="metadata"
          style={{ display: 'none' }}
        />
        
        <div className="audio-controls">
          <button
            className="play-pause-btn"
            onClick={handlePlayPause}
            disabled={!lesson.audio}
          >
            {isAudioPlaying ? '⏸' : '▶'}
          </button>
          
          <div className="audio-time-display">
            <span>{formatTime(currentTime)}</span>
            <span className="time-separator">/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Speed Control */}
        <div className="speed-controls">
          {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
            <button
              key={rate}
              className={`speed-btn ${playbackRate === rate ? 'active' : ''}`}
              onClick={() => setPlaybackRate(rate)}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>

      {/* Mark as Understood Button */}
      {currentTime >= duration - 1 && duration > 0 && !markedUnderstood && (
        <button
          className="mark-understood-btn"
          onClick={handleMarkUnderstood}
        >
          ✓ Mark as Understood
        </button>
      )}

      {/* View Details Link */}
      {showDetailsLink && (
        <Link
          to={`/listening-practice/${lesson._id}`}
          className="view-details-link"
        >
          View Full Lesson →
        </Link>
      )}
    </div>
  );
};

export default LessonCard;

