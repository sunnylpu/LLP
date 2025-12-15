import React from 'react';

const VocabularyBox = ({ words = [] }) => (
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
      {words.map((w, idx) => (
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
);

export default VocabularyBox;

