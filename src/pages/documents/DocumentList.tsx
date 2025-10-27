import { useNavigate } from "react-router-dom";
import { useDocuments } from "../../hooks/useDocuments";
import { useDeleteDocument } from "../../hooks/useDeleteDocument";
import type { Document, DocumentsListProps } from "../../types/document";

export function DocumentsList({ refresh }: DocumentsListProps) {
  const navigate = useNavigate();

  // Use custom hooks
  const {
    data: documents = [],
    isLoading: loading,
    error,
  } = useDocuments(refresh);
  const deleteMutation = useDeleteDocument();

  const handleDelete = async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) {
      return;
    }

    deleteMutation.mutate(documentId);
  };

  const getStatusBadge = (doc: Document) => {
    if (doc.status === "error") {
      return (
        <span style={{ color: "#ef4444", fontWeight: "bold" }}>✗ Error</span>
      );
    }
    return null;
  };

  if (loading) {
    return <div>Loading documents...</div>;
  }

  if (error) {
    return (
      <div style={{ color: "#ef4444" }}>
        {error instanceof Error ? error.message : "Failed to load documents"}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          backgroundColor: "#f9fafb",
          borderRadius: "8px",
        }}
      >
        <p style={{ color: "#6b7280" }}>
          No documents yet. Upload your first document above!
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2
        style={{
          fontSize: "1.25rem",
          fontWeight: "bold",
          marginBottom: "1rem",
        }}
      >
        My Documents ({documents.length})
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {documents.map((doc) => (
          <div
            key={doc.id}
            style={{
              padding: "1.5rem",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              backgroundColor: "white",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
              }}
            >
              <div style={{ flex: 1 }}>
                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "bold",
                    marginBottom: "0.5rem",
                  }}
                >
                  {doc.filename}
                </h3>
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    fontSize: "0.875rem",
                    color: "#6b7280",
                  }}
                >
                  <span>
                    Uploaded {new Date(doc.createdAt).toLocaleDateString()}
                  </span>
                  {getStatusBadge(doc) && (
                    <>
                      <span>•</span>
                      <span>{getStatusBadge(doc)}</span>
                    </>
                  )}
                </div>
              </div>

              {doc.ocrProcessed ? (
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={() => navigate(`/study/${doc.id}`)}
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "#3b82f6",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    Study
                  </button>

                  <button
                    onClick={() => handleDelete(doc.id)}
                    disabled={deleteMutation.isPending}
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: deleteMutation.isPending
                        ? "#9ca3af"
                        : "#ef4444",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: deleteMutation.isPending
                        ? "not-allowed"
                        : "pointer",
                    }}
                  >
                    {deleteMutation.isPending ? "Deleting..." : "Delete"}
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    padding: "0.75rem 1.5rem",
                    backgroundColor: "#fef3c7",
                    color: "#92400e",
                    border: "1px solid #fbbf24",
                    borderRadius: "6px",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                  }}
                >
                  ⏳ Processing...
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// import { useState, useEffect } from 'react';
// import { useAuth } from '@clerk/clerk-react';
// import { useNavigate } from 'react-router-dom';
// import { BACKEND_URL } from '../../lib/api';
// import type { Document, DocumentsListProps } from "../../types/document";

// export function DocumentsList({ refresh }: DocumentsListProps) {
//   const { getToken } = useAuth();
//   const navigate = useNavigate();
//   const [documents, setDocuments] = useState<Document[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     fetchDocuments();
//   }, [refresh]);

//   const fetchDocuments = async () => {
//     try {
//       const token = await getToken();
//       const res = await fetch(`${BACKEND_URL}/documents`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!res.ok) {
//         throw new Error('Failed to fetch documents');
//       }

