import React, { useState, useEffect } from 'react';
import rockyLogo from '/rocky.svg';

interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  score: number;
  language: string | null;
}

const LeaderboardPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:8080/leaderboard');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
      } else {
        setError(data.message || 'Failed to fetch leaderboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const getUserDisplayName = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) {
      return user.firstName;
    }
    if (user.lastName) {
      return user.lastName;
    }
    return 'Anonymous User';
  };

  const getLanguageCode = (language: string | null) => {
    if (!language) return 'ENG';
    
    const languageMap: { [key: string]: string } = {
      'English': 'ENG',
      'Chinese': 'CHN',
      'Tagalog': 'TGL',
      'French': 'FR',
      'Korean': 'KO',
      'Spanish': 'ES',
      'Punjabi': 'PA'
    };
    
    return languageMap[language] || 'ENG';
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>🏆 Leaderboard</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>🏆 Leaderboard</h1>
        <p style={{ color: 'red' }}>Error: {error}</p>
        <button onClick={fetchLeaderboard} style={{ padding: '0.5rem 1rem' }}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>🏆 Leaderboard</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {users.map((user, index) => (
          <div
            key={user.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem',
              backgroundColor: index < 3 ? '#f0f8ff' : '#f9f9f9',
              border: index < 3 ? '2px solid #007bff' : '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '1.1rem',
            }}
          >
            <span style={{ fontWeight: 'bold', color: index < 3 ? '#007bff' : '#333', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              #{index + 1} 
              <img 
                src={rockyLogo} 
                alt="Rocky" 
                style={{ 
                  width: '24px', 
                  height: '24px',
                  filter: index < 3 ? 'none' : 'grayscale(0.3)'
                }} 
              />
              {getUserDisplayName(user)}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 'bold', color: '#28a745' }}>
                {user.score.toLocaleString()}
              </span>
              <span style={{ 
                fontWeight: 'bold', 
                color: '#6c757d',
                fontSize: '0.9rem',
                backgroundColor: '#f8f9fa',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                border: '1px solid #dee2e6'
              }}>
                {getLanguageCode(user.language)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <p style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>
          No users found in the leaderboard.
        </p>
      )}
    </div>
  );
};

export default LeaderboardPage;
