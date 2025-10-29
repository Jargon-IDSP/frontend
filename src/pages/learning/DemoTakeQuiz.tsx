import { useNavigate } from 'react-router-dom';
import goBackIcon from '../../assets/icons/goBackIcon.svg';
import StudyTypeCard from '../../components/learning/StudyType';
import readBook from '../../assets/readBook.png';
import demoTermCard from '../../assets/demoTermCard.png';
import studyLaptop from '../../assets/studyLaptop.png';

export default function DemoTakeQuiz() {
  const navigate = useNavigate();
  const quizId = 'cd81eda1-ea47-4b09-9ab1-d47284aefa0f';
  const docId = 'cmha47br90001ztmchu5awy17';

  const handleStartQuiz = () => {
    navigate(`/learning/custom/quiz/take?quizId=${quizId}`);
  };

  const handleTerminology = () => {
    navigate(`/learning/documents/${docId}/terms`);
  };

  return (
    <div className="demo">
    <img src={goBackIcon} alt="back button" />
      <h1>level-2-acronyms.pdf</h1>
      <h1>...</h1>

      <button>Lesson</button>
      <button>Document</button>

      <img src={demoTermCard} alt="Demo Term Card" />

      <StudyTypeCard
        name="Terminology"
        img={readBook}
        start_button_text="Start Learning"
        onClick={handleTerminology}
      />    

      <StudyTypeCard
        name="Quiz"
        img={studyLaptop}
        start_button_text="Start Quiz"
        onClick={handleStartQuiz}
      />
    </div>
  );
}
