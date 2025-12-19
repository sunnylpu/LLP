import React from 'react';
import { useNavigate } from 'react-router-dom';

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

const LanguageSelector = ({ onSelect }) => {
  const navigate = useNavigate();

  const handleSelect = (code) => {
    if (onSelect) {
      onSelect(code);
    } else {
      navigate(`/listening-practice?lang=${encodeURIComponent(code)}`);
    }
  };

  return (
    <div
      style={{
        padding: '32px',
        maxWidth: '960px',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          padding: '20px 24px',
          borderRadius: '18px',
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          color: '#fff',
          boxShadow: '0 20px 40px rgba(37, 99, 235, 0.28)',
          marginBottom: '20px',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 700 }}>Choose a language</h1>
        <p style={{ marginTop: '8px', opacity: 0.9 }}>
          Start Listening Practice or Text-to-Speech with your target language.
        </p>
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '14px',
        }}
      >
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleSelect(lang.code)}
            style={{
              position: 'relative',
              overflow: 'hidden',
              padding: '16px 18px',
              borderRadius: '16px',
              border: '1px solid rgba(148, 163, 184, 0.35)',
              background: 'rgba(255,255,255,0.8)',
              backdropFilter: 'blur(10px)',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'transform 150ms ease, box-shadow 150ms ease',
              boxShadow: '0 8px 18px rgba(0,0,0,0.08)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 22px rgba(37, 99, 235, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0px)';
              e.currentTarget.style.boxShadow = '0 8px 18px rgba(0,0,0,0.08)';
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                background: '#eef2ff',
                display: 'grid',
                placeItems: 'center',
                fontSize: '22px',
                marginBottom: '10px',
              }}
            >
              {lang.flag}
            </div>
            <div style={{ fontWeight: 700, color: '#0f172a' }}>{lang.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;

