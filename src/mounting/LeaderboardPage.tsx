import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import rockyLogo from "/rocky.svg";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { useProfile } from "../hooks/useProfile";
import { getUserDisplayName, getLanguageCode } from "../utils/userHelpers";
import LeaderboardConnectAvatar from "../assets/leaderboardConnectAvatar.svg";
import Podium from "../components/Podium";

type LeaderboardType = "general" | "friends";

const LeaderboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>("general");
  const {
    data: users = [],
    isLoading: loading,
    error,
    refetch,
  } = useLeaderboard(leaderboardType);
  const { data: profile, isLoading: profileLoading } = useProfile();

  const userScore = profile?.score ?? 0;
  const hasNoPoints = userScore === 0;

  const hasNoFriends = 
    leaderboardType === "friends" && 
    users.length === 1 && 
    users[0]?.id === profile?.id;

  if (loading || profileLoading) {
    return (
      <div className="container">
        <div className="leaderboard-page leaderboard-error">
          <h1 className="leaderboard-title">Leaderboard</h1>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
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
      <div className="container">
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
    <div className="container">
      <div className="leaderboard-page">
        <h1 className="leaderboard-title">Leaderboard</h1>

        <div className="leaderboard-tabs">
          <button
            className={`leaderboard-tab ${
              leaderboardType === "general" ? "leaderboard-tab--active" : ""
            }`}
            onClick={() => setLeaderboardType("general")}
          >
            General
          </button>
          <button
            className={`leaderboard-tab ${
              leaderboardType === "friends" ? "leaderboard-tab--active" : ""
            }`}
            onClick={() => setLeaderboardType("friends")}
          >
            Friends
          </button>
        </div>

        {hasNoFriends ? (
          <div className="leaderboard-empty-state">
            <img
              src={LeaderboardConnectAvatar}
              alt="Leaderboard Connect Avatar"
              className="leaderboard-empty-avatar"
            />
            <p className="leaderboard-empty-message">
              You don't have any friends yet. Add friends to see the friends leaderboard!
            </p>
            <button
              className="leaderboard-start-button"
              onClick={() => navigate("/profile/friends")}
            >
              Add Friends
            </button>
          </div>
        ) : (
          <>
            {users.length > 0 && (
              <Podium users={users} currentUserId={profile?.id} />
            )}

            <div className="leaderboard-list">
              {users.slice(3).map((user, index) => {
                const actualRank = index + 4; 
                const isCurrentUser = user.id === profile?.id;
                return (
                  <div
                    key={user.id}
                    className={`leaderboard-item leaderboard-item--regular ${
                      isCurrentUser ? "leaderboard-item--current-user" : ""
                    }`}
                  >
                    <span className="leaderboard-item-content leaderboard-item-content--regular">
                      <span className="leaderboard-item-rank">#{actualRank}</span>
                      <img
                        src={rockyLogo}
                        alt="Rocky"
                        className="leaderboard-item-logo leaderboard-item-logo--regular"
                      />
                      {getUserDisplayName(user)}
                      {isCurrentUser && (
                        <span className="leaderboard-item-you">(You)</span>
                      )}
                    </span>
                    <div className="leaderboard-item-details">
                      <span className="leaderboard-item-score">
                        {user.score.toLocaleString()}
                      </span>
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
                {leaderboardType === "friends"
                  ? "No friends found. Add friends to see the friends leaderboard!"
                  : "No users found in the leaderboard."}
              </p>
            )}

            {users.length > 0 && users.length <= 3 && (
          <p className="leaderboard-empty-list">
            Only top {users.length} {users.length === 1 ? "user" : "users"} in the leaderboard.
          </p>
          )}
          </>
        )}

        {leaderboardType === "friends" && !hasNoFriends && (
          <button
            className="leaderboard-friends-button"
            onClick={() => navigate("/profile/friends")}
          >
            Add Friend
          </button>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
