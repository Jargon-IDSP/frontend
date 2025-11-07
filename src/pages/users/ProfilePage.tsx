import { useAuth } from "@clerk/clerk-react";
import { UserProfile } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useProfile } from "../../hooks/useProfile";
import { DocumentsList } from "../documents/DocumentList";
import { useUnreadCount } from "../../hooks/useNotifications";
import editIcon from '../../assets/icons/editIcon.svg';
import notificationIcon from '../../assets/icons/notification.svg';
import emptyBellIcon from '../../assets/icons/emptyBell.svg';
import rockyWhiteLogo from '/rockyWhite.svg';
import '../../styles/pages/_profile.scss';

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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { data: unreadCount } = useUnreadCount();

  const error = queryError ? (queryError as Error).message : null;

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

      <div className="container">
        <div className="profile-page">
          {/* Header with title and settings icon */}
          <div className="profile-header">
          <h1 className="profile-header-title">Profile</h1>
          <div className="profile-header-actions">
            <button
              className="profile-notifications-icon"
              onClick={() => navigate("/notifications")}
              aria-label="Notifications"
            >
              <img src={unreadCount && unreadCount > 0 ? notificationIcon : emptyBellIcon} alt="Notifications" />
            </button>
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
                  onClick={handleAccountClick}
                >
                  Account
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
