import { useState } from "react";

function App() {
  const [data, setData] = useState(null);

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

  return (
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
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default App;
