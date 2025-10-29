import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useDocument } from "../../hooks/useDocument";
import { useDocumentQuizzes } from "../../hooks/useDocumentQuizzes";
import { useSharedQuizzes } from "../../hooks/useSharedQuizzes";
import { useDeleteDocument } from "../../hooks/useDeleteDocument";
import { NavigationCard } from "../../components/learning/ui/Card";
import Button from "../../components/learning/ui/Button";
import QuizShareModal from "../../components/learning/QuizShareModal";

export default function DocumentStudy() {
  const navigate = useNavigate();
  const { documentId } = useParams<{ documentId: string }>();
  const { userId } = useAuth();
  const [shareModalQuiz, setShareModalQuiz] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Fetch document for ownership check
  const { data: documentData, isLoading: checkingOwnership } =
    useDocument(documentId);

  // Fetch shared quizzes (only if user doesn't own the document)
  const { data: sharedQuizzes } = useSharedQuizzes(
    !!documentData && documentData.document.userId !== userId
  );

  // Fetch quizzes (only if user is owner)
  const { data: quizzes = [], isLoading: loadingQuizzes } = useDocumentQuizzes(
    documentId,
    isOwner
  );

  // Delete document mutation
  const deleteMutation = useDeleteDocument();

  // Check ownership and redirect if needed
  useEffect(() => {
    if (!documentData || !userId) return;

    if (documentData.document.userId !== userId) {
      // User does NOT own this document - check if they have shared access
      const hasSharedAccess = sharedQuizzes?.some(
        (quiz) => quiz.documentId === documentId
      );

      if (hasSharedAccess) {
        navigate("/learning/shared", { replace: true });
      } else {
        navigate("/learning/custom", { replace: true });
      }
    } else {
      // User owns the document
      setIsOwner(true);
    }
  }, [documentData, sharedQuizzes, userId, documentId, navigate]);

  // Simulate progress while loading ownership check
  useEffect(() => {
    if (checkingOwnership) {
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
  }, [checkingOwnership]);

  // Simulate progress while loading quizzes
  useEffect(() => {
    if (loadingQuizzes && isOwner) {
      setLoadingProgress(0);
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 90) return prev; // Stop at 90% until data arrives
          return prev + 15; // Faster increments for quick API call
        });
      }, 150);

      return () => clearInterval(interval);
    } else if (!loadingQuizzes && isOwner) {
      // When loading completes, finish the progress
      setLoadingProgress(100);
      // Reset after animation
      const timeout = setTimeout(() => setLoadingProgress(0), 500);
      return () => clearTimeout(timeout);
    }
  }, [loadingQuizzes, isOwner]);

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this document? This will also delete all associated flashcards and quizzes."
      )
    ) {
      return;
    }

    if (documentId) {
      deleteMutation.mutate(documentId, {
        onSuccess: () => navigate("/learning/custom"),
      });
    }
  };

  const document = documentData?.document;
  const loading = loadingQuizzes;

  // Show loading while checking ownership
  if (checkingOwnership) {
    return (
      <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
        <h1>Document Study</h1>
        {/* Progress Bar */}
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
            Loading document... {loadingProgress}%
          </div>
        </div>
      </div>
    );
  }

  // Don't render anything if not owner (will redirect)
  if (!isOwner) {
    return null;
  }

  // Show loading while fetching document data
  if (loading) {
    return (
      <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
        <h1>Study: {document?.filename || "Document"}</h1>
        {/* Progress Bar */}
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
            Loading study options... {loadingProgress}%
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <Button
        onClick={() => navigate("/learning/custom")}
        variant="secondary"
        style={{ marginBottom: "1rem" }}
      >
        ← Back to Custom Learning
      </Button>

      <h1>Study: {document?.filename || "Document"}</h1>

      <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
        Choose how you want to study this document:
      </p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <NavigationCard
          icon="📚"
          title="Study Flashcards"
          description="Review terms and definitions"
          onClick={() => navigate(`/learning/documents/${documentId}/terms`)}
        />

        <NavigationCard
          icon="🎯"
          title="Take Quiz"
          description="Test your knowledge"
          onClick={() => navigate(`/learning/documents/${documentId}/quizzes`)}
        />

        <NavigationCard
          icon="🌐"
          title="View Translation"
          description="See document in other languages"
          onClick={() => navigate(`/documents/${documentId}/translation`)}
        />

        {isOwner && quizzes.length > 0 && (
          <Button
            onClick={() =>
              setShareModalQuiz({ id: quizzes[0].id, name: quizzes[0].name })
            }
            variant="success"
            fullWidth
          >
            🤝 Share Quiz with Friends
          </Button>
        )}
      </div>

      {shareModalQuiz && (
        <QuizShareModal
          quizId={shareModalQuiz.id}
          quizName={shareModalQuiz.name}
          onClose={() => setShareModalQuiz(null)}
          onShared={() => setShareModalQuiz(null)}
        />
      )}

      {isOwner && (
        <div
          style={{
            marginTop: "3rem",
            paddingTop: "2rem",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <Button
            onClick={handleDelete}
            variant="danger"
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "🗑️ Deleting..." : "🗑️ Delete Document"}
          </Button>
        </div>
      )}
    </div>
  );
}
