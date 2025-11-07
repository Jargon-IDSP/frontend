import { useAuth } from "@clerk/clerk-react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { BACKEND_URL } from "../../lib/api";
import goBackIcon from "../../assets/icons/goBackIcon.svg";
import "../../styles/pages/_friendProfile.scss";

interface LessonDetails {
  id: string;
  name: string;
  category: string | null;
  pointsPerQuestion: number;
  createdAt: string;
  updatedAt: string;
  documentId: string | null;
  document?: {
    id: string;
    filename: string;
  };
  _count?: {
    questions: number;
  };
}

export default function LessonDetailsPage() {
  const { friendId, lessonId } = useParams<{ friendId: string; lessonId: string }>();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  // Fetch lesson details
  const { data: lessonDetails, isLoading, error } = useQuery({
    queryKey: ["lessonDetails", friendId, lessonId],
    queryFn: async (): Promise<LessonDetails> => {
      const token = await getToken();
      
      // Fetch lesson details from the new endpoint
      const res = await fetch(
        `${BACKEND_URL}/learning/custom/users/${friendId}/lessons/${lessonId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Failed to fetch lesson details"
        );
      }

      const data = await res.json();
      
      if (data.success && data.data) {
        return data.data;
      }

      throw new Error("Invalid lesson data");
    },
    enabled: !!friendId && !!lessonId,
  });

  const handleBackClick = () => {
    navigate(`/profile/friends/${friendId}`);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  if (isLoading) {
    return (
      <div className="lesson-details-page">
        <div className="lesson-details-loading">Loading lesson details...</div>
      </div>
    );
  }

  if (error || !lessonDetails) {
    return (
      <div className="lesson-details-page">
        <div className="lesson-details-header">
          <button
            className="lesson-details-back-button"
            onClick={handleBackClick}
          >
            <img src={goBackIcon} alt="Back" />
          </button>
        </div>
        <div className="lesson-details-error">
          {error instanceof Error
            ? error.message
            : "Failed to load lesson details. Please try again."}
        </div>
      </div>
    );
  }

  return (
    <div className="lesson-details-page">
      {/* Header */}
      <div className="lesson-details-header">
        <button
          className="lesson-details-back-button"
          onClick={handleBackClick}
        >
          <img src={goBackIcon} alt="Back" />
        </button>
        <h1 className="lesson-details-title">{lessonDetails.name}</h1>
      </div>

      {/* Lesson Details */}
      <div className="lesson-details-container">
        {/* Title */}
        <div className="lesson-details-field">
          <p>Title:</p>
          <div className="lesson-details-textbox">
            {lessonDetails.name}
          </div>
        </div>
        
        {/* Topic */}
        <div className="lesson-details-field">
          <p>Topic:</p>
          <div className="lesson-details-textbox">
            {lessonDetails.category || "Not specified"}
          </div>
        </div>

        {/* Questions */}
        {lessonDetails._count && (
          <div className="lesson-details-field">
            <p>Questions:</p>
            <div className="lesson-details-textbox">
              {lessonDetails._count.questions}
            </div>
          </div>
        )}

        {/* Points per Question */}
        <div className="lesson-details-field">
          <p>Points per Question:</p>
          <div className="lesson-details-textbox">
            {lessonDetails.pointsPerQuestion}
          </div>
        </div>

        {/* Created */}
        <div className="lesson-details-field">
          <p>Created:</p>
          <div className="lesson-details-textbox">
            {formatDate(lessonDetails.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
}

