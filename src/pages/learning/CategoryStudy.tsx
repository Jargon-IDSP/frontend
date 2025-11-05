import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
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
    quickTranslation?: boolean;
  };
  documentId?: string;
}

function ProcessingDocumentCard({ filename, status, documentId }: ProcessingDocumentCardProps) {
  const navigate = useNavigate();

  // If quick translation is available, user can start studying immediately
  const canStudy = status.quickTranslation && (status.flashcardCount > 0 || status.questionCount > 0);

  const steps = [
    { name: 'Translation', complete: status.hasTranslation || status.quickTranslation },
    { name: 'Flashcards', complete: status.hasFlashcards || (status.quickTranslation && status.flashcardCount > 0) },
    { name: 'Questions', complete: status.hasQuiz || (status.quickTranslation && status.questionCount > 0) },
  ];

  const activeStepIndex = steps.findIndex(step => !step.complete);

  return (
    <div
      className={`processing-card ${canStudy ? 'processing-card--clickable' : ''}`}
      onClick={() => {
        if (canStudy && documentId) {
          navigate(`/learning/documents/${documentId}/study`);
        }
      }}
      style={{ cursor: canStudy ? 'pointer' : 'default' }}
    >
      <h3 className="processing-card__header">
        {filename}
        <span className="processing-card__badge">
          {canStudy ? 'READY TO STUDY' : 'PROCESSING'}
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
          {status.flashcardCount > 0 && `Generated ${status.flashcardCount} flashcard${status.flashcardCount !== 1 ? 's' : ''}`}
          {status.flashcardCount > 0 && status.questionCount > 0 && ' and '}
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

  // Track if processing is complete to hide the completion card
  const [showCompletionCard, setShowCompletionCard] = useState(true);

  const { data: statusData, isLoading: statusLoading } = useDocumentProcessingStatus({
    documentId: justUploaded ? justUploadedDocId : null,
    pollingInterval: 1000,
  });

  useEffect(() => {
    if (statusData?.status.status === 'completed') {
      // Invalidate queries to refetch the document list
      refetch();
      queryClient.invalidateQueries({ queryKey: ['documents', 'by-category', category] });

      // Hide the completion card after a brief delay to allow the refetch to complete
      setTimeout(() => {
        setShowCompletionCard(false);
        window.history.replaceState({}, document.title);
      }, 500);
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
          documentId={statusData.document.id}
        />
      )}

      {justUploaded && statusData && statusData.status.status === 'completed' && showCompletionCard && (
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
            // Only hide the just-uploaded document if we're still showing the completion card
            if (justUploaded && doc.id === justUploadedDocId && showCompletionCard) {
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
