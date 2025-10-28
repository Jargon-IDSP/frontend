import React from "react";
// import { useNavigate } from "react-router-dom";
import rockyLogo from "/rocky.svg";
import { useLeaderboard } from "../hooks/useLeaderboard";
import { getUserDisplayName, getLanguageCode } from "../utils/userHelpers";

const LeaderboardPage: React.FC = () => {
  // const navigate = useNavigate();
  const {
    data: users = [],
    isLoading: loading,
    error,
    refetch,
  } = useLeaderboard();

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>🏆 Leaderboard</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>🏆 Leaderboard</h1>
        <p style={{ color: "red" }}>
          Error:{" "}
          {error instanceof Error
            ? error.message
            : "Failed to fetch leaderboard"}
        </p>
        <button onClick={() => refetch()} style={{ padding: "0.5rem 1rem" }}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      {/* <button onClick={() => navigate("/")} style={{ marginBottom: "1rem" }}>
        ← Back to Dashboard
      </button> */}
      <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>
        🏆 Leaderboard
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {users.map((user, index) => (
          <div
            key={user.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem",
              backgroundColor: index < 3 ? "#f0f8ff" : "#f9f9f9",
              border: index < 3 ? "2px solid #007bff" : "1px solid #ddd",
              borderRadius: "8px",
              fontSize: "1.1rem",
            }}
          >
            <span
              style={{
                fontWeight: "bold",
                color: index < 3 ? "#007bff" : "#333",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              #{index + 1}
              <img
                src={rockyLogo}
                alt="Rocky"
                style={{
                  width: "24px",
                  height: "24px",
                  filter: index < 3 ? "none" : "grayscale(0.3)",
                }}
              />
              {getUserDisplayName(user)}
            </span>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <span style={{ fontWeight: "bold", color: "#28a745" }}>
                {user.score.toLocaleString()}
              </span>
              <span
                style={{
                  fontWeight: "bold",
                  color: "#6c757d",
                  fontSize: "0.9rem",
                  backgroundColor: "#f8f9fa",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "4px",
                  border: "1px solid #dee2e6",
                }}
              >
                {getLanguageCode(user.language)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <p style={{ textAlign: "center", color: "#666", marginTop: "2rem" }}>
          No users found in the leaderboard.
        </p>
      )}
    </div>
  );
};

export default LeaderboardPage;
