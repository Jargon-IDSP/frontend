import React from 'react';
import { useNavigate } from 'react-router-dom';
import languageIcon from '../assets/icons/languageIcon.svg';

const StartLearningCard: React.FC = () => {
  const navigate = useNavigate();

  const handleAiUpload = () => {
    navigate('/documents');
  };

  return (
    <div className="start-learning-card">
      <h2 className="learning-title">AI Translate & Lesson</h2>
      <div className="Ai-upload-content">
        <div className="translate-card-contents">
        <img src={languageIcon} alt="AI Translate & Lesson" className="translate-icon" />
        <h3>Generate your document to a lesson!</h3>
        <p>Upload any document and personalize your learning experience.</p>
        </div>
        <button 
          className="btn btn-primary upload-document-button"
          onClick={handleAiUpload}
        >
          Upload document
        </button>
      </div>
    </div>
  );
};

export default StartLearningCard;