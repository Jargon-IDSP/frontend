import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { BACKEND_URL } from "../lib/api";
import type { MonthlyActivityResponse, MonthlyActivityData } from "../types/monthlyActivity";

function MonthBar({ monthData, isCurrentMonth }: { monthData: MonthlyActivityData; isCurrentMonth: boolean }) {
  const fillPercentage = monthData.maxDays > 0 
    ? Math.min((monthData.daysActive / monthData.maxDays) * 100, 100) 
    : 0;
  const isZero = monthData.daysActive === 0;
  const dayText = monthData.daysActive === 1 ? 'Day' : 'Days';

  return (
    <div className="monthly-activity-bar-container">
      <div className="monthly-activity-bar-wrapper">
        {isZero ? (
          <div className="monthly-activity-bar monthly-activity-bar--zero">
            <div className="monthly-activity-bar-content">
              <span className="monthly-activity-bar-value monthly-activity-bar-value--zero">0</span>
              <span className="monthly-activity-bar-days monthly-activity-bar-days--zero">Day</span>
            </div>
          </div>
        ) : (
          <div 
            className={`monthly-activity-bar ${isCurrentMonth ? 'monthly-activity-bar--current' : ''}`}
            style={{ height: `${fillPercentage}%` }}
          >
            <div className="monthly-activity-bar-content">
              <span className="monthly-activity-bar-value">{monthData.daysActive}</span>
              <span className="monthly-activity-bar-days">{dayText}</span>
            </div>
          </div>
        )}
      </div>
      <div className="monthly-activity-bar-label">
        <span className="monthly-activity-month">{monthData.month}</span>
        {monthData.year !== new Date().getFullYear() && (
          <span className="monthly-activity-year">{monthData.year}</span>
        )}
      </div>
    </div>
  );
}

export default function MonthlyActivity() {
  const { getToken } = useAuth();

  const fetchMonthlyActivity = async (): Promise<MonthlyActivityData[]> => {
    const token = await getToken();
    const response = await fetch(`${BACKEND_URL}/weekly-tracking/monthly-activity`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch monthly activity");
    }

    const result: MonthlyActivityResponse = await response.json();
    return result.data || [];
  };

  const {
    data: monthlyData = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["monthlyActivity"],
    queryFn: fetchMonthlyActivity,
    staleTime: 5 * 60 * 1000,
  });

  const displayData = monthlyData;

  if (isLoading) {
    return (
      <div className="monthly-activity-card">
        <h3 className="monthly-activity-title">Monthly Activity</h3>
        <p className="loading-text">Loading activity...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="monthly-activity-card">
        <h3 className="monthly-activity-title">Monthly Activity</h3>
        <p className="error-text">Error loading activity</p>
      </div>
    );
  }

  const currentMonthIndex = displayData.length - 1;

  return (
    <div className="monthly-activity-card">
      <h3 className="monthly-activity-title">Monthly Activity</h3>
      <div className="monthly-activity-bars">
        {displayData.map((monthData, index) => (
          <MonthBar
            key={`${monthData.month}-${monthData.year}`}
            monthData={monthData}
            isCurrentMonth={index === currentMonthIndex}
          />
        ))}
      </div>
    </div>
  );
}

