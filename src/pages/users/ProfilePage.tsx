import { UserButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../hooks/useProfile";
import rockyWhiteLogo from '/rockyWhite.svg';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { data, error: queryError, isLoading } = useProfile();

  const error = queryError ? (queryError as Error).message : null;

  return (
    <div className="container">
      <div className="header">
        <div className="rocky-logo-section">
        <img src={rockyWhiteLogo} alt="Rocky" className="rocky-logo" />
        <UserButton 
          appearance={{
            elements: {
              userButtonAvatarBox: 'user-button-avatar-box',
              userButtonTrigger: 'user-button-trigger',
              userButtonAvatarImage: 'user-button-avatar-image'
            }
          }}
        />
      </div>
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
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
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
            <button
              className="btn btn-primary"
              onClick={() => navigate("/onboarding/language")}
            >
              Update Preferences
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
