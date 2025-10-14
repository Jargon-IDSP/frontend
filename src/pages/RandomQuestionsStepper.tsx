import { useEffect, useMemo, useState } from "react";
import Stepper, { Step } from "../components/Stepper";
import { fetchRandomQuestion } from "../lib/api";

type Question = { id: string; prompt: string; details?: string };
type Answer = { response: string; notes: string; confidence: number };

export default function RandomQuestionsStepper() {
  // fixed at 2 questions
  const count = 2;
  const steps = useMemo(() => Array.from({ length: count }, (_, i) => i), []);

  const [questions, setQuestions] = useState<(Question | null)[]>(Array(count).fill(null));
  const [answers, setAnswers] = useState<Answer[]>(
    Array(count).fill({ response: "", notes: "", confidence: 3 })
  );
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetchErr, setFetchErr] = useState<string | null>(null);

  // lazy fetch for current step
  useEffect(() => {
    let ignore = false;
    (async () => {
      if (questions[activeStep] || loading) return;
      setLoading(true);
      setFetchErr(null);
      try {
        const q = await fetchRandomQuestion();
        if (!ignore) {
          setQuestions((prev) => {
            const copy = [...prev];
            copy[activeStep] = q;
            return copy;
          });
        }
      } catch (e) {
        if (!ignore) setFetchErr(e instanceof Error ? e.message : "Failed to load question");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => { ignore = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep]);

  function updateAnswer(stepIdx: number, patch: Partial<Answer>) {
    setAnswers((prev) => {
      const copy = [...prev];
      copy[stepIdx] = { ...copy[stepIdx], ...patch };
      return copy;
    });
  }

  function FinalSummary() {
    return (
      <div style={{ display: "grid", gap: "0.75rem" }}>
        <h3 style={{ fontSize: 18, fontWeight: 600 }}>Summary</h3>
        {answers.map((a, i) => {
          const q = questions[i];
          return (
            <div key={i} style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: "0.75rem" }}>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Question {i + 1}</div>
              <div style={{ marginTop: 4, fontWeight: 600 }}>{q?.prompt ?? "—"}</div>
              <div style={{ marginTop: 6 }}>
                <div style={{ fontSize: 12, opacity: 0.7 }}>Your answer</div>
                <p style={{ whiteSpace: "pre-wrap" }}>{a.response || "—"}</p>
              </div>
              {a.notes ? (
                <div style={{ marginTop: 6 }}>
                  <div style={{ fontSize: 12, opacity: 0.7 }}>Notes</div>
                  <p style={{ whiteSpace: "pre-wrap" }}>{a.notes}</p>
                </div>
              ) : null}
              <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>Confidence: {a.confidence}/5</div>
            </div>
          );
        })}
      </div>
    );
  }

  function renderStepContent(stepIdx: number) {
    const q = questions[stepIdx];
    const a = answers[stepIdx];

    if (fetchErr) {
      return (
        <div style={{
          padding: "0.75rem",
          border: "1px solid #fecaca",
          background: "#fff1f2",
          color: "#7f1d1d",
          borderRadius: 12
        }}>
          Failed to load question: {fetchErr}
        </div>
      );
    }

    if (!q) {
      return <p style={{ opacity: 0.7, padding: "0.25rem 0" }}>{loading ? "Loading question…" : "Preparing…"}</p>;
    }

    return (
      <div style={{ display: "grid", gap: "0.75rem" }}>
        <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: "0.75rem", background: "#ffffff" }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: "#111827" }}>{q.prompt}</h2>
          {q.details ? <p style={{ opacity: 0.8, marginTop: 6 }}>{q.details}</p> : null}
        </div>

        <label>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Your answer</div>
          <textarea
            rows={4}
            style={{
              width: "100%",
              marginTop: 6,
              borderRadius: 10,
              padding: 10,
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              color: "#111827"
            }}
            value={a.response}
            onChange={(e) => updateAnswer(stepIdx, { response: e.target.value })}
            placeholder="Type your answer…"
          />
        </label>

        <label>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Notes (optional)</div>
          <textarea
            rows={3}
            style={{
              width: "100%",
              marginTop: 6,
              borderRadius: 10,
              padding: 10,
              background: "#ffffff",
              border: "1px solid #e5e7eb",
              color: "#111827"
            }}
            value={a.notes}
            onChange={(e) => updateAnswer(stepIdx, { notes: e.target.value })}
            placeholder="Any extra thoughts…"
          />
        </label>

        <label>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Confidence (1–5): {a.confidence}</div>
          <input
            type="range"
            min={1}
            max={5}
            value={a.confidence}
            onChange={(e) => updateAnswer(stepIdx, { confidence: Number(e.target.value) })}
            style={{ width: "100%" }}
          />
        </label>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1rem" }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Random Questions</h1>

      <Stepper
        initialStep={0}
        onStepChange={(s) => setActiveStep(s)}
        onFinalStepCompleted={() => { /* handle finish */ }}
        backButtonText="Previous"
        nextButtonText="Next"
      >
        {steps.map((idx) => (<Step key={idx}>{renderStepContent(idx)}</Step>))}
        <Step><FinalSummary /></Step>
      </Stepper>
    </div>
  );
}
