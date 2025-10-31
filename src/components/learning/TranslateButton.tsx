import { useState, useEffect } from 'react';

interface TranslateButtonProps {
  text: string;
  preferredLanguage?: string | null;
  onTranslate: (toLanguage: string) => Promise<string>;
}

export default function TranslateButton({ text, preferredLanguage, onTranslate }: TranslateButtonProps) {
  const [isTranslated, setIsTranslated] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [loading, setLoading] = useState(false);
  
  const targetLanguage = preferredLanguage || 'french';

  useEffect(() => {
    setIsTranslated(false);
    setTranslatedText('');
  }, [text]);

  const handleToggle = async () => {
    if (isTranslated) {
      setIsTranslated(false);
    } else {
      if (!translatedText) {
        setLoading(true);
        try {
          const result = await onTranslate(targetLanguage);
          setTranslatedText(result);
        } catch (err) {
          console.error('Translation failed:', err);
        } finally {
          setLoading(false);
        }
      }
      setIsTranslated(true);
    }
  };

  return (
    <div>
      <div className="quiz-translate-button">
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`translate-button ${isTranslated ? 'translate-button--translated' : 'translate-button--default'}`}
        >
          {loading ? '...' : isTranslated ? '🌐 Show English' : `🌐 Translate to ${targetLanguage.charAt(0).toUpperCase() + targetLanguage.slice(1)}`}
        </button>
      </div>

      <p className="translate-button-text">
        {isTranslated && translatedText ? translatedText : text}
      </p>
    </div>
  );
}