import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { BACKEND_URL } from "../lib/api";
import type { WeeklyStatsResponse } from "@/types/dailyCheckin";

function TickBox({ isChecked, label, isToday }: { isChecked: boolean; label: string; isToday?: boolean }) {
  return (
    <div className={`tick-box ${isToday ? 'tick-box--today' : ''}`}>
      <span className="tick-box-label">{label}</span>
      <div className={`tick-box-circle ${isChecked ? "checked" : ""}`}>
        {isChecked && <span className="tick-box-checkmark">✓</span>}
      </div>
    </div>
  );
}

function getPSTDate(offsetDays: number = 0): Date {
  const now = new Date();
  const pstDate = new Date(now.toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
  pstDate.setDate(pstDate.getDate() + offsetDays);
  return pstDate;
}

function getSevenDayRange(): { date: Date; label: string; key: string; isToday: boolean; isFuture: boolean }[] {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const result = [];

  // Rolling 7-day window: 3 days back, today, 3 days forward
  for (let i = -3; i <= 3; i++) {
    const date = getPSTDate(i);
    const dayIndex = date.getDay();
    result.push({
      date,
      label: days[dayIndex],
      key: `${days[dayIndex]}-${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
      isToday: i === 0,
      isFuture: i > 0
    });
  }

  return result;
}

export default function DailyCheckIn() {
  const { getToken } = useAuth();
  const sevenDays = getSevenDayRange();

  const fetchWeeklyStats = async (): Promise<string[]> => {
    const token = await getToken();
    const response = await fetch(`${BACKEND_URL}/weekly-tracking/rolling-week`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch rolling week stats");
    }

    const result: WeeklyStatsResponse = await response.json();
    return result.data?.daysActive || [];
  };

  const {
    data: daysActive = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["weeklyStats"],
    queryFn: fetchWeeklyStats,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="daily-checkin-card">
        <h3 className="daily-checkin-title">Daily Check-in</h3>
        <p className="loading-text">Loading check-in...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="daily-checkin-card">
        <h3 className="daily-checkin-title">Daily Check-in</h3>
        <p className="error-text">Error loading check-in</p>
      </div>
    );
  }

  return (
    <div className="daily-checkin-card">
      <h3 className="daily-checkin-title">Daily Check-in</h3>
      <div className="tick-box-container">
        {sevenDays.map((day) => (
          <TickBox
            key={day.key}
            label={day.label}
            isChecked={!day.isFuture && daysActive.includes(day.label)}
            isToday={day.isToday}
          />
        ))}
      </div>
    </div>
  );
}