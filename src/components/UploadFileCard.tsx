import React from 'react';
import { useNavigate } from 'react-router-dom';
import homePageFriends from '../assets/homePageFriends.svg';
import homePageLeaderBoard from '../assets/homePageLeaderBoard.svg';
// import languageIcon from '../assets/icons/languageIcon.svg';
import instantHelpIcon from '../assets/instantHelp.svg';

const UploadFileCard: React.FC = () => {
  const navigate = useNavigate();

  const handleFriendsClick = () => {
    navigate('/community/friends');
  };

   const handleLeaderboardsClick = () => {
    navigate('/leaderboard/full');
  };

  return (
    <div className="upload-file-card">
      <h2 className="upload-title">Instant Help</h2>

      <img className="instantHelp" src={instantHelpIcon} alt="Custom Lessons" onClick={() => navigate("/learning/custom/categories")}/>
      <h2>Community</h2>
      <div className="shortcuts-container">
        <div className="shortcut-card">
          <div className="shortcut-icon">
            <img src={homePageLeaderBoard} alt="Leaderboards" />
          </div>
          <button className="btn shortcut-button" onClick={handleLeaderboardsClick}>
            Leaderboards
          </button>
        </div>

        <div className="shortcut-card">
          <div className="shortcut-icon">
            <img src={homePageFriends} alt="Friends" />
          </div>
          <button className="btn shortcut-button" onClick={handleFriendsClick}>
            Friends
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadFileCard;
