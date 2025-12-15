import React from 'react';
import { Link } from 'react-router-dom';

const LessonList = ({ lessons }) => {
  if (!lessons || lessons.length === 0) {
    return <p style={{ color: '#475569' }}>No listening lessons available yet.</p>;
  }

  return (
    <div style={{ display: 'grid', gap: '16px' }}>
      {lessons.map((lesson) => (
        <Link
          key={lesson._id}
          to={`/listening-practice/${lesson._id}`}
          style={{ textDecoration: 'none', color: 'inherit' }}
        >
          <div
            style={{
              borderRadius: '16px',
              padding: '16px',
              display: 'grid',
              gap: '8px',
              background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
              boxShadow: '0 15px 30px rgba(15, 23, 42, 0.08)',
              border: '1px solid rgba(148, 163, 184, 0.25)',
              transition: 'transform 150ms ease, box-shadow 150ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '0 18px 32px rgba(37, 99, 235, 0.16)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0px)';
              e.currentTarget.style.boxShadow = '0 15px 30px rgba(15, 23, 42, 0.08)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '18px',
                  boxShadow: '0 10px 18px rgba(37, 99, 235, 0.35)',
                }}
              >
                🎧
              </div>
              <div>
                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '16px' }}>{lesson.title}</div>
                <div style={{ color: '#64748b', fontSize: 13 }}>
                  Level: {lesson.level} • {lesson.category || 'N/A'}
                </div>
              </div>
            </div>
            <div style={{ color: '#334155', fontSize: 14, display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span>⏱ {lesson.duration ? `${Math.round(lesson.duration / 60)} min` : 'Duration: —'}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default LessonList;

