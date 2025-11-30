import React from 'react';
import { useNavigate } from 'react-router-dom';
import rockyCamera from '../../public/camera-rocky.svg'

const InstantHelpCard: React.FC = () => {
  const navigate = useNavigate();

  const handleCameraClick = () => {
    navigate('/instant-help');
  };

  return (
    <div className="camera-file-card">
      <h2 className="camera-title">Instant Help</h2>
      <div className="camera-content">
        <div className="camera-option-icon">
          <img src={rockyCamera} alt="Camera" className='camera-homepage-graphic' />
        </div>
        <div className="camera-option-content">
          <h3>Point, snap, and learn!</h3>
          <p>Take a picture of any tool and instantly get the definition.</p>
          <button className="camera-option-button" onClick={handleCameraClick}>
            Start Camera
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstantHelpCard;
