import { UserButton, useUser } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import TopLeaderboard from '../components/TopLeaderboard';
import UploadFileCard from '../components/UploadFileCard';
import StartLearningCard from '../components/StartLearningCard';
import DailyCheckIn from '../components/DailyCheckIn';
import WordOfTheDay from '../components/WordOfTheDay';
// import JargonLogo from '../components/Wordmark';
import rockyWhiteLogo from '/rockyWhite.svg';

export default function LoggedInHome() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { data: profile, isLoading } = useProfile();
  const [isCheckingRedirect, setIsCheckingRedirect] = useState(true);

  // Check if user needs to see introduction or complete onboarding on first login
  useEffect(() => {
    if (!isLoading && user && profile) {
      const justCompleted = sessionStorage.getItem('onboardingJustCompleted') === 'true';

      // Clear the just completed flag after checking
      if (justCompleted) {
        sessionStorage.removeItem('onboardingJustCompleted');
      }

      // Only check skip flag during the current session (sessionStorage, not localStorage)
      // This way, skip only persists within a single session, not across logins
      const hasSkippedThisSession = sessionStorage.getItem('onboardingSkippedThisSession') === 'true';

      // Check if user has viewed the introduction page (from database)
      const introductionViewed = profile?.introductionViewed ?? false;

      // If introduction hasn't been viewed, redirect to introduction page first
      if (!introductionViewed && !hasSkippedThisSession && !justCompleted) {
        navigate('/onboarding/introduction', { replace: true });
        return;
      }

      // If introduction has been viewed but onboarding not completed, redirect to onboarding
      if (!profile.onboardingCompleted && !hasSkippedThisSession && !justCompleted && introductionViewed) {
        navigate('/onboarding/language', { replace: true });
        return;
      }

      // If we get here, user doesn't need redirect, show the home page
      setIsCheckingRedirect(false);
    } else if (isLoading || !user) {
      // Still loading or no user, keep checking
      setIsCheckingRedirect(true);
    }
  }, [user, profile, isLoading, navigate]);

  // Show loading state while checking for redirects or while profile is loading
  if (isLoading || isCheckingRedirect || !user || !profile) {
    return null; // Return null to prevent flash, the redirect will happen
  }

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