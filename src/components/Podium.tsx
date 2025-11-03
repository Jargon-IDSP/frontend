import React from "react";
import type { PodiumProps } from "../types/podium";
import rockyYellowLogo from "/rockyYellow.svg";
import { getUserDisplayName } from "../utils/userHelpers";

const Podium: React.FC<PodiumProps> = ({ users, currentUserId }) => {
  const topThree = users.slice(0, 3);

  const podiumUsers = [
    topThree[0] || null,
    topThree[1] || null,
    topThree[2] || null,
  ];

  return (
    <div className="podium-container">
      {podiumUsers.map((user, index) => {
        const rank = index + 1;
        const isCurrentUser = user?.id === currentUserId;

        if (!user) {
          return (
            <div key={`empty-${rank}`} className={`podium-item rank-${rank}`}>
              <div className="podium-block">
                <div className="rank-label">#{rank}</div>
              </div>
            </div>
          );
        }

        return (
          <div key={user.id} className={`podium-item rank-${rank}`}>
            <div className="rocky-avatar">
              <img
                src={rockyYellowLogo}
                alt="Rocky"
                className={`rocky-logo rank-${rank}`}
              />
            </div>
            <div className="user-name">
              {getUserDisplayName(user)}
              {isCurrentUser && <span className="podium-you"> (You)</span>}
            </div>
            <div className="user-score">{user.score.toLocaleString()}</div>
            <div className="podium-block">
              <div className="rank-label">#{rank}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Podium;

