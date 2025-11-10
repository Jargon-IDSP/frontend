import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import type { StudySession } from "@/types/learning";
import goBackIcon from "../../assets/icons/goBackIcon.svg";
import lockIcon from "../../assets/icons/lockIcon.svg";
import { useLevels } from "@/hooks/useLevels";
import { useApprenticeshipProgress } from "@/hooks/useApprenticeshipProgress";

const levelDescriptions: Record<number, string> = {
  1: "Basic trades terminology",
  2: "Common trade practices",
  3: "Complex technical concepts",
};

// Default levels in case API fails
const DEFAULT_LEVELS = [
  { id: 1, name: "Foundation", completed: false },
  { id: 2, name: "Intermediate", completed: false },
  { id: 3, name: "Advanced", completed: false },
];

export default function ExistingLevels() {
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const [openLevelId, setOpenLevelId] = useState<number | null>(null);

  // Use the custom hook
  const { data: levelsData, isLoading, error } = useLevels(profile?.industryId);
  const levels = levelsData || DEFAULT_LEVELS;

  // Get apprenticeship progress to check quiz completion
  const { data: progressData } = useApprenticeshipProgress();

  // Check if a level is locked (all previous levels must be completed)
  const isLevelLocked = (levelId: number): boolean => {
    if (levelId === 1) return false; // Level 1 is always unlocked

    // Check if all previous levels are completed
    for (let i = 1; i < levelId; i++) {
      const prevLevel = levels.find((l) => l.id === i);
      if (!prevLevel || !prevLevel.completed) {
        return true; // Lock if any previous level is not completed
      }
    }
    return false;
  };

  // Check if boss quiz (quiz 3) should be locked
  const isBossQuizLocked = (levelId: number): boolean => {
    if (!progressData || !profile?.industryId) {
      return true;
    }

    // Find progress for this level and industry
    const progress = progressData.find(
      (p) => p.levelId === levelId && p.industryId === profile.industryId
    );

    // Lock if less than 2 quizzes completed (need quizzes 1 and 2)
    return !progress || progress.quizzesCompleted < 2;
  };

  // Generate study sessions for each level (2 flashcard sessions + 3 quiz sessions)
  const getStudySessions = (levelId: number): StudySession[] => {
    return [
      {
        id: `level-${levelId}-flashcards-1`,
        name: "Industry Terms Practice",
        description: "Practice flashcards specific to your trade",
        type: "flashcards",
        sessionNumber: 1,
      },
      {
        id: `level-${levelId}-flashcards-2`,
        name: "General Terms Practice",
        description: "Practice general construction terminology",
        type: "flashcards",
        sessionNumber: 2,
      },
      {
        id: `level-${levelId}-quiz-1`,
        name: "Industry Knowledge Quiz",
        description: "Test your trade-specific knowledge",
        type: "quiz",
        sessionNumber: 1,
      },
      {
        id: `level-${levelId}-quiz-2`,
        name: "Mixed Practice Quiz",
        description: "Test your overall understanding",
        type: "quiz",
        sessionNumber: 2,
      },
      {
        id: `level-${levelId}-quiz-3`,
        name: "Challenge Quiz",
        description: "Put your skills to the test",
        type: "quiz",
        sessionNumber: 3,
      },
    ];
  };

  const toggleLevel = (levelId: number) => {
    const locked = isLevelLocked(levelId);
    if (locked) return; // Don't toggle if locked
    setOpenLevelId(openLevelId === levelId ? null : levelId);
  };

  const handleStudySessionClick = (levelId: number, session: StudySession) => {
    const locked = isLevelLocked(levelId);
    if (locked) return; // Don't navigate if level is locked

    // Check if boss quiz is locked
    if (session.type === "quiz" && session.sessionNumber === 3) {
      if (isBossQuizLocked(levelId)) {
        return; // Don't navigate if boss quiz is locked
      }
    }

    const industryId = profile?.industryId;

    if (session.type === "flashcards") {
      // Navigate to flashcards practice
      navigate(
        `/learning/existing/levels/${levelId}/flashcards/${
          session.sessionNumber
        }${industryId ? `?industry=${industryId}` : ""}`
      );
    } else {
      // Navigate directly to quiz (skip the Start Quiz page)
      navigate(
        `/learning/existing/levels/${levelId}/quiz/take?quiz=${session.sessionNumber}${
          industryId ? `&industry_id=${industryId}` : ""
        }`
      );
    }
  };

  if (isLoading) {
    return (
      <div className="categoriesPage">
        <div className="categoriesHeader">
          <img
            src={goBackIcon}
            alt="Go back"
            className="categoriesBackButton"
            onClick={() => navigate(-1)}
          />
          <h1>Red Seal Levels</h1>
        </div>
        <div className="categoriesLoading">Loading levels...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="categoriesPage">
        <div className="categoriesHeader">
          <img
            src={goBackIcon}
            alt="Go back"
            className="categoriesBackButton"
            onClick={() => navigate(-1)}
          />
          <h1>Red Seal Levels</h1>
        </div>
        <div className="error-message">
          {error instanceof Error ? error.message : "Failed to load levels"}
        </div>
      </div>
    );
  }

  return (
    <div className="categoriesPage">
      <div className="categoriesHeader">
        <img
          src={goBackIcon}
          alt="Go back"
          className="categoriesBackButton"
          onClick={() => navigate(-1)}
        />
        <h1>Red Seal Levels</h1>
      </div>

      <div className="categoriesList">
        {levels.map((level) => {
          const isOpen = openLevelId === level.id;
          const locked = isLevelLocked(level.id);
          const description = levelDescriptions[level.id] || "";

          return (
            <div
              key={level.id}
              className={`category-folder ${
                locked ? "category-folder--locked" : ""
              } ${level.completed ? "category-folder--completed" : ""}`}
            >
              <div
                className={`category-folder-header ${locked ? 'category-folder-header--locked' : ''}`}
                onClick={() => toggleLevel(level.id)}
              >
                <div className="category-folder-title">
                  <h3>
                    {locked && (
                      <span><img src={lockIcon} alt="Locked"/></span>
                    )}
                    {level.completed && (
                      <span>✅</span>
                    )}
                    Level {level.id}: {level.name}
                  </h3>
                  {locked && (
                    <p className="level-subtitle">
                      Complete previous levels to unlock
                    </p>
                  )}
                  {!locked && !level.completed && (
                    <p className="level-subtitle">
                      {description}
                    </p>
                  )}
                </div>
                {!locked && (
                  <svg
                    className={`chevron ${isOpen ? "open" : ""}`}
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                )}
              </div>

              {isOpen && !locked && (
                <div className="category-folder-content">
                  <div className="document-list">
                    {getStudySessions(level.id).map((session) => {
                      const isBossQuiz = session.type === "quiz" && session.sessionNumber === 3;
                      const sessionLocked = isBossQuiz && isBossQuizLocked(level.id);

                      return (
                        <div
                          key={session.id}
                          className={`document-item ${sessionLocked ? 'document-item--locked' : ''}`}
                          onClick={() =>
                            !sessionLocked && handleStudySessionClick(level.id, session)
                          }
                        >
                          <div className="document-info">
                            <span className="document-name">
                              {sessionLocked && <img src={lockIcon} alt="Locked" className="session-lock-icon" />}
                              {session.name}
                            </span>
                            <div className="document-stats">
                              <span className="stat">
                                {sessionLocked ? "Complete all practice quizzes to unlock" : session.description}
                              </span>
                            </div>
                          </div>
                          {!sessionLocked && (
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
