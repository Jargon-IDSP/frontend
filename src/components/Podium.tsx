import React from "react";
import { useNavigate } from "react-router-dom";
import type { PodiumProps } from "../types/podium";
import { getUserDisplayName, getLanguageCode } from "../utils/userHelpers";
import { getLanguageFlag } from "../utils/languageFlagHelpers";
import { AvatarDisplay } from "./avatar";
import rockyLogo from "/rocky.svg";

const Podium: React.FC<PodiumProps> = ({ users, currentUserId, fromRoute = "/leaderboard/full", onAvatarLoadingChange }) => {
  const navigate = useNavigate();
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
        const languageFlag = user ? getLanguageFlag(user.language) : undefined;
        const languageCode = user ? getLanguageCode(user.language) : undefined;

        if (!user) {
          return (
            <div key={`empty-${rank}`} className={`podium-item rank-${rank}`}>
              <div className="podium-block">
                <div className="rank-label">{rank}</div>
              </div>
            </div>
          );
        }

        return (
          <div
            key={user.id}
            className={`podium-item rank-${rank} podium-item--clickable`}
            onClick={() => navigate(`/profile/friends/${user.id}`, { state: { from: fromRoute } })}
          >
            <div className="rocky-avatar">
              {user.avatar ? (
                <AvatarDisplay
                  config={user.avatar}
                  size={60}
                  className={`podium-avatar rank-${rank}`}
                  onLoadingChange={(isLoading) => {
                    // Pass user ID to distinguish between podium avatars
                    if (onAvatarLoadingChange) {
                      onAvatarLoadingChange(user.id, isLoading);
                    }
                  }}
                />
              ) : (
                <img
                  src={rockyLogo}
                  alt="Rocky"
                  className={`rocky-logo rank-${rank}`}
                />
              )}
              {languageFlag && (
                <span
                  className={`podium-flag podium-flag--rank-${rank}`}
                  title={languageCode}
                >
                  <img
                    src={languageFlag.src}
                    alt={languageFlag.alt}
                    className="podium-flag-icon"
                  />
                </span>
              )}
            </div>
            <div className="user-name">
              {getUserDisplayName(user)}
              {isCurrentUser && <span className="podium-you"> (You)</span>}
            </div>
            <div className="user-score">{user.score.toLocaleString()} pts</div>
            <div className="podium-block">
              <div className="rank-label">{rank}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Podium;

