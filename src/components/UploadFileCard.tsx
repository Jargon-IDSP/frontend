import React from 'react';
import { useNavigate } from 'react-router-dom';
import RockySpeechBubble from './RockySpeechBubble';

const UploadFileCard: React.FC = () => {
  const navigate = useNavigate();

  const handleUploadClick = () => {
    navigate('/documents');
  };

  return (
    <div className="upload-file-card">
      <h2 className="upload-title">AI Translate & Lesson</h2>
      <div className="upload-content">
        <RockySpeechBubble 
          text="Upload your documents and I’ll turn them into bite-sized lessons!"
          className="upload-speech-bubble"
        />
        <button 
          className="btn btn-primary upload-button"
          onClick={handleUploadClick}
        >
          Upload your file
        </button>
      </div>
    </div>
  );
};

export default UploadFileCard;
