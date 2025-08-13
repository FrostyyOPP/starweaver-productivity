'use client';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'positive' | 'negative';
  };
  icon: string;
}

function StatCard({ title, value, change, icon }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="flex items-center justify-between">
        <div>
          <p className="stat-label">{title}</p>
          <p className="stat-value">{value}</p>
          {change && (
            <p className={`stat-change ${change.type}`}>
              {change.type === 'positive' ? '+' : ''}{change.value}%
            </p>
          )}
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  );
}

interface StatsCardsProps {
  stats: {
    totalVideos: number;
    totalHours: number;
    averageProductivity: number;
    targetAchievement: number;
    consistencyScore: number;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      <StatCard
        title="Total Videos"
        value={stats.totalVideos}
        icon="🎥"
      />
      <StatCard
        title="Total Hours"
        value={`${stats.totalHours}h`}
        icon="⏰"
      />
      <StatCard
        title="Avg Productivity"
        value={`${stats.averageProductivity}%`}
        icon="📊"
      />
      <StatCard
        title="Target Achievement"
        value={`${stats.targetAchievement}%`}
        icon="🎯"
      />
      <StatCard
        title="Consistency Score"
        value={`${stats.consistencyScore}%`}
        icon="📈"
      />
    </div>
  );
}
