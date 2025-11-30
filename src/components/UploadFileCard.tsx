import React from "react";
import { useNavigate } from "react-router-dom";
import translationHomepageIcon from "../assets/icons/translationHomepageIcon.svg";

const TopLeaderboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="top-leaderboard">
      <h2 className="leaderboard-title">AI Translate and Lesson</h2>
      <div className="leaderboard-content-new">
        <div className="leaderboard-content-area">
          <div className="left-section">
            <div className="rocky-character-section">
              <img
                src={translationHomepageIcon}
                alt="Translation Icon"
                className="rocky-character-image"
              />
            </div>
            
            {/* <div className="podium-section">
              <div className="first-place-podium">
                <div className="podium-label">1st</div>
              </div>
            </div> */}
          </div>
          
          <div className="message-buttons-section">
            <div className="motivational-message">
              <p className="message-text">
                Generate your document to a lesson!
              </p>
              <p className="message-text-2">
                Upload any document and personalize your learning experience.
              </p>
            </div>
          </div>
        </div>
        
        <button
          className="btn btn-leaderboard"
          onClick={() => navigate("/documents")}
        >
          Upload Document
        </button>
      </div>
    </div>
  );
};

export default TopLeaderboard;
