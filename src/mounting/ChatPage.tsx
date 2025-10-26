import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../lib/api";

export default function ChatPage() {
  const navigate = useNavigate();
  const { getToken } = useAuth();

  // UI state
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // health check (optional)
  const [model, setModel] = useState<string | null>(null);

  // streaming control
  const abortRef = useRef<AbortController | null>(null);
  const replyBoxRef = useRef<HTMLDivElement | null>(null);

  // optional: show backend health on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/chat`, { method: "GET" });
        if (res.ok) {
          const json = await res.json();
          setModel(json?.model || null);
        }
      } catch {
        // ignore health errors
      }
    })();
  }, []);

  // auto-scroll reply box
  useEffect(() => {
    if (replyBoxRef.current) {
      replyBoxRef.current.scrollTop = replyBoxRef.current.scrollHeight;
    }
  }, [reply]);

  async function sendPrompt(e?: React.FormEvent) {
    e?.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setError(null);
    setReply("");
    setIsLoading(true);

    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("No auth token from Clerk. Are you signed in?");
      }

      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
        signal: ac.signal,
      });

      if (!res.ok) {
        const text = await safeReadText(res);
        throw new Error(text || `Request failed (${res.status})`);
      }

      // Stream reader
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        // Fallback: not streamed by env; just read text once
        const text = await res.text();
        setReply(text);
      } else {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          setReply((prev) => prev + chunk);
        }
      }
    } catch (err: any) {
      if (err?.name === "AbortError") {
        // user pressed Stop
      } else {
        console.error(err);
        setError(err?.message || "Unknown error");
      }
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }

  function stopStreaming() {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsLoading(false);
  }

  function clearAll() {
    setPrompt("");
    setReply("");
    setError(null);
  }

  // Handle Enter/Shift+Enter in textarea
  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendPrompt();
    }
  }

  return (
    <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      <button onClick={() => navigate("/")} style={{ marginBottom: "1rem" }}>
        ← Back to Dashboard
      </button>

      <h1 style={{ marginBottom: 4 }}>Chat Page</h1>
      {model && (
        <div style={{ fontSize: 12, color: "#666", marginBottom: "0.75rem" }}>
          What would you like to know?
        </div>
      )}

      {error && (
        <div
          style={{
            color: "red",
            padding: "1rem",
            border: "1px solid red",
            marginBottom: "1rem",
            borderRadius: 4,
            whiteSpace: "pre-wrap",
          }}
        >
          Error: {error}
        </div>
      )}

      <form onSubmit={sendPrompt} style={{ display: "grid", gap: "0.75rem" }}>
        <label style={{ fontWeight: 600 }}>Your message</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask me anything… (Enter to send, Shift+Enter for newline)"
          rows={3}
          required
          style={{
            padding: "0.75rem",
            borderRadius: 6,
            border: "1px solid #ccc",
            resize: "vertical",
          }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Thinking…" : "Send"}
          </button>
          <button type="button" onClick={stopStreaming} disabled={!isLoading}>
            Stop
          </button>
          <button type="button" onClick={clearAll} disabled={isLoading}>
            Clear
          </button>
        </div>
      </form>

      <h2 style={{ marginTop: "1.25rem" }}>Reply</h2>
      <div
        ref={replyBoxRef}
        style={{
          whiteSpace: "pre-wrap",
          border: "1px solid #eee",
          padding: "1rem",
          borderRadius: 6,
          minHeight: 160,
          maxHeight: 420,
          overflowY: "auto",
          background: "#fafafa",
        }}
      >
        {reply || (isLoading ? "…" : "No reply yet")}
      </div>
    </div>
  );
}

// Safely read error body text (works even if not text/plain)
async function safeReadText(res: Response) {
  try {
    const clone = res.clone();
    const ct = clone.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      const j = await clone.json();
      return j?.error || JSON.stringify(j);
    }
    return await clone.text();
  } catch {
    return "";
  }
}
