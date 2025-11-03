import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import folderIcon from "../../assets/icons/folderIcon.svg";
import goBackIcon from "../../assets/icons/goBackIcon.svg";

type StudySessionType = "flashcards" | "quiz";

interface StudySession {
  id: string;
  name: string;
  description: string;
  type: StudySessionType;
  sessionNumber: number;
}

export default function ExistingLevels() {
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const [openLevelId, setOpenLevelId] = useState<number | null>(null);

  const levels = [
    {
      id: 1,
      name: 'Foundation',
      description: 'Basic trades terminology',
    },
    {
      id: 2,
      name: 'Intermediate',
      description: 'Common trade practices',
    },
    {
      id: 3,
      name: 'Advanced',
      description: 'Complex technical concepts',
    },
  ];

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
    setOpenLevelId(openLevelId === levelId ? null : levelId);
  };

  const handleStudySessionClick = (levelId: number, session: StudySession) => {
    const industryId = profile?.industryId;

    if (session.type === "flashcards") {
      // Navigate to flashcards practice
      navigate(`/learning/existing/levels/${levelId}/flashcards/${session.sessionNumber}${industryId ? `?industry=${industryId}` : ''}`);
    } else {
      // Navigate to quiz
      navigate(`/learning/existing/levels/${levelId}/quiz/${session.sessionNumber}${industryId ? `?industry=${industryId}` : ''}`);
    }
  };

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
        <img src={folderIcon} alt="Folder Icon" className="categoriesFolderIcon" />
      </div>

      <div className="categoriesList">
        {levels.map((level) => {
          const isOpen = openLevelId === level.id;
          return (
            <div key={level.id} className="category-folder">
              <div
                className="category-folder-header"
                onClick={() => toggleLevel(level.id)}
              >
                <div className="category-folder-title">
                  <h3>Level {level.id}: {level.name}</h3>
                </div>
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
              </div>

              {isOpen && (
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