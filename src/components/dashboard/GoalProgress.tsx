'use client';

interface GoalProgressProps {
  goalProgress: {
    daily: { target: number; achieved: number; percentage: number };
    weekly: { target: number; achieved: number; percentage: number };
    monthly: { target: number; achieved: number; percentage: number };
  };
}

function ProgressBar({ percentage, color = 'primary' }: { percentage: number; color?: string }) {
  const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
  
  return (
    <div className="progress">
      <div 
        className={`progress-bar bg-${color}-600`}
        style={{ width: `${clampedPercentage}%` }}
      />
    </div>
  );
}

export default function GoalProgress({ goalProgress }: GoalProgressProps) {
  const goals = [
    {
      title: 'Daily Goal',
      target: goalProgress.daily.target,
      achieved: goalProgress.daily.achieved,
      percentage: goalProgress.daily.percentage,
      icon: '📅',
      color: goalProgress.daily.percentage >= 100 ? 'success' : 'primary'
    },
    {
      title: 'Weekly Goal',
      target: goalProgress.weekly.target,
      achieved: goalProgress.weekly.achieved,
      percentage: goalProgress.weekly.percentage,
      icon: '📊',
      color: goalProgress.weekly.percentage >= 100 ? 'success' : 'primary'
    },
    {
      title: 'Monthly Goal',
      target: goalProgress.monthly.target,
      achieved: goalProgress.monthly.achieved,
      percentage: goalProgress.monthly.percentage,
      icon: '📈',
      color: goalProgress.monthly.percentage >= 100 ? 'success' : 'primary'
    }
  ];

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Goal Progress</h3>
        <p className="card-description">Track your daily, weekly, and monthly targets</p>
      </div>
      <div className="card-content">
        <div className="space-y-6">
          {goals.map((goal) => (
            <div key={goal.title} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{goal.icon}</span>
                  <span className="font-medium text-secondary-900">{goal.title}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-secondary-900">
                    {goal.achieved} / {goal.target}
                  </span>
                  <span className={`ml-2 text-xs font-medium ${
                    goal.percentage >= 100 ? 'text-success-600' : 'text-secondary-500'
                  }`}>
                    {goal.percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
              <ProgressBar percentage={goal.percentage} color={goal.color} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
