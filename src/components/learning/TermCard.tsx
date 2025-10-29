import type { Term } from "../../types/learning";

interface TermCardProps {
  term: Term;
  index: number;
  language: string;
  type?: "existing" | "custom";
}

export default function TermCard({
  term,
  index,
  language,
  type = "existing",
}: TermCardProps) {
  const isEnglish = language.toLowerCase() === "english";

  return (
    <div
      style={{
        border: "1px solid #ddd",
        padding: "1.5rem",
        marginBottom: "1rem",
        borderRadius: "8px",
        backgroundColor: "#fff",
      }}
    >
      <div style={{ marginBottom: "1rem" }}>
        <strong style={{ fontSize: "1.1rem" }}>Term {index}</strong>
        {type === "existing" && term.industry && (
          <span
            style={{ marginLeft: "1rem", color: "#666", fontSize: "0.9rem" }}
          >
            ({term.industry})
          </span>
        )}
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <div style={{ marginBottom: "0.5rem" }}>
          <strong>English:</strong> {term.term}
        </div>
        {!isEnglish && term.nativeTerm && (
          <div
            style={{ color: "#fe4d13", fontWeight: "500", fontSize: "1.1rem" }}
          >
            <strong style={{ textTransform: "capitalize" }}>{language}:</strong>{" "}
            {term.nativeTerm}
          </div>
        )}
      </div>

      <div>
        <div style={{ marginBottom: "0.5rem" }}>
          <strong>Definition (English):</strong> {term.definition}
        </div>
        {!isEnglish && term.nativeDefinition && (
          <div style={{ color: "#fe4d13" }}>
            <strong style={{ textTransform: "capitalize" }}>
              Definition ({language}):
            </strong>{" "}
            {term.nativeDefinition}
          </div>
        )}
      </div>
    </div>
  );
}
