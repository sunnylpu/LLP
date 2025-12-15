import React, { useEffect, useMemo, useState } from 'react';
import { translateWord } from '../../utils/api';

const languageOptions = [
  { label: 'English', value: 'en' },
  { label: 'Hindi', value: 'hi' },
  { label: 'Spanish', value: 'es' },
  { label: 'French', value: 'fr' },
  { label: 'German', value: 'de' },
];

const WordTranslator = ({ word, sourceLang = 'en', onClose }) => {
  const initialTarget = useMemo(
    () => (sourceLang === 'en' ? 'es' : 'en'),
    [sourceLang]
  );
  const [targetLang, setTargetLang] = useState(initialTarget);
  const [meaning, setMeaning] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMeaning('');
    setError('');
    setTargetLang(initialTarget);
  }, [word, initialTarget]);

  const handleTranslate = async () => {
    if (!word) return;
    setLoading(true);
    setError('');
    try {
      const translated = await translateWord(word, sourceLang, targetLang);
      setMeaning(translated || '');
    } catch (err) {
      console.error(err);
      setError('Could not translate right now. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="word-translator-card fade-in"
      style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 18px 32px rgba(15, 23, 42, 0.14)',
        border: '1px solid rgba(148, 163, 184, 0.25)',
        position: 'relative',
      }}
    >
      <button
        aria-label="Close translator"
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          border: 'none',
          background: '#eef2ff',
          color: '#1d4ed8',
          width: '32px',
          height: '32px',
          borderRadius: '10px',
          cursor: 'pointer',
          fontWeight: 700,
          boxShadow: '0 8px 18px rgba(59, 130, 246, 0.18)',
        }}
      >
        X
      </button>

      <div style={{ marginBottom: '10px' }}>
        <div style={{ fontSize: '14px', color: '#475569', marginBottom: '4px' }}>
          Selected word
        </div>
        <div style={{ fontWeight: 800, fontSize: '20px', color: '#0f172a' }}>
          {word}
        </div>
      </div>

      <label style={{ display: 'grid', gap: '6px', marginBottom: '12px' }}>
        <span style={{ fontSize: '14px', color: '#475569' }}>Convert To Language</span>
        <select
          value={targetLang}
          onChange={(e) => setTargetLang(e.target.value)}
          style={{
            padding: '10px 12px',
            borderRadius: '12px',
            border: '1px solid #cbd5e1',
            background: '#f8fafc',
            fontSize: '15px',
          }}
        >
          {languageOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <button
        className="primary-btn"
        onClick={handleTranslate}
        disabled={!word || loading}
        style={{ width: '100%', marginBottom: '10px' }}
      >
        {loading ? 'Translating…' : 'Translate'}
      </button>

      {error ? (
        <div style={{ color: '#dc2626', fontSize: '14px' }}>{error}</div>
      ) : null}
      {meaning ? (
        <div
          style={{
            marginTop: '10px',
            background: '#f1f5f9',
            padding: '12px',
            borderRadius: '12px',
            fontWeight: 600,
            color: '#0f172a',
            lineHeight: 1.5,
          }}
        >
          {meaning}
        </div>
      ) : null}
    </div>
  );
};

export default WordTranslator;

