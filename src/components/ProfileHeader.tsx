import { useNavigate } from "react-router-dom";
import goBackIcon from "../assets/icons/goBackIcon.svg";
import NotificationBell from "./NotificationBell";
import type { ProfileHeaderProps } from "../types/profile";

export default function ProfileHeader({
  from,
}: ProfileHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="friend-profile-header">
      <button
        className="friend-profile-back-button"
        onClick={() => {
          if (from) {
            navigate(from);
          } else {
            navigate("/leaderboard/full");
          }
        }}
      >
        <img src={goBackIcon} alt="Back" />
      </button>

      <div className="friend-profile-header-actions">
        <NotificationBell />
      </div>
    </div>
  );
}
