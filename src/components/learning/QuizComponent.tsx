import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useMutation } from "@tanstack/react-query";
import { BACKEND_URL } from "../../lib/api";
import { useNotificationContext } from "../../contexts/NotificationContext";
import { useUserBadges } from "../../hooks/useUserBadges";
import TranslateButton from "./TranslateButton";
import ChatModal from "./ChatModal";
import QuizCompletion from "./QuizCompletion";
import Correct from "../../assets/icons/correct.svg";
import Incorrect from "../../assets/icons/incorrect.svg";

import type {
  QuizComponentProps,
  ChatMessage,
} from "../../types/components/quiz";
import type { ChatRequest } from "../../types/api/chat";
import goBackIcon from "../../assets/icons/goBackIcon.svg";
import nextButton from "../../assets/icons/nextButton.svg";
import backButton from "../../assets/icons/backButton.svg";

export default function QuizComponent({
  questions,
  quizNumber,
  onComplete,
  onBack,
  preferredLanguage,
  quizType,
}: QuizComponentProps) {
  const { getToken } = useAuth();
  const { showToast } = useNotificationContext();

  // Preload user badges while quiz is in progress
  // This ensures badges are already cached when completion page shows (prevents flicker)
  useUserBadges();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [passed, setPassed] = useState(true);

  const [showChatModal, setShowChatModal] = useState(false);
  const [chatPrompt, setChatPrompt] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null
  );

  const [isTranslated, setIsTranslated] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [translationLoading, setTranslationLoading] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const isBossQuiz = quizType === "existing" && quizNumber === 3;
  const BOSS_QUIZ_PASSING_SCORE = 70;
  const targetLanguage = preferredLanguage || 'french';

  const chatMutation = useMutation({
    mutationFn: async ({ prompt, token }: ChatRequest) => {
      const userMessageId = `user-${Date.now()}`;
      const userMessage: ChatMessage = {
        id: userMessageId,
        role: "user",
        content: prompt,
      };
      setChatHistory((prev) => [...prev, userMessage]);

      const assistantMessageId = `assistant-${Date.now()}`;
      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: "assistant",
        content: "",
      };
      setChatHistory((prev) => [...prev, assistantMessage]);
      setStreamingMessageId(assistantMessageId);

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
      if (!reader) {
        const text = await res.text();
        setChatHistory((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId ? { ...msg, content: text } : msg
          )
        );
        setStreamingMessageId(null);
        return text;
      }

      const decoder = new TextDecoder();
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;

        setChatHistory((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: fullResponse }
              : msg
          )
        );
      }

      setStreamingMessageId(null);
      return fullResponse;
    },
    onError: (error: Error) => {
      if (streamingMessageId) {
        setChatHistory((prev) =>
          prev.map((msg) =>
            msg.id === streamingMessageId
              ? {
                  ...msg,
                  content: `Error: ${error?.message || "Unknown error"}`,
                }
              : msg
          )
        );
        setStreamingMessageId(null);
      } else {
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: `Error: ${error?.message || "Unknown error"}`,
        };
        setChatHistory((prev) => [...prev, errorMessage]);
      }
    },
  });

  const translateText = async (
    text: string,
    targetLanguage: string
  ): Promise<string> => {
    console.log("🔄 Translating text:", {
      text,
      targetLanguage,
      prompts: currentQuestion.prompts,
    });

    if (!currentQuestion.prompts) {
      console.log("❌ No prompts available on question");
      return text;
    }

    const lang =
      targetLanguage.toLowerCase() as keyof typeof currentQuestion.prompts;
    const translated = currentQuestion.prompts[lang] || text;

    console.log("✅ Translation result:", { lang, translated });
    return translated;
  };

  useEffect(() => {
    setIsTranslated(false);
    setTranslatedText('');
  }, [currentQuestion.prompt]);

  const handleTranslateToggle = async () => {
    if (isTranslated) {
      setIsTranslated(false);
    } else {
      if (!translatedText) {
        setTranslationLoading(true);
        try {
          const result = await translateText(currentQuestion.prompt, targetLanguage);
          if (result && result !== currentQuestion.prompt) {
            setTranslatedText(result);
            setIsTranslated(true);
          } else {
            setTranslatedText('Translation not available for this content.');
            setIsTranslated(false);
          }
        } catch (err) {
          console.error('Translation failed:', err);
          setTranslatedText('Translation not available for this content.');
          setIsTranslated(false);
        } finally {
          setTranslationLoading(false);
        }
      } else {
        setIsTranslated(true);
      }
    }
  };

  const resetChatState = () => {
    setChatPrompt("");
    setChatHistory([]);
    setStreamingMessageId(null);
    setShowChatModal(false);
    chatMutation.reset();
  };

  const playSound = (soundFile: string) => {
    try {
      const audio = new Audio(`/sounds/${soundFile}`);
      audio.volume = 0.5; // Set volume to 50% to avoid being too loud
      audio.play().catch((error) => {
        // Silently handle errors (e.g., user hasn't interacted with page yet)
        console.log("Could not play sound:", error);
      });
    } catch (error) {
      console.log("Error playing sound:", error);
    }
  };

  const handleAnswerSelect = (choiceId: string) => {
    setSelectedAnswer(choiceId);

    // Play sound effect immediately when answer is selected
    const selectedChoice = currentQuestion.choices.find(
      (c) => c.id === choiceId
    );
    if (selectedChoice?.isCorrect) {
      playSound("correct_answer.mp3");
    } else {
      playSound("wrong_answer.mp3");
    }

    if (isBossQuiz) {
      setTimeout(() => {
        handleNext(choiceId);
      }, 300);
    }
  };

  const handleNext = (answerOverride?: string | React.MouseEvent) => {
    const answer =
      typeof answerOverride === "string" ? answerOverride : selectedAnswer;
    let finalScore = score;
    const updatedAnswers = answer
      ? { ...answers, [currentQuestionIndex]: answer }
      : answers;

    if (answer) {
      setAnswers(updatedAnswers);

      const selectedChoice = currentQuestion.choices.find(
        (c) => c.id === answer
      );
      if (selectedChoice?.isCorrect) {
        finalScore = score + 1;
        setScore(finalScore);
      }
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(answers[currentQuestionIndex + 1] || null);
      resetChatState();
    } else {
      const allAnswered =
        Object.keys(updatedAnswers).length === questions.length;

      if (!allAnswered) {
        showToast({
          id: `unanswered-${Date.now()}`,
          type: "ERROR",
          title: "Incomplete Quiz",
          message: "Please answer all questions before submitting the quiz.",
          isRead: false,
          createdAt: new Date().toISOString(),
          userId: "",
          actionUrl: undefined,
        });
        return;
      }

      const percentCorrect = (finalScore / questions.length) * 100;
      const userPassed = isBossQuiz
        ? percentCorrect >= BOSS_QUIZ_PASSING_SCORE
        : true;
      setPassed(userPassed);

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
    setPassed(true);
    resetChatState();
  };

  const handleSendChat = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatPrompt.trim() || chatMutation.isPending) return;

    const promptToSend = chatPrompt.trim();
    setChatPrompt(""); 

    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication required");

      chatMutation.mutate({ prompt: promptToSend, token });
    } catch (err) {
      console.error("Auth error:", err);
      setChatPrompt(promptToSend);
    }
  };

  const handleOpenChat = () => {
    setShowChatModal(true);
  };

  const handleCloseChat = () => {
    setShowChatModal(false);
  };

  if (isComplete) {
    return (
      <QuizCompletion
        score={score}
        totalQuestions={questions.length}
        onRetry={handleRetry}
        onBack={onBack}
        quizNumber={quizNumber}
        isBossQuiz={isBossQuiz}
        passed={passed}
      />
    );
  }

  if (questions.length === 0) {
    return (
        <div className="container">
          <div className="quizContainer">
            <button className="back-to-quiz-button" onClick={onBack}>
              <img src={goBackIcon} alt="Back" />
            </button>
            <div className="empty-state">
              <p>
                No questions available for this quiz. Please try again or select
                a different quiz.
              </p>
            </div>
          </div>
        </div>
    );
  }

  return (
    <div className="container">
        <div className="quizContainer">
          <div className="quiz-header">
          <button
            className="back-to-quiz-button"
            onClick={onBack}
            aria-label="Back to Quizzes"
          >
            <img src={goBackIcon} alt="Back" />
          </button>

          <div className="quiz-progress">
            <span className="quiz-number">
              {currentQuestionIndex + 1} / {questions.length}
            </span>
          </div>

          {!isBossQuiz && (
            <TranslateButton
              isTranslated={isTranslated}
              loading={translationLoading}
              targetLanguage={targetLanguage}
              onToggle={handleTranslateToggle}
            />
          )}
          </div>

          <div className="quiz-question-section">
            <p className="translate-button-text">
              {isTranslated && translatedText ? translatedText : currentQuestion.prompt}
            </p>

            <div className="quiz-choices-section">
              {currentQuestion.choices.map((choice) => {
                const isSelected = selectedAnswer === choice.id;
                const isCorrect = choice.isCorrect;
                const showFeedback = !isBossQuiz && selectedAnswer !== null;

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
                    onClick={() =>
                      !showFeedback && handleAnswerSelect(choice.id)
                    }
                    disabled={showFeedback}
                  >
                    <div className="choice-content">
                      <span className="choice-id">{choice.id}.</span>
                      <span className="choice-text">{choice.term}</span>
                    </div>

                    {showFeedback && (
                      <div className="quiz-feedback-section">
                        {isSelected && isCorrect && (
                          <span className="feedback-icon quiz-correct"><img src={Correct} alt="Correct" /></span>
                        )}
                        {isSelected && !isCorrect && (
                          <span className="feedback-icon quiz-incorrect">
                            <img src={Incorrect} alt="Incorrect" />
                          </span>
                        )}
                        {!isSelected && isCorrect && (
                          <span className="quiz-feedback-correct">
                            <img src={Correct} alt="Correct Answer" /> 
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="quiz-nav-buttons">
            {!isBossQuiz && (
              <button
                className="back-previous-question-button"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                aria-label="Previous question"
              >
                <img src={backButton} alt="Back" />
              </button>
            )}

            {!isBossQuiz && (
              <button className="quiz-chat-button" onClick={handleOpenChat}>
                <span className="quiz-chat-button-text">
                  Need Help? Ask Rocky!
                </span>
              </button>
            )}

            {!isBossQuiz && (
              <button
                className={`next-question-button ${
                  currentQuestionIndex === questions.length - 1
                    ? "next-question-button--submit"
                    : ""
                }`}
                onClick={handleNext}
                aria-label={
                  currentQuestionIndex === questions.length - 1
                    ? "Finish quiz"
                    : "Next question"
                }
              >
                {currentQuestionIndex === questions.length - 1 ? (
                  <>
                    <span style={{ marginRight: "8px" }}>Submit</span>
                    <img src={nextButton} alt="Next" />
                  </>
                ) : (
                  <img src={nextButton} alt="Next" />
                )}
              </button>
            )}
          </div>

          <ChatModal
            isOpen={showChatModal}
            onClose={handleCloseChat}
            currentQuestion={currentQuestion.prompt}
            chatHistory={chatHistory}
            chatPrompt={chatPrompt}
            onChatPromptChange={setChatPrompt}
            onSendChat={handleSendChat}
            isLoading={chatMutation.isPending}
          />
        </div>
        </div>
  );
}
