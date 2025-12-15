import React, { useState } from 'react';
import { extractVocabulary, generateSummary, speakText } from '../../utils/textTools';
import SummaryBox from './SummaryBox';
import VocabularyBox from './VocabularyBox';

const TTSInputBox = ({
  languageCode = 'en-US',
  defaultText = '',
  onPlaybackComplete,
}) => {
  const [text, setText] = useState(defaultText);
  const [summary, setSummary] = useState('');
  const [vocab, setVocab] = useState([]);
  const [error, setError] = useState('');
  const [speaking, setSpeaking] = useState(false);

  const handleSpeak = () => {
    if (!text.trim()) {
      setError('Please enter text to convert.');
      return;
    }
    setError('');
    setSpeaking(true);
    try {
      const summaryText = generateSummary(text);
      const vocabList = extractVocabulary(text);
      speakText(text, languageCode, () => {
        setSpeaking(false);
        if (onPlaybackComplete) {
          onPlaybackComplete(text);
        }
      });
      setSummary(summaryText);
      setVocab(vocabList);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Speech synthesis failed.');
      setSpeaking(false);
    }
  };

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(226,232,240,0.9))',
          borderRadius: '18px',
          padding: '16px',
          border: '1px solid rgba(148, 163, 184, 0.35)',
          boxShadow: '0 18px 32px rgba(15, 23, 42, 0.08)',
        }}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste text to convert into audio…"
          rows={7}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '14px',
            border: '1px solid #cbd5e1',
            fontSize: '15px',
            background: '#fff',
            resize: 'vertical',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
          }}
        />
        <div style={{ marginTop: '12px' }}>
          <button
            onClick={handleSpeak}
            disabled={speaking}
            style={{
              padding: '12px 18px',
              borderRadius: '14px',
              border: '1px solid transparent',
              background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
              color: '#fff',
              cursor: 'pointer',
              width: 'fit-content',
              transition: 'all 150ms ease',
              boxShadow: '0 14px 28px rgba(37, 99, 235, 0.35)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            {speaking ? 'Speaking…' : 'Convert to Audio'}
          </button>
        </div>
        {error ? <div style={{ color: '#dc2626', marginTop: '8px' }}>{error}</div> : null}
      </div>
      {summary ? <SummaryBox summary={summary} /> : null}
      {vocab && vocab.length > 0 ? <VocabularyBox words={vocab} /> : null}
    </div>
  );
};

export default TTSInputBox;

