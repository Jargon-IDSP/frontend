import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { BACKEND_URL } from "../lib/api";
import type { ChatHealthResponse, ChatRequest } from "@/types/api/chat";
import "../styles/pages/_chatPage.scss";

export default function ChatPage() {
  const { getToken } = useAuth();

  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState("");

  const abortRef = useRef<AbortController | null>(null);
  const replyBoxRef = useRef<HTMLDivElement | null>(null);

  const { data: healthData } = useQuery({
    queryKey: ["chatHealth"],
    queryFn: async (): Promise<ChatHealthResponse> => {
      const res = await fetch(`${BACKEND_URL}/chat`, { method: "GET" });
      if (!res.ok) {
        throw new Error("Health check failed");
      }
      return await res.json();
    },
    staleTime: 5 * 60 * 1000, 
    retry: false, 
  });

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

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        const text = await res.text();
        return text;
      }

      let fullResponse = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;
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

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendPrompt();
    }
  }

  return (
    <div className="chat-page">
      <h1 className="chat-page__title">Chat Page</h1>
      {healthData?.model && (
        <div className="chat-page__subtitle">
          What would you like to know?
        </div>
      )}

      {chatMutation.isError && chatMutation.error.name !== "AbortError" && (
        <div className="chat-page__error">
          Error: {chatMutation.error.message}
        </div>
      )}

      <form onSubmit={sendPrompt} className="chat-page__form">
        <label className="chat-page__label">Your message</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Ask me anything… (Enter to send, Shift+Enter for newline)"
          rows={3}
          required
          className="chat-page__textarea"
        />
        <div className="chat-page__button-group">
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

      <h2 className="chat-page__reply-title">Reply</h2>
      <div ref={replyBoxRef} className="chat-page__reply-box">
        {reply || (chatMutation.isPending ? "…" : "No reply yet")}
      </div>
    </div>
  );
}

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
