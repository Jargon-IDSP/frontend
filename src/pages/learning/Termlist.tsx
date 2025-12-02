import {
  useParams,
  useSearchParams,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Volume2, ChevronUp, ChevronDown } from "lucide-react";
import { useLearning } from "../../hooks/useLearning";
import { useUserPreferences } from "../../hooks/useUserPreferences";
import { useDocument } from "../../hooks/useDocument";
import EmptyState from "../../components/learning/EmptyState";
import LoadingBar from "../../components/LoadingBar";
import type { Term } from "../../types/learning";
import goBackIcon from "../../assets/icons/goBackIcon.svg";
import { industryIdToName } from "@/lib/api";

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

  let type: "existing" | "custom" = "custom";
  let endpoint = "";

  if (location.pathname.includes("/existing/")) {
    type = "existing";
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

  // Fetch document data if we have a documentId
  const { data: documentData } = useDocument(documentId);

  const terms = data?.data || [];
  const isEmpty = terms.length === 0;
  const showLoading = !data && !error;
  const [speakingTermId, setSpeakingTermId] = useState<string | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Handle speed adjustments
  const handleSpeedUp = () => {
    setSpeechRate((prevRate) => Math.min(prevRate + 0.25, 2.0));
  };

  const handleSpeedDown = () => {
    setSpeechRate((prevRate) => Math.max(prevRate - 0.25, 0.5));
  };

  // Handle text-to-speech
  const handleSpeak = (term: Term) => {
    // Cancel any ongoing speech
    if (speechSynthesisRef.current) {
      window.speechSynthesis.cancel();
      setSpeakingTermId(null);
    }

    // If clicking the same term that's speaking, stop it
    if (speakingTermId === term.id) {
      setSpeakingTermId(null);
      return;
    }

    // Check if term exists
    if (!term.term) {
      console.warn("No term available");
      return;
    }

    // Check if definition exists
    if (!term.definition) {
      console.warn("No definition available for this term");
      return;
    }

    // Check if browser supports speech synthesis
    if (!("speechSynthesis" in window)) {
      console.warn("Speech synthesis not supported in this browser");
      return;
    }

    setSpeakingTermId(term.id);

    const termText = term.term;
    const definitionText = term.definition;

    // Create utterance for term
    const termUtterance = new SpeechSynthesisUtterance(termText);
    termUtterance.lang = "en-US";
    termUtterance.rate = speechRate;
    termUtterance.pitch = 1;
    termUtterance.volume = 1;

    // Create utterance for definition
    const definitionUtterance = new SpeechSynthesisUtterance(definitionText);
    definitionUtterance.lang = "en-US";
    definitionUtterance.rate = speechRate;
    definitionUtterance.pitch = 1;
    definitionUtterance.volume = 1;

    // When term finishes, start definition
    termUtterance.onend = () => {
      window.speechSynthesis.speak(definitionUtterance);
    };

    // When definition finishes, clean up
    definitionUtterance.onend = () => {
      setSpeakingTermId(null);
      speechSynthesisRef.current = null;
    };

    // Handle speech errors
    const handleError = (error: SpeechSynthesisErrorEvent) => {
      console.error("Speech synthesis error:", error);
      setSpeakingTermId(null);
      speechSynthesisRef.current = null;
    };

    termUtterance.onerror = handleError;
    definitionUtterance.onerror = handleError;

    speechSynthesisRef.current = termUtterance;
    window.speechSynthesis.speak(termUtterance);
  };

  // Generate dynamic title
  const getPageTitle = () => {
    if (documentId && documentData?.document) {
      // For documents, show the document name
      return documentData.document.filename;
    } else if (type === "existing" && levelId) {
      // For existing/level-based, show "Level X: Industry Terminology"
      const industry = queryIndustryId ? industryIdToName[parseInt(queryIndustryId)] : "";
      return `Level ${levelId}${industry ? ` ${industry}` : ""} Terminology`;
    }
    return "Terms List";
  };

  const pageTitle = getPageTitle();

  return (
    <div className="container">
      <div className="termlist-page">
        <div className="termlist-page-header">
          <button onClick={() => navigate(-1)}>
            <img src={goBackIcon} alt="Go Back" />
          </button>
          <h1 className="termlist-page-title">{pageTitle}</h1>
        </div>

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
                <ul className="termlist-page-items">
                  {terms.map((term, index) => (
                    <li key={term.id || index} className="termlist-item">
                      <div className="termlist-item-number">{index + 1}.</div>
                      <div className="termlist-item-content">
                        <div className="termlist-item-term-wrapper">
                          <div className="termlist-item-term">
                            {term.term}
                          </div>
                          <div className="termlist-item-tts-controls">
                            <button
                              className="termlist-item-speed-button"
                              onClick={handleSpeedDown}
                              aria-label="Decrease speech speed"
                              title={`Decrease speed (current: ${speechRate.toFixed(2)}x)`}
                              disabled={speechRate <= 0.5}
                            >
                              <ChevronDown size={16} />
                            </button>
                            <div className="termlist-item-speaker-wrapper">
                              <button
                                className="termlist-item-speak-button"
                                onClick={() => handleSpeak(term)}
                                aria-label={`Speak definition for ${term.term}`}
                                title={`Speak definition for ${term.term} (speed: ${speechRate.toFixed(2)}x)`}
                                disabled={!term.definition}
                              >
                                <Volume2
                                  size={20}
                                  className={speakingTermId === term.id ? "speaking" : ""}
                                />
                              </button>
                              <span className="termlist-item-speed-indicator">
                                {speechRate.toFixed(1)}x
                              </span>
                            </div>
                            <button
                              className="termlist-item-speed-button"
                              onClick={handleSpeedUp}
                              aria-label="Increase speech speed"
                              title={`Increase speed (current: ${speechRate.toFixed(2)}x)`}
                              disabled={speechRate >= 2.0}
                            >
                              <ChevronUp size={16} />
                            </button>
                          </div>
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
                      </div>
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
