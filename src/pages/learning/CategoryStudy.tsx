import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Button from "../../components/learning/ui/Button";
import { useDocumentsByCategory } from '../../hooks/useDocumentsByCategory';
import { useDocumentProcessingStatus } from '../../hooks/useDocumentProcessingStatus';
import { useQueryClient } from '@tanstack/react-query';

const categoryNames: Record<string, string> = {
  'safety': 'Safety',
  'technical': 'Technical',
  'training': 'Training',
  'workplace': 'Workplace',
  'professional': 'Professional',
  'general': 'General'
};

interface ProcessingDocumentCardProps {
  filename: string;
  status: {
    hasTranslation: boolean;
    hasFlashcards: boolean;
    hasQuiz: boolean;
    flashcardCount: number;
    questionCount: number;
  };
}

function ProcessingDocumentCard({ filename, status }: ProcessingDocumentCardProps) {
  const steps = [
    { name: 'Translation', complete: status.hasTranslation },
    { name: 'Flashcards', complete: status.hasFlashcards },
    { name: 'Questions', complete: status.hasQuiz },
  ];

  const activeStepIndex = steps.findIndex(step => !step.complete);

  return (
    <div className="processing-card">
      <h3 className="processing-card__header">
        {filename}
        <span className="processing-card__badge">
          PROCESSING
        </span>
      </h3>

      <div className="processing-card__steps">
        {steps.map((step, index) => {
          const isActive = index === activeStepIndex && !step.complete;
          const indicatorClass = step.complete
            ? 'processing-card__step-indicator--complete'
            : isActive
            ? 'processing-card__step-indicator--active'
            : 'processing-card__step-indicator--pending';

          const labelClass = step.complete
            ? 'processing-card__step-label--complete'
            : isActive
            ? 'processing-card__step-label--active'
            : 'processing-card__step-label--pending';

          return (
            <div key={step.name} className="processing-card__step">
              <div className={`processing-card__step-indicator ${indicatorClass}`}>
                {step.complete ? '✓' : isActive ? '...' : ''}
              </div>
              <span className={`processing-card__step-label ${labelClass}`}>
                {step.name}
                {isActive && <span className="processing-card__progress-text">(in progress)</span>}
              </span>
            </div>
          );
        })}
      </div>

      {(status.flashcardCount > 0 || status.questionCount > 0) && (
        <p className="processing-card__stats">
          {status.flashcardCount > 0 && `✓ Generated ${status.flashcardCount} flashcard${status.flashcardCount !== 1 ? 's' : ''}`}
          {status.flashcardCount > 0 && status.questionCount > 0 && ' • '}
          {status.questionCount > 0 && `${status.questionCount} question${status.questionCount !== 1 ? 's' : ''}`}
        </p>
      )}
    </div>
  );
}

export default function CategoryStudy() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { category } = useParams<{ category: string }>();

  const categoryName = category ? categoryNames[category.toLowerCase()] || category : 'Category';

  const { data: documents = [], isLoading, refetch } = useDocumentsByCategory(category || 'general');

  const justUploadedDocId = location.state?.documentId;
  const justUploaded = location.state?.justUploaded;

  const { data: statusData, isLoading: statusLoading } = useDocumentProcessingStatus({
    documentId: justUploaded ? justUploadedDocId : null,
    pollingInterval: 1000, 
  });

  useEffect(() => {
    if (statusData?.status.status === 'completed') {
      // Invalidate queries to refresh the document list
      refetch();
      queryClient.invalidateQueries({ queryKey: ['documents', 'by-category', category] });

      // Immediately clear the upload state to hide the completion card and refresh the view
      window.history.replaceState({}, document.title);
    }
  }, [statusData?.status.status, refetch, queryClient, category]);

  return (
    <div className="category-study">
      <Button
        onClick={() => navigate('/learning/custom/categories')}
        variant="secondary"
        className="category-study__back-button"
      >
        ← Back to My Generated Lessons
      </Button>

      <h1 className="category-study__title">{categoryName} Category</h1>

      <h2 className="category-study__section-title">
        Study by Document
      </h2>

      {justUploaded && statusData && statusData.status.status === 'processing' && (
        <ProcessingDocumentCard
          filename={statusData.document.filename}
          status={statusData.status}
        />
      )}

      {justUploaded && statusData && statusData.status.status === 'completed' && (
        <div className="completion-card">
          <h3 className="completion-card__header">
            ✓ {statusData.document.filename}
            <span className="completion-card__badge">
              READY
            </span>
          </h3>
          <p className="completion-card__message">
            Your document has been successfully processed!
          </p>
          <div className="completion-card__stats">
            <span>✓ {statusData.status.flashcardCount} flashcards</span>
            <span>•</span>
            <span>✓ {statusData.status.questionCount} questions</span>
          </div>
        </div>
      )}

      {justUploaded && statusLoading && !statusData && (
        <div className="upload-loading-card">
          <p className="upload-loading-card__title">
            Uploading your document...
          </p>
          <p className="upload-loading-card__message">
            Please wait while we process your file
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="category-study__loading">
          Loading documents...
        </div>
      ) : documents.length === 0 && !justUploaded ? (
        <div className="category-study__empty-state">
          <p>No documents in the {categoryName} category yet.</p>
          <p className="category-study__empty-state-description">
            Upload and process documents to see them here!
          </p>
        </div>
      ) : (
        <div className="category-study__documents-list">
          {documents.map((doc) => {
            if (justUploaded && doc.id === justUploadedDocId) {
              return null;
            }

            const isProcessing = !doc.ocrProcessed || doc.flashcardCount === 0 || doc.questionCount === 0;

            return (
              <div
                key={doc.id}
                onClick={() => {
                  if (!isProcessing) {
                    navigate(`/learning/documents/${doc.id}/study`);
                  }
                }}
                className={`document-card ${isProcessing ? 'document-card--processing' : ''}`}
              >
                <div className="document-card__content">
                  <div className="document-card__details">
                    <h3 className="document-card__title">
                      {doc.filename}
                    </h3>
                    {isProcessing ? (
                      <p className="document-card__status document-card__status--processing">
                        Processing document...
                      </p>
                    ) : (
                      <p className="document-card__status document-card__status--ready">
                        {doc.flashcardCount} flashcards • {doc.questionCount} questions
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
