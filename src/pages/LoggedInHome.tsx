import { useAuth, useUser } from '@clerk/clerk-react';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import TopLeaderboard from '../components/TopLeaderboard';
import UploadFileCard from '../components/UploadFileCard';
import StartLearningCard from '../components/StartLearningCard';
import DailyCheckIn from '../components/DailyCheckIn';
import WordOfTheDay from '../components/WordOfTheDay';
import NotificationBell from '../components/NotificationBell';
import LoadingBar from '../components/LoadingBar';
// import JargonLogo from '../components/Wordmark';
import rockyWhiteLogo from '/rockyWhite.svg';

export default function LoggedInHome() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading } = useProfile();
  const [isCheckingRedirect, setIsCheckingRedirect] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSettingsClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    navigate("/profile");
  };

  const handleLanguagesClick = () => {
    setIsDropdownOpen(false);
    navigate("/onboarding/language");
  };

  const handleIndustryClick = () => {
    setIsDropdownOpen(false);
    navigate("/onboarding/industry");
  };

  const handleLogoutClick = async () => {
    try {
      setIsDropdownOpen(false);
      await signOut({ redirectUrl: "/" });
    } catch (error) {
      console.error("Logout error:", error);
      // Force navigation even if signOut fails
      window.location.href = "/";
    }
  };

  // Maintain consistent container structure in both loading and loaded states
  return (
    <div className='container'>
      <div className="home-page">
        {(isLoading || isCheckingRedirect || !user || !profile) ? (
          <div className="loading-container">
            <LoadingBar isLoading={true} />
          </div>
        ) : (
          <>
            <div className="top-header">
              <div className="welcome-text-section">
                <h1 className="welcome-text">Welcome back,</h1>
                <h1 className="welcome-title">
                  {user?.firstName || user?.username || 'User'}
                </h1>
              </div>
              <NotificationBell />
              <div className="home-settings-container" ref={dropdownRef}>
                <button
                  className="rocky-logo-section"
                  onClick={handleSettingsClick}
                  aria-label="Settings"
                >
                  <img src={rockyWhiteLogo} alt="Rocky" className="rocky-logo" />
                </button>

                {isDropdownOpen && (
                  <div className="home-settings-dropdown">
                    <button
                      className="home-settings-item"
                      onClick={handleProfileClick}
                    >
                      Profile
                    </button>
                    <button
                      className="home-settings-item"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/profile/avatar");
                      }}
                    >
                      Avatar
                    </button>
                    <button
                      className="home-settings-item"
                      onClick={handleLanguagesClick}
                    >
                      Languages
                    </button>
                    <button
                      className="home-settings-item"
                      onClick={handleIndustryClick}
                    >
                      Industry
                    </button>
                    <button
                      className="home-settings-item"
                      onClick={handleLogoutClick}
                    >
                      Logout
                    </button>
                  </div>
                )}
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
          </>
        )}
      </div>
    </div>
  );
}