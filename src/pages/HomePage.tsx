import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import HappyRocky from '../components/avatar/HappyRocky';
import OCRDocumentsList from '../pages/documents/OCRDocumentsList';
import { BACKEND_URL } from '../lib/api';

export default function HomePage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();
  const navigate = useNavigate();

  const fetchHelp = async () => {
    try {
      setError(null);
      const res = await fetch(`${BACKEND_URL}/help`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      console.error('Error fetching data:', err);
    }
  };

  const navButtons = [
    { label: 'Random Questions (Stepper)', path: '/random-questions' },
    { label: 'Chat Page', path: '/chat' },
    { label: 'Profile Page', path: '/profile' },
    { label: 'Documents Page', path: '/documents' },
    { label: 'Leaderboard', path: '/leaderboard' },
    { label: 'Learn Jargon', path: '/learning' },
  ];

  return (
    <header>
      <SignedOut>
        <SignInButton />
        <div style={{ padding: '2rem' }}>
          <h1>Welcome to Jargon!</h1>
          <HappyRocky />
        </div>
      </SignedOut>

      <SignedIn>
        <UserButton />

        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          <h1>Welcome {user?.firstName || user?.username || 'User'}</h1>

          <div style={{ marginTop: '2rem', marginBottom: '2rem' }}>
            <OCRDocumentsList />
          </div>

          <hr style={{ margin: '2rem 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1rem', color: '#1f2937' }}>Navigation</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {navButtons.map(({ label, path }) => (
                <button
                  key={path}
                  style={{ padding: '0.75rem 1rem' }}
                  onClick={() => navigate(path)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <details style={{ marginTop: '2rem' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '1rem' }}>
              API Testing Tools
            </summary>

            {error && (
              <div style={{
                color: 'red',
                padding: '1rem',
                border: '1px solid red',
                marginBottom: '1rem',
                borderRadius: '4px',
              }}>
                Error: {error}
              </div>
            )}

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              <button style={{ padding: '0.75rem 1rem' }} onClick={fetchHelp}>
                Fetch Help
              </button>
            </div>

            {data && (
              <pre style={{
                marginTop: '1rem',
                padding: '1rem',
                backgroundColor: '#f9fafb',
                borderRadius: '6px',
                overflow: 'auto',
                maxHeight: '400px',
              }}>
                {JSON.stringify(data, null, 2)}
              </pre>
            )}
          </details>
        </div>
      </SignedIn>
    </header>
  );
}