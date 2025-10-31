import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSharedQuizzes } from "../../hooks/useSharedQuizzes";
import Button from "../../components/learning/ui/Button";
import Card from "../../components/learning/ui/Card";
import { getUserDisplayName } from "../../types/friend";
import type { SharedQuiz } from "../../types/learning";

export default function SharedQuizzesPage() {
  const navigate = useNavigate();
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Use shared quizzes hook
  const { data: sharedQuizzes = [], isLoading: loading } = useSharedQuizzes();

  // Simulate progress while loading
  useEffect(() => {
    if (loading) {
      setLoadingProgress(0);
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 90) return prev; // Stop at 90% until data arrives
          return prev + 15; // Faster increments for quick API call
        });
      }, 150);

      return () => clearInterval(interval);
    } else {
      // When loading completes, finish the progress
      setLoadingProgress(100);
      // Reset after animation
      const timeout = setTimeout(() => setLoadingProgress(0), 500);
      return () => clearTimeout(timeout);
    }
  }, [loading]);

  const handleTakeQuiz = (quiz: SharedQuiz["customQuiz"]) => {
    // Check if quiz has a documentId to determine the correct route
    if ("documentId" in quiz && quiz.documentId) {
      navigate(`/learning/documents/${quiz.documentId}/study`);
    } else {
      // For general custom quizzes, go to the custom quiz page
      navigate(`/learning/custom/quiz/take?quizId=${quiz.id}&skipHistory=true`);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <Button
        onClick={() => navigate("/learning")}
        variant="secondary"
        style={{ marginBottom: "1rem" }}
      >
        ← Back to Learning
      </Button>

      <h1 style={{ marginBottom: "2rem" }}>Quizzes Shared With Me</h1>

      {loading ? (
        <div style={{ marginTop: "2rem" }}>
          <div
            style={{
              width: "100%",
              height: "8px",
              backgroundColor: "#e5e7eb",
              borderRadius: "9999px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${loadingProgress}%`,
                backgroundColor: "#fe4d13",
                transition: "width 0.3s ease-in-out",
                borderRadius: "9999px",
              }}
            />
          </div>
          <div
            style={{
              marginTop: "0.5rem",
              textAlign: "center",
              fontSize: "0.875rem",
              color: "#666",
            }}
          >
            Loading shared quizzes... {loadingProgress}%
          </div>
        </div>
      ) : sharedQuizzes.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#6b7280" }}>
          <p style={{ fontSize: "1.125rem", marginBottom: "0.5rem" }}>
            No quizzes have been shared with you yet
          </p>
          <p>Ask your friends to share their custom quizzes with you!</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {sharedQuizzes.map((share) => (
            <Card key={share.id} hoverable={false}>
              <div style={{ marginBottom: "1rem" }}>
                <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.25rem" }}>
                  {share.customQuiz.name}
                </h3>
                <p
                  style={{
                    margin: "0",
                    fontSize: "0.875rem",
                    color: "#6b7280",
                  }}
                >
                  Shared by:{" "}
                  <strong>{getUserDisplayName(share.customQuiz.user)}</strong>
                </p>
                {share.customQuiz.category && (
                  <p
                    style={{
                      margin: "0.25rem 0 0 0",
                      fontSize: "0.875rem",
                      color: "#6b7280",
                    }}
                  >
                    Category: {share.customQuiz.category}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <p
                  style={{
                    margin: "0",
                    fontSize: "0.875rem",
                    color: "#6b7280",
                  }}
                >
                  {share.customQuiz._count.questions} question
                  {share.customQuiz._count.questions !== 1 ? "s" : ""}
                </p>
                <p
                  style={{
                    margin: "0.25rem 0 0 0",
                    fontSize: "0.875rem",
                    color: "#9ca3af",
                  }}
                >
                  Shared {new Date(share.sharedAt).toLocaleDateString()}
                </p>
              </div>

              <Button
                onClick={() => handleTakeQuiz(share.customQuiz)}
                variant="primary"
                fullWidth
              >
                View Quiz
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
