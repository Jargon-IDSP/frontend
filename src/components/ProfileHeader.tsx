import { useNavigate } from "react-router-dom";
import goBackIcon from "../assets/icons/goBackIcon.svg";
import type { ProfileHeaderProps } from "../types/profile";

export default function ProfileHeader({
  from,
  isOwnProfile,
  isFriend,
  isFollowing,
  onFriendshipAction,
  isSendRequestPending,
  isRemoveFriendPending,
}: ProfileHeaderProps) {
  const navigate = useNavigate();

  // Show unfollow/remove button if following (one-way) or friends (mutual)
  const showUnfollowButton = isFriend || isFollowing;

  return (
    <div className="friend-profile-header">
      <button
        className="friend-profile-back-button"
        onClick={() => {
          if (from) {
            navigate(from);
          } else {
            navigate("/leaderboard");
          }
        }}
      >
        <img src={goBackIcon} alt="Back" />
      </button>
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
    </div>
  );
}
