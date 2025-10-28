import { Children, type ReactElement, type ReactNode, isValidElement, useMemo, useState } from "react";
// import "./Stepper.css";

type StepperProps = {
  initialStep?: number;
  onStepChange?: (step: number) => void;
  onFinalStepCompleted?: () => void;
  backButtonText?: string;
  nextButtonText?: string;
  className?: string;
  children: ReactNode;
};

export default function Stepper({
  initialStep = 0,
  onStepChange,
  onFinalStepCompleted,
  backButtonText = "Previous",
  nextButtonText = "Next",
  className,
  children,
}: StepperProps) {
  const steps = useMemo(
    () => Children.toArray(children).filter((c) => isValidElement(c)) as ReactElement[],
    [children]
  );
  const [step, setStep] = useState(initialStep);

  function go(to: number) {
    const clamped = Math.max(0, Math.min(to, steps.length - 1));
    setStep(clamped);
    onStepChange?.(clamped);
  }

  function next() {
    if (step < steps.length - 1) {
      go(step + 1);
    } else {
      onFinalStepCompleted?.();
    }
  }
  function prev() {
    if (step > 0) go(step - 1);
  }

  return (
    <div className={`rb-stepper ${className ?? ""}`}>
      <div className="rb-stepper-header">
        {steps.map((_, i) => (
          <span key={i} className={`rb-pill ${i === step ? "active" : ""}`}>Step {i + 1}</span>
        ))}
      </div>

      <div className="rb-step">{steps[step]}</div>

      <div className="rb-actions">
        <button className="rb-btn" onClick={prev} disabled={step === 0}>
          {backButtonText}
        </button>
        <button className="rb-btn" onClick={next}>
          {step < steps.length - 1 ? nextButtonText : "Finish"}
        </button>
      </div>
    </div>
  );
}

export function Step({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
