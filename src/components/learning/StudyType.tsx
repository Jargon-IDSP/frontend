import Button from "./ui/Button";
import '../../styles/components/_studyType.scss';
import type { StudyTypeCardProps } from '../../types/studyTypeCard';

export function StudyTypeCard(props: StudyTypeCardProps) {
  return (
    <div className={`study-type study-type--${props.color}`}>
      <div className="top">
        <h2 className="type">{props.name}</h2>
        </div>
        <img className="decoration" src={props.img} alt="study_type_img" />
      <div className="start_learning">
        <Button onClick={props.onClick}>
            <p>{props.start_button_text}</p>
        </Button>
      </div>
    </div>
  );
}

export default StudyTypeCard;
