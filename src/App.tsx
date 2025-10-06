import { useState } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useAuth,
  useUser,
} from "@clerk/clerk-react";
// something
// export default function App() {
//   const [data, setData] = useState(null);
//   const { getToken } = useAuth();
//   useUser,
// } from "@clerk/clerk-react";

export default function App() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const { getToken } = useAuth();

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";

  const makeAuthenticatedRequest = async (url: string) => {
    try {
      const token = await getToken();
      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Unable to fetch data`);
      }
      
      const json = await res.json();
      setData(json);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errorMsg);
      console.error("Error fetching data:", err);
    }
  };

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

  const fetchChat = async () => {
    await makeAuthenticatedRequest(`${BACKEND_URL}/chat`);
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
    await makeAuthenticatedRequest(`${BACKEND_URL}/profile`);
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

  // const fetchRandomQuestion = async () => {
  //   try {
  //     const res = await fetch("http://localhost:8080/questions/random");
  //     if (!res.ok) throw new Error(`Unable to fetch data`);
  //     const json = await res.json();
  //     setData(json);
  //   } catch (err) {
  //     console.error("Error fetching data:", err);
  //   }
  // };

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
            <button style={{ margin: "1rem" }} onClick={fetchFlashcards}>
              Fetch All Flashcards
            </button>
            <button style={{ margin: "1rem" }} onClick={fetchRandomQuestion}>
              Fetch Random Question
            </button>

            <pre>{JSON.stringify(data, null, 2)}</pre>
          </div>
        </SignedIn>
      </header>
    </>
  );
}
