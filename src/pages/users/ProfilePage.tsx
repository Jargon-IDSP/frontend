import { UserButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../hooks/useProfile";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { data, error: queryError, isLoading } = useProfile();

  const error = queryError ? (queryError as Error).message : null;

  return (
    <div className="container">
      <div className="profile-header">
        <button className="back-button" onClick={() => navigate("/")}>
          ← Back to Dashboard
        </button>
        <UserButton />
      </div>

      <h1 className="profile-title">Profile Page</h1>

      {isLoading && (
        <div style={{ padding: "2rem", textAlign: "center", color: "#666" }}>
          Loading profile...
        </div>
      )}

      {error && <div className="error-message">Error: {error}</div>}

      {data && (
        <div className="profile-content">
          <div className="profile-data">
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/profile/avatar")}
            >
              View Avatar
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/profile/friends")}
            >
              Friends
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
