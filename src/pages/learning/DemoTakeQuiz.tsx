import { useNavigate } from 'react-router-dom';
import StudyTypeCard from '../../components/learning/StudyType';
import DocumentNav from '../../components/DocumentNav';
import readBook from '../../assets/readBook.png';
import demoTermCard from '../../assets/demoTermCard.png'
import studyLaptop from '../../assets/studyLaptop.png';

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

  const handleBackClick = () => {
    navigate('/learning/custom');
  };

  return (
    <div className="container demo">
      <DocumentNav 
        activeTab="lesson"
        title="Level 2 Acronyms"
        onDocumentClick={handleDemoDocs}
        onBackClick={handleBackClick}
      />

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
