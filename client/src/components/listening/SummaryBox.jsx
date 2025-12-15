import React from 'react';

const SummaryBox = ({ summary }) => (
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
);

export default SummaryBox;

