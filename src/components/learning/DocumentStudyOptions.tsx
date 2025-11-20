import { useNavigate } from 'react-router-dom';
import { useDocumentQuizzes } from '../../hooks/useDocumentQuizzes';
import StudyTypeCard from './StudyType';
import WordOfTheDay from '../WordOfTheDay';
import type { DocumentStudyOptionsProps } from '../../types/documentStudyOptions';
import '../../styles/components/_studyType.scss';

export default function DocumentStudyOptions({
  documentId,
  documentTitle,
  terminologyColor = "blue",
  quizColor = "red",
  showWordOfTheDay = false
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

      {showWordOfTheDay && (
        <WordOfTheDay
          documentId={documentId}
          backgroundColor="#FE4D13"
        />
      )}

      <StudyTypeCard
        name="Terminology"
        start_button_text="Start Learning"
        onClick={handleTerminology}
        color={terminologyColor}
      />

      <StudyTypeCard
        name="Quiz"
        start_button_text={isLoading ? "Loading..." : quizzes.length > 0 ? "Take Quiz" : "View Quizzes"}
        onClick={handleStartQuiz}
        color={quizColor}
      />
    </div>
  );
}
