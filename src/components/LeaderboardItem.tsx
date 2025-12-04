import React from "react";
import { useSmartNavigation } from "../hooks/useSmartNavigation";
import { getUserDisplayName, getLanguageCode } from "../utils/userHelpers";
import { getLanguageFlag } from "../utils/languageFlagHelpers";
import type { LeaderboardItemProps } from "../types/leaderboardItem";
import { AvatarDisplay } from "./avatar";
import rockyLogo from "/rocky.svg";

const LeaderboardItem: React.FC<LeaderboardItemProps> = ({
  user,
  rank,
  isCurrentUser,
  isClickable = false,
  onAvatarLoadingChange,
}) => {
  const { navigateWithOrigin } = useSmartNavigation();
  const languageFlag = getLanguageFlag(user.language);

  const handleClick = () => {
    if (isClickable) {
      navigateWithOrigin(`/profile/friends/${user.id}`);
    }
  };

  return (
    <div
      className={`leaderboard-item leaderboard-item--regular ${
        isCurrentUser ? "leaderboard-item--current-user" : ""
      } ${isClickable ? "leaderboard-item--clickable" : ""}`}
      onClick={handleClick}
    >
      <div className="leaderboard-item-content leaderboard-item-content--regular">
        <span className="leaderboard-item-rank">{rank}</span>
        {user.avatar ? (
          <AvatarDisplay
            config={user.avatar}
            size={48}
            className="leaderboard-item-avatar"
            onLoadingChange={onAvatarLoadingChange}
          />
        ) : (
          <img
            src={rockyLogo}
            alt="Rocky"
            className="leaderboard-item-logo leaderboard-item-logo--regular"
          />
        )}
        <div className="leaderboard-item-text">
          <span className="leaderboard-item-name">
            {getUserDisplayName(user)}
          </span>
          {isCurrentUser && (
            <span className="leaderboard-item-you">(You)</span>
          )}
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
};

export default LeaderboardItem;
