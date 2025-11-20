import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "../../lib/api";
import { useProfile } from "../../hooks/useProfile";
import { useCategories } from "../../hooks/useCategories";
import { useDocumentCategory } from "../../hooks/useDocumentCategory";
import { getUserDisplayName } from "../../utils/userHelpers";
import goBackIcon from "../../assets/icons/goBackIcon.svg";
import deleteIconBrown from "../../assets/icons/deleteIconBrown.svg";
import lessonIconWrenchWhite from "../../assets/icons/lessonIconWrenchWhite.svg";
import lessonIconWrench from "../../assets/icons/lessonIconWrench.svg";
import downArrow from "../../assets/icons/downArrow.svg";
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
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [isSharedUsersExpanded, setIsSharedUsersExpanded] = useState(false);
  const [selectedSharedUserIds, setSelectedSharedUserIds] = useState<Set<string>>(new Set());

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

  // Fetch categories
  const { data: categories = [] } = useCategories();
  
  // Fetch current document category
  const { data: currentCategoryId } = useDocumentCategory(lessonData?.documentId || null);

  // Fetch shared users for this lesson
  const { data: sharedUsersData } = useQuery({
    queryKey: ["quizShares", lessonData?.id],
    queryFn: async () => {
      if (!lessonData?.id) return { shares: [] };
      const token = await getToken();
      const res = await fetch(
        `${BACKEND_URL}/learning/sharing/quiz/${lessonData.id}/shares`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) return { shares: [] };
      const data = await res.json();
      return data.data || { shares: [] };
    },
    enabled: !!lessonData?.id,
  });

  const sharedUsers = sharedUsersData?.shares || [];

  // Initialize selected shared users when data loads
  useEffect(() => {
    if (sharedUsers.length > 0) {
      const userIds = new Set<string>(sharedUsers.map((share: any) => share.sharedWith.id as string));
      setSelectedSharedUserIds(userIds);
    }
  }, [sharedUsers]);

  // Update newName when lessonData is loaded
  useEffect(() => {
    if (lessonData?.name) {
      setNewName(lessonData.name);
    }
  }, [lessonData]);

  // Update selectedCategoryId when currentCategoryId is loaded
  useEffect(() => {
    if (currentCategoryId !== undefined && currentCategoryId !== null) {
      setSelectedCategoryId(currentCategoryId);
    }
  }, [currentCategoryId]);

  const updateNameMutation = useMutation({
    mutationFn: async ({ name, categoryId }: { name: string; categoryId?: number | null }) => {
      if (!lessonData?.documentId) throw new Error("No document ID");
      if (!name.trim()) throw new Error("Name cannot be empty");

      const token = await getToken();
      const body: { name?: string; categoryId?: number } = { name: name.trim() };
      
      // Only include categoryId if it's different from current
      if (categoryId !== undefined && categoryId !== null && categoryId !== currentCategoryId) {
        body.categoryId = categoryId;
      }

      const response = await fetch(`${BACKEND_URL}/documents/${lessonData.documentId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Failed to update lesson");
      }
      return response.json();
    },
    onSuccess: async () => {
      // Invalidate all document-related queries
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["document", lessonData?.documentId] });
      queryClient.invalidateQueries({ queryKey: ["document", lessonData?.documentId, "category"] });
      queryClient.invalidateQueries({ queryKey: ["documentQuizzes", lessonData?.documentId] });
      queryClient.invalidateQueries({ queryKey: ["friendLessons"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["customQuizzes"] });
      queryClient.invalidateQueries({ queryKey: ["lessonDetails"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });

      // Handle unsharing for unchecked users before navigating
      if (lessonData?.id && sharedUsers.length > 0) {
        const token = await getToken();
        const usersToUnshare = sharedUsers.filter(
          (share: any) => !selectedSharedUserIds.has(share.sharedWith.id as string)
        );

        // Unshare with users that were unchecked
        for (const share of usersToUnshare) {
          try {
            const response = await fetch(
              `${BACKEND_URL}/learning/sharing/${share.id}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            if (!response.ok) {
              console.error(`Failed to unshare with user ${share.sharedWith.id}`);
            }
          } catch (error) {
            console.error("Error unsharing:", error);
          }
        }

        // Invalidate queries after unsharing
        if (usersToUnshare.length > 0) {
          queryClient.invalidateQueries({ queryKey: ["quizShares", lessonData.id] });
        }
      }

      // Navigate back to profile
      const returnPath = location.state?.from || "/profile";
      navigate(returnPath);
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: async () => {
      if (!lessonData?.documentId) throw new Error("No document ID");

      const token = await getToken();
      const response = await fetch(`${BACKEND_URL}/documents/${lessonData.documentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete lesson");
      }
      return response.json();
    },
    onSuccess: () => {
      // Invalidate all document-related queries
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["document"] });
      queryClient.invalidateQueries({ queryKey: ["documentQuizzes"] });
      queryClient.invalidateQueries({ queryKey: ["friendLessons"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["customQuizzes"] });
      queryClient.invalidateQueries({ queryKey: ["lessonDetails"] });

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

    // Update name and category (unsharing will be handled in onSuccess)
    updateNameMutation.mutate({ 
      name: newName, 
      categoryId: selectedCategoryId !== currentCategoryId ? selectedCategoryId : undefined 
    });
  };

  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setIsCategoryExpanded(false);
  };

  const currentCategory = categories.find(cat => cat.id === selectedCategoryId);

  const handleCancel = () => {
    const returnPath = location.state?.from || "/profile";
    navigate(returnPath);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this lesson? This action cannot be undone.")) {
      deleteLessonMutation.mutate();
    }
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
        <div className="edit-lesson-hero">
          <div className="edit-lesson-header">
            <button
              className="edit-lesson-back-button"
              onClick={handleCancel}
            >
              <img src={goBackIcon} alt="Back" />
            </button>
            <h1 className="edit-lesson-title">{currentName}</h1>
            <button
              className="edit-lesson-delete-button"
              onClick={handleDelete}
              disabled={deleteLessonMutation.isPending}
              aria-label="Delete lesson"
            >
              <img src={deleteIconBrown} alt="Delete" />
            </button>
          </div>
          <div className="edit-lesson-icon-container">
            <img src={lessonIconWrenchWhite} alt="Lesson" className="edit-lesson-icon" />
          </div>
        </div>

        <div className="edit-lesson-drawer">
          <div className="edit-lesson-content">
            <div className="edit-lesson-input-group">
              <label htmlFor="lesson-name" className="edit-lesson-label">
                Title:
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
                disabled={updateNameMutation.isPending || deleteLessonMutation.isPending}
                autoFocus
              />
              {error && <p className="edit-lesson-error">{error}</p>}
            </div>

            <div className="edit-lesson-input-group">
              <label htmlFor="lesson-folder" className="edit-lesson-label">
                Folder:
              </label>
              <div className="edit-lesson-category-card">
                <button
                  type="button"
                  id="lesson-folder"
                  className="edit-lesson-category-button"
                  onClick={() => setIsCategoryExpanded(!isCategoryExpanded)}
                  disabled={updateNameMutation.isPending || deleteLessonMutation.isPending}
                >
                  <img 
                    src={lessonIconWrench} 
                    alt="Folder" 
                    className="edit-lesson-category-wrench-icon"
                  />
                  <span className="edit-lesson-category-value">
                    {currentCategory?.name || "Uncategorized"}
                  </span>
                  <img 
                    src={downArrow} 
                    alt="Toggle" 
                    className={`edit-lesson-category-arrow ${isCategoryExpanded ? "edit-lesson-category-arrow--open" : ""}`}
                  />
                </button>
                {isCategoryExpanded && (
                  <div className="edit-lesson-category-list">
                    {categories
                      .filter(category => category.id !== selectedCategoryId)
                      .map((category, index, filteredCategories) => (
                        <button
                          key={category.id}
                          type="button"
                          className={`edit-lesson-category-option ${index === 0 ? "edit-lesson-category-option--first" : ""} ${index === filteredCategories.length - 1 ? "edit-lesson-category-option--last" : ""}`}
                          onClick={() => handleCategorySelect(category.id)}
                        >
                          <img 
                            src={lessonIconWrench} 
                            alt="Folder" 
                            className="edit-lesson-category-option-wrench-icon"
                          />
                          <span className="edit-lesson-category-option-text">{category.name}</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>

            <div className="edit-lesson-input-group">
              <label htmlFor="lesson-shared" className="edit-lesson-label">
                Shared With:
              </label>
              <div className="edit-lesson-shared-card">
                <button
                  type="button"
                  id="lesson-shared"
                  className="edit-lesson-shared-button"
                  onClick={() => setIsSharedUsersExpanded(!isSharedUsersExpanded)}
                  disabled={updateNameMutation.isPending || deleteLessonMutation.isPending}
                >
                  <span className="edit-lesson-shared-value">
                    {(() => {
                      if (sharedUsers.length === 0) {
                        return "No one";
                      }
                      
                      if (sharedUsers.length === 1) {
                        return getUserDisplayName(sharedUsers[0].sharedWith);
                      }
                      
                      if (sharedUsers.length === 2) {
                        return `${getUserDisplayName(sharedUsers[0].sharedWith)}, ${getUserDisplayName(sharedUsers[1].sharedWith)}`;
                      }
                      
                      // More than 2 users: show first 2 + count
                      const firstTwo = sharedUsers.slice(0, 2).map((share: any) => getUserDisplayName(share.sharedWith)).join(", ");
                      const remainingCount = sharedUsers.length - 2;
                      return `${firstTwo} +${remainingCount} ${remainingCount === 1 ? "other" : "others"}`;
                    })()}
                  </span>
                  <img 
                    src={downArrow} 
                    alt="Toggle" 
                    className={`edit-lesson-shared-arrow ${isSharedUsersExpanded ? "edit-lesson-shared-arrow--open" : ""}`}
                  />
                </button>
                {isSharedUsersExpanded && sharedUsers.length > 0 && (
                  <div className="edit-lesson-shared-list">
                    {sharedUsers.map((share: any, index: number, filteredShares: any[]) => {
                      const userId = share.sharedWith.id;
                      const isChecked = selectedSharedUserIds.has(userId);
                      
                      return (
                        <label
                          key={share.id}
                          className={`edit-lesson-shared-option ${index === 0 ? "edit-lesson-shared-option--first" : ""} ${index === filteredShares.length - 1 ? "edit-lesson-shared-option--last" : ""}`}
                        >
                          <span className="edit-lesson-shared-option-text">
                            {getUserDisplayName(share.sharedWith)}
                          </span>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const newSelected = new Set(selectedSharedUserIds);
                              if (e.target.checked) {
                                newSelected.add(userId);
                              } else {
                                newSelected.delete(userId);
                              }
                              setSelectedSharedUserIds(newSelected);
                            }}
                            className="edit-lesson-shared-checkbox"
                            disabled={updateNameMutation.isPending || deleteLessonMutation.isPending}
                          />
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="edit-lesson-actions">
            <button
                className="edit-lesson-button edit-lesson-button--save"
                onClick={handleSave}
                disabled={updateNameMutation.isPending || deleteLessonMutation.isPending || !newName.trim()}
              >
                {updateNameMutation.isPending ? "Saving..." : "Save"}
              </button>
              <button
                className="edit-lesson-button edit-lesson-button--cancel"
                onClick={handleCancel}
                disabled={updateNameMutation.isPending || deleteLessonMutation.isPending}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditLessonPage;

