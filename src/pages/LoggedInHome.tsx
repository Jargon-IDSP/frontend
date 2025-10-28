import { UserButton, useUser } from '@clerk/clerk-react';
import TopLeaderboard from '../components/TopLeaderboard';
import UploadFileCard from '../components/UploadFileCard';
import StartLearningCard from '../components/StartLearningCard';
import DailyCheckIn from '../components/DailyCheckIn';
import WordOfTheDay from '../components/WordOfTheDay';
// import JargonLogo from '../components/Wordmark';
import rockyWhiteLogo from '/rockyWhite.svg';

export default function LoggedInHome() {
  const { user } = useUser();

  return (
    <div className="home-page">
      <div className="top-header">
        <div className="welcome-text-section">
          
          <h1 className="welcome-text">Welcome back,</h1>
          <h1 className="welcome-title">
            {user?.firstName || user?.username || 'User'}
          </h1>
        </div>
        <div className="rocky-logo-section">
        <img src={rockyWhiteLogo} alt="Rocky" className="rocky-logo" />
        <UserButton 
          appearance={{
            elements: {
              userButtonAvatarBox: 'user-button-avatar-box',
              userButtonTrigger: 'user-button-trigger',
              userButtonAvatarImage: 'user-button-avatar-image'
            }
          }}
        />
      </div>
      </div>

      <div className="welcome-section">
        {/* <JargonLogo /> */}
        <WordOfTheDay />
        <DailyCheckIn />
        <StartLearningCard />
        <UploadFileCard />
        <TopLeaderboard />
      </div>
    </div>
  );
}