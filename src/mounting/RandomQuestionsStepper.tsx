import { useMemo, useState, useCallback, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useMutation } from "@tanstack/react-query";
import Stepper, { Step } from "../components/Stepper";
import { useNavigate } from "react-router-dom";
import { BACKEND_URL } from "../lib/api";
import type {
  Choice,
  QuestionData,
  FetchResponse,
  FetchQuestionRequest,
  ChoiceButtonProps,
} from "@/types/randomQuestionsStepper";

const MAX_QUESTIONS = 2;

function ChoiceButton({
  choice,
  selectedId,
  disabled,
  onSelect,
}: ChoiceButtonProps) {
  const isSelected = selectedId === choice.id || selectedId === choice.termId;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={() => onSelect(choice)}
      disabled={disabled}
      className={[
        "w-full text-left rounded-xl border px-4 py-3",
        "transition-colors duration-150",
        "bg-white text-zinc-900",
        "border-zinc-300 hover:bg-zinc-50 focus:outline-none focus:ring",
        isSelected ? "border-blue-500 ring-2 ring-blue-200 bg-blue-50" : "",
        disabled ? "opacity-70 cursor-not-allowed" : "cursor-pointer",
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        <span
          className={[
            "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
            isSelected
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-zinc-700 border-zinc-300",
          ].join(" ")}
        >
          {choice.id}
        </span>

        <span className="font-medium text-zinc-900">{choice.term}</span>

        {isSelected && (
          <svg
            className="ml-auto h-5 w-5"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M16 6l-8 8-4-4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    </button>
  );
}

interface FeedbackProps {
  wasCorrect: boolean | null;
  correctChoice: Choice | null;
}

function Feedback({ wasCorrect, correctChoice }: FeedbackProps) {
  return (
    <div
      className={[
        "rounded-xl border p-4",
        wasCorrect
          ? "border-green-300 bg-green-50"
          : "border-red-300 bg-red-50",
      ].join(" ")}
    >
      <p className="text-lg font-semibold text-zinc-900">
        {wasCorrect ? "Correct! 🎉" : "Not quite."}
      </p>
      {correctChoice && (
        <p className="mt-1 text-sm text-zinc-800">
          The right answer is{" "}
          <span className="font-semibold">{correctChoice.term}</span>
          {correctChoice.id ? ` (${correctChoice.id})` : ""}.
        </p>
      )}
    </div>
  );
}

interface RandomQuestionsStepperProps {
  backButtonText?: string;
  nextButtonText?: string;
  type?: "existing" | "custom";
}

export default function RandomQuestionsStepper({
  backButtonText = "Previous",
  nextButtonText = "Next",
  type = "existing",
}: RandomQuestionsStepperProps) {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [questionCounter, setQuestionCounter] = useState<number>(0);
  const [finished, setFinished] = useState<boolean>(false);

  // Fetch random question mutation
  const questionMutation = useMutation({
    mutationFn: async ({
      token,
      type,
    }: FetchQuestionRequest): Promise<QuestionData> => {
      const endpoint =
        type === "custom"
          ? `${BACKEND_URL}/learning/custom/random/question`
          : `${BACKEND_URL}/learning/existing/random/question`;

      const res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("❌ Bad response:", text.slice(0, 200));
        throw new Error(`Failed to fetch question (${res.status})`);
      }

      const json: FetchResponse = await res.json();
      if (!json?.data)
        throw new Error("No question data received from backend.");
      return json.data;
    },
    onSuccess: (data) => {
      setQuestion(data);
      setSelected(null);
    },
  });

  const correctChoice = useMemo<Choice | null>(() => {
    if (!question) return null;
    const byFlag = question.choices.find((c) => c.isCorrect);
    if (byFlag) return byFlag;
    return (
      question.choices.find(
        (c) => String(c.termId) === String(question.correctAnswerId)
      ) || null
    );
  }, [question]);

  const wasCorrect = useMemo<boolean | null>(() => {
    if (!question || !selected) return null;
    if (
      correctChoice?.id &&
      (selected === correctChoice.id || selected === correctChoice.termId)
    ) {
      return true;
    }
    if (
      correctChoice?.termId &&
      String(selected) === String(correctChoice.termId)
    ) {
      return true;
    }
    return false;
  }, [question, selected, correctChoice]);

  const loadQuestion = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error("No authentication token available. Please log in.");
      }

      questionMutation.mutate({ token, type });
    } catch (err) {
      console.error("Auth error:", err);
    }
  }, [getToken, type, questionMutation]);

  useEffect(() => {
    loadQuestion();
  }, []);

  useEffect(() => {
    setSelected(null);
    window.scrollTo(0, 0);
  }, [questionCounter]);

  const handleSelect = (choice: Choice) => {
    setSelected(choice.id ?? choice.termId ?? null);
  };

  const handleFinalCompleted = async () => {
    if (questionCounter + 1 >= MAX_QUESTIONS) {
      setFinished(true);
      return;
    }
    await loadQuestion();
    setQuestionCounter((n) => n + 1);
  };

  const resetSession = async () => {
    setFinished(false);
    setQuestionCounter(0);
    await loadQuestion();
  };

  return (
    <div className="mx-auto w-full max-w-2xl p-4">
      {/* <button
        onClick={() => navigate("/")}
        style={{ marginBottom: "1rem" }}
        className="text-sm text-zinc-600 hover:text-zinc-900"
      >
        ← Back to Dashboard
      </button> */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-900">
          Random Questions {type === "custom" ? "(Custom)" : "(Red Seal)"}
        </h1>
        {question?.difficulty != null && !finished && (
          <span className="rounded-lg border px-2 py-1 text-xs text-zinc-800 bg-white">
            Difficulty: <b>{question.difficulty}</b>
          </span>
        )}
      </div>

      {finished && (
        <div className="rounded-xl border border-green-300 bg-green-50 p-6 text-center">
          <h2 className="text-xl font-bold text-green-800">
            ✅ You finished all {MAX_QUESTIONS} questions!
          </h2>
          <p className="mt-2 text-sm text-green-800">
            Nice work. Want to try another round?
          </p>
          <div className="mt-4 flex justify-center">
            <button
              onClick={resetSession}
              className="rounded-lg border border-green-600 bg-green-600 px-4 py-2 text-white hover:opacity-90"
            >
              Restart
            </button>
          </div>
        </div>
      )}

      {!finished && questionMutation.isPending && (
        <div className="rounded-xl border border-zinc-200 p-6 bg-white">
          <p className="animate-pulse text-zinc-700">Loading question…</p>
        </div>
      )}

      {!finished && questionMutation.isError && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          {questionMutation.error.message}
        </div>
      )}

      {!finished &&
        !questionMutation.isPending &&
        !questionMutation.isError &&
        question && (
          <Stepper
            key={questionCounter}
            initialStep={0}
            onStepChange={(s) => {
              if (s === 0) setSelected(null);
            }}
            onFinalStepCompleted={handleFinalCompleted}
            backButtonText={backButtonText}
            nextButtonText={
              questionCounter + 1 >= MAX_QUESTIONS ? "Finish" : nextButtonText
            }
          >
            <Step>
              <div className="space-y-5">
                <div className="rounded-xl border border-zinc-200 bg-white p-5">
                  <div className="mb-2 text-xs text-zinc-600">
                    Question {questionCounter + 1} of {MAX_QUESTIONS}
                  </div>
                  <p className="text-lg font-semibold text-zinc-900">
                    {question.prompt}
                  </p>
                  {Array.isArray(question.tags) && question.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {question.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-800 bg-white"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {question.choices.map((choice) => (
                    <ChoiceButton
                      key={choice.id ?? choice.termId}
                      choice={choice}
                      selectedId={selected}
                      disabled={false}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>

                <p className="text-xs text-zinc-700">
                  Tip: Select an answer, then click <b>Next</b>.
                </p>
              </div>
            </Step>

            <Step>
              <div className="space-y-5">
                <Feedback
                  wasCorrect={!!wasCorrect}
                  correctChoice={correctChoice}
                />

                <div className="rounded-xl border border-zinc-200 bg-white p-5">
                  <p className="text-lg font-semibold text-zinc-900">
                    {question.prompt}
                  </p>

                  <div className="mt-4 space-y-2">
                    {question.choices.map((choice) => {
                      const isCorrect =
                        choice.isCorrect ||
                        (correctChoice &&
                          String(choice.termId) ===
                            String(correctChoice.termId));
                      const isSelected =
                        selected === choice.id ||
                        String(selected) === String(choice.termId);

                      return (
                        <div
                          key={choice.id ?? choice.termId}
                          className={[
                            "rounded-lg border px-3 py-2 text-sm bg-white",
                            isCorrect
                              ? "border-green-300 bg-green-50"
                              : isSelected
                              ? "border-red-300 bg-red-50"
                              : "border-zinc-200",
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "mr-2 rounded-md border px-2 py-0.5 text-xs",
                              isCorrect
                                ? "bg-green-600 text-white border-green-600"
                                : "bg-white text-zinc-700 border-zinc-300",
                            ].join(" ")}
                          >
                            {choice.id}
                          </span>
                          <span className="font-medium text-zinc-900">
                            {choice.term}
                          </span>
                          {isCorrect && (
                            <span className="ml-2 text-xs text-zinc-700">
                              (correct)
                            </span>
                          )}
                          {!isCorrect && isSelected && (
                            <span className="ml-2 text-xs text-zinc-700">
                              (your choice)
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <p className="text-xs text-zinc-700">
                  {questionCounter + 1 >= MAX_QUESTIONS
                    ? "Click Finish to end this round."
                    : "Click Next to load another random question."}
                </p>
              </div>
            </Step>
          </Stepper>
        )}
    </div>
  );
}
