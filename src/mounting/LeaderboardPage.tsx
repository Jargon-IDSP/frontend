import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { useProfile } from "../hooks/useProfile";
import LeaderboardConnectAvatar from "../assets/leaderboardConnectAvatar.svg";
import Podium from "../components/Podium";
import LeaderboardItem from "../components/LeaderboardItem";
import LeaderboardHeader from "../components/LeaderboardHeader";
import LoadingBar from "../components/LoadingBar";
import SelfLeaderboard from "../components/SelfLeaderboard";
import type { LeaderboardType } from "../types/leaderboardHeader";
import { AvatarDisplay } from "../components/avatar";
import rockyWhiteLogo from "/rockyWhite.svg";
import { getLanguageFlag } from "../utils/languageFlagHelpers";
import { getLanguageCode } from "../utils/userHelpers";

const LeaderboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");

  const initialTab = (tabParam === "general" || tabParam === "private" || tabParam === "self")
    ? tabParam
    : "general";

  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>(initialTab);

  // Update state when URL parameter changes
  useEffect(() => {
    if (tabParam === "general" || tabParam === "private" || tabParam === "self") {
      setLeaderboardType(tabParam);
    }
  }, [tabParam]);
  const {
    data: users = [],
    isLoading: loading,
    error,
    refetch,
  } = useLeaderboard(leaderboardType === "private" ? "friends" : "general");
  const { data: profile, isLoading: profileLoading } = useProfile();

  const userScore = profile?.score ?? 0;
  const hasNoPoints = userScore === 0;

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
  const isLoadingPage =
    loading ||
    profileLoading;

  if (error) {
    return (
      <div className={containerClass}>
        <div className="leaderboard-page leaderboard-error">
          <LeaderboardHeader
            activeTab={leaderboardType}
            onTabChange={setLeaderboardType}
            showActions={false}
          />
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
          <LeaderboardHeader
            activeTab={leaderboardType}
            onTabChange={setLeaderboardType}
            showActions={false}
          />
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
          <LeaderboardHeader
            activeTab={leaderboardType}
            onTabChange={setLeaderboardType}
            showActions={true}
          />

          <LoadingBar isLoading={isLoadingPage} text="Loading Leaderboard" />

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
              {isSelfLeaderboard ? (
                <div className="friend-profile-avatar" style={{ position: "relative", overflow: "visible" }}>
                  {profile?.avatar ? (
                    <AvatarDisplay
                      config={profile.avatar}
                      size={120}
                      className="friend-profile-avatar-display"
                    />
                  ) : (
                    <img src={rockyWhiteLogo} alt="User Avatar" />
                  )}
                  {profile?.language && getLanguageFlag(profile.language) && (
                    <span
                      className="leaderboard-self-flag"
                      title={getLanguageCode(profile.language)}
                    >
                      <img
                        src={getLanguageFlag(profile.language)!.src}
                        alt={getLanguageFlag(profile.language)!.alt}
                        className="leaderboard-self-flag-icon"
                      />
                    </span>
                  )}
                </div>
              ) : (
                users.length > 0 && (
                  <Podium users={users} currentUserId={profile?.id} fromRoute="/leaderboard/full" />
                )
              )}
            </>
          )}
        </div>

        {!hasInsufficientPrivateConnections && (
          <div className="leaderboard-drawer">
            {isSelfLeaderboard ? (
              <SelfLeaderboard />
            ) : (
              <>
                <div className="leaderboard-list">
                  {users.slice(3).map((user, index) => {
                    const actualRank = index + 4;
                    const isCurrentUser = user.id === profile?.id;
                    return (
                      <LeaderboardItem
                        key={user.id}
                        user={user}
                        rank={actualRank}
                        isCurrentUser={isCurrentUser}
                        isClickable={true}
                        fromRoute="/leaderboard/full"
                      />
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
