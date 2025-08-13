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
        change={{ value: 12, type: 'positive' }}
        icon="🎥"
      />
      <StatCard
        title="Total Hours"
        value={`${stats.totalHours}h`}
        change={{ value: 8, type: 'positive' }}
        icon="⏰"
      />
      <StatCard
        title="Avg Productivity"
        value={`${stats.averageProductivity}%`}
        change={{ value: 5, type: 'positive' }}
        icon="📊"
      />
      <StatCard
        title="Target Achievement"
        value={`${stats.targetAchievement}%`}
        change={{ value: -2, type: 'negative' }}
        icon="🎯"
      />
      <StatCard
        title="Consistency Score"
        value={`${stats.consistencyScore}%`}
        change={{ value: 15, type: 'positive' }}
        icon="📈"
      />
    </div>
  );
}
