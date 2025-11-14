import { useNavigate } from 'react-router-dom';
import { useDocumentQuizzes } from '../../hooks/useDocumentQuizzes';
import StudyTypeCard from './StudyType';
import readBook from '../../assets/readBook.png';
import studyLaptop from '../../assets/studyLaptop.png';
import type { DocumentStudyOptionsProps } from '../../types/documentStudyOptions';
import '../../styles/components/_studyType.scss';

export default function DocumentStudyOptions({
  documentId,
  documentTitle,
  terminologyColor = "blue",
  quizColor = "red"
}: DocumentStudyOptionsProps) {
  const navigate = useNavigate();
  const { data: quizzes = [], isLoading } = useDocumentQuizzes(documentId);

  const handleTerminology = () => {
    navigate(`/learning/documents/${documentId}/terminology`);
  };

  const handleStartQuiz = () => {
    if (quizzes.length > 0) {
      navigate(`/learning/custom/quiz/take?quizId=${quizzes[0].id}`);
    } else {
      navigate(`/learning/documents/${documentId}/study`);
    }
  };

  return (
    <div className="document-study-options">
      {documentTitle && (
        <h2 className="document-study-options__title">
          {documentTitle}
        </h2>
      )}

      <StudyTypeCard
        name="Terminology"
        img={readBook}
        start_button_text="Start Learning"
        onClick={handleTerminology}
        color={terminologyColor}
      />

      <StudyTypeCard
        name="Quiz"
        img={studyLaptop}
        start_button_text={isLoading ? "Loading..." : quizzes.length > 0 ? "Start the Quiz" : "View Quizzes"}
        onClick={handleStartQuiz}
        color={quizColor}
      />
    </div>
  );
}
