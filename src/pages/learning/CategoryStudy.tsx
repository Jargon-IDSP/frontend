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

  return (
    <div
      style={{
        border: '2px solid #3b82f6',
        borderRadius: '8px',
        padding: '1.5rem',
        backgroundColor: '#eff6ff',
      }}
    >
      <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {filename}
        <span style={{
          fontSize: '0.75rem',
          backgroundColor: '#3b82f6',
          color: 'white',
          padding: '0.25rem 0.5rem',
          borderRadius: '4px',
          fontWeight: 'bold'
        }}>
          PROCESSING
        </span>
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {steps.map((step) => (
          <div key={step.name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: step.complete ? '#10b981' : '#e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              {step.complete ? '✓' : ''}
            </div>
            <span style={{
              fontSize: '0.875rem',
              color: step.complete ? '#10b981' : '#6b7280',
              fontWeight: step.complete ? '500' : '400'
            }}>
              {step.name}
            </span>
          </div>
        ))}
      </div>

      {status.hasFlashcards && status.flashcardCount > 0 && (
        <p style={{
          marginTop: '1rem',
          fontSize: '0.875rem',
          color: '#6b7280',
          paddingTop: '1rem',
          borderTop: '1px solid #cbd5e1'
        }}>
          Generated {status.flashcardCount} flashcard{status.flashcardCount !== 1 ? 's' : ''}
          {status.questionCount > 0 && ` • ${status.questionCount} question${status.questionCount !== 1 ? 's' : ''}`}
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

  // Get the document ID from navigation state if user just uploaded
  const justUploadedDocId = location.state?.documentId;
  const justUploaded = location.state?.justUploaded;

  // Poll status for the just-uploaded document
  const { data: statusData, isLoading: statusLoading } = useDocumentProcessingStatus({
    documentId: justUploaded ? justUploadedDocId : null,
    pollingInterval: 3000,
  });

  // Refetch documents list when processing completes
  useEffect(() => {
    if (statusData?.status.status === 'completed') {
      refetch();
      queryClient.invalidateQueries({ queryKey: ['documents', 'by-category', category] });
    }
  }, [statusData?.status.status, refetch, queryClient, category]);

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <Button
        onClick={() => navigate('/learning/custom/categories')}
        variant="secondary"
        style={{ marginBottom: '1rem' }}
      >
        ← Back to My Generated Lessons
      </Button>

      <h1>{categoryName} Category</h1>

      <h2 style={{ marginTop: '2rem', marginBottom: '1rem' }}>
        Study by Document
      </h2>

      {/* Show just-uploaded document at the top if processing */}
      {justUploaded && statusData && statusData.status.status === 'processing' && (
        <div style={{ marginBottom: '1rem' }}>
          <ProcessingDocumentCard
            filename={statusData.document.filename}
            status={statusData.status}
          />
        </div>
      )}

      {/* Show loading state for status if we're waiting for the just-uploaded document */}
      {justUploaded && statusLoading && !statusData && (
        <div style={{
          border: '2px solid #3b82f6',
          borderRadius: '8px',
          padding: '1.5rem',
          backgroundColor: '#eff6ff',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          <p style={{ color: '#3b82f6', fontWeight: '500' }}>
            Uploading your document...
          </p>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
            Please wait while we process your file
          </p>
        </div>
      )}

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
          Loading documents...
        </div>
      ) : documents.length === 0 && !justUploaded ? (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          color: '#6b7280'
        }}>
          <p>No documents in the {categoryName} category yet.</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Upload and process documents to see them here!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

          {documents.map((doc) => {
            // Skip the just-uploaded doc if it's still processing (we show it above)
            if (justUploaded && doc.id === justUploadedDocId && statusData?.status.status === 'processing') {
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
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  backgroundColor: isProcessing ? '#f9fafb' : 'white',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: isProcessing ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isProcessing) {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isProcessing) {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                      {doc.filename}
                    </h3>
                    {isProcessing ? (
                      <p style={{ color: '#f59e0b', fontSize: '0.875rem', fontWeight: '500' }}>
                        Processing document...
                      </p>
                    ) : (
                      <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
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
