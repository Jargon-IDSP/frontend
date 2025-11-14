import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import rockyLogo from "/rocky.svg";
import rockyWhiteLogo from '/rockyWhite.svg';
import { useLeaderboard } from "../hooks/useLeaderboard";
import { useProfile } from "../hooks/useProfile";
import { getUserDisplayName, getLanguageCode } from "../utils/userHelpers";
import LeaderboardConnectAvatar from "../assets/leaderboardConnectAvatar.svg";
import Podium from "../components/Podium";
import NotificationBell from "../components/NotificationBell";
import { getLanguageFlag } from "../utils/languageFlagHelpers";

type LeaderboardType = "general" | "private" | "self";

const LeaderboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>("general");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
    data: users = [],
    isLoading: loading,
    error,
    refetch,
  } = useLeaderboard(leaderboardType === "private" ? "friends" : "general");
  const { data: profile, isLoading: profileLoading } = useProfile();

  const userScore = profile?.score ?? 0;
  const hasNoPoints = userScore === 0;

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

  const isPrivateLeaderboard = leaderboardType === "private";
  const isSelfLeaderboard = leaderboardType === "self";

  const hasNoPrivateConnections =
    isPrivateLeaderboard &&
    users.length === 1 &&
    users[0]?.id === profile?.id;

  const hasInsufficientPrivateConnections =
    isPrivateLeaderboard &&
    users.length < 3;

  const containerClass = "container container--leaderboard";

  if (loading || profileLoading) {
    return (
      <div className={containerClass}>
        <div className="leaderboard-page leaderboard-error">
          <h1 className="leaderboard-title">Leaderboard</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={containerClass}>
        <div className="leaderboard-page leaderboard-error">
          <h1 className="leaderboard-title">Leaderboard</h1>
          <p className="leaderboard-error-message">
            Error:{" "}
            {error instanceof Error
              ? error.message
              : "Failed to fetch leaderboard"}
          </p>
          <button
            className="leaderboard-error-button"
            onClick={() => refetch()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (hasNoPoints) {
    return (
      <div className={containerClass}>
        <div className="leaderboard-page">
          <h1 className="leaderboard-title">Leaderboard</h1>
          <div className="leaderboard-empty-state">
            <img src={LeaderboardConnectAvatar} alt="Leaderboard Connect Avatar" className="leaderboard-empty-avatar" />
            <p className="leaderboard-empty-message">
              You haven't started earning points yet. Go and start learning!
            </p>
            <button
              className="leaderboard-start-button"
              onClick={() => navigate("/learning")}
            >
              Start Learning
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div className="leaderboard-page">
        <div className="leaderboard-hero">
          <div className="leaderboard-header">
            <h1 className="leaderboard-title">Leaderboard</h1>
            <div className="leaderboard-header-actions">
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
            </div>
          </div>

          <div className="leaderboard-tabs">
            <button
              type="button"
              className={`leaderboard-tab ${
                leaderboardType === "general" ? "leaderboard-tab--active" : ""
              }`}
              onClick={() => setLeaderboardType("general")}
            >
              General
            </button>
            <button
              type="button"
              className={`leaderboard-tab ${
                leaderboardType === "private" ? "leaderboard-tab--active" : ""
              }`}
              onClick={() => setLeaderboardType("private")}
            >
              Private
            </button>
            <button
              type="button"
              className={`leaderboard-tab ${
                leaderboardType === "self" ? "leaderboard-tab--active" : ""
              }`}
              onClick={() => setLeaderboardType("self")}
            >
              Self
            </button>
          </div>

          {hasInsufficientPrivateConnections ? (
            <div className="leaderboard-empty-state">
              <img
                src={LeaderboardConnectAvatar}
                alt="Leaderboard Connect Avatar"
                className="leaderboard-empty-avatar"
              />
              <p className="leaderboard-empty-message">
                {hasNoPrivateConnections
                  ? "You don't have any private connections yet. Follow friends to unlock the private leaderboard!"
                  : "You need at least 2 friends to unlock the private leaderboard!"}
              </p>
              <button
                className="leaderboard-start-button"
                onClick={() => navigate("/profile/friends")}
              >
                Find Friends
              </button>
            </div>
          ) : (
            <>
              {users.length > 0 && (
                <Podium users={users} currentUserId={profile?.id} />
              )}
            </>
          )}
        </div>

        {!hasInsufficientPrivateConnections && (
          <div className="leaderboard-drawer">
            {isSelfLeaderboard ? (
              <div className="leaderboard-coming-soon">
                <h2 className="leaderboard-coming-soon__title">Self leaderboard coming soon</h2>
                <p className="leaderboard-coming-soon__description">
                  Track your personal streaks and milestones right from this tab. Hang tight—we’re polishing the experience!
                </p>
              </div>
            ) : (
              <>
                <div className="leaderboard-list">
                  {users.slice(3).map((user, index) => {
                    const actualRank = index + 4;
                    const isCurrentUser = user.id === profile?.id;
                    const languageFlag = getLanguageFlag(user.language);
                    return (
                      <div
                        key={user.id}
                        className={`leaderboard-item leaderboard-item--regular ${
                          isCurrentUser ? "leaderboard-item--current-user" : ""
                        } leaderboard-item--clickable`}
                        onClick={() => navigate(`/profile/friends/${user.id}`, { state: { from: "/leaderboard" } })}
                      >
                        <div className="leaderboard-item-content leaderboard-item-content--regular">
                          <span className="leaderboard-item-rank">{actualRank}</span>
                          <img
                            src={rockyLogo}
                            alt="Rocky"
                            className="leaderboard-item-logo leaderboard-item-logo--regular"
                          />
                          <div className="leaderboard-item-text">
                            <span className="leaderboard-item-name">
                              {getUserDisplayName(user)}
                              {isCurrentUser && (
                                <span className="leaderboard-item-you">(You)</span>
                              )}
                            </span>
                            <span className="leaderboard-item-points">
                              {user.score.toLocaleString()} pts
                            </span>
                          </div>
                        </div>
                        <div className="leaderboard-item-details">
                          {languageFlag && (
                            <img
                              src={languageFlag.src}
                              alt={languageFlag.alt}
                              className="leaderboard-item-flag"
                            />
                          )}
                          <span className="leaderboard-item-language">
                            {getLanguageCode(user.language)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {users.length === 0 && (
                  <p className="leaderboard-empty-list">
                    {isPrivateLeaderboard
                      ? "No private leaderboard entries yet. Invite friends to start competing!"
                      : "No users found in the leaderboard."}
                  </p>
                )}
              </>
            )}
          </div>
        )}

        {isPrivateLeaderboard && !hasInsufficientPrivateConnections && (
          <button
            className="leaderboard-friends-button"
            onClick={() => navigate("/profile/friends")}
          >
            Find Friends
          </button>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
