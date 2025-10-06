import { useState } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/clerk-react";

// Type definitions
interface Flashcard {
  id: string;
  term: {
    english: string;
    [language: string]: string;
  };
  definition: {
    english: string;
    [language: string]: string;
  };
  industry_id: number | null;
  level_id: number;
  industry: string;
  level: string;
}

interface FlashcardResponse {
  success: boolean;
  count: number;
  total?: number;
  page?: number;
  totalPages?: number;
  data: Flashcard[];
  filters?: {
    language?: string;
    industry_id?: string;
    level_id?: string;
  };
}

export default function App() {
  const [data, setData] = useState<any>(null);
  const [flashcards, setFlashcards] = useState<FlashcardResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  console.log("Backend URL:", BACKEND_URL); // Debug

  const fetchHome = async () => {
    try {
      setError(null);
      const res = await fetch(BACKEND_URL);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errorMsg);
      console.error("Error fetching data:", err);
    }
  };

  const fetchChat = async () => {
    try {
      setError(null);
      const res = await fetch(`${BACKEND_URL}/chat`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errorMsg);
      console.error("Error fetching data:", err);
    }
  };

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

  const fetchProfile = async () => {
    try {
      setError(null);
      const res = await fetch(`${BACKEND_URL}/profile`);
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

  // Fetch paginated flashcards
  const fetchFlashcards = async (page = 1, limit = 20, append = false) => {
    try {
      setError(null);
      if (append) setIsLoadingMore(true);

      const url = `${BACKEND_URL}/flashcards?page=${page}&limit=${limit}`;
      console.log("Fetching URL:", url);

      const res = await fetch(url);

      console.log("Response status:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error response body:", errorText);
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const json: FlashcardResponse = await res.json();
      console.log("Received flashcards:", json);

      setFlashcards((prev) => {
        if (page === 1 || !prev || !append) {
          return json;
        }

        return {
          ...json,
          data: [...prev.data, ...json.data],
        };
      });

      setCurrentPage(page);
      setData(json);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errorMsg);
      console.error("Error fetching flashcards:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const loadFlashcards = () => {
    setCurrentPage(1);
    fetchFlashcards(1, 20, false);
  };

  const loadMoreFlashcards = () => {
    if (flashcards && flashcards.page && flashcards.totalPages) {
      if (flashcards.page < flashcards.totalPages) {
        fetchFlashcards(currentPage + 1, 20, true);
      }
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
    <>
      <header>
        <SignedOut>
          <SignInButton />
          <div style={{ padding: "2rem" }}>
            <h1>Welcome to Jargon! 🗿</h1>
            <button style={{ margin: "1rem" }} onClick={fetchHome}>
              Fetch Home Page
            </button>
          </div>
        </SignedOut>
        <SignedIn>
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
            <button style={{ margin: "1rem" }} onClick={loadFlashcards}>
              Load Flashcards (Paginated)
            </button>
            <button style={{ margin: "1rem" }} onClick={fetchRandomQuestion}>
              Fetch Random Question
            </button>

            {flashcards && flashcards.data && flashcards.data.length > 0 && (
              <div style={{ margin: "1rem" }}>
                <p>
                  Showing {flashcards.data.length} of {flashcards.total}{" "}
                  flashcards
                  {flashcards.page &&
                    flashcards.totalPages &&
                    ` (Page ${flashcards.page} of ${flashcards.totalPages})`}
                </p>
                {flashcards.page &&
                  flashcards.totalPages &&
                  flashcards.page < flashcards.totalPages && (
                    <button
                      onClick={loadMoreFlashcards}
                      disabled={isLoadingMore}
                    >
                      {isLoadingMore ? "Loading..." : "Load More Flashcards"}
                    </button>
                  )}
              </div>
            )}

            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        </SignedIn>
      </header>
    </>
  );
}
