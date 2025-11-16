import React from "react";
import { useSelfLeaderboard } from "../hooks/useSelfLeaderboard";
import LoadingBar from "./LoadingBar";

// Medal SVG icons
const GoldMedalIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="16"
      cy="16"
      r="14"
      fill="#FFD700"
      stroke="#FFA500"
      strokeWidth="2"
    />
    <path
      d="M16 8L18 14L24 14L19 18L21 24L16 20L11 24L13 18L8 14L14 14Z"
      fill="#FFA500"
    />
  </svg>
);

const SilverMedalIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="16"
      cy="16"
      r="14"
      fill="#C0C0C0"
      stroke="#808080"
      strokeWidth="2"
    />
    <path
      d="M16 8L18 14L24 14L19 18L21 24L16 20L11 24L13 18L8 14L14 14Z"
      fill="#808080"
    />
  </svg>
);

const BronzeMedalIcon = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="16"
      cy="16"
      r="14"
      fill="#CD7F32"
      stroke="#8B4513"
      strokeWidth="2"
    />
    <path
      d="M16 8L18 14L24 14L19 18L21 24L16 20L11 24L13 18L8 14L14 14Z"
      fill="#8B4513"
    />
  </svg>
);

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const month = date.toLocaleString("en-US", { month: "short" });
  const day = date.getDate();
  const year = date.getFullYear();
  return `${month} ${day} ${year}`;
};

const formatWeekRange = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const startMonth = start.toLocaleString("en-US", { month: "short" });
  const startDay = start.getDate();
  const startYear = start.getFullYear();

  const endMonth = end.toLocaleString("en-US", { month: "short" });
  const endDay = end.getDate();
  const endYear = end.getFullYear();

  // Format: "Aug 31 2025- Sept 6 2025"
  return `${startMonth} ${startDay} ${startYear}- ${endMonth} ${endDay} ${endYear}`;
};

const getRankDisplay = (
  rank: number | null
): { icon: JSX.Element | null; text: string } => {
  if (rank === null) {
    return { icon: null, text: "NP" };
  }

  if (rank === 1) {
    return { icon: <GoldMedalIcon />, text: "1st" };
  }
  if (rank === 2) {
    return { icon: <SilverMedalIcon />, text: "2nd" };
  }
  if (rank === 3) {
    return { icon: <BronzeMedalIcon />, text: "3rd" };
  }

  return { icon: null, text: `${rank}th` };
};

const SelfLeaderboard: React.FC = () => {
  const { data, isLoading, error } = useSelfLeaderboard(12);

  if (isLoading) {
    return (
      <div className="self-leaderboard">
        <LoadingBar isLoading={true} text="Loading your achievements..." />
      </div>
    );
  }

  if (error) {
    console.error("Self leaderboard error:", error);
    return (
      <div className="self-leaderboard">
        <p className="self-leaderboard-error">
          Error loading achievements. Please try again later.
        </p>
        {process.env.NODE_ENV === "development" && (
          <p className="self-leaderboard-error-detail">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        )}
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { medals, placements } = data;

  return (
    <div className="self-leaderboard">
      {/* Medals Section */}
      <div className="self-leaderboard-medals">
        <div className="self-leaderboard-medal self-leaderboard-medal--silver">
          <SilverMedalIcon />
          <span className="self-leaderboard-medal-count">{medals.silver}</span>
        </div>
        <div className="self-leaderboard-medal self-leaderboard-medal--gold">
          <GoldMedalIcon />
          <span className="self-leaderboard-medal-count">{medals.gold}</span>
        </div>
        <div className="self-leaderboard-medal self-leaderboard-medal--bronze">
          <BronzeMedalIcon />
          <span className="self-leaderboard-medal-count">{medals.bronze}</span>
        </div>
      </div>

      {/* Placements Section */}
      <div className="self-leaderboard-placements">
        <h2 className="self-leaderboard-placements-title">Placements</h2>
        <div className="self-leaderboard-placements-list">
          {placements.length === 0 ? (
            <p className="self-leaderboard-empty">
              No placements yet. Start learning to earn your first medal!
            </p>
          ) : (
            placements.map((placement, index) => {
              const { icon, text } = getRankDisplay(placement.rank);
              return (
                <div key={index} className="self-leaderboard-placement-item">
                  <span className="self-leaderboard-placement-date">
                    {formatWeekRange(
                      placement.weekStartDate,
                      placement.weekEndDate
                    )}
                  </span>
                  <div className="self-leaderboard-placement-rank">
                    {icon && (
                      <span className="self-leaderboard-placement-icon">
                        {icon}
                      </span>
                    )}
                    <span className="self-leaderboard-placement-text">
                      {text}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default SelfLeaderboard;
