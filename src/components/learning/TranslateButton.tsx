interface TranslateButtonProps {
  isTranslated: boolean;
  loading: boolean;
  targetLanguage: string;
  onToggle: () => void;
}

export default function TranslateButton({ isTranslated, loading, targetLanguage, onToggle }: TranslateButtonProps) {
  return (
    <div className="quiz-translate-button">
      <button
        onClick={onToggle}
        disabled={loading}
        className={`translate-button ${isTranslated ? 'translate-button--translated' : 'translate-button--default'}`}
      >
        {loading ? '...' : isTranslated ? 'Translate to English' : `Translate to ${targetLanguage.charAt(0).toUpperCase() + targetLanguage.slice(1)}`}
      </button>
    </div>
  );
}