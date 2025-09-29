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

  const fetchHome = async () => {
    try {
      const res = await fetch("http://localhost:8080");
      if (!res.ok) throw new Error(`Unable to fetch data`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const fetchChat = async () => {
    try {
      const res = await fetch("http://localhost:8080/chat");
      if (!res.ok) throw new Error(`Unable to fetch data`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const fetchHelp = async () => {
    try {
      const res = await fetch("http://localhost:8080/help");
      if (!res.ok) throw new Error(`Unable to fetch data`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const fetchProfile = async () => {
    try {
      const res = await fetch("http://localhost:8080/profile");
      if (!res.ok) throw new Error(`Unable to fetch data`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const fetchRandomFlashcard = async () => {
    try {
      const res = await fetch("http://localhost:8080/flashcards/random");
      if (!res.ok) throw new Error(`Unable to fetch data`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const fetchRandomQuestion = async () => {
    try {
      const res = await fetch("http://localhost:8080/questions/random");
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
            <h1>Welcome {user?.fullName || user?.username || "User"}</h1>
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
