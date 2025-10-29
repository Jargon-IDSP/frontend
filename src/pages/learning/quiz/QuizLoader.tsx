import type { ReactNode } from "react";

interface QuizLoaderProps {
  isLoading: boolean;
  error: Error | null;
  onBack?: () => void;
  children: ReactNode;
}

export function QuizLoader({ isLoading, error, onBack, children }: QuizLoaderProps) {
  if (isLoading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Loading quiz...</p>
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