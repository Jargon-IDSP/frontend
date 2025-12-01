import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "../../lib/api";
import { useProfile } from "../../hooks/useProfile";
import { useCategories } from "../../hooks/useCategories";
import { useDocumentCategory } from "../../hooks/useDocumentCategory";
import { getUserDisplayName } from "../../utils/userHelpers";
import LoadingBar from "../../components/LoadingBar";
import goBackIcon from "../../assets/icons/goBackIcon.svg";
import deleteIconBrown from "../../assets/icons/deleteIconBrown.svg";
import lessonIconWrenchWhite from "../../assets/icons/lessonIconWrenchWhite.svg";
import lessonIconWrench from "../../assets/icons/lessonIconWrench.svg";
import downArrowBrown from "../../assets/icons/downArrowBrown.svg";
import DeleteDrawer from "../drawers/DeleteDrawer";
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
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const [isSharedUsersExpanded, setIsSharedUsersExpanded] = useState(false);
  const [selectedSharedUserIds, setSelectedSharedUserIds] = useState<
    Set<string>
  >(new Set());
  const [isDeleteDrawerOpen, setIsDeleteDrawerOpen] = useState(false);

  // Fetch lesson details to get current name and documentId
  const { data: lessonData, isLoading } = useQuery({
    queryKey: ["lessonDetails", lessonId, profile?.id],
    queryFn: async () => {
      if (!profile?.id) throw new Error("User not loaded");
      const token = await getToken();
      const res = await fetch(
        `${BACKEND_URL}/learning/custom/users/${profile.id}/lessons/${lessonId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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
  const { data: currentCategoryId } = useDocumentCategory(
    lessonData?.documentId || null
  );

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

  // Fetch friends list (needed for PRIVATE mode selection)
  const { data: friends = [] } = useQuery({
    queryKey: ["friends"],
    queryFn: async () => {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/friendships/friends`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Initialize selected shared users when data loads
  useEffect(() => {
    if (sharedUsers.length > 0) {
      const userIds = new Set<string>(
        sharedUsers.map((share: any) => share.sharedWith.id as string)
      );
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
    mutationFn: async ({
      name,
      categoryId,
    }: {
      name: string;
      categoryId?: number | null;
    }) => {
      if (!lessonData?.documentId) throw new Error("No document ID");
      if (!name.trim()) throw new Error("Name cannot be empty");

      const token = await getToken();
      const body: { name?: string; categoryId?: number } = {
        name: name.trim(),
      };

      // Only include categoryId if it's different from current
      if (
        categoryId !== undefined &&
        categoryId !== null &&
        categoryId !== currentCategoryId
      ) {
        body.categoryId = categoryId;
      }

      const response = await fetch(
        `${BACKEND_URL}/documents/${lessonData.documentId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update lesson");
      }
      return response.json();
    },
    onSuccess: async () => {
      // Invalidate all document-related queries
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({
        queryKey: ["document", lessonData?.documentId],
      });
      queryClient.invalidateQueries({
        queryKey: ["document", lessonData?.documentId, "category"],
      });
      queryClient.invalidateQueries({
        queryKey: ["documentQuizzes", lessonData?.documentId],
      });
      queryClient.invalidateQueries({ queryKey: ["friendLessons"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["customQuizzes"] });
      queryClient.invalidateQueries({ queryKey: ["lessonDetails"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });

      // Navigate back to profile
      const returnPath = location.state?.from || "/profile";
      navigate(returnPath);
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  // Share mutation - add a friend to the lesson
  const shareMutation = useMutation({
    mutationFn: async (friendId: string) => {
      if (!lessonData?.id) throw new Error("No lesson ID");
      const token = await getToken();
      const response = await fetch(`${BACKEND_URL}/quiz-shares`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customQuizId: lessonData.id,
          friendUserId: friendId,
        }),
      });
      if (!response.ok) throw new Error("Failed to share");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["quizShares", lessonData?.id],
      });
    },
  });

  // Unshare mutation - remove a friend from the lesson
  const unshareMutation = useMutation({
    mutationFn: async (shareId: string) => {
      const token = await getToken();
      const response = await fetch(
        `${BACKEND_URL}/learning/sharing/${shareId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to unshare");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["quizShares", lessonData?.id],
      });
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
      categoryId:
        selectedCategoryId !== currentCategoryId
          ? selectedCategoryId
          : undefined,
    });
  };

  const handleCategorySelect = (categoryId: number) => {
    setSelectedCategoryId(categoryId);
    setIsCategoryExpanded(false);
  };

  const currentCategory = categories.find(
    (cat) => cat.id === selectedCategoryId
  );

  const handleCancel = () => {
    const returnPath = location.state?.from || "/profile";
    navigate(returnPath);
  };

  const handleDelete = () => {
    setIsDeleteDrawerOpen(true);
  };

  const handleDeleteCancel = () => {
    // This is called after successful deletion (when navigateOnSuccess is false)
    // or when user cancels the delete action
    // Invalidate additional queries that DeleteDrawer doesn't handle
    queryClient.invalidateQueries({ queryKey: ["document"] });
    queryClient.invalidateQueries({ queryKey: ["documentQuizzes"] });
    queryClient.invalidateQueries({ queryKey: ["friendLessons"] });
    queryClient.invalidateQueries({ queryKey: ["profile"] });
    queryClient.invalidateQueries({ queryKey: ["customQuizzes"] });
    queryClient.invalidateQueries({ queryKey: ["lessonDetails"] });
    queryClient.invalidateQueries({ queryKey: ["categories"] });

    // Navigate back to profile (only if deletion succeeded, but we navigate in both cases for safety)
    const returnPath = location.state?.from || "/profile";
    navigate(returnPath);
  };

  if (isLoading || !profile) {
    return (
      <LoadingBar
        isLoading={isLoading || !profile}
        hasData={!!lessonData && !!profile}
        hasError={false}
        text="Loading lesson"
      />
    );
  }

  const currentName =
    lessonData?.name || location.state?.lessonName || newName || "";

  return (
    <>
      <DeleteDrawer
        open={isDeleteDrawerOpen}
        onOpenChange={setIsDeleteDrawerOpen}
        onCancel={handleDeleteCancel}
        documentId={lessonData?.documentId || null}
        documentName={lessonData?.name || location.state?.lessonName || ""}
        navigateOnSuccess={false}
      />
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
                aria-label="Delete lesson"
              >
                <img src={deleteIconBrown} alt="Delete" />
              </button>
            </div>
            <div className="edit-lesson-icon-container">
              <img
                src={lessonIconWrenchWhite}
                alt="Lesson"
                className="edit-lesson-icon"
              />
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
                  disabled={updateNameMutation.isPending}
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
                    disabled={updateNameMutation.isPending}
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
                      src={downArrowBrown}
                      alt="Toggle"
                      className={`edit-lesson-category-arrow ${
                        isCategoryExpanded
                          ? "edit-lesson-category-arrow--open"
                          : ""
                      }`}
                    />
                  </button>
                  {isCategoryExpanded && (
                    <>
                      <div className="edit-lesson-category-list">
                        {categories
                          .filter(
                            (category) => category.id !== selectedCategoryId
                          )
                          .map((category, index, filteredCategories) => (
                            <button
                              key={category.id}
                              type="button"
                              className={`edit-lesson-category-option ${
                                index === 0
                                  ? "edit-lesson-category-option--first"
                                  : ""
                              } ${
                                index === filteredCategories.length - 1
                                  ? "edit-lesson-category-option--last"
                                  : ""
                              }`}
                              onClick={() => handleCategorySelect(category.id)}
                            >
                              <img
                                src={lessonIconWrench}
                                alt="Folder"
                                className="edit-lesson-category-option-wrench-icon"
                              />
                              <span className="edit-lesson-category-option-text">
                                {category.name}
                              </span>
                            </button>
                          ))}
                      </div>
                      <div className="edit-lesson-manage-folders-container">
                        <button
                          type="button"
                          className="edit-lesson-manage-folders-button"
                          onClick={() =>
                            navigate("/learning/custom/categories")
                          }
                          disabled={updateNameMutation.isPending}
                        >
                          Manage Custom Folders
                        </button>
                      </div>
                    </>
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
                    onClick={() =>
                      setIsSharedUsersExpanded(!isSharedUsersExpanded)
                    }
                    disabled={updateNameMutation.isPending}
                  >
                    <span className="edit-lesson-shared-value">
                      {(() => {
                        const privacy = profile?.defaultPrivacy || "PRIVATE";

                        // If profile is PUBLIC, always show "Everyone"
                        if (privacy === "PUBLIC") {
                          return "Everyone";
                        }

                        // If profile is FRIENDS, always show "All friends"
                        if (privacy === "FRIENDS") {
                          return "All friends";
                        }

                        // PRIVATE mode - show individual friend names or "No one"
                        if (sharedUsers.length === 0) {
                          return "No one";
                        }

                        if (sharedUsers.length === 1) {
                          return getUserDisplayName(sharedUsers[0].sharedWith);
                        }

                        if (sharedUsers.length === 2) {
                          return `${getUserDisplayName(
                            sharedUsers[0].sharedWith
                          )}, ${getUserDisplayName(sharedUsers[1].sharedWith)}`;
                        }

                        // More than 2 users: show first 2 + count
                        const firstTwo = sharedUsers
                          .slice(0, 2)
                          .map((share: any) =>
                            getUserDisplayName(share.sharedWith)
                          )
                          .join(", ");
                        const remainingCount = sharedUsers.length - 2;
                        return `${firstTwo} +${remainingCount} ${
                          remainingCount === 1 ? "other" : "others"
                        }`;
                      })()}
                    </span>
                    <img
                      src={downArrowBrown}
                      alt="Toggle"
                      className={`edit-lesson-shared-arrow ${
                        isSharedUsersExpanded
                          ? "edit-lesson-shared-arrow--open"
                          : ""
                      }`}
                    />
                  </button>
                  {isSharedUsersExpanded && (
                    <div className="edit-lesson-shared-list">
                      {profile?.defaultPrivacy === "PUBLIC" ||
                      profile?.defaultPrivacy === "FRIENDS" ? (
                        // PUBLIC or FRIENDS mode: Show only the centered notice
                        <p className="edit-lesson-privacy-note edit-lesson-privacy-note--centered">
                          Update privacy settings to control individual documents
                          visibility
                        </p>
                      ) : (
                        // PRIVATE mode: Show all friends with checkboxes
                        friends.length > 0 ? (
                          friends.map((friend: any, index: number) => {
                            const friendId = friend.id;
                            const isChecked =
                              selectedSharedUserIds.has(friendId);
                            const share = sharedUsers.find(
                              (s: any) => s.sharedWith.id === friendId
                            );

                            return (
                              <label
                                key={friendId}
                                className={`edit-lesson-shared-option ${
                                  index === 0
                                    ? "edit-lesson-shared-option--first"
                                    : ""
                                } ${
                                  index === friends.length - 1
                                    ? "edit-lesson-shared-option--last"
                                    : ""
                                }`}
                              >
                                <span className="edit-lesson-shared-option-text">
                                  {getUserDisplayName(friend)}
                                </span>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    const newSelected = new Set(
                                      selectedSharedUserIds
                                    );
                                    if (e.target.checked) {
                                      newSelected.add(friendId);
                                      // Immediately share with this friend
                                      shareMutation.mutate(friendId);
                                    } else {
                                      newSelected.delete(friendId);
                                      // Immediately unshare from this friend
                                      if (share) {
                                        unshareMutation.mutate(share.id);
                                      }
                                    }
                                    setSelectedSharedUserIds(newSelected);
                                  }}
                                  className="edit-lesson-shared-checkbox"
                                  disabled={
                                    updateNameMutation.isPending ||
                                    shareMutation.isPending ||
                                    unshareMutation.isPending
                                  }
                                />
                              </label>
                            );
                          })
                        ) : (
                          <p className="edit-lesson-shared-empty">
                            No friends yet
                          </p>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="edit-lesson-actions">
                <button
                  className="edit-lesson-button edit-lesson-button--save"
                  onClick={handleSave}
                  disabled={updateNameMutation.isPending || !newName.trim()}
                >
                  {updateNameMutation.isPending ? "Saving..." : "Save"}
                </button>
                <button
                  className="edit-lesson-button edit-lesson-button--cancel"
                  onClick={handleCancel}
                  disabled={updateNameMutation.isPending}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditLessonPage;
