import { useState, useEffect } from "react";
import {
  useParams,
  useSearchParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useLearning } from "../../hooks/useLearning";
import { useUserPreferences } from "../../hooks/useUserPreferences";
import TermCard from "../../components/learning/TermCard";
import EmptyState from "../../components/learning/EmptyState";
import type { Term } from "../../types/learning";

export default function Terms() {
  const navigate = useNavigate();
  const location = useLocation();
  const { levelId, documentId, category } = useParams<{
    levelId?: string;
    documentId?: string;
    category?: string;
  }>();
  const [searchParams] = useSearchParams();
  const [loadingProgress, setLoadingProgress] = useState(0);

  const {
    language,
    industryId,
    loading: preferencesLoading,
  } = useUserPreferences();

  const queryLanguage = searchParams.get("language") || language;
  const queryIndustryId =
    searchParams.get("industry_id") || industryId?.toString();

  // Determine type and endpoint
  let type: "existing" | "custom" = "custom";
  let endpoint = "";

  if (location.pathname.includes("/existing/")) {
    type = "existing";
    endpoint = `levels/${levelId}/terms`;
  } else if (location.pathname.includes("/learning/documents/")) {
    type = "custom";
    endpoint = `documents/${documentId}/terms`;
  } else if (category) {
    type = "custom";
    endpoint = `categories/${category}/terms`;
  } else {
    type = "custom";
    endpoint = "terms";
  }

  const { data, error } = useLearning<Term[]>({
    type,
    endpoint,
    params: {
      language: queryLanguage,
      ...(queryIndustryId &&
        type === "existing" && { industry_id: queryIndustryId }),
    },
    enabled: !preferencesLoading,
  });

  const terms = data?.data || [];
  const count = data?.count || 0;
  const isEmpty = terms.length === 0;
  const showLoading = !data && !error;

  // Simulate progress while loading
  useEffect(() => {
    if (showLoading) {
      setLoadingProgress(0);
      const interval = setInterval(() => {
        setLoadingProgress((prev) => {
          if (prev >= 90) return prev; // Stop at 90% until data arrives
          return prev + 10;
        });
      }, 200);

      return () => clearInterval(interval);
    } else if (data) {
      setLoadingProgress(100);
    }
  }, [showLoading, data]);

  return (
    <div style={{ padding: "2rem" }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: "1rem" }}>
        ← Back
      </button>

      <h1>{type === "existing" ? "Red Seal" : "Custom"} Terms</h1>

      {/* Progress Bar */}
      {showLoading && (
        <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
          <div
            style={{
              width: "100%",
              height: "8px",
              backgroundColor: "#e5e7eb",
              borderRadius: "9999px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${loadingProgress}%`,
                backgroundColor: "#fe4d13",
                transition: "width 0.3s ease-in-out",
                borderRadius: "9999px",
              }}
            />
          </div>
          <div
            style={{
              marginTop: "0.5rem",
              textAlign: "center",
              fontSize: "0.875rem",
              color: "#666",
            }}
          >
            Loading terms... {loadingProgress}%
          </div>
        </div>
      )}

      {error && (
        <div
          style={{
            backgroundColor: "#fee",
            padding: "1rem",
            borderRadius: "6px",
            border: "1px solid #fcc",
            marginTop: "1rem",
          }}
        >
          <strong>Error loading terms</strong>
          <p style={{ margin: "0.5rem 0 0 0" }}>{error}</p>
        </div>
      )}

      {!error && data && (
        <>
          {type === "existing" &&
            data?.industryCount !== undefined &&
            data?.generalCount !== undefined && (
              <p style={{ color: "#666", marginBottom: "1rem" }}>
                Total: {count} terms
                {queryIndustryId &&
                  ` (${data.industryCount} industry, ${data.generalCount} general)`}
              </p>
            )}

          {type !== "existing" && count > 0 && (
            <p style={{ color: "#666", marginBottom: "1rem" }}>
              Total: {count} terms
            </p>
          )}

          {isEmpty ? (
            type !== "existing" ? (
              <EmptyState type="terms" />
            ) : (
              <div>
                <p>No terms found for this level.</p>
              </div>
            )
          ) : (
            <div style={{ marginTop: "2rem" }}>
              {terms.map((term, index) => (
                <TermCard
                  key={term.id}
                  term={term}
                  index={index + 1}
                  language={queryLanguage}
                  type={type === "existing" ? "existing" : "custom"}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
