import {
  useParams,
  useSearchParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useLearning } from "../../hooks/useLearning";
import { useUserPreferences } from "../../hooks/useUserPreferences";
import EmptyState from "../../components/learning/EmptyState";
import LoadingBar from "../../components/LoadingBar";
import type { Term } from "../../types/learning";
import goBackIcon from "../../assets/icons/goBackIcon.svg";

export default function TermList() {
  const navigate = useNavigate();
  const location = useLocation();
  const { levelId, documentId, category, sessionNumber } = useParams<{
    levelId?: string;
    documentId?: string;
    category?: string;
    sessionNumber?: string;
  }>();
  const [searchParams] = useSearchParams();

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
    // Use industry-specific endpoint for terminology list
    if (queryIndustryId) {
      endpoint = `levels/${levelId}/industry/${queryIndustryId}/terms`;
    } else {
      endpoint = `levels/${levelId}/terms`;
    }
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
      ...(sessionNumber && { limit: "10" }),
    },
    enabled: !preferencesLoading,
  });

  const terms = data?.data || [];
  const isEmpty = terms.length === 0;
  const showLoading = !data && !error;

  return (
    <div className="termlist-page">
      <div className="container">
        <div className="termlist-page-header">
          <button onClick={() => navigate(-1)}>
            <img src={goBackIcon} alt="Go Back" />
          </button>
          <h1 className="termlist-page-title">Terms List</h1>
        </div>

        {/* Loading */}
        {showLoading && (
          <LoadingBar isLoading={true} text="Loading terms" />
        )}

        {error && (
          <div className="termlist-page-error">
            <strong>Error loading terms</strong>
            <p>{error}</p>
          </div>
        )}

        {!error && data && (
          <>
            {isEmpty ? (
              type !== "existing" ? (
                <EmptyState type="terms" />
              ) : (
                <div className="termlist-page-empty">
                  <p>No terms found for this level.</p>
                </div>
              )
            ) : (
              <div className="termlist-page-content">
                <ul className="termlist-items">
                  {terms.map((term, index) => (
                    <li key={term.id || index} className="termlist-item">
                      <div className="termlist-item-term">
                        {term.term}
                      </div>
                      {term.nativeTerm && (
                        <div className="termlist-item-translation">
                          {term.nativeTerm}
                        </div>
                      )}
                      {term.definition && (
                        <div className="termlist-item-definition">
                          {term.definition}
                        </div>
                      )}
                      {term.nativeDefinition && (
                        <div className="termlist-item-definition-translation">
                          {term.nativeDefinition}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
