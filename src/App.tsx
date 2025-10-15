import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
  useAuth,
} from "@clerk/clerk-react";

import ProtectedRoute from "./components/ProtectedRoute";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import DocumentsPage from "./pages/DocumentsPage";
import RandomQuestionsStepper from "./pages/RandomQuestionsStepper";
import HappyRocky from "./components/avatar/HappyRocky";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

/** ---------- OCR Results Modal Component ---------- */
interface OCRModalProps {
  document: any;
  onClose: () => void;
}

function OCRResultsModal({ document, onClose }: OCRModalProps) {
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"formatted" | "json">("json");
  const { getToken } = useAuth();

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const token = await getToken();
        const res = await fetch(
          `${BACKEND_URL}/custom-flashcards?documentId=${document.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setFlashcards(data.flashcards || []);
        }
      } catch (err) {
        console.error("Error fetching flashcards:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcards();
  }, [document.id, getToken]);

  const jsonData = {
    document: {
      id: document.id,
      filename: document.filename,
      fileType: document.fileType,
      fileSize: document.fileSize,
      ocrProcessed: document.ocrProcessed,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    },
    extractedText: document.extractedText,
    textLength: document.extractedText?.length || 0,
    flashcards: flashcards,
    flashcardsCount: flashcards.length,
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(jsonData, null, 2));
    alert("JSON copied to clipboard!");
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "2rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "8px",
          padding: "2rem",
          maxWidth: "900px",
          width: "100%",
          maxHeight: "80vh",
          overflow: "auto",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
            borderBottom: "2px solid #e5e7eb",
            paddingBottom: "1rem",
          }}
        >
          <h2 style={{ margin: 0, color: "#1f2937" }}>
            📄 {document.filename}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "#6b7280",
            }}
          >
            ×
          </button>
        </div>

        {/* View Mode Toggle */}
        <div
          style={{
            marginBottom: "1rem",
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => setViewMode("formatted")}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: viewMode === "formatted" ? "#3b82f6" : "#e5e7eb",
              color: viewMode === "formatted" ? "white" : "#374151",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            Formatted View
          </button>
          <button
            onClick={() => setViewMode("json")}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: viewMode === "json" ? "#3b82f6" : "#e5e7eb",
              color: viewMode === "json" ? "white" : "#374151",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "500",
            }}
          >
            JSON View
          </button>
          {viewMode === "json" && (
            <button
              onClick={copyToClipboard}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "#10b981",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500",
                marginLeft: "auto",
              }}
            >
              📋 Copy JSON
            </button>
          )}
        </div>

        {/* JSON View */}
        {viewMode === "json" ? (
          <div>
            <pre
              style={{
                backgroundColor: "#1f2937",
                color: "#f9fafb",
                padding: "1.5rem",
                borderRadius: "6px",
                overflow: "auto",
                maxHeight: "60vh",
                fontSize: "0.875rem",
                fontFamily: "monospace",
                margin: 0,
              }}
            >
              {JSON.stringify(jsonData, null, 2)}
            </pre>
          </div>
        ) : (
          /* Formatted View */
          <div>
            {/* Extracted Text Section */}
            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{ color: "#374151", marginBottom: "0.5rem" }}>
                📝 Extracted Text
              </h3>
              <div
                style={{
                  backgroundColor: "#f9fafb",
                  padding: "1rem",
                  borderRadius: "6px",
                  border: "1px solid #e5e7eb",
                  maxHeight: "200px",
                  overflow: "auto",
                  whiteSpace: "pre-wrap",
                  fontFamily: "monospace",
                  fontSize: "0.875rem",
                }}
              >
                {document.extractedText || "No text extracted"}
              </div>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "#6b7280",
                  marginTop: "0.5rem",
                }}
              >
                Length: {document.extractedText?.length || 0} characters
              </p>
            </div>

            {/* Flashcards Section */}
            <div>
              <h3 style={{ color: "#374151", marginBottom: "0.5rem" }}>
                🎴 Flashcards Created ({flashcards.length})
              </h3>
              {loading ? (
                <p style={{ color: "#6b7280" }}>Loading flashcards...</p>
              ) : flashcards.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  {flashcards.map((card, index) => (
                    <div
                      key={card.id || index}
                      style={{
                        backgroundColor: "#f9fafb",
                        padding: "1rem",
                        borderRadius: "6px",
                        border: "1px solid #e5e7eb",
                      }}
                    >
                      <div style={{ marginBottom: "0.5rem" }}>
                        <strong style={{ color: "#1f2937" }}>Term:</strong>
                        <p
                          style={{ margin: "0.25rem 0 0 0", color: "#374151" }}
                        >
                          {card.termEnglish}
                        </p>
                      </div>
                      <div>
                        <strong style={{ color: "#1f2937" }}>
                          Definition:
                        </strong>
                        <p
                          style={{ margin: "0.25rem 0 0 0", color: "#374151" }}
                        >
                          {card.definitionEnglish}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: "#6b7280" }}>
                  No flashcards created from this document yet.
                </p>
              )}
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          style={{
            marginTop: "1.5rem",
            padding: "0.75rem 1.5rem",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: "500",
            width: "100%",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}

/** ---------- OCR Documents List Component ---------- */
function OCRDocumentsList() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<any | null>(null);
  const { getToken } = useAuth();

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/documents`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error("Error fetching documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const ocrProcessedDocs = documents.filter((doc) => doc.ocrProcessed);

  if (loading) {
    return <div style={{ padding: "1rem" }}>Loading documents...</div>;
  }

  if (ocrProcessedDocs.length === 0) {
    return (
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          backgroundColor: "#f9fafb",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
        }}
      >
        <p style={{ color: "#6b7280", margin: 0 }}>
          No OCR processed documents yet. Upload and process a document to see
          results here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: "1rem", color: "#1f2937" }}>
        📚 OCR Processed Documents ({ocrProcessedDocs.length})
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {ocrProcessedDocs.map((doc) => (
          <div
            key={doc.id}
            style={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "1.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  margin: "0 0 0.5rem 0",
                  color: "#1f2937",
                  fontSize: "1.125rem",
                }}
              >
                📄 {doc.filename}
              </h3>
              <div
                style={{ display: "flex", gap: "1rem", fontSize: "0.875rem" }}
              >
                <span style={{ color: "#6b7280" }}>
                  Type: {doc.fileType || "Unknown"}
                </span>
                <span style={{ color: "#6b7280" }}>
                  Size: {Math.round((doc.fileSize || 0) / 1024)} KB
                </span>
                <span
                  style={{
                    color: "#10b981",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  ✓ OCR Processed
                </span>
              </div>
              {doc.extractedText && (
                <p
                  style={{
                    margin: "0.5rem 0 0 0",
                    color: "#6b7280",
                    fontSize: "0.875rem",
                  }}
                >
                  Preview: {doc.extractedText.substring(0, 100)}
                  {doc.extractedText.length > 100 ? "..." : ""}
                </p>
              )}
            </div>
            <button
              onClick={() => setSelectedDoc(doc)}
              style={{
                padding: "0.75rem 1.5rem",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500",
                whiteSpace: "nowrap",
                marginLeft: "1rem",
              }}
            >
              View Contents
            </button>
          </div>
        ))}
      </div>

      {selectedDoc && (
        <OCRResultsModal
          document={selectedDoc}
          onClose={() => setSelectedDoc(null)}
        />
      )}
    </div>
  );
}

