import React from "react";
import { useNavigate } from "react-router-dom";
import rockyYellowLogo from "/rockyYellow.svg";

const TopLeaderboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="top-leaderboard">
      <h2 className="leaderboard-title">Leaderboards</h2>
      <div className="leaderboard-content-new">
        <div className="left-section">
          <div className="rocky-character-section">
            <img
              src={rockyYellowLogo}
              alt="Rocky"
              className="rocky-character-image"
            />
          </div>
          
          <div className="podium-section">
            <div className="first-place-podium">
              <div className="podium-label">1st</div>
            </div>
          </div>
        </div>
        
        <div className="message-buttons-section">
          <div className="motivational-message">
            <p className="message-text">
              Rocky wants you to be number 1!
            </p>
            <p className="message-text-2">
              Stay on top of your learning and be top the leaderboard next week!
            </p>
          </div>
          
          <div className="action-buttons">
            <button
              className="btn btn-leaderboard"
              onClick={() => navigate("/leaderboard/full")}
            >
              Leaderboard
            </button>
            <button
              className="btn btn-view-friends"
              onClick={() => navigate("/community/friends")}
            >
              View Friends
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopLeaderboard;
