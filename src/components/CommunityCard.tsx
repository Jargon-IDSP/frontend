import React from 'react';
import { useNavigate } from 'react-router-dom';
import leaderboardGraphic from '../assets/leaderboardHomepageGraphic.svg'
import friendGraphic from '../assets/friendsHomepageGraphic.svg'
// import bookIcon from '../assets/icons/bookIcon.svg';
// import languageIcon from '../assets/icons/languageIcon.svg';

const UploadFileCard: React.FC = () => {
  const navigate = useNavigate();

  // const handleUploadClick = () => {
  //   navigate('/documents');
  // };

  const handleLeaderboardClick = () => {
    navigate('/leaderboard/full');
  };

  const handleFriendsClick = () => {
    navigate('/community/friends');
  };

  return (
    <div className="community-file-card">
      <h2 className="community-title">Community</h2>
      <div className="community-content community-options">
        <div className="community-option-card">
          <div className="community-option-icon">
            <img src={leaderboardGraphic} alt="Leaderboards" className='leaderboard-homepage-graphic' />
            {/* <img src={bookIcon} alt="Leaderboards" /> */}
          </div>
          <button className="btn community-options-button" onClick={handleLeaderboardClick}>
            Leaderboards
          </button>
        </div>

        <div className="community-option-card">
          <div className="community-option-icon">
            <img src={friendGraphic} alt="Friends" className='friends-homepage-graphic' />
            {/* <img src={languageIcon} alt="Friends" /> */}
          </div>
          <button className="btn community-options-button" onClick={handleFriendsClick}>
            Friends
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadFileCard;
