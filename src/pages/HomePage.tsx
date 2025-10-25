import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, useUser } from '@clerk/clerk-react';
import HappyRocky from '../components/avatar/HappyRocky';
import TopLeaderboard from '../components/TopLeaderboard';
import UploadFileCard from '../components/UploadFileCard';
import StartLearningCard from '../components/StartLearningCard';
import { BACKEND_URL } from '../lib/api';
import rockyWhiteLogo from '/rockyWhite.svg';

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
    // { label: 'Profile Page', path: '/profile' },
  ];

  return (
    <div className="home-page">
      {/* Top Header Section */}
      <div className="top-header">
        {/* Welcome Text - Top Left */}
        <div className="welcome-text-section">
          <SignedOut>
            <h1 className="welcome-title">Welcome to Jargon!</h1>
          </SignedOut>
          <SignedIn>
            <h1 className="welcome-title">Welcome {user?.firstName || user?.username || 'User'}</h1>
          </SignedIn>
        </div>

        {/* Rocky Logo - Top Right */}
        <div className="rocky-logo-section">
          <img src={rockyWhiteLogo} alt="Rocky" className="rocky-logo" />
        </div>
      </div>

      <SignedOut>
        <SignInButton />
        <div className="welcome-section">
          <HappyRocky />
        </div>
      </SignedOut>

      <SignedIn>
        <div className="welcome-section">

          <div className="quick-actions">
            <h2 className="quick-actions-title">Quick Actions</h2>
            <div className="quick-actions-grid">
              {navButtons.map(({ label, path }) => (
                <button
                  key={path}
                  className="p-2 border rounded"
                  onClick={() => navigate(path)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <StartLearningCard />
          <UploadFileCard />
          <TopLeaderboard />


          <details className="api-testing-section">
            <summary className="api-testing-title cursor-pointer font-bold m-3">
              API Testing Tools
            </summary>

            {error && (
              <div className="text-red-500 p-3 border border-red-500 m-3 rounded">
                Error: {error}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <button className="p-2 border rounded" onClick={fetchHelp}>
                Fetch Help
              </button>
            </div>

            {data && (
              <div className="api-response">
                <pre>
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            )}
          </details>
        </div>
      </SignedIn>
    </div>
  );
}