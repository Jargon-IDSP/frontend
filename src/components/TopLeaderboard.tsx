import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../lib/api';
import rockyYellowLogo from '/rockyYellow.svg';

interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  score: number;
  language: string | null;
}

const TopLeaderboard: React.FC = () => {
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchTopUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${BACKEND_URL}/leaderboard`);
      const data = await response.json();
      
      if (data.success) {
        // Get only top 3 users
        setTopUsers(data.data.slice(0, 3));
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
    fetchTopUsers();
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


  if (loading) {
    return (
      <div className="top-leaderboard">
        <h2 className="leaderboard-title">Leaderboard</h2>
        <div className="leaderboard-content">
          <p>Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="top-leaderboard">
        <h2 className="leaderboard-title">Leaderboard</h2>
        <div className="leaderboard-content">
          <p className="error-text">Unable to load leaderboard</p>
          <button className="btn btn-primary" onClick={fetchTopUsers}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="top-leaderboard">
      <h2 className="leaderboard-title">Leaderboard</h2>
      <div className="leaderboard-content">
        {topUsers.length > 0 ? (
          <div className="podium-container">
            {topUsers.map((user, index) => (
              <div 
                key={user.id} 
                className={`podium-item rank-${index + 1} clickable-card`}
                onClick={() => navigate('/leaderboard')}
              >
                <div className="rocky-avatar">
                  <img 
                    src={rockyYellowLogo} 
                    alt="Rocky" 
                    className={`rocky-logo rank-${index + 1}`}
                  />
                </div>
                <div className="user-name">{getUserDisplayName(user)}</div>
                <div className="podium-block">
                  <div className="rank-label">{index === 0 ? '1st' : index === 1 ? '2nd' : '3rd'}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No users found</p>
        )}
      </div>
    </div>
  );
};

export default TopLeaderboard;
