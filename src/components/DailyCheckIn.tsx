import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { BACKEND_URL } from "../lib/api";
import type { WeeklyStatsResponse } from "@/types/dailyCheckin";

function TickBox({ isChecked, label }: { isChecked: boolean; label: string }) {
  return (
    <div className="tick-box">
      <span className="tick-box-label">{label}</span>
      <div className={`tick-box-circle ${isChecked ? "checked" : ""}`}>
        {isChecked && <span className="tick-box-checkmark">✓</span>}
      </div>
    </div>
  );
}

export default function DailyCheckIn() {
  const { getToken } = useAuth();
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const fetchWeeklyStats = async (): Promise<string[]> => {
    const token = await getToken();
    const response = await fetch(`${BACKEND_URL}/weekly-tracking/current`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch weekly stats");
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
        {days.map((day) => (
          <TickBox key={day} label={day} isChecked={daysActive.includes(day)} />
        ))}
      </div>
    </div>
  );
}