/** ---------- Home Page (signed-in content + buttons) ---------- */
function HomePage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const navigate = useNavigate();

  const makeUnauthenticatedRequest = async (url: string) => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Unable to fetch data`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const fetchHome = async () => {
    await makeUnauthenticatedRequest(BACKEND_URL);
  };

  const fetchChat = () => navigate("/chat");
  const fetchProfile = () => navigate("/profile");
  const fetchDocuments = () => navigate("/documents");
  const openRandomQuestions = () => navigate("/random-questions");

  const fetchHelp = async () => {
    try {
      setError(null);
      const res = await fetch(`${BACKEND_URL}/help`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errorMsg);
      console.error("Error fetching data:", err);
    }
  };

  const fetchRandomFlashcard = async () => {
    try {
      setError(null);
      const res = await fetch(`${BACKEND_URL}/flashcards/random`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errorMsg);
      console.error("Error fetching data:", err);
    }
  };

  const fetchFlashcards = async () => {
    try {
      setError(null);
      const res = await fetch(`${BACKEND_URL}/flashcards`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errorMsg);
      console.error("Error fetching data:", err);
    }
  };

  const fetchRandomQuestion = async () => {
    try {
      setError(null);
      const res = await fetch(`${BACKEND_URL}/questions/random`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errorMsg);
      console.error("Error fetching data:", err);
    }
  };

  return (
    <header>
      <SignedOut>
        <SignInButton />
        <div style={{ padding: "2rem" }}>
          <h1>Welcome to Jargon!</h1>
          <HappyRocky />
        </div>
      </SignedOut>

      <SignedIn>
        <UserButton />

        <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
          <h1>Welcome {user?.firstName || user?.username || "User"}</h1>

          {/* OCR Documents Section */}
          <div style={{ marginTop: "2rem", marginBottom: "2rem" }}>
            <OCRDocumentsList />
          </div>

          {/* Divider */}
          <hr
            style={{
              margin: "2rem 0",
              border: "none",
              borderTop: "1px solid #e5e7eb",
            }}
          />

          {/* Navigation Buttons */}
          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ marginBottom: "1rem", color: "#1f2937" }}>
              Navigation
            </h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              <button
                style={{ padding: "0.75rem 1rem" }}
                onClick={openRandomQuestions}
              >
                Random Questions (Stepper)
              </button>
              <button style={{ padding: "0.75rem 1rem" }} onClick={fetchChat}>
                Chat Page
              </button>
              <button
                style={{ padding: "0.75rem 1rem" }}
                onClick={fetchProfile}
              >
                Profile Page
              </button>
              <button
                style={{ padding: "0.75rem 1rem" }}
                onClick={fetchDocuments}
              >
                Documents Page
              </button>
            </div>
          </div>

          {/* API Testing Section */}
          <details style={{ marginTop: "2rem" }}>
            <summary
              style={{
                cursor: "pointer",
                fontWeight: "bold",
                marginBottom: "1rem",
              }}
            >
              API Testing Tools
            </summary>

            {error && (
              <div
                style={{
                  color: "red",
                  padding: "1rem",
                  border: "1px solid red",
                  marginBottom: "1rem",
                  borderRadius: "4px",
                }}
              >
                Error: {error}
              </div>
            )}

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              <button style={{ padding: "0.75rem 1rem" }} onClick={fetchHome}>
                Fetch Home
              </button>
              <button style={{ padding: "0.75rem 1rem" }} onClick={fetchHelp}>
                Fetch Help
              </button>
              <button
                style={{ padding: "0.75rem 1rem" }}
                onClick={fetchRandomFlashcard}
              >
                Random Flashcard
              </button>
              <button
                style={{ padding: "0.75rem 1rem" }}
                onClick={fetchFlashcards}
              >
                All Flashcards
              </button>
              <button
                style={{ padding: "0.75rem 1rem" }}
                onClick={fetchRandomQuestion}
              >
                Random Question
              </button>
            </div>

            {data && (
              <pre
                style={{
                  marginTop: "1rem",
                  padding: "1rem",
                  backgroundColor: "#f9fafb",
                  borderRadius: "6px",
                  overflow: "auto",
                  maxHeight: "400px",
                }}
              >
                {JSON.stringify(data, null, 2)}
              </pre>
            )}
          </details>
        </div>
      </SignedIn>
    </header>
  );
}

/** ---------- App Router ---------- */
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents"
          element={
            <ProtectedRoute>
              <DocumentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/random-questions"
          element={
            <ProtectedRoute>
              <RandomQuestionsStepper />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
