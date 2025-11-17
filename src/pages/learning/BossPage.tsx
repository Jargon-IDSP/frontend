import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useAvailableBadges } from "../../hooks/useAvailableBadges";
import { useApprenticeshipProgress } from "../../hooks/useApprenticeshipProgress";
import { usePrebuiltQuizzes } from "../../hooks/usePrebuiltQuizzes";
import { usePrebuiltQuizAttempt } from "../../hooks/usePrebuiltQuizAttempt";
import { useMemo } from "react";
import LoadingBar from "@/components/LoadingBar";
import WordOfTheDay from "@/components/WordOfTheDay";
import StudyTypeCard from "@/components/learning/StudyType";
import '../../styles/components/_studyType.scss';
import { getIndustryName } from "../../hooks/useUserPreferences";
import goBackIcon from "../../assets/icons/goBackIcon.svg";

const badgeModules = import.meta.glob<string>('../../assets/badges/**/*.svg', {
  eager: true,
  import: 'default'
});

const BossPage = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const [searchParams] = useSearchParams();
  const industryId = searchParams.get("industry_id");
  const navigate = useNavigate();
  const { data: availableBadges, isLoading } = useAvailableBadges();
  const { data: progressData } = useApprenticeshipProgress();

  // Fetch prebuilt quizzes for this level/industry
  const { data: prebuiltQuizzes } = usePrebuiltQuizzes(
    levelId ? parseInt(levelId) : undefined,
    industryId ? parseInt(industryId) : undefined
  );

  // Find the boss quiz (quiz number 3)
  const bossQuiz = useMemo(() => {
    return prebuiltQuizzes?.find(q => q.quizNumber === 3);
  }, [prebuiltQuizzes]);

  // Fetch the user's attempt for the boss quiz
  const { data: bossQuizAttempt } = usePrebuiltQuizAttempt(bossQuiz?.id);

  const industryName = getIndustryName(industryId ? parseInt(industryId) : undefined);

  // Check if boss quiz is locked (requires completing quizzes 1 and 2 first)
  const isBossQuizLocked = useMemo(() => {
    if (!progressData || !levelId || !industryId) return true;

    const progress = progressData.find(
      p => p.levelId === parseInt(levelId) &&
           p.industryId === parseInt(industryId)
    );

    // Boss quiz requires at least 2 quizzes completed
    return !progress || progress.quizzesCompleted < 2;
  }, [progressData, levelId, industryId]);

  const targetBadge = useMemo(() => {

    if (availableBadges && levelId && industryId) {
      const found = availableBadges.find(
        (badge) => {
          const matches = badge.levelId === parseInt(levelId) &&
            badge.industryId === parseInt(industryId);
          if (matches) {
            console.log('✅ Found matching badge:', badge);
          }
          return matches;
        }
      );

      if (!found) {
        console.log('❌ No badge found. All badges:', availableBadges.map(b => ({
          code: b.code,
          levelId: b.levelId,
          industryId: b.industryId
        })));
      }

      return found || null;
    }
    return null;
  }, [availableBadges, levelId, industryId]);

  const badgeIconUrl = useMemo(() => {
    if (targetBadge?.iconUrl) {
      const iconPath = targetBadge.iconUrl;
      const fullPath = `../../assets/badges/${iconPath}`;
      const url = badgeModules[fullPath];
      if (url) {
        return url;
      } else {
        console.error('❌ Badge not in glob. Tried:', fullPath, 'Available:', Object.keys(badgeModules));
        return null;
      }
    }
    console.log('⚠️ No badge iconUrl found:', { targetBadge, availableBadges });
    return null;
  }, [targetBadge]);

  if (isLoading) {
    return (
      <div className="container">
        <LoadingBar isLoading={isLoading} text="Loading boss challenge" />
      </div>
    );
  }

  return (
    <div className="container">
      <div className="bossPage">
        <div className="headerContent">
          <div className="navigation">
            <img
              src={goBackIcon}
              alt="Go back"
              className="categoriesBackButton"
              onClick={() => navigate(-1)}
            />
          </div>
          <div className="headerText">
                    <span className="apprenticeship"><h1>Apprenticeship</h1></span>
                    <span className="levelLabel"><h1>Level {levelId}</h1></span>
                    <span className="badge">{industryName}</span>
                    <p className="description">Score 70% or more on this final level 1 quiz to unlock apprenticeship level 2 content</p>
                </div>
                </div>

      {badgeIconUrl && (
        <div className="levelBadge">
        <img src={badgeIconUrl} alt="Level Badge" />
        </div>
      )}

      <div className="document-study-options">
        <div
          onClick={() => navigate(`/learning/existing/levels/${levelId}/terms?industry_id=${industryId}&all=true`)}
          style={{ cursor: 'pointer' }}
        >
          <WordOfTheDay backgroundColor="#FE4D13" showButton={true} />
        </div>

        <StudyTypeCard
          name="Terminology"
          start_button_text="Start Learning"
          onClick={() => navigate(`/learning/existing/levels/${levelId}/terminology?industry_id=${industryId}`)}
          color="blue"
        />

        <StudyTypeCard
          name="Quiz"
          start_button_text={bossQuizAttempt && bossQuizAttempt.completed ? "Take Quiz Again" : "Take Quiz"}
          onClick={() => navigate(`/learning/existing/levels/${levelId}/quiz/take?quiz=3&industry_id=${industryId}`)}
          color="red"
          isLocked={isBossQuizLocked}
          lockMessage={`*Complete all practice quizzes for Apprenticeship Level ${levelId} to unlock`}
          score={bossQuizAttempt?.completed ? bossQuizAttempt.percentCorrect : undefined}
        />
      </div>
    </div>
    </div>
  );
};

export default BossPage;
