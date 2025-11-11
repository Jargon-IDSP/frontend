import type { ProfileOverviewProps } from "../types/profile";

export default function ProfileOverview({
  badgeCount,
  joinedDate,
  badges,
}: ProfileOverviewProps) {
  return (
    <div className="friend-profile-section">
      <h3 className="friend-profile-section-title">Overview</h3>
      <div className="friend-profile-overview">
        <div className="friend-profile-overview-item">
          <p className="friend-profile-overview-label">Badges: {badgeCount}</p>
        </div>
        <div className="friend-profile-overview-item">
          <p className="friend-profile-overview-label">Joined: {joinedDate}</p>
        </div>
      </div>

      {/* Badges Display */}
      <div className="friend-profile-badges-section">
        <h4 className="friend-profile-badges-subtitle">Badge Collection</h4>
        <div className="friend-profile-badges-grid">
          {badges.length > 0 ? (
            badges.map((badge) => (
              <div key={badge.id} className="friend-profile-badge-item" title={badge.name}>
                <img
                  src={badge.url}
                  alt={badge.name}
                  className="friend-profile-badge-icon"
                />
              </div>
            ))
          ) : (
            <p className="friend-profile-no-badges">No badges earned yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
