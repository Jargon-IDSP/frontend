import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import continueLearningImg from '/continueLearning.svg';
// import StartLearningImage from '/startLearning.png';

interface StartLearningCardProps {
  onReady?: () => void;
}

const StartLearningCard: React.FC<StartLearningCardProps> = ({ onReady }) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (imageLoaded && onReady) {
      onReady();
    }
  }, [imageLoaded, onReady]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageLoaded(true);
  };


  return (
    <div className="start-learning-card">
      <h2 className="learning-title">Start Learning</h2>
      <div className="learning-content">
        <img 
          className="prebuilt" 
          src={continueLearningImg} 
          alt="Continue Learning Prebuilt" 
          onClick={() => navigate("/learning/existing/levels")}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />

      
      </div>
    </div>
  );
};

export default StartLearningCard;