import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useMutation } from "@tanstack/react-query";
import { BACKEND_URL } from "../../lib/api";
import TranslateButton from "./TranslateButton";
import ChatModal from "./ChatModal";
import QuizCompletion from "./QuizCompletion";
import type { QuizComponentProps, ChatRequest } from "@/types/quizComponent";
import goBackIcon from "../../assets/icons/goBackIcon.svg";
import nextButton from "../../assets/icons/nextButton.svg";
import backButton from "../../assets/icons/backButton.svg";

export default function QuizComponent({
  questions,
  onComplete,
  onBack,
  preferredLanguage,
}: QuizComponentProps) {
  const { getToken } = useAuth();

  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Chat state
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatPrompt, setChatPrompt] = useState("");
  const [chatReply, setChatReply] = useState("");

  const currentQuestion = questions[currentQuestionIndex];

  // Chat mutation
  const chatMutation = useMutation({
    mutationFn: async ({ prompt, token }: ChatRequest) => {
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

      if (!res.ok) throw new Error(`Request failed (${res.status})`);

      const reader = res.body?.getReader();
      if (!reader) return await res.text();

      const decoder = new TextDecoder();
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;
        setChatReply((prev) => prev + chunk);
      }

      return fullResponse;
    },
    onMutate: () => setChatReply(""),
    onError: (error: Error) => {
      setChatReply("Error: " + (error?.message || "Unknown error"));
    },
  });

  // Handlers
  const translateText = async (
    text: string,
    targetLanguage: string
  ): Promise<string> => {
    if (!currentQuestion.prompts) return text;

    const lang = targetLanguage.toLowerCase() as keyof typeof currentQuestion.prompts;
    return currentQuestion.prompts[lang] || text;
  };

  const resetChatState = () => {
    setChatPrompt("");
    setChatReply("");
    setShowChatModal(false);
    chatMutation.reset();
  };

  const handleAnswerSelect = (choiceId: string) => {
    setSelectedAnswer(choiceId);
  };

  const handleNext = () => {
    let finalScore = score;

    if (selectedAnswer) {
      // Save answer
      setAnswers({ ...answers, [currentQuestionIndex]: selectedAnswer });

      // Update score if correct
      const selectedChoice = currentQuestion.choices.find(
        (c) => c.id === selectedAnswer
      );
      if (selectedChoice?.isCorrect) {
        finalScore = score + 1;
        setScore(finalScore);
      }
    }

    // Navigate or complete quiz
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      resetChatState();
    } else {
      // Show completion screen
      setIsComplete(true);
      onComplete(finalScore, questions.length);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex === 0) return;

    setCurrentQuestionIndex(currentQuestionIndex - 1);
    setSelectedAnswer(answers[currentQuestionIndex - 1] || null);
    resetChatState();
  };

  const handleRetry = () => {
    setIsComplete(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswers({});
    setScore(0);
    resetChatState();
  };

  const handleSendChat = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatPrompt.trim() || chatMutation.isPending) return;

    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication required");
      
      chatMutation.mutate({ prompt: chatPrompt, token });
    } catch (err) {
      console.error("Auth error:", err);
    }
  };

  const handleOpenChat = () => {
    setShowChatModal(true);
  };

  const handleCloseChat = () => {
    setShowChatModal(false);
  };

  // Show completion screen
  if (isComplete) {
    return (
      <QuizCompletion
        score={score}
        totalQuestions={questions.length}
        onRetry={handleRetry}
        onBack={onBack}
      />
    );
  }

  // Empty state
  if (questions.length === 0) {
    return (
      <div className="container">
        <button className="back-to-quiz-button" onClick={onBack}>
          <img src={goBackIcon} alt="Back" />
        </button>
        <div className="empty-state">
          <p>
            No questions available for this quiz. Please try again or select a
            different quiz.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <button
        className="back-to-quiz-button"
        onClick={onBack}
        aria-label="Back to Quizzes"
      >
        <img src={goBackIcon} alt="Back" />
      </button>

      <div className="quiz-progress">
        <span className="quiz-number">
          Question {currentQuestionIndex + 1} of {questions.length}
        </span>
      </div>

      {/* Question section */}
      <div className="quiz-question-section">
        <div className="quiz-translate-button">
          <TranslateButton
            text={currentQuestion.prompt}
            preferredLanguage={preferredLanguage}
            onTranslate={(targetLanguage) =>
              translateText(currentQuestion.prompt, targetLanguage)
            }
          />
        </div>

        {/* Choices */}
        <div className="quiz-choices-section">
          {currentQuestion.choices.map((choice) => {
            const isSelected = selectedAnswer === choice.id;
            const isCorrect = choice.isCorrect;
            const showFeedback = selectedAnswer !== null;

            const buttonClasses = [
              "quiz-choices-button",
              showFeedback && "show-feedback",
              showFeedback && isSelected && isCorrect && "quiz-correct",
              showFeedback && isSelected && !isCorrect && "quiz-incorrect",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <button
                key={choice.id}
                className={buttonClasses}
                onClick={() => !showFeedback && handleAnswerSelect(choice.id)}
                disabled={showFeedback}
              >
                <div className="choice-content">
                  <span className="choice-id">{choice.id}.</span>
                  <span className="choice-text">{choice.term}</span>
                </div>

                {showFeedback && (
                  <div className="quiz-feedback-section">
                    {isSelected && isCorrect && (
                      <span className="feedback-icon quiz-correct">✓</span>
                    )}
                    {isSelected && !isCorrect && (
                      <span className="feedback-icon quiz-incorrect">✗</span>
                    )}
                    {!isSelected && isCorrect && (
                      <span className="quiz-feedback-correct">✓ Correct answer</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="quiz-nav-buttons">
        <button
          className="back-previous-question-button"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
          aria-label="Previous question"
        >
          <img src={backButton} alt="Back" />
        </button>

        <button className="quiz-chat-button" onClick={handleOpenChat}>
          <span className="quiz-chat-button-text">Need Help? Ask Rocky!</span>
        </button>

        <button
          className="next-question-button"
          onClick={handleNext}
          aria-label={
            currentQuestionIndex === questions.length - 1
              ? "Finish quiz"
              : "Next question"
          }
        >
          <img src={nextButton} alt="Next" />
        </button>
      </div>

      {/* Chat Modal */}
      <ChatModal
        isOpen={showChatModal}
        onClose={handleCloseChat}
        currentQuestion={currentQuestion.prompt}
        chatReply={chatReply}
        chatPrompt={chatPrompt}
        onChatPromptChange={setChatPrompt}
        onSendChat={handleSendChat}
        isLoading={chatMutation.isPending}
      />
    </div>
  );
}