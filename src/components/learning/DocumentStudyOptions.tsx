import { useNavigate } from 'react-router-dom';
import { useDocumentQuizzes } from '../../hooks/useDocumentQuizzes';
import StudyTypeCard from './StudyType';
import readBook from '../../assets/readBook.png';
import studyLaptop from '../../assets/studyLaptop.png';
import '../../styles/components/_studyType.scss';

interface DocumentStudyOptionsProps {
  documentId: string;
  documentTitle?: string;
  terminologyColor?: string;
  quizColor?: string;
}

/**
 * DocumentStudyOptions - Reusable component that displays study options for a document
 * Shows cards for:
 * - Terminology (flashcards)
 * - Quiz (take quiz)
 *
 * @param documentId - ID of the document to study
 * @param documentTitle - Optional title to display
 * @param terminologyColor - Color for the terminology card (default: "blue")
 * @param quizColor - Color for the quiz card (default: "red")
 */
export default function DocumentStudyOptions({
  documentId,
  documentTitle,
  terminologyColor = "blue",
  quizColor = "red"
}: DocumentStudyOptionsProps) {
  const navigate = useNavigate();
  const { data: quizzes = [], isLoading } = useDocumentQuizzes(documentId);

  const handleTerminology = () => {
    navigate(`/learning/documents/${documentId}/terms`);
  };

  const handleStartQuiz = () => {
    // If there are quizzes for this document, navigate to the first one
    if (quizzes.length > 0) {
      navigate(`/learning/custom/quiz/take?quizId=${quizzes[0].id}`);
    } else {
      // Fallback to document quizzes page if no quizzes found
      navigate(`/learning/documents/${documentId}/quizzes`);
    }
  };

  return (
    <div className="document-study-options">
      {documentTitle && (
        <h2 style={{ marginBottom: '1rem', textAlign: 'center' }}>
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
