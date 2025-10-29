import { useState, useEffect, useRef } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useMutation } from "@tanstack/react-query";
import { BACKEND_URL } from "../../lib/api";
import TranslateButton from "./TranslateButton";
import QuizCompletion from "./QuizCompletion";
import type { QuizComponentProps, ChatRequest } from "@/types/quizComponent";

export default function QuizComponent({
  questions,
  quizNumber,
  onComplete,
  onBack,
  preferredLanguage,
}: QuizComponentProps) {
  const { getToken } = useAuth();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatPrompt, setChatPrompt] = useState("");
  const [chatReply, setChatReply] = useState("");
  const chatReplyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatReplyRef.current) {
      chatReplyRef.current.scrollTop = chatReplyRef.current.scrollHeight;
    }
  }, [chatReply]);

  // Chat mutation using TanStack Query
  const chatMutation = useMutation({
    mutationFn: async ({ prompt, token }: ChatRequest) => {
      const currentQuestion = questions[currentQuestionIndex];

      const contextualPrompt = `You are a friendly, helpful tutor assisting immigrants learning skilled trades terminology in British Columbia, Canada. Your role is to explain concepts in simple, clear language. Give short, conversational answers (2-4 sentences) that are warm and encouraging. Use everyday examples when helpful.

Current quiz question the student is working on: "${currentQuestion.prompt}"

Student's question: ${prompt}

Remember: Be supportive, keep it brief, and explain like you're talking to a friend who's learning English and trades at the same time.`;

      const res = await fetch(`${BACKEND_URL}/chat`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: contextualPrompt }),
      });

      if (!res.ok) {
        throw new Error(`Request failed (${res.status})`);
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
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
        setChatReply((prev) => prev + chunk);
      }

      return fullResponse;
    },
    onMutate: () => {
      setChatReply("");
    },
    onError: (error: Error) => {
      setChatReply("Error: " + (error?.message || "Unknown error"));
    },
  });

  const translateText = async (
    text: string,
    targetLanguage: string
  ): Promise<string> => {
    const currentQuestion = questions[currentQuestionIndex];

    console.log("Translating to:", targetLanguage);
    console.log("Current question prompts:", currentQuestion.prompts);

    if (currentQuestion.prompts) {
      const lang =
        targetLanguage.toLowerCase() as keyof typeof currentQuestion.prompts;
      const translated = currentQuestion.prompts[lang];
      console.log("Translation result:", translated);
      return translated || text;
    }

    console.log("No prompts available, returning original text");
    return text;
  };

  const handleAnswerSelect = (choiceId: string) => {
    setSelectedAnswer(choiceId);
  };

  const handleNext = () => {
    if (selectedAnswer) {
      setAnswers({ ...answers, [currentQuestionIndex]: selectedAnswer });

      const currentQuestion = questions[currentQuestionIndex];
      const selectedChoice = currentQuestion.choices.find(
        (c) => c.id === selectedAnswer
      );
      const newScore = selectedChoice?.isCorrect ? score + 1 : score;
      setScore(newScore);

      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedAnswer(null);
        setChatPrompt("");
        setChatReply("");
        setShowChatModal(false);
        chatMutation.reset(); // Clear any previous chat errors
      } else {
        onComplete(newScore, questions.length);
        setIsComplete(true);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(answers[currentQuestionIndex - 1] || null);
      setChatPrompt("");
      setChatReply("");
      setShowChatModal(false);
      chatMutation.reset(); // Clear any previous chat errors
    }
  };

  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswers({});
    setScore(0);
    setIsComplete(false);
  };

  const handleSendChat = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatPrompt.trim() || chatMutation.isPending) return;

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      chatMutation.mutate({ prompt: chatPrompt, token });
    } catch (err) {
      console.error("Auth error:", err);
    }
  };

  if (questions.length === 0) {
    return (
      <div style={{ padding: "2rem" }}>
        <button onClick={onBack} style={{ marginBottom: "1rem" }}>
          ← Back
        </button>
        <div
          style={{
            backgroundColor: "#f0f0f0",
            padding: "2rem",
            borderRadius: "6px",
            textAlign: "center",
          }}
        >
          <p style={{ margin: 0, fontSize: "1.1rem", color: "#666" }}>
            No questions available for this quiz. Please try again or select a
            different quiz.
          </p>
        </div>
      </div>
    );
  }

  if (isComplete) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
        <h1>Quiz Complete! 🎉</h1>
        <div
          style={{
            backgroundColor: "#f9fafb",
            padding: "2rem",
            borderRadius: "8px",
            marginTop: "2rem",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
            {percentage >= 80 ? "🌟" : percentage >= 60 ? "👍" : "📚"}
          </div>
          <h2 style={{ margin: 0, marginBottom: "1rem" }}>
            Your Score: {score} / {questions.length}
          </h2>
          <p
            style={{ fontSize: "1.5rem", color: "#3b82f6", fontWeight: "600" }}
          >
            {percentage}%
          </p>
          <div
            style={{
              width: "100%",
              height: "20px",
              backgroundColor: "#e5e7eb",
              borderRadius: "10px",
              marginTop: "1rem",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${percentage}%`,
                height: "100%",
                backgroundColor:
                  percentage >= 80
                    ? "#10b981"
                    : percentage >= 60
                    ? "#f59e0b"
                    : "#ef4444",
                transition: "width 0.5s ease",
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
          <button
            onClick={handleRetry}
            style={{
              flex: 1,
              padding: "0.75rem",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Try Again
          </button>
          <button
            onClick={onBack}
            style={{
              flex: 1,
              padding: "0.75rem",
              backgroundColor: "#6b7280",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Back to Quizzes
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <button onClick={onBack} style={{ marginBottom: "1rem" }}>
        ← Back to Quizzes
      </button>

      <div
        style={{
          backgroundColor: "#f9fafb",
          padding: "1rem",
          borderRadius: "6px",
          marginBottom: "1rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontWeight: "600" }}>Quiz {quizNumber}</span>
        <span>
          Question {currentQuestionIndex + 1} of {questions.length}
        </span>
      </div>

      <div
        style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "1rem",
          }}
        >
          <TranslateButton
            text={currentQuestion.prompt}
            preferredLanguage={preferredLanguage}
            onTranslate={(targetLanguage) =>
              translateText(currentQuestion.prompt, targetLanguage)
            }
          />
          <button
            onClick={() => setShowChatModal(true)}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.875rem",
            }}
          >
            💬 Need Help?
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {currentQuestion.choices.map((choice) => {
            const isSelected = selectedAnswer === choice.id;
            const isCorrect = choice.isCorrect;
            const showFeedback = selectedAnswer !== null;

            let backgroundColor = "#f9fafb";
            let borderColor = "#e5e7eb";

            if (showFeedback) {
              if (isSelected && isCorrect) {
                backgroundColor = "#d1fae5";
                borderColor = "#10b981";
              } else if (isSelected && !isCorrect) {
                backgroundColor = "#fee2e2";
                borderColor = "#ef4444";
              } else if (!isSelected && isCorrect) {
                backgroundColor = "#dbeafe";
                borderColor = "#3b82f6";
              }
            } else if (isSelected) {
              backgroundColor = "#dbeafe";
              borderColor = "#3b82f6";
            }

            return (
              <button
                key={choice.id}
                onClick={() => !showFeedback && handleAnswerSelect(choice.id)}
                disabled={showFeedback}
                style={{
                  padding: "1rem",
                  textAlign: "left",
                  backgroundColor,
                  border: `2px solid ${borderColor}`,
                  borderRadius: "8px",
                  cursor: showFeedback ? "default" : "pointer",
                  fontWeight: isSelected ? "600" : "400",
                  transition: "all 0.2s ease",
                  position: "relative",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <span style={{ marginRight: "1rem", fontWeight: "700" }}>
                    {choice.id}.
                  </span>
                  {choice.term}
                </div>
                {showFeedback && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    {isSelected && isCorrect && (
                      <span style={{ fontSize: "1.5rem", color: "#10b981" }}>
                        ✓
                      </span>
                    )}
                    {isSelected && !isCorrect && (
                      <span style={{ fontSize: "1.5rem", color: "#ef4444" }}>
                        ✗
                      </span>
                    )}
                    {!isSelected && isCorrect && (
                      <span
                        style={{
                          fontSize: "0.875rem",
                          color: "#3b82f6",
                          fontWeight: "600",
                        }}
                      >
                        Correct answer
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div style={{ display: "flex", gap: "1rem" }}>
        <button
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: currentQuestionIndex === 0 ? "#e5e7eb" : "#6b7280",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: currentQuestionIndex === 0 ? "not-allowed" : "pointer",
            fontWeight: "600",
          }}
        >
          ← Previous
        </button>
        <button
          onClick={handleNext}
          disabled={!selectedAnswer}
          style={{
            flex: 1,
            padding: "0.75rem 1.5rem",
            backgroundColor: !selectedAnswer ? "#e5e7eb" : "#3b82f6",
            color: !selectedAnswer ? "#9ca3af" : "white",
            border: "none",
            borderRadius: "6px",
            cursor: !selectedAnswer ? "not-allowed" : "pointer",
            fontWeight: "600",
          }}
        >
          {currentQuestionIndex === questions.length - 1
            ? "Finish Quiz"
            : "Next →"}
        </button>
      </div>

      {/* Chat Modal */}
      {showChatModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowChatModal(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "2rem",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
              }}
            >
              <h2 style={{ margin: 0 }}>Need Help?</h2>
              <button
                onClick={() => setShowChatModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  color: "#6b7280",
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                fontSize: "0.875rem",
                color: "#6b7280",
                marginBottom: "1rem",
                padding: "0.75rem",
                backgroundColor: "#f9fafb",
                borderRadius: "6px",
              }}
            >
              <strong>Current Question:</strong> {currentQuestion.prompt}
            </div>

            {chatReply && (
              <div
                ref={chatReplyRef}
                style={{
                  flex: 1,
                  overflowY: "auto",
                  backgroundColor: "#f9fafb",
                  padding: "1rem",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                  whiteSpace: "pre-wrap",
                  maxHeight: "300px",
                }}
              >
                {chatReply}
              </div>
            )}

            <form
              onSubmit={handleSendChat}
              style={{ display: "flex", gap: "0.5rem" }}
            >
              <input
                type="text"
                value={chatPrompt}
                onChange={(e) => setChatPrompt(e.target.value)}
                placeholder="Ask your question..."
                disabled={chatMutation.isPending}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "6px",
                  fontSize: "1rem",
                }}
              />
              <button
                type="submit"
                disabled={chatMutation.isPending || !chatPrompt.trim()}
                style={{
                  padding: "0.75rem 1.5rem",
                  backgroundColor:
                    chatMutation.isPending || !chatPrompt.trim()
                      ? "#e5e7eb"
                      : "#10b981",
                  color:
                    chatMutation.isPending || !chatPrompt.trim()
                      ? "#9ca3af"
                      : "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor:
                    chatMutation.isPending || !chatPrompt.trim()
                      ? "not-allowed"
                      : "pointer",
                  fontWeight: "600",
                }}
              >
                {chatMutation.isPending ? "..." : "Send"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
