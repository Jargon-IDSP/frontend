import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { BACKEND_URL } from '../lib/api';

export default function DailyCheckIn() {
  const { getToken } = useAuth();
  const [daysActive, setDaysActive] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    fetchWeeklyStats();
  }, []);

  const fetchWeeklyStats = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${BACKEND_URL}/weekly-tracking/current`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Weekly stats response:', result);
        // The API returns { success: true, data: { daysActive: [...] } }
        const activeDays = result.data?.daysActive || [];
        setDaysActive(activeDays);
      }
    } catch (err) {
      console.error('Error fetching weekly stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading check-in...</div>;
  }

  console.log('Days active:', daysActive);
  console.log('Current day abbreviations:', days);

  return (
    <div>
      <h3>Daily Check-in</h3>
      <div style={{ display: 'flex', gap: '1rem' }}>
        {days.map((day) => {
          const isChecked = daysActive.includes(day);
          console.log(`Day: ${day}, Checked: ${isChecked}`);
          return (
            <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <input
                type="checkbox"
                checked={isChecked}
                readOnly
                disabled
              />
              <span>{day}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
