import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import HappyRocky from '../components/avatar/HappyRocky';
import TopLeaderboard from '../components/TopLeaderboard';
import UploadFileCard from '../components/UploadFileCard';
import StartLearningCard from '../components/StartLearningCard';
import rockyWhiteLogo from '/rockyWhite.svg';

export default function HomePage() {
  const { user } = useUser();

  return (
    <div className="home-page">
      <div className="top-header">
        <div className="welcome-text-section">
          <SignedOut>
            <h1 className="welcome-title">Welcome to Jargon!</h1>
          </SignedOut>
          <SignedIn>
            <h1 className="welcome-title">Welcome {user?.firstName || user?.username || 'User'}</h1>
          </SignedIn>
        </div>

        <div className="rocky-logo-section">
          <img src={rockyWhiteLogo} alt="Rocky" className="rocky-logo" />
        </div>
      </div>

      <SignedOut>
        <SignInButton />
        <div className="welcome-section">
          <HappyRocky />
        </div>
      </SignedOut>

      <SignedIn>
        <div className="welcome-section">
          <UserButton />
          
          <img src="../../public/Jargon_Wordmark.png" alt="Jargon Word Mark" style={{ borderRadius: '50%', width: '20rem' }} />

          <StartLearningCard />
          <UploadFileCard />
          <TopLeaderboard />
        </div>
      </SignedIn>
    </div>
  );
}