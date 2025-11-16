import { useNavigate } from "react-router-dom";
import goBackIcon from "../../../assets/icons/goBackIcon.svg";
import FullAvatar from "../../../components/avatar/fullAvatar";

export default function AvatarPage() {
  const navigate = useNavigate();

  return (
    <div className="container">
    <div className="avatarPage">
      <button 
        onClick={() => navigate(-1)}
        aria-label="Back"
      >
        <img src={goBackIcon} alt="Back Button" />    
      </button>
      <h1>Your Avatar</h1>
      <FullAvatar />
      </div>
    </div>
  );
}