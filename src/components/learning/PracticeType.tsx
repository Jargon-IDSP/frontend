// import type { ReactNode } from 'react';

interface PracticeTypeProps {
  icon: string;
  title: string;
  description: string;
  onClick: () => void;
}

export default function PracticeType({ icon, title, description, onClick }: PracticeTypeProps) {
  return (
    <button
      style={{ 
        padding: '1.5rem', 
        fontSize: '1.1rem',
        cursor: 'pointer',
        color: '#2196F3',
        border: '1px solid #2196F3',
        borderRadius: '8px',
        textAlign: 'left',
        transition: 'all 0.2s',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        width: '100%',
        backgroundColor: 'transparent',
        margin: "1rem"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.border = '3px solid #1976D2';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.border = '1px solid #2196F3';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
      }}
      onClick={onClick}
    >
      <div>
        <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
          {icon} {title}
        </div>
        <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
          {description}
        </div>
      </div>
      <span style={{ fontSize: '1.5rem' }}>→</span>
    </button>
  );
}