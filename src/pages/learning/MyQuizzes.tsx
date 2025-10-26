import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../../lib/api";
import QuizShareModal from "../../components/learning/QuizShareModal";

interface CustomQuiz {
  id: string;
  name: string;
  category: string | null;
  createdAt: string;
  _count: {
    questions: number;
    sharedWith: number;
  };
  sharedWith: Array<{
    id: string;
    sharedAt: string;
    sharedWith: {
      id: string;
      username: string | null;
      firstName: string | null;
      lastName: string | null;
    };
  }>;
}

export default function MyQuizzesPage() {
  const [quizzes, setQuizzes] = useState<CustomQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareModalQuiz, setShareModalQuiz] = useState<{ id: string; name: string } | null>(null);
  const { getToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/quiz-shares/my-shared-quizzes`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setQuizzes(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching quizzes:", err);
    } finally {
      setLoading(false);
    }
  };

  const getUserDisplayName = (user: CustomQuiz["sharedWith"][0]["sharedWith"]) => {
    if (user.username) return user.username;
    if (user.firstName || user.lastName) {
      return `${user.firstName || ""} ${user.lastName || ""}`.trim();
    }
    return "Unknown User";
  };

  const handleTakeQuiz = (quizId: string) => {
    navigate(`/learning/custom/quiz/take?quizId=${quizId}`);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <button onClick={() => navigate("/learning/custom")} style={{ marginBottom: "1rem" }}>
        ← Back to Custom Learning
      </button>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ margin: 0 }}>My Custom Quizzes</h1>
        <button
          onClick={() => navigate("/learning/shared")}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          View Shared Quizzes
        </button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : quizzes.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#6b7280" }}>
          <p style={{ fontSize: "1.125rem", marginBottom: "0.5rem" }}>
            You haven't created any custom quizzes yet
          </p>
          <p>Upload documents and create quizzes to get started!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "1.5rem" }}>
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
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
                  {quiz.name}
                </h3>
                {quiz.category && (
                  <p style={{ margin: "0", fontSize: "0.875rem", color: "#6b7280" }}>
                    Category: {quiz.category}
                  </p>
                )}
                <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.875rem", color: "#6b7280" }}>
                  {quiz._count.questions} question{quiz._count.questions !== 1 ? "s" : ""}
                </p>
              </div>

              {quiz._count.sharedWith > 0 && (
                <div
                  style={{
                    backgroundColor: "#f0f9ff",
                    padding: "0.75rem",
                    borderRadius: "6px",
                    marginBottom: "1rem",
                  }}
                >
                  <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.875rem", fontWeight: "600", color: "#0369a1" }}>
                    Shared with {quiz._count.sharedWith} friend{quiz._count.sharedWith !== 1 ? "s" : ""}:
                  </p>
                  <div style={{ fontSize: "0.75rem", color: "#0c4a6e" }}>
                    {quiz.sharedWith.slice(0, 3).map((share) => (
                      <div key={share.id}>
                        • {getUserDisplayName(share.sharedWith)}
                      </div>
                    ))}
                    {quiz._count.sharedWith > 3 && (
                      <div style={{ fontStyle: "italic" }}>
                        ...and {quiz._count.sharedWith - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => handleTakeQuiz(quiz.id)}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Take Quiz
                </button>
                <button
                  onClick={() => setShareModalQuiz({ id: quiz.id, name: quiz.name })}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    backgroundColor: "#10b981",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Share
                </button>
              </div>

              <p style={{ margin: "0.75rem 0 0 0", fontSize: "0.75rem", color: "#9ca3af", textAlign: "center" }}>
                Created {new Date(quiz.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {shareModalQuiz && (
        <QuizShareModal
          quizId={shareModalQuiz.id}
          quizName={shareModalQuiz.name}
          onClose={() => setShareModalQuiz(null)}
          onShared={() => {
            fetchQuizzes(); // Refresh to show updated share count
          }}
        />
      )}
    </div>
  );
}
