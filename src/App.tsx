import { useState } from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  UserProfile,
  useUser,
} from "@clerk/clerk-react";

export default function App() {
  const [data, setData] = useState(null);
  const { isSignedIn, user } = useUser();

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const fetchHome = async () => {
    try {
      const res = await fetch(BACKEND_URL);
      if (!res.ok) throw new Error(`Unable to fetch data`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const fetchChat = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/chat`);
      if (!res.ok) throw new Error(`Unable to fetch data`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const fetchHelp = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/help`);
      if (!res.ok) throw new Error(`Unable to fetch data`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/profile`);
      if (!res.ok) throw new Error(`Unable to fetch data`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const fetchRandomFlashcard = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/random`);
      if (!res.ok) throw new Error(`Unable to fetch data`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const fetchRandomQuestion = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/questions/random`);
      if (!res.ok) throw new Error(`Unable to fetch data`);
      const json = await res.json();
      setData(json);
    } catch (err) {
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
        </SignedIn>
      </header>
    </>
  );
}
