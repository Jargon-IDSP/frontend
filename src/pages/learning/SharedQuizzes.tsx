import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../../lib/api";
import type { SharedQuiz } from "../../types/learning";

export default function SharedQuizzesPage() {
  const [sharedQuizzes, setSharedQuizzes] = useState<SharedQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchSharedQuizzes();
  }, []);

  const fetchSharedQuizzes = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/quiz-shares/shared-with-me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setSharedQuizzes(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching shared quizzes:", err);
    } finally {
      setLoading(false);
    }
  };

  const getUserDisplayName = (user: SharedQuiz["customQuiz"]["user"]) => {
    if (user.username) return user.username;
    if (user.firstName || user.lastName) {
      return `${user.firstName || ""} ${user.lastName || ""}`.trim();
    }
    return "Unknown User";
  };

  const handleTakeQuiz = (quizId: string) => {
    navigate(`/learning/custom/quiz/take?quizId=${quizId}&skipHistory=true`);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <button onClick={() => navigate("/learning")} style={{ marginBottom: "1rem" }}>
        ← Back to Learning
      </button>

      <h1 style={{ marginBottom: "2rem" }}>Quizzes Shared With Me</h1>

      {loading ? (
        <p>Loading...</p>
      ) : sharedQuizzes.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#6b7280" }}>
          <p style={{ fontSize: "1.125rem", marginBottom: "0.5rem" }}>
            No quizzes have been shared with you yet
          </p>
          <p>Ask your friends to share their custom quizzes with you!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
          {sharedQuizzes.map((share) => (
            <div
              key={share.id}
              style={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "1.5rem",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ marginBottom: "1rem" }}>
                <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.25rem" }}>
                  {share.customQuiz.name}
                </h3>
                <p style={{ margin: "0", fontSize: "0.875rem", color: "#6b7280" }}>
                  Shared by: <strong>{getUserDisplayName(share.customQuiz.user)}</strong>
                </p>
                {share.customQuiz.category && (
                  <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.875rem", color: "#6b7280" }}>
                    Category: {share.customQuiz.category}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <p style={{ margin: "0", fontSize: "0.875rem", color: "#6b7280" }}>
                  {share.customQuiz._count.questions} question{share.customQuiz._count.questions !== 1 ? "s" : ""}
                </p>
                <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.875rem", color: "#9ca3af" }}>
                  Shared {new Date(share.sharedAt).toLocaleDateString()}
                </p>
              </div>

              <button
                onClick={() => handleTakeQuiz(share.customQuiz.id)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  backgroundColor: "#3b82f6",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "1rem",
                }}
              >
                Take Quiz
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
