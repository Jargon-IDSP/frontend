import badgeIcon from "../assets/icons/badge.svg";
import calendarIcon from "../assets/icons/calendarIcon.svg";
import medalIcon from "../assets/icons/medalIcon.svg";
import type { ProfileOverviewProps } from "../types/profile";

export default function ProfileOverview({
  badgeCount,
  joinedDate,
}: ProfileOverviewProps) {
  return (
    <div className="friend-profile-section">
      <h3 className="friend-profile-section-title">Overview</h3>
      <div className="friend-profile-overview">
        <div className="friend-profile-overview-item-1">
          <img
            src={badgeIcon}
            alt="Badges"
            className="friend-profile-overview-icon"
          />
          <p className="friend-profile-overview-label">Badges:</p>
          <p className="friend-profile-overview-value">{badgeCount}</p>
        </div>
        <div className="friend-profile-overview-item-2">
          <img
            src={calendarIcon}
            alt="Joined"
            className="friend-profile-overview-icon"
          />
          <p className="friend-profile-overview-label">Joined:</p>
          <p className="friend-profile-overview-value">{joinedDate}</p>
        </div>
        <div className="friend-profile-overview-item-3">
          <img
            src={medalIcon}
            alt="Medals"
            className="friend-profile-overview-icon"
          />
          <p className="friend-profile-overview-label">Medals:</p>
          <p className="friend-profile-overview-value">0</p>
        </div>
      </div>
    </div>
  );
}
