import Star from '../../assets/icons/star.svg';
import Hat from '../../assets/icons/hat.svg';
import type { QuizCompletionProps } from '../../types/components/quiz';
import { useUserBadges } from '../../hooks/useUserBadges';
import { useMemo } from 'react';

const badgeModules = import.meta.glob<string>('../../assets/badges/**/*.svg', {
  eager: true,
  import: 'default'
});

export default function QuizCompletion({
  score,
  onBack,
  quizType = 'custom',
  isBossQuiz = false,
}: QuizCompletionProps) {
  const { data: userBadges } = useUserBadges();

  const completionMessage = isBossQuiz
    ? 'You earned a new badge!'
    : quizType === 'existing'
    ? 'You completed your Red Seal practice quiz!'
    : 'You completed your customized course!';

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
    <div className="quiz-page-wrapper">
      <div className="container">
        <div className="quizCompletion">
        <div className="points">
        <h1>{score * pointsPerQuestion}</h1>
        <img src={Star} alt="Star" />
        </div>
              <h2>Awesome!</h2>
              <h2> {completionMessage}</h2>

              {!isBossQuiz && (
                <img className="hatIcon" src={Hat} alt="Celebration" />
              )}

              {isBossQuiz && badgeIconUrl && (
                <>
                  <img className="badgeIcon" src={badgeIconUrl} alt="Badge" />
                  <p>You got a new badge to your collection!</p>
                  <p className="smallNote">You can view all your achievements on your profile page.</p>
                </>
              )}

      </div>

      <div>
        <button className="returnToLesson"onClick={onBack}>Back to Lessons</button>
      </div>
      </div>
    </div>
  );
}