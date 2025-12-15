import React from 'react';

const ToggleTTSButton = ({ active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: '12px 16px',
      borderRadius: '14px',
      border: '1px solid transparent',
      background: active
        ? 'linear-gradient(135deg, #2563eb, #7c3aed)'
        : 'linear-gradient(135deg, #e2e8f0, #f8fafc)',
      color: active ? '#fff' : '#1e293b',
      cursor: 'pointer',
      marginBottom: '16px',
      transition: 'all 150ms ease',
      boxShadow: active
        ? '0 12px 24px rgba(37, 99, 235, 0.35)'
        : '0 8px 18px rgba(15, 23, 42, 0.12)',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-1px)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0px)';
    }}
  >
    Switch to Text-to-Speech Mode
  </button>
);

export default ToggleTTSButton;

