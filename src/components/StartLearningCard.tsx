import React from 'react';
import { useNavigate } from 'react-router-dom';
import continueLearningImg from '/continueLearning.svg';
// import StartLearningImage from '/startLearning.png';

const StartLearningCard: React.FC = () => {
  const navigate = useNavigate();

  // const handleContinueLearning = () => {
  //   navigate('/learning');
  // };

  return (
    <div className="start-learning-card">
      <h2 className="learning-title">Start Learning</h2>
      <div className="learning-content">
        <img className="prebuilt" src={continueLearningImg} alt="Continue Learning Prebuilt" onClick={() => navigate("/learning/existing/levels")}/>

        {/* <img src={StartLearningImage} alt="Start Learning" className="learning-image" />
        <button 
          className="btn btn-primary learning-button"
          onClick={handleContinueLearning}
        >
          Continue Learning
        </button> */}
      </div>
    </div>
  );
};

export default StartLearningCard;