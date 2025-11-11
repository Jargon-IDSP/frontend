interface StatItem {
  value: number;
  label: string;
}

interface ProfileStatsCardProps {
  stats: StatItem[];
}

/**
 * Reusable stats display component for profile pages
 * Shows follower/following/lesson counts in a grid layout
 */
export default function ProfileStatsCard({ stats }: ProfileStatsCardProps) {
  return (
    <div className="friend-profile-stats">
      {stats.map((stat, index) => (
        <div key={index} className="friend-profile-stat">
          <div className="friend-profile-stat-value">{stat.value}</div>
          <div className="friend-profile-stat-label">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
