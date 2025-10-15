import { useEffect, useMemo, useState, useCallback } from "react";
import Stepper, { Step } from "../components/Stepper";

// --------------------
// Type Definitions
// --------------------
interface Choice {
  id: string;
  term: string;
  termId: string;
  isCorrect: boolean;
}

interface QuestionData {
  questionId: string;
  prompt: string;
  choices: Choice[];
  difficulty: number;
  tags: string[];
  language: string;
  correctAnswerId: string;
}

interface FetchResponse {
  success: boolean;
  data: QuestionData;
}

// --------------------
// API Fetch
// --------------------
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

async function defaultFetchRandomQuestion(): Promise<QuestionData> {
  const res = await fetch(`${API_URL}/questions/random`, {
    credentials: "include",
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("❌ Bad response:", text.slice(0, 200));
    throw new Error(`Failed to fetch question (${res.status})`);
  }

  const json: FetchResponse = await res.json();
  if (!json?.data) throw new Error("No question data received from backend.");
  return json.data;
}

// --------------------
// Choice Button
// --------------------
interface ChoiceButtonProps {
  choice: Choice;
  selectedId: string | null;
  disabled: boolean;
  onSelect: (choice: Choice) => void;
}

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
        // layout
        "w-full text-left rounded-xl border px-4 py-3",
        "transition-colors duration-150",
        // base colors (force readable text + white card)
        "bg-white text-zinc-900",
        // borders, hover + focus
        "border-zinc-300 hover:bg-zinc-50 focus:outline-none focus:ring",
        // selected state
        isSelected ? "border-blue-500 ring-2 ring-blue-200 bg-blue-50" : "",
        // disabled
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

        <span
          className={[
            "font-medium",
            isSelected ? "text-zinc-900" : "text-zinc-900",
          ].join(" ")}
        >
          {choice.term}
        </span>

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

// --------------------
// Feedback Component
// --------------------
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

// --------------------
// Main Component
// --------------------
interface RandomQuestionsStepperProps {
  fetchRandomQuestion?: () => Promise<QuestionData>;
  backButtonText?: string;
  nextButtonText?: string;
}

export default function RandomQuestionsStepper({
  fetchRandomQuestion = defaultFetchRandomQuestion,
  backButtonText = "Previous",
  nextButtonText = "Next",
}: RandomQuestionsStepperProps) {
  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [questionCounter, setQuestionCounter] = useState<number>(0);

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
    setLoading(true);
    setErr(null);
    setSelected(null);
    try {
      const q = await fetchRandomQuestion();
      setQuestion(q);
    } catch (e: any) {
      setErr(e?.message || "Failed to load question");
      setQuestion(null);
    } finally {
      setLoading(false);
    }
  }, [fetchRandomQuestion]);

  useEffect(() => {
    loadQuestion();
  }, [loadQuestion]);

  // reset when question changes
  useEffect(() => {
    setSelected(null);
    window.scrollTo(0, 0);
  }, [questionCounter]);

  const handleSelect = (choice: Choice) => {
    setSelected(choice.id ?? choice.termId ?? null);
  };

  const handleFinalCompleted = async () => {
    await loadQuestion();
    setQuestionCounter((n) => n + 1);
  };

  return (
    <div className="mx-auto w-full max-w-2xl p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-900">Random Questions</h1>
        {question?.difficulty != null && (
          <span className="rounded-lg border px-2 py-1 text-xs text-zinc-800 bg-white">
            Difficulty: <b>{question.difficulty}</b>
          </span>
        )}
      </div>

      {loading && (
        <div className="rounded-xl border border-zinc-200 p-6 bg-white">
          <p className="animate-pulse text-zinc-700">Loading question…</p>
        </div>
      )}

      {err && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          {err}
        </div>
      )}

      {!loading && !err && question && (
        <Stepper
          key={questionCounter}
          initialStep={0} // ensure step 1 first
          onStepChange={(s) => {
            if (s === 0) setSelected(null);
          }}
          onFinalStepCompleted={handleFinalCompleted}
          backButtonText={backButtonText}
          nextButtonText={nextButtonText}
        >
          {/* STEP 1: Question & Choices */}
          <Step>
            <div className="space-y-5">
              <div className="rounded-xl border border-zinc-200 bg-white p-5">
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

          {/* STEP 2: Feedback */}
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
                Click <b>Next</b> to load another random question.
              </p>
            </div>
          </Step>
        </Stepper>
      )}
    </div>
  );
}
