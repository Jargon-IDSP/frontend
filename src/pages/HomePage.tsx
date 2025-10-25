import { useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from '@clerk/clerk-react';
import HappyRocky from '../components/avatar/HappyRocky';

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
    <div>
      <SignedOut>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Welcome to Jargon!</h1>
          <HappyRocky />
          <SignInButton />
        </div>
      </SignedOut>

      <SignedIn>
        <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between' }}>
          <UserButton />
        </div>

        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          <img src="../../public/Jargon_Wordmark.png" alt="Jargon Word Mark" style={{ borderRadius: '50%', width: '20rem' }} />
          <h2> Welcome {user?.firstName || user?.username || 'User'}!</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '2rem' }}>
            {navButtons.map(({ label, path }) => (
              <button
                key={path}
                style={{ padding: '1rem' }}
                onClick={() => navigate(path)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </SignedIn>
    </div>
  );
}