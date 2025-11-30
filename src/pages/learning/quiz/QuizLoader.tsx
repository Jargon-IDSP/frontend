import type { ReactNode } from "react";
import LoadingBar from "../../../components/LoadingBar";

interface QuizLoaderProps {
  isLoading: boolean;
  error: Error | null;
  onBack?: () => void;
  children: ReactNode;
}

export function QuizLoader({ isLoading, error, onBack, children }: QuizLoaderProps) {
  if (isLoading) {
    return (
      <div className="container">
        <LoadingBar isLoading={true} text="Loading quiz" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: "2rem" }}>
        {onBack && (
          <button onClick={onBack} style={{ marginBottom: "1rem" }}>
            ← Back
          </button>
        )}
        <div
          style={{
            backgroundColor: "#fee",
            padding: "1rem",
            borderRadius: "6px",
          }}
        >
          <strong>Error:</strong> {error.message}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}