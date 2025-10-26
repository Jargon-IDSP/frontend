import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { BACKEND_URL } from '../../lib/api';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { getUserDisplayName } from '../../types/friend';
import type { Friend } from '../../types/friend';

interface QuizShareModalProps {
  quizId: string;
  quizName: string;
  onClose: () => void;
  onShared?: () => void;
}

export default function QuizShareModal({ quizId, quizName, onClose, onShared }: QuizShareModalProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const { getToken } = useAuth();

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/friendships`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setFriends(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching friends:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFriend = (friendId: string) => {
    const newSelected = new Set(selectedFriends);
    if (newSelected.has(friendId)) {
      newSelected.delete(friendId);
    } else {
      newSelected.add(friendId);
    }
    setSelectedFriends(newSelected);
  };

  const handleShare = async () => {
    if (selectedFriends.size === 0) {
      alert('Please select at least one friend');
      return;
    }

    try {
      setSharing(true);
      const token = await getToken();
      const res = await fetch(`${BACKEND_URL}/learning/sharing/share-multiple`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customQuizId: quizId,
          friendUserIds: Array.from(selectedFriends),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        alert(`Successfully shared with ${data.data.totalShared} friend(s)!`);
        onShared?.();
        onClose();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to share quiz');
      }
    } catch (err) {
      console.error('Error sharing quiz:', err);
      alert('Failed to share quiz');
    } finally {
      setSharing(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={`Share "${quizName}"`}>
      {loading ? (
        <p>Loading friends...</p>
      ) : friends.length === 0 ? (
        <p style={{ color: '#6b7280' }}>
          You don't have any friends yet. Add friends to share quizzes with them!
        </p>
      ) : (
        <>
          <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
            Select friends to share this quiz with:
          </p>
          <div style={{ maxHeight: '300px', overflow: 'auto', marginBottom: '1.5rem' }}>
            {friends.map((friend) => (
              <label
                key={friend.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.75rem',
                  borderBottom: '1px solid #e5e7eb',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedFriends.has(friend.id)}
                  onChange={() => toggleFriend(friend.id)}
                  style={{ marginRight: '0.75rem', cursor: 'pointer' }}
                />
                <span>{getUserDisplayName(friend)}</span>
              </label>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
            <Button onClick={onClose} variant="secondary">
              Cancel
            </Button>
            <Button
              onClick={handleShare}
              disabled={sharing || selectedFriends.size === 0}
              variant="primary"
            >
              {sharing ? 'Sharing...' : `Share with ${selectedFriends.size} friend(s)`}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}