import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "../../lib/api";
import { useProfile } from "../../hooks/useProfile";
import goBackIcon from "../../assets/icons/goBackIcon.svg";
import "../../styles/pages/_editLesson.scss";

const EditLessonPage: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const { data: profile } = useProfile();
  const [newName, setNewName] = useState(location.state?.lessonName || "");
  const [error, setError] = useState("");

  // Fetch lesson details to get current name and documentId
  const { data: lessonData, isLoading } = useQuery({
    queryKey: ["lessonDetails", lessonId, profile?.id],
    queryFn: async () => {
      if (!profile?.id) throw new Error("User not loaded");
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/learning/custom/users/${profile.id}/lessons/${lessonId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch lesson details");
      }

      const data = await res.json();
      return data.data;
    },
    enabled: !!lessonId && !!profile?.id,
  });

  // Update newName when lessonData is loaded
  useEffect(() => {
    if (lessonData?.name) {
      setNewName(lessonData.name);
    }
  }, [lessonData]);

  const updateNameMutation = useMutation({
    mutationFn: async (name: string) => {
      if (!lessonData?.documentId) throw new Error("No document ID");
      if (!name.trim()) throw new Error("Name cannot be empty");

      const token = await getToken();
      const response = await fetch(`${BACKEND_URL}/documents/${lessonData.documentId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to update lesson name");
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all document-related queries
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["document", lessonData?.documentId] });
      queryClient.invalidateQueries({ queryKey: ["documentQuizzes", lessonData?.documentId] });
      queryClient.invalidateQueries({ queryKey: ["friendLessons"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["customQuizzes"] });

      // Navigate back to profile
      const returnPath = location.state?.from || "/profile";
      navigate(returnPath);
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleSave = () => {
    if (!newName.trim()) {
      setError("Lesson name cannot be empty");
      return;
    }
    updateNameMutation.mutate(newName);
  };

  const handleCancel = () => {
    const returnPath = location.state?.from || "/profile";
    navigate(returnPath);
  };

  if (isLoading || !profile) {
    return (
      <div className="container container--edit-lesson">
        <div className="edit-lesson-page">
          <div className="edit-lesson-loading">Loading...</div>
        </div>
      </div>
    );
  }

  const currentName = lessonData?.name || location.state?.lessonName || newName || "";

  return (
    <div className="container container--edit-lesson">
      <div className="edit-lesson-page">
        <div className="edit-lesson-header">
          <button
            className="edit-lesson-back-button"
            onClick={handleCancel}
          >
            <img src={goBackIcon} alt="Back" />
          </button>
          <h1 className="edit-lesson-title">{currentName}</h1>
          <div></div> {/* Spacer for flex layout */}
        </div>

        <div className="edit-lesson-content">
          <div className="edit-lesson-input-group">
            <label htmlFor="lesson-name" className="edit-lesson-label">
              Lesson Name
            </label>
            <input
              id="lesson-name"
              type="text"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                setError("");
              }}
              placeholder="Enter lesson name"
              className="edit-lesson-input"
              disabled={updateNameMutation.isPending}
              autoFocus
            />
            {error && <p className="edit-lesson-error">{error}</p>}
          </div>

          <div className="edit-lesson-actions">
            <button
              className="edit-lesson-button edit-lesson-button--cancel"
              onClick={handleCancel}
              disabled={updateNameMutation.isPending}
            >
              Cancel
            </button>
            <button
              className="edit-lesson-button edit-lesson-button--save"
              onClick={handleSave}
              disabled={updateNameMutation.isPending || !newName.trim()}
            >
              {updateNameMutation.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditLessonPage;

