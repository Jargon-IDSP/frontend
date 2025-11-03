import Star from '../../assets/icons/star.svg';
import Hat from '../../assets/icons/hat.svg';
import type { QuizCompletionProps } from '../../types/components/quiz';

export default function QuizCompletion({
  score,
  onBack,
  quizType = 'custom',
}: QuizCompletionProps) {
  const completionMessage = quizType === 'existing'
    ? 'You finished your Red Seal course!'
    : 'You completed your customized course!';

  return (
    <div className="container">
      <div className="quizCompletion">
        <div className="points">
        <h1>{score * 10}</h1>
        <img src={Star} alt="Star" />
        </div>
              <h2>Awesome!</h2>
              <h2> {completionMessage}</h2>
              <img className="hatIcon"src={Hat} alt="Hat" />
              <p> You got a new badge to your collection!</p>
              <p className="smallNote">You can view all your achievements on your profile page.</p>

      </div>

      <div>
        <button className="returnToLesson"onClick={onBack}>Back to Lessons</button>
      </div>
    </div>
  );
}