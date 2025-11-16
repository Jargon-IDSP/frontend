import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import rockyWhiteLogo from '/rockyWhite.svg';
import goBackIcon from "../assets/icons/goBackIcon.svg";
import NotificationBell from "./NotificationBell";
import type { LeaderboardHeaderProps } from "../types/leaderboardHeader";

const LeaderboardHeader: React.FC<LeaderboardHeaderProps> = ({
  activeTab,
  onTabChange,
  showActions = true,
}) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      window.location.href = "/";
    }
  };

  return (
    <>
      <div className="leaderboard-header">
        <button
          className="leaderboard-back-button"
          onClick={() => navigate("/community")}
        >
          <img src={goBackIcon} alt="Back" />
        </button>
        <h1 className="leaderboard-title">Leaderboard</h1>
        <div className="leaderboard-header-actions">
          {showActions ? (
            <>
              <NotificationBell />
              <div className="leaderboard-settings-container" ref={dropdownRef}>
                <button
                  className="leaderboard-settings-icon"
                  onClick={handleSettingsClick}
                  aria-label="Settings"
                >
                  <img src={rockyWhiteLogo} alt="Rocky" className="rocky-logo" />
                </button>

                {isDropdownOpen && (
                  <div className="leaderboard-settings-dropdown">
                    <button
                      className="leaderboard-settings-item"
                      onClick={handleProfileClick}
                    >
                      Profile
                    </button>
                    <button
                      className="leaderboard-settings-item"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        navigate("/profile/avatar");
                      }}
                    >
                      Avatar
                    </button>
                    <button
                      className="leaderboard-settings-item"
                      onClick={handleLanguagesClick}
                    >
                      Languages
                    </button>
                    <button
                      className="leaderboard-settings-item"
                      onClick={handleIndustryClick}
                    >
                      Industry
                    </button>
                    <button
                      className="leaderboard-settings-item"
                      onClick={handleLogoutClick}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div></div>
          )}
        </div>
      </div>

      {showActions && (
        <div className="leaderboard-tabs">
          <button
            type="button"
            className={`leaderboard-tab ${
              activeTab === "general" ? "leaderboard-tab--active" : ""
            }`}
            onClick={() => onTabChange("general")}
          >
            General
          </button>
          <button
            type="button"
            className={`leaderboard-tab ${
              activeTab === "private" ? "leaderboard-tab--active" : ""
            }`}
            onClick={() => onTabChange("private")}
          >
            Private
          </button>
          <button
            type="button"
            className={`leaderboard-tab ${
              activeTab === "self" ? "leaderboard-tab--active" : ""
            }`}
            onClick={() => onTabChange("self")}
          >
            Self
          </button>
        </div>
      )}
    </>
  );
};

export default LeaderboardHeader;
