import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getListeningLessons } from '../utils/api';
import LessonList from '../components/listening/LessonList';
import TTSInputBox from '../components/listening/TTSInputBox';
import ToggleTTSButton from '../components/listening/ToggleTTSButton';
import WordTranslator from '../components/listening/WordTranslator';

const ListeningPractice = () => {
  const [searchParams] = useSearchParams();
  const languageParam = searchParams.get('lang') || 'en-US';
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [ttsMode, setTtsMode] = useState(languageParam !== 'en-US'); // default true for non-English
  const [playedText, setPlayedText] = useState('');
  const [selectedWord, setSelectedWord] = useState('');
  const [showTranslator, setShowTranslator] = useState(false);

  const sourceLang = useMemo(() => {
    switch (languageParam) {
      case 'hi-IN':
        return 'hi';
      case 'es-ES':
        return 'es';
      case 'fr-FR':
        return 'fr';
      case 'de-DE':
        return 'de';
      default:
        return 'en';
    }
  }, [languageParam]);

  useEffect(() => {
    const fetchLessons = async () => {
      // Only fetch lessons for English
      if (languageParam !== 'en-US') {
        setLoading(false);
        return;
      }
      try {
        const data = await getListeningLessons();
        setLessons(data);
      } catch (err) {
        setError('Failed to load listening lessons');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLessons();
  }, [languageParam]);

  const categories = ['All', 'Story', 'Conversation', 'Podcast', 'Practice', 'Real-life'];

  const filteredLessons = useMemo(() => {
    if (categoryFilter === 'All') return lessons;
    return lessons.filter((lesson) => lesson.category === categoryFilter);
  }, [lessons, categoryFilter]);

  const handlePlaybackComplete = (text = '') => {
    setPlayedText(text);
    setSelectedWord('');
    setShowTranslator(false);
  };

  const handleWordClick = (word = '') => {
    if (!word.trim()) return;
    setSelectedWord(word);
    setShowTranslator(true);
  };

  const renderClickableText = () =>
    playedText.split(/(\s+)/).map((part, index) => {
      if (!part.trim()) return part;
      const wordMatch = part.match(/[A-Za-zÀ-ÿ0-9'-]+/);
      if (!wordMatch) return part;
      const cleanWord = wordMatch[0];
      return (
        <span
          key={`${cleanWord}-${index}`}
          className={`clickable-word ${selectedWord === cleanWord ? 'active' : ''}`}
          onClick={() => handleWordClick(cleanWord)}
        >
          {part}
        </span>
      );
    });

  if (loading) {
    return <div style={{ padding: '24px' }}>Loading...</div>;
  }

  if (error) {
    return <div style={{ padding: '24px', color: 'red' }}>{error}</div>;
  }

  const renderTtsSection = () => (
    <div style={{ marginTop: '16px', display: 'grid', gap: '14px' }}>
      <TTSInputBox
        languageCode={languageParam || 'en-US'}
        onPlaybackComplete={handlePlaybackComplete}
      />

      {playedText ? (
        <div
          style={{
            background: '#f8fafc',
            borderRadius: '18px',
            padding: '14px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 14px 26px rgba(15, 23, 42, 0.06)',
            display: 'grid',
            gap: '12px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
            }}
          >
            <div style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a' }}>
              Tap a word to translate
            </div>
            <div style={{ fontSize: '13px', color: '#475569' }}>
              Source language: {sourceLang.toUpperCase()}
            </div>
          </div>

          <div
            style={{
              lineHeight: 1.7,
              fontSize: '16px',
              color: '#0f172a',
              padding: '10px 12px',
              background: '#fff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
            }}
          >
            {renderClickableText()}
          </div>

          {showTranslator && selectedWord ? (
            <WordTranslator
              word={selectedWord}
              sourceLang={sourceLang}
              onClose={() => setShowTranslator(false)}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
      <div
        style={{
          padding: '18px 20px',
          borderRadius: '18px',
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          color: '#fff',
          boxShadow: '0 20px 40px rgba(37, 99, 235, 0.28)',
          marginBottom: '18px',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 800 }}>Listening Practice</h1>
        <p style={{ marginTop: '6px', opacity: 0.9 }}>
          Switch between lessons and Text-to-Speech based on your chosen language.
        </p>
      </div>
      {languageParam === 'en-US' ? (
        <>
          <ToggleTTSButton active={ttsMode} onClick={() => setTtsMode((prev) => !prev)} />
          {ttsMode ? (
            renderTtsSection()
          ) : (
            <>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #ccc',
                      background: categoryFilter === cat ? '#1d4ed8' : '#fff',
                      color: categoryFilter === cat ? '#fff' : '#111',
                      cursor: 'pointer',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <LessonList lessons={filteredLessons} />
            </>
          )}
        </>
      ) : (
        renderTtsSection()
      )}
    </div>
  );
};

export default ListeningPractice;

