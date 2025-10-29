// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// import translateFileIcon from '../assets/icons/translateFileIcon.svg';
// import lessonIcon from '../assets/icons/lessonIcon.svg';

// interface DocumentNavProps {
//   onTabChange?: (tab: 'lesson' | 'document') => void;
//   defaultTab?: 'lesson' | 'document';
//   documentId?: string;
// }

// const DocumentNav: React.FC<DocumentNavProps> = ({ 
//   onTabChange, 
//   defaultTab = 'document',
//   documentId 
// }) => {
//   const [activeTab, setActiveTab] = useState<'lesson' | 'document'>(defaultTab);
//   const navigate = useNavigate();

//   const handleTabClick = (tab: 'lesson' | 'document') => {
//     setActiveTab(tab);
//     onTabChange?.(tab);
    
//     // Hardcode for presentation
//     if (tab === 'lesson' && documentId) {
//       navigate(`/learning/documents/cmha47br90001ztmchu5awy17/quizzes`);
//     } else if (tab === 'document' && documentId) {
//       navigate(`/learning/custom/quiz/take?quizId=cd81eda1-ea47-4b09-9ab1-d47284aefa0f`);
//     }
//   };

//   return (
//     <div className="switch-view">
//       <button 
//         className={activeTab === 'lesson' ? 'demoLesson active' : 'demoLesson'}
//         onClick={() => handleTabClick('lesson')}
//       >
//         <img src={lessonIcon} alt="lesson icon" />
//         Lesson
//       </button>
//       <button 
//         className={activeTab === 'document' ? 'demoDocs active' : 'demoDocs'}
//         onClick={() => handleTabClick('document')}
//       >
//         <img src={translateFileIcon} alt="document icon" />
//         Document
//       </button>
//     </div>
//   );
// };

// export default DocumentNav;

import React from 'react';
import translateFileIcon from '../assets/icons/translateFileIcon.svg';
import fileIconB from '../assets/icons/fileIconB.svg';
import lessonIcon from '../assets/icons/lessonIcon.svg';
import lessonIconB from '../assets/icons/lessonIconB.svg';
import goBackIcon from '../assets/icons/goBackIcon.svg';

interface DocumentNavProps {
  activeTab: 'lesson' | 'document';
  title: string;
  subtitle?: string;
  onLessonClick?: () => void;
  onDocumentClick?: () => void;
  onBackClick?: () => void;
}

const DocumentNav: React.FC<DocumentNavProps> = ({ 
  activeTab,
  title,
  subtitle = '...',
  onLessonClick,
  onDocumentClick,
  onBackClick
}) => {
return (
    <>
      <div className="top">
        <img src={goBackIcon} alt="back button" onClick={onBackClick} style={{ cursor: onBackClick ? 'pointer' : 'default' }} />
        <h1>{title}</h1>
        <h2>{subtitle}</h2>
      </div>
      <div className="switch-view">
        <button 
          className={`demoLesson ${activeTab === 'lesson' ? 'active' : ''}`}
          onClick={onLessonClick}
        >
          <img src={activeTab === 'lesson' ? lessonIcon : lessonIconB} alt="lesson icon" />
          Lesson
        </button>
        <button 
          className={`demoDocs ${activeTab === 'document' ? 'active' : ''}`}
          onClick={onDocumentClick}
        >
          <img src={activeTab === 'document' ? fileIconB : translateFileIcon } alt="document icon" />
          Document
        </button>
      </div>
    </>
  );
};
export default DocumentNav;
