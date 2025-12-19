import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getListeningLessons, getCurrentUser } from '../utils/api';
import GuidedLessonsPanel from '../components/listening/GuidedLessonsPanel';
import TTSPracticePanel from '../components/listening/TTSPracticePanel';
import DailyStatsStrip from '../components/listening/DailyStatsStrip';
import LanguageSelector from '../components/LanguageSelector';
import './ListeningHub.css';

const languages = [
  { label: 'English (US)', code: 'en-US', flag: '🇺🇸' },
  { label: 'English (UK)', code: 'en-GB', flag: '🇬🇧' },
  { label: 'Hindi', code: 'hi-IN', flag: '🇮🇳' },
  { label: 'Spanish', code: 'es-ES', flag: '🇪🇸' },
  { label: 'French', code: 'fr-FR', flag: '🇫🇷' },
  { label: 'German', code: 'de-DE', flag: '🇩🇪' },
  { label: 'Italian', code: 'it-IT', flag: '🇮🇹' },
  { label: 'Japanese', code: 'ja-JP', flag: '🇯🇵' },
  { label: 'Korean', code: 'ko-KR', flag: '🇰🇷' },
  { label: 'Chinese (Mandarin)', code: 'zh-CN', flag: '🇨🇳' },
  { label: 'Arabic', code: 'ar-SA', flag: '🇸🇦' },
  { label: 'Russian', code: 'ru-RU', flag: '🇷🇺' },
];

const ListeningHub = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // Language selectors (independent)
  const [textLanguage, setTextLanguage] = useState('en-US');
  const [listeningLanguage, setListeningLanguage] = useState('en-US');
  
  // Mode: 'guided' or 'practice'
  const [activeMode, setActiveMode] = useState('guided');
  const [showLangModal, setShowLangModal] = useState(false);
  
  // Daily stats
  const [dailyStats, setDailyStats] = useState({
    listeningTime: 0, // minutes
    lessonsCompleted: 0,
    practicesCompleted: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lessonsData, userData] = await Promise.all([
          getListeningLessons(),
          getCurrentUser().catch(() => null), // Optional, don't fail if not logged in
        ]);
        setLessons(lessonsData);
        setUser(userData);
        
        // Load daily stats from localStorage (client-side tracking)
        const today = new Date().toDateString();
        const storedStats = localStorage.getItem(`listeningStats_${today}`);
        if (storedStats) {
          setDailyStats(JSON.parse(storedStats));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Save daily stats to localStorage
  const updateDailyStats = (updates) => {
    const newStats = { ...dailyStats, ...updates };
    setDailyStats(newStats);
    const today = new Date().toDateString();
    localStorage.setItem(`listeningStats_${today}`, JSON.stringify(newStats));
  };

  if (loading) {
    return (
      <div className="listening-hub-page">
        <Header />
        <div className="loading-container">
          <div className="loading-spinner">Loading Listening Hub...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="listening-hub-page">
      <Header />
      <main className="listening-hub-main">
        {/* Hero Section */}
        <section className="listening-hero">
          <div className="listening-hero-container">
            <h1 className="listening-hero-title">🎧 Listening Hub</h1>
            <p className="listening-hero-subtitle">
              Master languages through guided audio lessons and personalized text-to-speech practice.
            </p>
          </div>
        </section>

        {/* Top Controls - Language Selectors */}
        <section className="language-controls-section">
          <div className="language-controls-container">
            <div className="language-control-group">
              <label className="language-control-label">
                <span className="label-icon">📝</span>
                Text Language
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                 <select
                  className="language-select"
                  value={textLanguage}
                  onChange={(e) => setTextLanguage(e.target.value)}
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.flag} {lang.label}
                    </option>
                  ))}
                </select>
                <button 
                  onClick={() => setShowLangModal(true)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#fff',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Change
                </button>
              </div>
            </div>

            <div className="language-control-group">
              <label className="language-control-label">
                <span className="label-icon">🎧</span>
                Accent Language
              </label>
              <select
                className="language-select"
                value={listeningLanguage}
                onChange={(e) => setListeningLanguage(e.target.value)}
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {showLangModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }} onClick={() => setShowLangModal(false)}>
            <div onClick={e => e.stopPropagation()} style={{ background: '#f8fafc', borderRadius: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
              <LanguageSelector onSelect={(code) => {
                setTextLanguage(code);
                setShowLangModal(false);
              }} />
            </div>
          </div>
        )}

        {/* Mode Tabs */}
        <section className="mode-tabs-section">
          <div className="mode-tabs-container">
            <button
              className={`mode-tab ${activeMode === 'guided' ? 'active' : ''}`}
              onClick={() => setActiveMode('guided')}
            >
              🎧 Guided Lessons
            </button>
            <button
              className={`mode-tab ${activeMode === 'practice' ? 'active' : ''}`}
              onClick={() => setActiveMode('practice')}
            >
              ✍️ Practice with Your Text
            </button>
          </div>
        </section>

        {/* Main Content - Split View */}
        <section className="listening-content-section">
          <div className="listening-content-container">
            {activeMode === 'guided' ? (
              <div className="guided-mode-view">
                <GuidedLessonsPanel
                  lessons={lessons}
                  listeningLanguage={listeningLanguage}
                  user={user}
                  onLessonComplete={(lessonId, duration) => {
                    updateDailyStats({
                      lessonsCompleted: dailyStats.lessonsCompleted + 1,
                      listeningTime: dailyStats.listeningTime + Math.round(duration / 60),
                    });
                  }}
                />
              </div>
            ) : (
              <div className="practice-mode-view">
                <TTSPracticePanel
                  textLanguage={textLanguage}
                  listeningLanguage={listeningLanguage}
                  user={user}
                  onPracticeComplete={() => {
                    updateDailyStats({
                      practicesCompleted: dailyStats.practicesCompleted + 1,
                    });
                  }}
                />
              </div>
            )}
          </div>
        </section>

        {/* Daily Feedback Strip */}
        <DailyStatsStrip stats={dailyStats} />
      </main>
      <Footer />
    </div>
  );
};

export default ListeningHub;

