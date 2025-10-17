import type { Term } from '../../types/learning';

interface TermCardProps {
  term: Term;
  index: number;
  language: string;
  type?: 'existing' | 'custom';
}

export default function TermCard({ term, index, language, type = 'existing' }: TermCardProps) {
  const isEnglish = language.toLowerCase() === 'english';
  const lang = language.toLowerCase();

  return (
    <div
      style={{
        border: '1px solid #ddd',
        padding: '1.5rem',
        marginBottom: '1rem',
        borderRadius: '8px',
        backgroundColor: '#fff',
      }}
    >
      <div style={{ marginBottom: '1rem' }}>
        <strong style={{ fontSize: '1.1rem' }}>Term {index}</strong>
        {type === 'existing' && term.industry && (
          <span style={{ marginLeft: '1rem', color: '#666', fontSize: '0.9rem' }}>
            ({term.industry})
          </span>
        )}
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <strong>English:</strong> {term.term.english}
        </div>
        {!isEnglish && term.term[lang] && (
          <div style={{ color: '#0066cc', fontWeight: '500', fontSize: '1.1rem' }}>
            <strong style={{ textTransform: 'capitalize' }}>{lang}:</strong>{' '}
            {term.term[lang]}
          </div>
        )}
      </div>

      <div>
        <div style={{ marginBottom: '0.5rem' }}>
          <strong>Definition (English):</strong> {term.definition.english}
        </div>
        {!isEnglish && term.definition[lang] && (
          <div style={{ color: '#0066cc' }}>
            <strong style={{ textTransform: 'capitalize' }}>Definition ({lang}):</strong>{' '}
            {term.definition[lang]}
          </div>
        )}
      </div>
    </div>
  );
}