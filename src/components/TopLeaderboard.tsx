import React from "react";
import { useNavigate } from "react-router-dom";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { getUserDisplayName } from "../utils/userHelpers";
import rockyYellowLogo from "/rockyYellow.svg";

const TopLeaderboard: React.FC = () => {
  const navigate = useNavigate();

  // Use shared leaderboard hook
  const { data: users = [], isLoading, error, refetch } = useLeaderboard();

  // Get only top 3 users
  const topUsers = users.slice(0, 3);

  if (isLoading) {
    return (
      <div className="top-leaderboard">
        <h2 className="leaderboard-title">Leaderboard</h2>
        <div className="leaderboard-content">
          <p>Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="top-leaderboard">
        <h2 className="leaderboard-title">Leaderboard</h2>
        <div className="leaderboard-content">
          <p className="error-text">
            {error instanceof Error
              ? error.message
              : "Unable to load leaderboard"}
          </p>
          <button className="btn btn-primary" onClick={() => refetch()}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="top-leaderboard">
      <h2 className="leaderboard-title">Leaderboard</h2>
      <div className="leaderboard-content">
        {topUsers.length > 0 ? (
          <div className="podium-container">
            {topUsers.map((user, index) => (
              <div
                key={user.id}
                className={`podium-item rank-${index + 1} clickable-card`}
                onClick={() => navigate("/leaderboard")}
              >
                <div className="rocky-avatar">
                  <img
                    src={rockyYellowLogo}
                    alt="Rocky"
                    className={`rocky-logo rank-${index + 1}`}
                  />
                </div>
                <div className="user-name">{getUserDisplayName(user)}</div>
                <div className="podium-block">
                  <div className="rank-label">
                    {index === 0 ? "1st" : index === 1 ? "2nd" : "3rd"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No users found</p>
        )}
      </div>
    </div>
  );
};

export default TopLeaderboard;
