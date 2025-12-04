import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { CategoriesCard } from "@/components/learning/CategoriesCard";
import { CategoryFolder } from "@/components/learning/CategoryFolder";
import type { StudySession } from "@/types/learning";
import { useLevels } from "@/hooks/useLevels";
import LoadingBar from "@/components/LoadingBar";
import { getIndustryName } from "@/utils/userHelpers";
import dictionaryBottom from "../../assets/dictionaryBottom.svg";

import carpenterBadge1 from "../../assets/badges/carpenter/C1.svg";
import carpenterBadge2 from "../../assets/badges/carpenter/C2.svg";
import carpenterBadge3 from "../../assets/badges/carpenter/C3.svg";
import electricianBadge1 from "../../assets/badges/electrician/E1.svg";
import electricianBadge2 from "../../assets/badges/electrician/E2.svg";
import electricianBadge3 from "../../assets/badges/electrician/E3.svg";
import plumberBadge1 from "../../assets/badges/plumber/P1.svg";
import plumberBadge2 from "../../assets/badges/plumber/P2.svg";
import plumberBadge3 from "../../assets/badges/plumber/P3.svg";
import mechanicBadge1 from "../../assets/badges/mechanic/E1.svg";
import mechanicBadge2 from "../../assets/badges/mechanic/E2.svg";
import mechanicBadge3 from "../../assets/badges/mechanic/E3.svg";
import welderBadge1 from "../../assets/badges/welder/W1.svg";
import welderBadge2 from "../../assets/badges/welder/W2.svg";
import welderBadge3 from "../../assets/badges/welder/W3.svg";
import apprenticeship4Badge from "../../assets/badges/apprenticeship4.svg";
import redSealBadge from "../../assets/badges/redSeal.svg";

const getBadgeForLevel = (industryId: number | null | undefined, levelId: number): string => {
  if (levelId === 4) return apprenticeship4Badge;

  if (levelId === 5) return redSealBadge;

  const badgeMap: Record<number, Record<number, string>> = {
    1: { 1: electricianBadge1, 2: electricianBadge2, 3: electricianBadge3 }, // Electrician
    2: { 1: plumberBadge1, 2: plumberBadge2, 3: plumberBadge3 },             // Plumber
    3: { 1: carpenterBadge1, 2: carpenterBadge2, 3: carpenterBadge3 },       // Carpenter
    4: { 1: mechanicBadge1, 2: mechanicBadge2, 3: mechanicBadge3 },          // Mechanic
    5: { 1: welderBadge1, 2: welderBadge2, 3: welderBadge3 },                // Welder
  };

  return badgeMap[industryId || 1]?.[levelId] || electricianBadge1;
};

const DEFAULT_LEVELS = [
  { id: 1, name: "Foundation", completed: false, unlocked: true, quizzesCompleted: 0 },
  { id: 2, name: "Intermediate", completed: false, unlocked: false, quizzesCompleted: 0 },
  { id: 3, name: "Advanced", completed: false, unlocked: false, quizzesCompleted: 0 },
];

