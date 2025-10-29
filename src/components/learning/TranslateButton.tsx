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
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        marginBottom: '1rem',
      }}>
        <button
          onClick={handleToggle}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: isTranslated ? '#ffba0a' : '#fe4d13',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'wait' : 'pointer',
            fontWeight: '500',
            fontSize: '0.875rem',
          }}
        >
          {loading ? '...' : isTranslated ? 'Show English' : `Translate to ${targetLanguage.charAt(0).toUpperCase() + targetLanguage.slice(1)}`}
        </button>
      </div>

      <p style={{ fontSize: '14px', marginBottom: '2rem', lineHeight: '1.2' }}>
        {isTranslated && translatedText ? translatedText : text}
      </p>
    </div>
  );
}