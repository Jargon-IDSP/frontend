import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@clerk/clerk-react";
import { BACKEND_URL } from "@/lib/api";
import goBackIcon from "../../assets/icons/goBackIcon.svg";

type StudySessionType = "flashcards" | "quiz";

interface StudySession {
  id: string;
  name: string;
  description: string;
  type: StudySessionType;
  sessionNumber: number;
}

interface Level {
  id: number;
  name: string;
  completed: boolean;
}

const levelDescriptions: Record<number, string> = {
  1: 'Basic trades terminology',
  2: 'Common trade practices',
  3: 'Complex technical concepts',
};

export default function ExistingLevels() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { data: profile } = useProfile();
  const [openLevelId, setOpenLevelId] = useState<number | null>(null);

  // Fetch levels with completion status
  const { data: levelsData, isLoading } = useQuery({
    queryKey: ["levels", profile?.industryId],
    queryFn: async () => {
      const token = await getToken();
      const response = await fetch(`${BACKEND_URL}/learning/existing/levels`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch levels");
      const result = await response.json();
      return result.data as Level[];
    },
    enabled: !!getToken,
  });

  const levels = levelsData || [
    { id: 1, name: 'Foundation', completed: false },
    { id: 2, name: 'Intermediate', completed: false },
    { id: 3, name: 'Advanced', completed: false },
  ];

  // Check if a level is locked (all previous levels must be completed)
  const isLevelLocked = (levelId: number): boolean => {
    if (levelId === 1) return false; // Level 1 is always unlocked

    // Check if all previous levels are completed
    for (let i = 1; i < levelId; i++) {
      const prevLevel = levels.find(l => l.id === i);
      if (!prevLevel || !prevLevel.completed) {
        return true; // Lock if any previous level is not completed
      }
    }
    return false;
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
    if (locked) return; // Don't navigate if locked

    const industryId = profile?.industryId;

    if (session.type === "flashcards") {
      // Navigate to flashcards practice
      navigate(`/learning/existing/levels/${levelId}/flashcards/${session.sessionNumber}${industryId ? `?industry=${industryId}` : ''}`);
    } else {
      // Navigate to quiz
      navigate(`/learning/existing/levels/${levelId}/quiz/${session.sessionNumber}${industryId ? `?industry=${industryId}` : ''}`);
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
          const description = levelDescriptions[level.id] || '';

          return (
            <div
              key={level.id}
              className={`category-folder ${locked ? 'category-folder--locked' : ''} ${level.completed ? 'category-folder--completed' : ''}`}
            >
              <div
                className="category-folder-header"
                onClick={() => toggleLevel(level.id)}
                style={{ cursor: locked ? 'not-allowed' : 'pointer' }}
              >
                <div className="category-folder-title">
                  <h3>
                    {locked && <span style={{ marginRight: '0.5rem' }}>🔒</span>}
                    {level.completed && <span style={{ marginRight: '0.5rem' }}>✅</span>}
                    Level {level.id}: {level.name}
                  </h3>
                  {locked && (
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                      Complete previous levels to unlock
                    </p>
                  )}
                  {!locked && !level.completed && (
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                      {description}
                    </p>
                  )}
                </div>
                {!locked && (
                  <svg
                    className={`chevron ${isOpen ? 'open' : ''}`}
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
                    {getStudySessions(level.id).map((session) => (
                      <div
                        key={session.id}
                        className="document-item"
                        onClick={() => handleStudySessionClick(level.id, session)}
                      >
                        <div className="document-info">
                          <span className="document-name">{session.name}</span>
                          <div className="document-stats">
                            <span className="stat">{session.description}</span>
                          </div>
                        </div>
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
                      </div>
                    ))}
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
