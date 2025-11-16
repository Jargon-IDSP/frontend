import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { useProfile } from "../hooks/useProfile";
import LeaderboardConnectAvatar from "../assets/leaderboardConnectAvatar.svg";
import Podium from "../components/Podium";
import LeaderboardItem from "../components/LeaderboardItem";
import LeaderboardHeader from "../components/LeaderboardHeader";
import type { LeaderboardType } from "../types/leaderboardHeader";

const LeaderboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>("general");
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

  if (loading || profileLoading) {
    return (
      <div className={containerClass}>
        <div className="leaderboard-page leaderboard-error">
          <LeaderboardHeader
            activeTab={leaderboardType}
            onTabChange={setLeaderboardType}
            showActions={false}
          />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

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
                    return (
                      <LeaderboardItem
                        key={user.id}
                        user={user}
                        rank={actualRank}
                        isCurrentUser={isCurrentUser}
                        isClickable={true}
                        fromRoute="/community"
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