//       const data = await res.json();
//       setDocuments(data.documents || []);
//       setLoading(false);
//     } catch (err) {
//       console.error('Error fetching documents:', err);
//       setError('Failed to load documents');
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (documentId: string) => {
//     if (!confirm('Are you sure you want to delete this document?')) {
//       return;
//     }

//     try {
//       const token = await getToken();
//       const res = await fetch(`${BACKEND_URL}/documents/${documentId}`, {
//         method: 'DELETE',
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!res.ok) {
//         throw new Error('Failed to delete document');
//       }

//       // Refresh the list
//       fetchDocuments();
//     } catch (err) {
//       console.error('Error deleting document:', err);
//       alert('Failed to delete document');
//     }
//   };

//   const getStatusBadge = (doc: Document) => {
//     if (doc.status === 'error') {
//       return <span style={{ color: '#ef4444', fontWeight: 'bold' }}>✗ Error</span>;
//     }
//     return null;
//   };

//   /*
//   // Manual trigger functions (for testing - kept commented)
//   const triggerOCR = async (documentId: string) => {
//     try {
//       const token = await getToken();
//       const res = await fetch(`${BACKEND_URL}/documents/${documentId}/ocr`, {
//         method: 'POST',
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (res.ok) {
//         alert('OCR processing started');
//         fetchDocuments();
//       }
//     } catch (err) {
//       console.error('Error triggering OCR:', err);
//     }
//   };

//   const generateFlashcards = async (documentId: string) => {
//     try {
//       const token = await getToken();
//       const res = await fetch(`${BACKEND_URL}/documents/${documentId}/generate-custom`, {
//         method: 'POST',
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (res.ok) {
//         alert('Flashcard generation started');
//         fetchDocuments();
//       }
//     } catch (err) {
//       console.error('Error generating flashcards:', err);
//     }
//   };
//   */

//   if (loading) {
//     return <div>Loading documents...</div>;
//   }

//   if (error) {
//     return <div style={{ color: '#ef4444' }}>{error}</div>;
//   }

//   if (documents.length === 0) {
//     return (
//       <div style={{
//         padding: '2rem',
//         textAlign: 'center',
//         backgroundColor: '#f9fafb',
//         borderRadius: '8px',
//       }}>
//         <p style={{ color: '#6b7280' }}>No documents yet. Upload your first document above!</p>
//       </div>
//     );
//   }

//   return (
//     <div>
//       <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>
//         My Documents ({documents.length})
//       </h2>

//       <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
//         {documents.map((doc) => (
//           <div
//             key={doc.id}
//             style={{
//               padding: '1.5rem',
//               border: '2px solid #e5e7eb',
//               borderRadius: '8px',
//               backgroundColor: 'white',
//             }}
//           >
//             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
//               <div style={{ flex: 1 }}>
//                 <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
//                   {doc.filename}
//                 </h3>
//                 <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
//                   <span>Uploaded {new Date(doc.createdAt).toLocaleDateString()}</span>
//                   {getStatusBadge(doc) && (
//                     <>
//                       <span>•</span>
//                       <span>{getStatusBadge(doc)}</span>
//                     </>
//                   )}
//                 </div>
//               </div>

//               {doc.ocrProcessed ? (
//                 <div style={{ display: 'flex', gap: '0.5rem' }}>
//                   <button
//                     onClick={() => navigate(`/study/${doc.id}`)}
//                     style={{
//                       padding: '0.5rem 1rem',
//                       backgroundColor: '#3b82f6',
//                       color: 'white',
//                       border: 'none',
//                       borderRadius: '6px',
//                       cursor: 'pointer',
//                       fontWeight: '600',
//                     }}
//                   >
//                     Study
//                   </button>

//                   <button
//                     onClick={() => handleDelete(doc.id)}
//                     style={{
//                       padding: '0.5rem 1rem',
//                       backgroundColor: '#ef4444',
//                       color: 'white',
//                       border: 'none',
//                       borderRadius: '6px',
//                       cursor: 'pointer',
//                     }}
//                   >
//                     Delete
//                   </button>
//                 </div>
//               ) : (
//                 <div style={{
//                   padding: '0.75rem 1.5rem',
//                   backgroundColor: '#fef3c7',
//                   color: '#92400e',
//                   border: '1px solid #fbbf24',
//                   borderRadius: '6px',
//                   fontSize: '0.875rem',
//                   fontWeight: '600',
//                 }}>
//                   ⏳ Processing...
//                 </div>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
