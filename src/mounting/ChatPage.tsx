import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
// import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { BACKEND_URL } from "../lib/api";
import type { ChatHealthResponse, ChatRequest } from "@/types/api/chat";

export default function ChatPage() {
  // const navigate = useNavigate();
  const { getToken } = useAuth();

  // UI state
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState("");

  // streaming control
  const abortRef = useRef<AbortController | null>(null);
  const replyBoxRef = useRef<HTMLDivElement | null>(null);

  // Health check query
  const { data: healthData } = useQuery({
    queryKey: ["chatHealth"],
    queryFn: async (): Promise<ChatHealthResponse> => {
      const res = await fetch(`${BACKEND_URL}/chat`, { method: "GET" });
      if (!res.ok) {
        throw new Error("Health check failed");
      }
      return await res.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry health checks
  });

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: async ({ prompt, token, signal }: ChatRequest) => {
      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
        signal,
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
        return text;
      }

      // Handle streaming response
      let fullResponse = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;
        // Update state during streaming
        setReply((prev) => prev + chunk);
      }

      return fullResponse;
    },
    onMutate: () => {
      setReply("");
    },
    onError: (error: Error) => {
      if (error.name !== "AbortError") {
        console.error(error);
      }
    },
  });

  // auto-scroll reply box
  useEffect(() => {
    if (replyBoxRef.current) {
      replyBoxRef.current.scrollTop = replyBoxRef.current.scrollHeight;
    }
  }, [reply]);

  async function sendPrompt(e?: React.FormEvent) {
    e?.preventDefault();
    if (!prompt.trim() || chatMutation.isPending) return;

    const ac = new AbortController();
    abortRef.current = ac;

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("No auth token from Clerk. Are you signed in?");
      }

      chatMutation.mutate({
        prompt,
        token,
        signal: ac.signal,
      });
    } catch (err) {
      console.error(err);
      chatMutation.reset();
    }
  }

  function stopStreaming() {
    abortRef.current?.abort();
    abortRef.current = null;
    chatMutation.reset();
  }

  function clearAll() {
    setPrompt("");
    setReply("");
    chatMutation.reset();
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
      {/* <button onClick={() => navigate("/")} style={{ marginBottom: "1rem" }}>
        ← Back to Dashboard
      </button> */}

      <h1 style={{ marginBottom: 4 }}>Chat Page</h1>
      {healthData?.model && (
        <div style={{ fontSize: 12, color: "#666", marginBottom: "0.75rem" }}>
          What would you like to know?
        </div>
      )}

      {chatMutation.isError && chatMutation.error.name !== "AbortError" && (
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
          Error: {chatMutation.error.message}
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
          <button type="submit" disabled={chatMutation.isPending}>
            {chatMutation.isPending ? "Thinking…" : "Send"}
          </button>
          <button
            type="button"
            onClick={stopStreaming}
            disabled={!chatMutation.isPending}
          >
            Stop
          </button>
          <button
            type="button"
            onClick={clearAll}
            disabled={chatMutation.isPending}
          >
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
        {reply || (chatMutation.isPending ? "…" : "No reply yet")}
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
