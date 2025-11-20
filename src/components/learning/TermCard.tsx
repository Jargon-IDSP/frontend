import type { TermCardProps } from "../../types/termCard";
import "../../styles/components/_termCard.scss";

export default function TermCard({
  term,
  index,
  language,
  type = "existing",
}: TermCardProps) {
  const isEnglish = language.toLowerCase() === "english";

  return (
    <div className="term-card">
      <div className="term-card__header">
        <strong className="term-card__header-title">Term {index}</strong>
        {type === "existing" && term.industry && (
          <span className="term-card__header-industry">
            ({term.industry})
          </span>
        )}
      </div>

      <div className="term-card__content">
        <div className="term-card__content-row">
          <span className="term-card__content-label">English:</span> {term.term}
        </div>
        {!isEnglish && term.nativeTerm && (
          <div className="term-card__content-native">
            <span className="term-card__content-native-label">{language}:</span>{" "}
            {term.nativeTerm}
          </div>
        )}
      </div>

      <div className="term-card__definition">
        <div className="term-card__definition-row">
          <span className="term-card__definition-label">Definition (English):</span> {term.definition}
        </div>
        {!isEnglish && term.nativeDefinition && (
          <div className="term-card__definition-native">
            <span className="term-card__definition-native-label">
              Definition ({language}):
            </span>{" "}
            {term.nativeDefinition}
          </div>
        )}
      </div>
    </div>
  );
}
