import React, { useEffect, useState, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getListeningLesson } from '../../utils/api';
import { extractVocabulary, generateSummary } from '../../utils/textTools';

const LessonView = () => {
  const { id } = useParams();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState('');
  const [vocab, setVocab] = useState([]);
  const audioRef = useRef();

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const data = await getListeningLesson(id);
        setLesson(data);
        setSummary(generateSummary(data.transcript || ''));
        setVocab(extractVocabulary(data.transcript || ''));
      } catch (err) {
        setError('Failed to load this lesson');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [id]);

  if (loading) return <div style={{ padding: '24px' }}>Loading...</div>;
  if (error) return <div style={{ padding: '24px', color: 'red' }}>{error}</div>;
  if (!lesson) return <div style={{ padding: '24px' }}>Lesson not found.</div>;

  return (
    <div style={{ padding: '24px', display: 'grid', gap: '16px' }}>
      <Link to="/listening-practice?lang=en-US" style={{ textDecoration: 'none', color: '#2563eb' }}>
        ← Back to Listening Practice
      </Link>
      <div
        style={{
          borderRadius: '18px',
          padding: '18px',
          background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
          boxShadow: '0 18px 32px rgba(15, 23, 42, 0.1)',
          border: '1px solid rgba(148, 163, 184, 0.35)',
        }}
      >
        <h1 style={{ marginTop: 0 }}>{lesson.title}</h1>
        <audio ref={audioRef} controls src={lesson.audio} style={{ width: '100%', marginBottom: '8px' }} />
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '6px' }}>
          {[0.5, 1, 1.5, 2].map((rate) => (
            <button
              key={rate}
              onClick={() => {
                if (audioRef.current) audioRef.current.playbackRate = rate;
              }}
              style={{
                padding: '7px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                background: '#fff',
                cursor: 'pointer',
              }}
            >
              {rate}x
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '16px', fontSize: '14px', flexWrap: 'wrap', color: '#475569' }}>
          <span>Category: {lesson.category || '—'}</span>
          <span>Level: {lesson.level}</span>
          {lesson.duration ? <span>Duration: {lesson.duration} sec</span> : null}
        </div>
        <div
          style={{
            whiteSpace: 'pre-wrap',
            lineHeight: 1.7,
            border: '1px solid #e2e8f0',
            padding: '14px',
            borderRadius: '12px',
            background: '#f8fafc',
            marginTop: '12px',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
            animation: 'fadeIn 220ms ease',
          }}
        >
          {lesson.transcript}
        </div>
      </div>
      <div
        style={{
          borderRadius: '16px',
          padding: '16px',
          background: 'linear-gradient(135deg, #eef2ff, #e0f2fe)',
          boxShadow: '0 16px 30px rgba(59, 130, 246, 0.18)',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          animation: 'fadeIn 220ms ease',
        }}
      >
        <div style={{ fontWeight: 800, marginBottom: '6px', color: '#0f172a' }}>Summary</div>
        <div style={{ color: '#1f2937', lineHeight: 1.6 }}>{summary}</div>
      </div>
      {vocab && vocab.length > 0 ? (
        <div
          style={{
            borderRadius: '16px',
            padding: '16px',
            background: 'linear-gradient(135deg, #ecfeff, #eff6ff)',
            boxShadow: '0 16px 30px rgba(14, 165, 233, 0.16)',
            border: '1px solid rgba(14, 165, 233, 0.25)',
            display: 'grid',
            gap: '10px',
            animation: 'fadeIn 220ms ease',
          }}
        >
          <div style={{ fontWeight: 800, marginBottom: '2px', color: '#0f172a' }}>Vocabulary</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {vocab.map((w, idx) => (
              <span
                key={`${w}-${idx}`}
                style={{
                  padding: '7px 12px',
                  background: '#dbeafe',
                  color: '#1d4ed8',
                  borderRadius: '999px',
                  fontSize: '13px',
                  boxShadow: '0 6px 12px rgba(59, 130, 246, 0.18)',
                }}
              >
                {w}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default LessonView;

