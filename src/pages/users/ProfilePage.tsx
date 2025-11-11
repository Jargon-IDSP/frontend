import { useAuth } from "@clerk/clerk-react";
import { UserProfile } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect, useMemo } from "react";
import { useProfile } from "../../hooks/useProfile";
import { DocumentsList } from "../documents/DocumentList";
import { useUserBadges } from "../../hooks/useUserBadges";
import PrivacyDrawer from "../drawers/PrivacyDrawer";
import NotificationBell from "../../components/NotificationBell";
import editIcon from '../../assets/icons/editIcon.svg';
import rockyWhiteLogo from '/rockyWhite.svg';
import '../../styles/pages/_profile.scss';
import '../../styles/pages/_friendProfile.scss';

// Eagerly import all badge images using glob
const badgeModules = import.meta.glob<string>('../../assets/badges/**/*.svg', {
  eager: true,
  import: 'default'
});

const industryIdToName: { [key: number]: string } = {
  1: 'Electrician',
  2: 'Plumber',
  3: 'Carpenter',
  4: 'Mechanic',
  5: 'Welder',
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { data, error: queryError, isLoading } = useProfile();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isPrivacyDrawerOpen, setIsPrivacyDrawerOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: userBadges } = useUserBadges();

  const error = queryError ? (queryError as Error).message : null;

  // Get badge icon URLs from glob imports
  const badgeIcons = useMemo(() => {
    if (!userBadges) return [];

    return userBadges.map((userBadge) => {
      if (userBadge.badge?.iconUrl) {
        const iconPath = userBadge.badge.iconUrl;
        const fullPath = `../../assets/badges/${iconPath}`;
        const url = badgeModules[fullPath];
        return {
          id: userBadge.id,
          name: userBadge.badge.name,
          url: url || null
        };
      }
      return null;
    }).filter((icon): icon is { id: string; name: string; url: string } => icon !== null && icon.url !== null);
  }, [userBadges]);

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

  const handleAccountClick = () => {
    setIsDropdownOpen(false);
    setIsAccountModalOpen(true);
  };

  const handleCloseAccountModal = () => {
    setIsAccountModalOpen(false);
  };

  const handlePrivacyClick = () => {
    setIsDropdownOpen(false);
    setIsPrivacyDrawerOpen(true);
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

  return (
    <>
      {/* Clerk UserProfile Modal */}
      {isAccountModalOpen && (
        <div className="profile-account-modal-wrapper" onClick={handleCloseAccountModal}>
          <div onClick={(e) => e.stopPropagation()}>
            <UserProfile />
          </div>
        </div>
      )}

      {/* Privacy Settings Drawer */}
      <PrivacyDrawer
        open={isPrivacyDrawerOpen}
        onOpenChange={setIsPrivacyDrawerOpen}
      />

      <div className="container">
        <div className="profile-page">
          {/* Header with title and settings icon */}
          <div className="profile-header">
          <h1 className="profile-header-title">Profile</h1>
          <div className="profile-header-actions">
            <NotificationBell />
            <div className="profile-settings-container" ref={dropdownRef}>
              <button
                className="profile-settings-icon"
                onClick={handleSettingsClick}
                aria-label="Settings"
              >
                <img src={rockyWhiteLogo} alt="Rocky" className="rocky-logo" />
              </button>

            {isDropdownOpen && (
              <div className="profile-settings-dropdown">
                <button
                  className="profile-settings-item"
                  onClick={handleProfileClick}
                >
                  Profile
                </button>
                <button
                  className="profile-settings-item"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate("/profile/avatar");
                  }}
                >
                  Avatar
                </button>
                <button
                  className="profile-settings-item"
                  onClick={handlePrivacyClick}
                >
                  Privacy
                </button>
                <button
                  className="profile-settings-item"
                  onClick={handleLanguagesClick}
                >
                  Languages
                </button>
                <button
                  className="profile-settings-item"
                  onClick={handleIndustryClick}
                >
                  Industry
                </button>
                <button
                  className="profile-settings-item"
                  onClick={handleLogoutClick}
                >
                  Logout
                </button>
              </div>
            )}
            </div>
          </div>
        </div>

        {isLoading && (
          <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
            Loading profile...
          </div>
        )}

        {error && <div className="error-message">Error: {error}</div>}

        {data && (
          <div className="profile-content">
            {/* Profile Card */}
            <div className="profile-card">
              <div className="profile-card-avatar">
                <img src={rockyWhiteLogo} alt="User Avatar" className="profile-avatar-image" />
              </div>
              <div className="profile-card-info">
                <h2 className="profile-card-name">
                  {data.firstName
                    ? `${data.firstName}`
                    : data.username || data.email || 'User'}
                </h2>
                <p className="profile-card-industry">
                  {data.industryId ? industryIdToName[data.industryId] || 'Not set' : 'Not set'}
                </p>
              </div>
              <button
                className="profile-card-edit"
                onClick={() => navigate("/profile/manage")}
                aria-label="Edit profile"
              >
                <img src={editIcon} alt="Edit" />
              </button>
            </div>

            {/* Friends Button */}
            <div className="profile-actions">
              <button
                className="profile-friends-button"
                onClick={() => navigate("/profile/friends")}
              >
                View Friends
              </button>
            </div>

            {/* Badges Section - using friend profile styling */}
            <div className="friend-profile-badges-section">
              <h4 className="friend-profile-badges-subtitle">
                Badge Collection
              </h4>
              <div className="friend-profile-badges-grid">
                {badgeIcons.length > 0 ? (
                  badgeIcons.map((badge) => (
                    <div key={badge.id} className="friend-profile-badge-item" title={badge.name}>
                      <img
                        src={badge.url}
                        alt={badge.name}
                        className="friend-profile-badge-icon"
                      />
                    </div>
                  ))
                ) : (
                  <p className="friend-profile-no-badges">No badges earned yet.</p>
                )}
              </div>
            </div>

            {/* Documents Section */}
            <div className="profile-documents">
              <DocumentsList refresh={0} />
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  );
}
