import { useNavigate } from "react-router-dom";
import goBackIcon from "../../../assets/icons/goBackIcon.svg";
import { AvatarCustomizer } from "../../../components/avatar/AvatarCustomizer";

export default function AvatarPage() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="avatarPage">
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <img src={goBackIcon} alt="Back Button" />
        </button>
        <AvatarCustomizer />
      </div>
    </div>
  );
}