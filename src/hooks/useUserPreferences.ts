import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import { BACKEND_URL } from '../lib/api';

export const useUserPreferences = () => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    language: 'english',
    industryId: null as number | null,
    userId: user?.id || '',
  });

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        const token = await getToken();
        const res = await fetch(`${BACKEND_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (res.ok) {
          const data = await res.json();
          setPreferences({
            language: data.user?.language || 'english',
            industryId: data.user?.industryId || null,
            userId: user.id,
          });
        }
      } catch (err) {
        console.error('Error fetching user preferences:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [user?.id, getToken]);

  return { ...preferences, loading }; 
};