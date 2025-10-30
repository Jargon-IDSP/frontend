import React from 'react';
import { useNavigate } from 'react-router-dom';
import bookIcon from '../assets/icons/bookIcon.svg';
import languageIcon from '../assets/icons/languageIcon.svg';

const UploadFileCard: React.FC = () => {
  const navigate = useNavigate();

  const handleUploadClick = () => {
    navigate('/documents');
  };

  return (
    <div className="upload-file-card">
      <h2 className="upload-title">AI Translate & Lesson</h2>
      <div className="upload-content upload-options">
        <div className="upload-option-card">
          <div className="upload-option-icon">
            <img src={bookIcon} alt="Generate" />
          </div>
          <button className="btn upload-option-button" onClick={handleUploadClick}>
            Generate
          </button>
        </div>

        <div className="upload-option-card">
          <div className="upload-option-icon">
            <img src={languageIcon} alt="Translate" />
          </div>
          <button className="btn upload-option-button" onClick={handleUploadClick}>
            Translate
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadFileCard;
