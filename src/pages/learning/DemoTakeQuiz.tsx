import { useNavigate } from 'react-router-dom';
import goBackIcon from '../../assets/icons/goBackIcon.svg';
import translateFileIcon from '../../assets/icons/translateFileIcon.svg';
import StudyTypeCard from '../../components/learning/StudyType';
import readBook from '../../assets/readBook.png';
import demoTermCard from '../../assets/demoTermCard.png'
import studyLaptop from '../../assets/studyLaptop.png';
import lessonIcon from '../../assets/icons/lessonIcon.svg';

export default function DemoTakeQuiz() {
  const navigate = useNavigate();
  const quizId = 'cd81eda1-ea47-4b09-9ab1-d47284aefa0f';
  const documentId = 'cmha47br90001ztmchu5awy17';

  const handleStartQuiz = () => {
    navigate(`/learning/custom/quiz/take?quizId=${quizId}`);
  };

  const handleTerminology = () => {
    navigate(`/learning/documents/${documentId}/terms`);
  };

  const handleDemoDocs = () => {
    navigate(`/documents/${documentId}/translation`);
  };

  return (
    <div className="container demo">
      <div className="top">
    <img src={goBackIcon} alt="back button" />
      <h1>Level 2 Acronyms</h1>
      <h2>...</h2>
      </div>

      <div className="switch-view">
      <button className='demoLesson'><img src={lessonIcon} alt="file icon" />Lesson</button>
      <button className='demoDocs' onClick={handleDemoDocs}><img src={translateFileIcon} alt="file icon" />Document</button>
      </div>

      <img className="demo-term-card" src={demoTermCard} alt="Demo Term Card" />

      <StudyTypeCard
        name="Terminology"
        img={readBook}
        start_button_text="Start Learning"
        onClick={handleTerminology}
        color={"blue"}
      />    

      <StudyTypeCard
        name="Quiz"
        img={studyLaptop}
        start_button_text="Start the Quiz"
        onClick={handleStartQuiz}
        color={"red"}
      />
    </div>
  );
}
