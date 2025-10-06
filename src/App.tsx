import { useState } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useAuth,
} from "@clerk/clerk-react";

export default function App() {
  const [data, setData] = useState(null);
  const { getToken } = useAuth();

  const BACKEND_URL = "http://localhost:8080";

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
    await makeUnauthenticatedRequest(`${BACKEND_URL}/help`);
  };

  const fetchProfile = async () => {
    await makeAuthenticatedRequest(`${BACKEND_URL}/profile`);
  };

  const fetchRandomFlashcard = async () => {
    await makeUnauthenticatedRequest(`${BACKEND_URL}/flashcards/random`);
  };

  const fetchRandomQuestion = async () => {
    await makeUnauthenticatedRequest(`${BACKEND_URL}/questions/random`);
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
        </SignedIn>
      </header>
      <div style={{ padding: "2rem" }}>
        <h1>Test API Backend</h1>
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
        <button style={{ margin: "1rem" }} onClick={fetchRandomQuestion}>
          Fetch Random Question
        </button>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>
    </>
  );
}