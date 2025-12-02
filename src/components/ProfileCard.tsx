import { useNavigate } from "react-router-dom";
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
  isOwnProfile,
  isFriend,
  isFollowing,
  onFriendshipAction,
  isSendRequestPending,
  isRemoveFriendPending,
  onAvatarLoadingChange,
}: ProfileCardProps) {
  const navigate = useNavigate();
  const showUnfollowButton = isFriend || isFollowing;

  return (
    <div className="friend-profile-card">
       {isOwnProfile ? (
          <button
            className="friend-profile-friendship-button friend-profile-friendship-button--own"
            onClick={() => navigate('/profile')}
          >
            Your Profile
          </button>
        ) : (
          <button
            className={`friend-profile-friendship-button ${
              showUnfollowButton
                ? "friend-profile-friendship-button--remove"
                : "friend-profile-friendship-button--add"
            }`}
            onClick={onFriendshipAction}
            disabled={isSendRequestPending || isRemoveFriendPending}
          >
            {showUnfollowButton
              ? (isRemoveFriendPending ? "..." : "Unfollow")
              : (isSendRequestPending ? "..." : "Follow")
            }
          </button>
        )}
      <div className="friend-profile-avatar">
        {avatar ? (
          <AvatarDisplay
            config={avatar}
            size={120}
            className="friend-profile-avatar-display"
            onLoadingChange={onAvatarLoadingChange}
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
