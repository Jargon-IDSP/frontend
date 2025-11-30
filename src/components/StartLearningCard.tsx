import React from 'react';
import { useNavigate } from 'react-router-dom';
import StartLearningImage from '/startLearning.png';

const StartLearningCard: React.FC = () => {
  const navigate = useNavigate();

  const handleContinueLearning = () => {
    navigate('/learning');
  };

  return (
    <div className="start-learning-card">
      <h2 className="learning-title">Start Learning</h2>
      <div className="learning-content" onClick={handleContinueLearning}>
        <img src={StartLearningImage} alt="Start Learning" className="learning-image" />
      </div>
    </div>
  );
};

export default StartLearningCard;
