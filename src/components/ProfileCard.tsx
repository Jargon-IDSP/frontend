import ProfileStatsCard from "./ProfileStatsCard";
import type { ProfileCardProps } from "../types/profile";
import { AvatarDisplay } from "./avatar";
import rockyWhiteLogo from "/rockyWhite.svg";

export default function ProfileCard({
  displayName,
  industryName,
  followerCount,
  followingCount,
  lessonCount,
  avatar,
}: ProfileCardProps) {
  return (
    <div className="friend-profile-card">
      <div className="friend-profile-avatar">
        {avatar ? (
          <AvatarDisplay
            config={avatar}
            size={120}
            className="friend-profile-avatar-display"
          />
        ) : (
          <img src={rockyWhiteLogo} alt="User Avatar" />
        )}
      </div>
      <h2 className="friend-profile-name">{displayName}</h2>
      <p className="friend-profile-industry">{industryName}</p>

      <ProfileStatsCard
        stats={[
          { value: followerCount, label: "Followers" },
          { value: followingCount, label: "Followings" },
          { value: lessonCount, label: "Lessons" },
        ]}
      />
    </div>
  );
}
