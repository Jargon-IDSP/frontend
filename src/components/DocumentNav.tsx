import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface DocumentNavProps {
  onTabChange?: (tab: 'lesson' | 'document') => void;
  defaultTab?: 'lesson' | 'document';
  documentId?: string;
}

const DocumentNav: React.FC<DocumentNavProps> = ({ 
  onTabChange, 
  defaultTab = 'document',
  documentId 
}) => {
  const [activeTab, setActiveTab] = useState<'lesson' | 'document'>(defaultTab);
  const navigate = useNavigate();

  const handleTabClick = (tab: 'lesson' | 'document') => {
    setActiveTab(tab);
    onTabChange?.(tab);
    
    // Navigate to DocumentStudy when lesson tab is clicked
    if (tab === 'lesson' && documentId) {
      navigate(`/learning/documents/${documentId}`);
    }
  };

  return (
    <div className="document-nav">
      <button
        className={`document-nav__tab ${activeTab === 'lesson' ? 'document-nav__tab--active' : ''}`}
        onClick={() => handleTabClick('lesson')}
        type="button"
      >
        <svg 
          className="document-nav__icon" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
        <span>Lesson</span>
      </button>
      
      <button
        className={`document-nav__tab ${activeTab === 'document' ? 'document-nav__tab--active' : ''}`}
        onClick={() => handleTabClick('document')}
        type="button"
      >
        <svg 
          className="document-nav__icon" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10,9 9,9 8,9" />
        </svg>
        <span>Document</span>
      </button>
    </div>
  );
};

export default DocumentNav;
