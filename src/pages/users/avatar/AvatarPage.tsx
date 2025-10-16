import { useNavigate } from "react-router-dom";
import HappyRocky from "../../../components/avatar/HappyRocky";

export default function AvatarPage() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "2rem" }}>
      <button 
        onClick={() => navigate("/profile")}
        style={{ marginBottom: "1rem" }}
      >
        ← Back to Profile
      </button>
      <h1>Your Avatar</h1>
      <HappyRocky />
    </div>
  );
}