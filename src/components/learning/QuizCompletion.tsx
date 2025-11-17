import Star from '../../assets/icons/star.svg';
import type { QuizCompletionProps } from '../../types/components/quiz';
import { useUserBadges } from '../../hooks/useUserBadges';
import { useMemo } from 'react';
import goBackIcon from "../../assets/icons/goBackIcon.svg";

const badgeModules = import.meta.glob<string>('../../assets/badges/**/*.svg', {
  eager: true,
  import: 'default'
});

export default function QuizCompletion({
  score,
  totalQuestions: _totalQuestions,
  onBack,
  isBossQuiz = false,
  passed = true,
}: QuizCompletionProps) {
  const { data: userBadges } = useUserBadges();

  const failedBossQuiz = isBossQuiz && !passed;

const headingMessage = failedBossQuiz
    ? 'So Close!'
    : isBossQuiz
    ? 'Congrats!'
    : 'Awesome!';

  const completionMessage = failedBossQuiz
    ? 'Try again to earn your badge'
    : isBossQuiz
    ? 'You completed your course'
    : "You've finished this lesson";
  const pointsPerQuestion = isBossQuiz ? 20 : 10;

  const latestBadge = userBadges && userBadges.length > 0 ? userBadges[0] : null;

  const badgeIconUrl = useMemo(() => {
    if (latestBadge?.badge?.iconUrl) {
      const iconPath = latestBadge.badge.iconUrl;
      const fullPath = `../../assets/badges/${iconPath}`;
      const url = badgeModules[fullPath];
      if (url) {
        return url;
      } else {
        console.error('❌ Badge not in glob. Tried:', fullPath, 'Available:', Object.keys(badgeModules));
        return null;
      }
    }
    console.log('⚠️ No badge iconUrl found:', { latestBadge, userBadges });
    return null;
  }, [latestBadge, userBadges]);

  return (
      <div className="container">
      <div className="quiz-page-wrapper">
        <div className="quiz-header">
          <button
            className="back-to-quiz-button"
            onClick={onBack}
            aria-label="Back to Quizzes"
          >
            <img src={goBackIcon} alt="Back" />
          </button>
          </div>
        <div className="quizCompletion">
        <div className="points">
        <h1>{score * pointsPerQuestion}</h1>
        <img src={Star} alt="Star" />
        </div>
              <h2>{headingMessage}!</h2>
              <h2> {completionMessage}</h2>

              {isBossQuiz && !failedBossQuiz && badgeIconUrl ? (
                <>
                  <img className="badgeIcon" src={badgeIconUrl} alt="Badge" />
                  <p>You got a new badge to your collection!</p>
                  <p className="smallNote">You can view all your achievements on your profile page.</p>
                </>
              ) : (
                <img className="rockyIcon" src="/rockyYellow.svg" alt="Rocky" />
              )}

      </div>

      <div>
        <button className="returnToLesson"onClick={onBack}>Back to Lessons</button>
      </div>
      </div>
    </div>
  );
}