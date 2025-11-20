import Button from "./ui/Button";
import '../../styles/components/_studyType.scss';
import type { StudyTypeCardProps } from '../../types/studyTypeCard';
import lockIcon from "../../assets/icons/lockIcon.svg";

export function StudyTypeCard(props: StudyTypeCardProps) {
  const handleClick = () => {
    if (!props.isLocked) {
      props.onClick();
    }
  };

  return (
    <>
      <div className="studyTypeHead">
        <h2>{props.name}</h2>
      </div>
      <div className={`study-type study-type-${props.color} ${props.isLocked ? 'study-type-locked' : ''} ${props.score !== undefined ? 'study-type-with-score' : ''}`}>
        {props.score !== undefined && (
          <div className="study-type-score">
            <div className="score-label">Score:</div>
            <div className="score-value">{props.score}%</div>
          </div>
        )}
        <div className="study-type-actions">
          <Button onClick={handleClick} disabled={props.isLocked}>
            {props.isLocked && (
              <img src={lockIcon} alt="Locked" className="button-lock-icon" />
            )}
            <p>{props.start_button_text}</p>
          </Button>
          {props.isLocked && props.lockMessage && (
            <p className="lock-message">{props.lockMessage}</p>
          )}
        </div>
      </div>
    </>
  );
}

export default StudyTypeCard;
