import React from "react";
import { useSelfLeaderboard } from "../hooks/useSelfLeaderboard";
import LoadingBar from "./LoadingBar";
import GoldMedal from "../assets/medals/gold_medal.svg";
import SilverMedal from "../assets/medals/silver_medal.svg";
import BronzeMedal from "../assets/medals/bronze_medal.svg";

// Medal SVG icons
const GoldMedalIcon = () => (
  <img src={GoldMedal} alt="Gold Medal" width="32" height="32" />
);

const SilverMedalIcon = () => (
  <img src={SilverMedal} alt="Silver Medal" width="32" height="32" />
);

const BronzeMedalIcon = () => (
  <img src={BronzeMedal} alt="Bronze Medal" width="32" height="32" />
);

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
): { icon: React.ReactElement | null; text: string } => {
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
