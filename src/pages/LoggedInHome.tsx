import { useAuth, useUser } from '@clerk/clerk-react';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../hooks/useProfile';
import UploadFileCard from '../components/UploadFileCard';
import CommunityCard from '../components/CommunityCard';
import StartLearningCard from '../components/StartLearningCard';
import DailyCheckIn from '../components/DailyCheckIn';
import WordOfTheDay from '../components/WordOfTheDay';
import NotificationBell from '../components/NotificationBell';
import LoadingBar from '../components/LoadingBar';
// import JargonLogo from '../components/Wordmark';
// import rockyWhiteLogo from '/rockyWhite.svg';
import todayTermCard from '../assets/todayTermCard.svg';
import InstantHelpCard from '../components/InstantHelpCard';
import RockyFriends from '../assets/homePageRockys.svg';

export default function LoggedInHome() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const [hasCheckedRedirect, setHasCheckedRedirect] = useState(false);
  const [isWordReady, setIsWordReady] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isProfileLoading && user && profile) {
      const justCompleted = sessionStorage.getItem('onboardingJustCompleted') === 'true';

      if (justCompleted) {
        sessionStorage.removeItem('onboardingJustCompleted');
      }

      const hasSkippedThisSession = sessionStorage.getItem('onboardingSkippedThisSession') === 'true';
      const introductionViewed = profile?.introductionViewed ?? false;

      if (!introductionViewed && !hasSkippedThisSession && !justCompleted) {
        navigate('/onboarding/introduction', { replace: true });
        return;
      }

      if (!profile.onboardingCompleted && !hasSkippedThisSession && !justCompleted && introductionViewed) {
        navigate('/onboarding/language', { replace: true });
        return;
      }
      
      setHasCheckedRedirect(true);
    }
  }, [user, profile, isProfileLoading, navigate]);


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
      window.location.href = "/";
    }
  };

  const isPageLoading = isProfileLoading || !user || !profile || !hasCheckedRedirect || !isWordReady;

return (
  <div className='container'>
    <div className="home-page">
      {isPageLoading && (
        <div className="loading-container">
          <LoadingBar isLoading={true} />
        </div>
      )}
      
      <div style={{ display: isPageLoading ? 'none' : 'block' }}>
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
                      navigate("/avatar");
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
            <WordOfTheDay 
              backgroundImage={todayTermCard}
              onReady={() => setIsWordReady(true)}
            />
            <DailyCheckIn />
            <StartLearningCard />
            <InstantHelpCard />
            <CommunityCard />
            <UploadFileCard />
            <img src={RockyFriends} alt="Rocky friends graphic" className='rocky-friends'/>
          </div>
        </>
      </div>
    </div>
  </div>
);
}
