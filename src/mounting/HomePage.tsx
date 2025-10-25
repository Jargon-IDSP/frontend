import { useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import HappyRocky from '../components/avatar/HappyRocky';
import rockyWhiteLogo from '/rockyWhite.svg';

export default function HomePage() {
  const { user } = useUser();
  const navigate = useNavigate();

  const navButtons = [
    { label: 'Learn Jargon', path: '/learning' },
    { label: 'Onboarding Preferences', path: '/random-questions' },
    { label: 'Documents', path: '/documents' },
    { label: 'Chat', path: '/chat' },
    { label: 'Leaderboard', path: '/leaderboard' },
    { label: 'Profile', path: '/profile' },
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
          <UserButton />
          
          <img src="../../public/Jargon_Wordmark.png" alt="Jargon Word Mark" style={{ borderRadius: '50%', width: '20rem' }} />

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
        </div>
      </SignedIn>
    </div>
  );
}