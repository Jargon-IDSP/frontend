import { useNavigate } from "react-router-dom";
import { useSmartNavigation } from "../hooks/useSmartNavigation";
import goBackIcon from "../assets/icons/goBackIcon.svg";
import NotificationBell from "./NotificationBell";

export default function ProfileHeader() {
  const navigate = useNavigate();
  const { navigateBack } = useSmartNavigation();

  return (
    <div className="friend-profile-header">
      <button
        className="friend-profile-back-button"
        onClick={() => navigateBack("/leaderboard/full")}
      >
        <img src={goBackIcon} alt="Back" />
      </button>

      <div className="friend-profile-header-actions">
        <NotificationBell />
      </div>
    </div>
  );
}