export default function ExistingLevels() {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useProfile();

  const { data: levelsData, isLoading: levelsLoading, error } = useLevels(profile?.industryId);
  const backendLevels = levelsData || DEFAULT_LEVELS;


  const level3 = backendLevels.find((l) => l.id === 3);
  const levels = [
    ...backendLevels,
    {
      id: 4,
      name: "Apprentice 4",
      completed: false,
      unlocked: level3?.completed || false,
      quizzesCompleted: 0,
    },
    {
      id: 5,
      name: "Red Seal",
      completed: false,
      unlocked: false, 
      quizzesCompleted: 0,
    },
  ];

  const isLevelLocked = (levelId: number): boolean => {
    const level = levels.find((l) => l.id === levelId);
    return level?.unlocked === false || (level?.unlocked === undefined && levelId > 1);
  };

  const isLoading = profileLoading || levelsLoading;

  const getStudySessions = (levelId: number): StudySession[] => {
    return [
      {
        id: `level-${levelId}-flashcards-1`,
        name: "Lv1 Industry Term",
        type: "flashcards",
        sessionNumber: 1,
      },
      {
        id: `level-${levelId}-flashcards-2`,
        name: "Lv2 General Term",
        type: "flashcards",
        sessionNumber: 2,
      },
      {
        id: `level-${levelId}-quiz-1`,
        name: "Lv3 Industry Knowledge Quiz",
        type: "quiz",
        sessionNumber: 1,
      },
      {
        id: `level-${levelId}-quiz-2`,
        name: "Lv4 Mixed Practice Quiz",
        type: "quiz",
        sessionNumber: 2,
      },
      {
        id: `level-${levelId}-quiz-3`,
        name: "Lv5 Challenge Quiz",
        type: "quiz",
        sessionNumber: 3,
      },
    ];
  };

  const handleStudySessionClick = (levelId: number, session: StudySession) => {
    const locked = isLevelLocked(levelId);
    if (locked) return;

    const industryId = profile?.industryId;

    if (session.type === "flashcards") {
      navigate(
        `/learning/existing/levels/${levelId}/flashcards/${
          session.sessionNumber
        }${industryId ? `?industry_id=${industryId}` : ""}`
      );
    } else if (session.sessionNumber === 3) {
      navigate(
        `/learning/existing/levels/${levelId}/boss${
          industryId ? `?industry_id=${industryId}` : ""
        }`
      );
    } else {
      navigate(
        `/learning/existing/levels/${levelId}/quiz/take?quiz=${session.sessionNumber}${
          industryId ? `&industry_id=${industryId}` : ""
        }`
      );
    }
  };

  return (
    <div className="categoriesPage">
      <CategoriesCard
        title={`${getIndustryName(profile?.industryId)} Course`}
        onBack={() => navigate(-1)}
        bottomImages={[dictionaryBottom]}
      >
        {isLoading ? (
          <LoadingBar isLoading={isLoading} hasData={!!profile && !!levelsData} text="Loading course" />
        ) : error ? (
          <div className="error-message">
            {error instanceof Error ? error.message : "Failed to load levels"}
          </div>
        ) : (
          <div className="categoriesList">
            {levels.map((level) => {
              const locked = isLevelLocked(level.id);
              const badge = getBadgeForLevel(profile?.industryId, level.id);

              const isLevel4 = level.id === 4;
              const isRedSeal = level.id === 5;

              return (
                <CategoryFolder
                  key={level.id}
                  title={`Apprentice ${level.id}`}
                  icon={badge}
                  locked={locked}
                  completed={level.completed}
                >
                  {!isLevel4 && !isRedSeal && (
                    <div className="document-list">
                      {getStudySessions(level.id).map((session) => {
                        return (
                          <div
                            key={session.id}
                            className="document-item"
                            onClick={() => handleStudySessionClick(level.id, session)}
                          >
                            <div className="document-info">
                              <span className="document-name">{session.name}</span>
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
                        );
                      })}
                    </div>
                  )}
                  {isLevel4 && (
                    <div className="document-list">
                      {/* Level 4 uses Level 3 content for first 4 sessions, but has its own boss quiz */}
                      {getStudySessions(3).map((session) => {
                        // For the challenge quiz (session 3), link to level 4's boss page
                        const isChallenge = session.sessionNumber === 3;
                        return (
                          <div
                            key={session.id}
                            className="document-item"
                            onClick={() => {
                              if (isChallenge) {
                                // Navigate to level 4's boss page
                                const industryId = profile?.industryId;
                                navigate(
                                  `/learning/existing/levels/4/boss${
                                    industryId ? `?industry_id=${industryId}` : ""
                                  }`
                                );
                              } else {
                                // Use level 3's content for other sessions
                                handleStudySessionClick(3, session);
                              }
                            }}
                          >
                            <div className="document-info">
                              <span className="document-name">{session.name}</span>
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
                        );
                      })}
                    </div>
                  )}
                </CategoryFolder>
              );
            })}
          </div>
        )}
      </CategoriesCard>
    </div>
  );
}
