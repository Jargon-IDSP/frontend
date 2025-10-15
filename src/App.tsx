import { useState } from "react";
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
} from "@clerk/clerk-react";

// something
// export default function App() {
//   const [data, setData] = useState(null);
//   const { getToken } = useAuth();
//   useUser,
// } from "@clerk/clerk-react";

import ProtectedRoute from "./components/ProtectedRoute";
import ChatPage from "./pages/ChatPage";
import ProfilePage from "./pages/ProfilePage";
import DocumentsPage from "./pages/DocumentsPage";
import RandomQuestionsStepper from "./pages/RandomQuestionsStepper";
import HappyRocky from "./components/avatar/HappyRocky";

/** ---------- Home Page (signed-in content + buttons) ---------- */
function HomePage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const navigate = useNavigate();

  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

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
        {/* Navigate to the Random Questions Stepper page */}
        <button style={{ margin: "1rem" }} onClick={openRandomQuestions}>
          Open Random Questions (Stepper)
        </button>

        <UserButton />

        <div style={{ padding: "2rem" }}>
          <h1>Welcome {user?.firstName || user?.username || "User"}</h1>

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

          <button style={{ margin: "1rem" }} onClick={fetchHome}>
            Fetch Home Page
          </button>
          <button style={{ margin: "1rem" }} onClick={fetchChat}>
            Fetch Chat Page
          </button>
          <button style={{ margin: "1rem" }} onClick={fetchHelp}>
            Fetch Help Page
          </button>
          <button style={{ margin: "1rem" }} onClick={fetchProfile}>
            Fetch Profile Page
          </button>
          <button style={{ margin: "1rem" }} onClick={fetchRandomFlashcard}>
            Fetch Random Flashcard
          </button>
          <button style={{ margin: "1rem" }} onClick={fetchFlashcards}>
            Fetch All Flashcards
          </button>
          <button style={{ margin: "1rem" }} onClick={fetchRandomQuestion}>
            Fetch Random Question
          </button>
          <button style={{ margin: "1rem" }} onClick={fetchDocuments}>
            Fetch Documents Page
          </button>

          <pre>{JSON.stringify(data, null, 2)}</pre>
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