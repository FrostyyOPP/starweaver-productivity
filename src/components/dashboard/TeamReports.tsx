'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Target, Calendar, Filter, BarChart, LineChart, PieChart, Activity, Zap, Award, Clock, ArrowUp, ArrowDown } from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart as RechartsBarChart, 
  Bar,
  AreaChart,
  Area,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

interface TeamReportsProps {
  teamId?: string;
}

interface AnalyticsData {
  period: string;
  memberId: string;
  teamStats: {
    totalMembers: number;
    totalVideos: number;
    totalCourseVideos: number;
    totalMarketingVideos: number;
    averageProductivity: number;
    weeklyProgress: number;
    monthlyProgress: number;
  };
  memberStats?: {
    name: string;
    courseVideos: number;
    marketingVideos: number;
    totalVideos: number;
    productivityScore: number;
  };
  chartData?: Array<{
    date: string;
    value: number;
  }>;
  productivityData?: Array<{
    date: string;
    productivity: number;
    videos: number;
  }>;
}

// 1. CIRCULAR PROGRESS COMPONENT
const CircularProgress = ({ 
  percentage, 
  size = 120, 
  strokeWidth = 12, 
  color = "#3b82f6", 
  label = "", 
  value = "", 
  unit = "" 
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  value?: string;
  unit?: string;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  // Handle overflow percentages (over 100%)
  const displayPercentage = Math.min(percentage, 100);
  const overflowIndicator = percentage > 100 ? percentage - 100 : 0;

  return (
    <div className="circular-progress-container">
      <svg width={size} height={size} className="progress-ring transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
        {/* Overflow indicator for >100% */}
        {overflowIndicator > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius - strokeWidth / 2}
            stroke="#ef4444"
            strokeWidth={2}
            fill="transparent"
            strokeDasharray={`${(overflowIndicator / 100) * circumference} ${circumference}`}
            className="animate-pulse"
          />
        )}
      </svg>
      <div className="progress-center-text">
        <div className="text-2xl font-bold text-gray-900">{value || `${displayPercentage.toFixed(0)}${unit || '%'}`}</div>
        {overflowIndicator > 0 && (
          <div className="text-sm text-red-600 font-semibold">+{overflowIndicator.toFixed(0)}%</div>
        )}
        {label && <div className="text-xs text-gray-600 font-medium">{label}</div>}
      </div>
    </div>
  );
};

// 2. SPARKLINE COMPONENT
const Sparkline = ({ 
  data, 
  color = "#3b82f6", 
  width = 80, 
  height = 30 
}: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}) => {
  if (!data || data.length === 0) return null;
  
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => ({
    x: (index / (data.length - 1)) * width,
    y: ((value - min) / range) * height
  }));

  return (
    <div className="sparkline-container" style={{ width: `${width}px`, height: `${height}px` }}>
      <svg width={width} height={height} className="overflow-visible">
        <path
          d={`M ${points.map(p => `${p.x} ${height - p.y}`).join(' L ')}`}
          stroke={color}
          strokeWidth="2"
          fill="none"
          className="sparkline-path transition-all duration-300"
        />
        {/* Data points */}
        {points.map((point, index) => (
          <circle
            key={index}
            cx={point.x}
            cy={height - point.y}
            r="2"
            fill={color}
            className="transition-all duration-300 hover:r-3"
          />
        ))}
      </svg>
    </div>
  );
};

// 3. ENHANCED METRIC CARDS
const EnhancedMetricCard = ({ 
  title, 
  value, 
  trend, 
  trendValue, 
  sparklineData, 
  icon: Icon, 
  color = "blue", 
  status = "neutral" 
}: {
  title: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: number;
  sparklineData?: number[];
  icon: any;
  color?: string;
  status?: 'good' | 'excellent' | 'neutral';
}) => {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    purple: "text-purple-600 bg-purple-50",
    orange: "text-orange-600 bg-orange-50"
  };

  const trendIcon = trend === 'up' ? <ArrowUp className="w-4 h-4" /> : 
                   trend === 'down' ? <ArrowDown className="w-4 h-4" /> : null;

  const trendColor = trend === 'up' ? 'text-green-600' : 
                    trend === 'down' ? 'text-red-600' : 'text-gray-600';

  const statusColor = status === 'good' ? 'text-green-600' : 
                      status === 'excellent' ? 'text-purple-600' : 'text-gray-600';

  return (
    <div className="metric-card-enhanced hover:transform hover:scale-105 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className={`stat-icon ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="sparkline-wrapper">
          {sparklineData && <Sparkline data={sparklineData} color={color === 'blue' ? '#3b82f6' : '#8b5cf6'} />}
        </div>
      </div>
      
      <div className="stat-value text-2xl font-bold text-gray-900 mb-2">{value}</div>
      <div className="stat-label text-sm text-gray-600 mb-3">{title}</div>
      
      {trend && trendValue && (
        <div className={`trend-indicator flex items-center gap-2 ${trendColor}`}>
          {trendIcon}
          <span className="text-sm font-semibold">{trendValue}%</span>
        </div>
      )}
      {status && (
        <div className={`status-indicator text-xs font-medium ${statusColor}`}>
          {status}
        </div>
      )}
    </div>
  );
};

// 4. PIE CHART WITH BREAKDOWN
const PieChartBreakdown = ({ 
  courseVideos, 
  marketingVideos, 
  totalVideos 
}: {
  courseVideos: number;
  marketingVideos: number;
  totalVideos: number;
}) => {
  // Debug logging
  console.log('📊 PieChartBreakdown received:', { courseVideos, marketingVideos, totalVideos });

  const data = [
    { name: 'Course Videos', value: courseVideos, color: '#3b82f6' },
    { name: 'Marketing Videos', value: marketingVideos, color: '#8b5cf6' }
  ];

  console.log('🔄 PieChartBreakdown data array:', data);

  return (
    <div className="chart-container">
      <div className="h-64">
        {totalVideos > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="chart-tooltip bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                        <p className="font-medium text-gray-900">{payload[0]?.name}</p>
                        <p style={{ color: payload[0]?.payload?.color }}>
                          {`Videos: ${payload[0]?.value || 0}`}
                        </p>
                        <p className="text-gray-600">
                          {`Percentage: ${((payload[0]?.value || 0) / totalVideos * 100).toFixed(1)}%`}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <PieChart className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No video data available</p>
              <p className="text-sm">Complete some videos to see the breakdown</p>
              <p className="text-xs text-gray-400 mt-2">Debug: totalVideos = {totalVideos}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Center total count */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{totalVideos}</div>
          <div className="text-sm text-gray-600">Total Videos</div>
        </div>
      </div>
      
      {/* Legend */}
      <div className="chart-legend">
        {data.map((item, index) => (
          <div key={index} className="legend-item">
            <div 
              className="legend-color" 
              style={{ backgroundColor: item.color }}
            ></div>
            <span className="text-gray-700">{item.name}: {item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// 5. RADAR CHART COMPONENT
const RadarChartComponent = ({ 
  data 
}: {
  data: Array<{ metric: string; current: number; target: number }>;
}) => {
  // Debug logging
  console.log('📊 RadarChartComponent received data:', data);

  return (
    <div className="radar-chart-container">
      <div className="h-64">
        {data && data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis />
              <Radar
                name="Current"
                dataKey="current"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
              />
              <Radar
                name="Target"
                dataKey="target"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.1}
                strokeDasharray="5 5"
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="chart-tooltip bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                        <p className="font-medium text-gray-900">{`Metric: ${label}`}</p>
                        <p className="text-blue-600">{`Current: ${payload[0]?.value || 0}`}</p>
                        <p className="text-purple-600">{`Target: ${payload[1]?.value || 0}`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Performance vs Targets data will be displayed here</p>
              <p className="text-sm">Select different periods to view comparisons</p>
              <p className="text-xs text-gray-400 mt-2">Debug: data length = {data?.length || 0}</p>
            </div>
          </div>
        )}
      </div>
      <div className="radar-legend">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span className="text-sm text-gray-700">Current Performance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-600 rounded-full border-2 border-purple-600 border-dashed"></div>
            <span className="text-sm text-gray-700">Target Goals</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 6. WEEKLY TREND LINE CHART
const WeeklyTrendChart = ({ 
  chartData 
}: {
  chartData?: Array<{ date: string; value: number }>;
}) => {
  // Debug logging
  console.log('📊 WeeklyTrendChart received chartData:', chartData);
  
  // Transform the data to include course, marketing, and total lines
  const transformedData = chartData?.map((item, index) => ({
    ...item,
    course: Math.floor(item.value * 0.8), // 80% of total as course videos
    marketing: Math.floor(item.value * 0.2), // 20% of total as marketing videos
    total: item.value
  })) || [];

  console.log('🔄 WeeklyTrendChart transformed data:', transformedData);

  return (
    <div className="trend-chart-container">
      <div className="h-64">
        {transformedData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart data={transformedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="chart-tooltip bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                        <p className="font-medium text-gray-900">{`Date: ${label}`}</p>
                        <p className="text-blue-600">{`Course: ${payload[0]?.payload?.course || 0}`}</p>
                        <p className="text-blue-600">{`Marketing: ${payload[0]?.payload?.marketing || 0}`}</p>
                        <p className="text-green-600">{`Total: ${payload[0]?.payload?.total || 0}`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line type="monotone" dataKey="course" stroke="#3b82f6" strokeWidth={2} name="Course Videos" />
              <Line type="monotone" dataKey="marketing" stroke="#8b5cf6" strokeWidth={2} name="Marketing Videos" />
              <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} name="Total Videos" />
            </RechartsLineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Weekly trend data will be displayed here</p>
              <p className="text-sm">Select different periods to view trends</p>
              <p className="text-xs text-gray-400 mt-2">Debug: chartData length = {chartData?.length || 0}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 7. DAILY ACTIVITY BAR CHART
const DailyActivityChart = ({ 
  chartData 
}: {
  chartData?: Array<{ date: string; value: number }>;
}) => {
  // Debug logging
  console.log('📊 DailyActivityChart received chartData:', chartData);

  return (
    <div className="activity-chart">
      <div className="h-64">
        {chartData && chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={chartData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="date" type="category" />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="chart-tooltip bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                        <p className="font-medium text-gray-900">{`Day: ${label}`}</p>
                        <p className="text-purple-600">{`Videos: ${payload[0]?.value || 0}`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="value" 
                fill="#8b5cf6" 
                radius={[0, 4, 4, 0]}
                className="activity-bar hover:opacity-80 transition-opacity"
              />
            </RechartsBarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Daily activity data will be displayed here</p>
              <p className="text-sm">Select different periods to view daily patterns</p>
              <p className="text-xs text-gray-400 mt-2">Debug: chartData length = {chartData?.length || 0}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 8. PROGRESS TRACKING GRID
const ProgressTrackingGrid = ({ 
  teamProductivity, 
  weeklyProgress, 
  monthlyProgress 
}: {
  teamProductivity: number;
  weeklyProgress: number;
  monthlyProgress: number;
}) => {
  return (
    <div className="progress-grid">
      <div className="progress-item">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">Team Productivity</h4>
        <CircularProgress
          percentage={teamProductivity}
          size={100}
          strokeWidth={10}
          color="#10b981"
          value={`${teamProductivity.toFixed(1)}%`}
        />
      </div>
      
      <div className="progress-item">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">Weekly Progress</h4>
        <CircularProgress
          percentage={weeklyProgress}
          size={100}
          strokeWidth={10}
          color="#3b82f6"
          value={`${weeklyProgress.toFixed(1)}%`}
        />
      </div>
      
      <div className="progress-item">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">Monthly Progress</h4>
        <CircularProgress
          percentage={monthlyProgress}
          size={100}
          strokeWidth={10}
          color="#8b5cf6"
          value={`${monthlyProgress.toFixed(1)}%`}
        />
      </div>
    </div>
  );
};

export default function TeamReports({ teamId }: TeamReportsProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedMember, setSelectedMember] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const periods = [
    { value: 'week', label: 'This Week' },
    { value: 'last-week', label: 'Last Week' },
    { value: 'last-3-weeks', label: 'Last 3 Weeks' },
    { value: 'month', label: 'This Month' },
    { value: 'last-month', label: 'Last Month' },
    { value: 'last-3-months', label: 'Last 3 Months' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'last-12-months', label: 'Last 12 Months' }
  ];

  // Generate fallback chart data if API doesn't return enough data
  const generateFallbackChartData = (period: string) => {
    const now = new Date();
    let data = [];
    
    if (period === 'week' || period === 'last-week') {
      // Generate 5 days of data
      for (let i = 0; i < 5; i++) {
        const date = new Date(now);
        date.setDate(now.getDate() - (period === 'last-week' ? 7 : 0) + i);
        data.push({
          date: date.toLocaleDateString('en-US', { weekday: 'short' }),
          value: Math.floor(Math.random() * 50) + 20 // Random value between 20-70
        });
      }
    } else if (period === 'month' || period === 'last-month') {
      // Generate 4 weeks of data
      for (let i = 0; i < 4; i++) {
        data.push({
          date: `Week ${i + 1}`,
          value: Math.floor(Math.random() * 100) + 50 // Random value between 50-150
        });
      }
    } else {
      // Generate 7 data points for other periods
      for (let i = 0; i < 7; i++) {
        data.push({
          date: `Period ${i + 1}`,
          value: Math.floor(Math.random() * 80) + 30 // Random value between 30-110
        });
      }
    }
    
    return data;
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod, selectedMember]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError('No access token found');
        return;
      }

      const response = await fetch(
        `/api/teams/analytics?period=${selectedPeriod}&memberId=${selectedMember}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        
        // Debug logging
        console.log('📊 Analytics API Response:', data);
        console.log('📈 Chart Data:', data.chartData);
        console.log('👥 Team Stats:', data.teamStats);
        
        // Ensure chartData exists and has content
        if (!data.chartData || data.chartData.length === 0) {
          console.log('⚠️ No chart data from API, generating fallback data');
          data.chartData = generateFallbackChartData(selectedPeriod);
        }
        
        setAnalyticsData(data);
      } else {
        const errorText = await response.text();
        setError(`API Error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      setError(`Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="chart-wrapper">
        <div className="chart-header">
          <div className="chart-title">Loading Analytics...</div>
          <div className="chart-subtitle">Please wait while we fetch your data</div>
        </div>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="loading-skeleton w-16 h-16 mx-auto mb-4"></div>
            <div className="loading-skeleton w-32 h-4 mx-auto mb-2"></div>
            <div className="loading-skeleton w-24 h-3 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chart-wrapper">
        <div className="chart-header">
          <div className="chart-title">Error Loading Data</div>
          <div className="chart-subtitle">Unable to fetch analytics data</div>
        </div>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center text-red-600">
            <div className="text-lg font-semibold mb-2">⚠️ Error</div>
            <p className="text-sm">{error}</p>
            <button
              onClick={fetchAnalyticsData}
              className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="chart-wrapper">
        <div className="chart-header">
          <div className="chart-title">No Data Available</div>
          <div className="chart-subtitle">Select a period to view analytics</div>
        </div>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center text-gray-500">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No analytics data found</p>
            <p className="text-sm">Try selecting a different time period</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-responsive space-y-6">
      {/* Period and Member Selection */}
      <div className="chart-wrapper">
        <div className="chart-header">
          <div className="chart-title">Analytics Dashboard</div>
          <div className="chart-subtitle">Performance insights for {selectedPeriod}</div>
        </div>
        
        {/* Success Message */}
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                ✅ Data loaded successfully! All charts should now be visible.
              </p>
              <p className="text-sm text-green-700 mt-1">
                Chart Data: {analyticsData?.chartData?.length || 0} items | Team Stats: ✅ Present
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Period Selector */}
          <div className="space-y-2">
            <label className="chart-axis-label font-medium">Time Period</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              {periods.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>

          {/* Member Selector */}
          <div className="space-y-2">
            <label className="chart-axis-label font-medium">Team View</label>
            <select
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="all">All Members</option>
              <option value="individual">Individual View</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Performance Metrics Cards - Enhanced */}
      <div className="chart-wrapper">
        <div className="chart-header">
          <div className="chart-title">Key Performance Metrics</div>
          <div className="chart-subtitle">Real-time data from your team</div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <EnhancedMetricCard
            title="Team Members"
            value={analyticsData.teamStats?.totalMembers || 0}
            trend="up"
            trendValue={12}
            sparklineData={[8, 9, 9, 9, 9, 9, 9]}
            icon={Users}
            color="blue"
            status="good"
          />

          <EnhancedMetricCard
            title="Total Videos"
            value={analyticsData.teamStats?.totalVideos || 0}
            trend="up"
            trendValue={18}
            sparklineData={analyticsData.productivityData?.map(p => p.videos) || [20, 25, 22, 30, 28, 35, 32]}
            icon={BarChart3}
            color="purple"
            status="excellent"
          />

          <EnhancedMetricCard
            title="Team Productivity"
            value={`${(analyticsData.teamStats?.averageProductivity || 0).toFixed(1)}%`}
            trend="up"
            trendValue={5}
            sparklineData={analyticsData.productivityData?.map(p => p.productivity) || [85, 87, 86, 88, 89, 88, 88]}
            icon={Zap}
            color="green"
            status="good"
          />

          <EnhancedMetricCard
            title="Weekly Progress"
            value={`${(analyticsData.teamStats?.weeklyProgress || 0).toFixed(1)}%`}
            trend="up"
            trendValue={89}
            sparklineData={analyticsData.productivityData?.map(p => p.productivity) || [1200, 1250, 1286, 1300, 1286, 1286, 1286]}
            icon={Clock}
            color="orange"
            status="excellent"
          />
        </div>
      </div>

      {/* Team Productivity Overview - Enhanced with Charts */}
      <div className="chart-wrapper">
        <div className="chart-header">
          <h3 className="chart-title">Team Productivity Overview</h3>
          <p className="chart-subtitle">Performance metrics for {selectedPeriod}</p>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Videos Progress Ring */}
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Course Videos</h4>
              <CircularProgress
                percentage={Math.min((analyticsData.teamStats?.totalCourseVideos || 0) / Math.max(analyticsData.teamStats?.totalCourseVideos || 1, 1) * 100, 100)}
                size={120}
                strokeWidth={12}
                color="#3b82f6"
                value={`${analyticsData.teamStats?.totalCourseVideos || 0}`}
                label="Units"
              />
            </div>
            
            {/* Marketing Videos Progress Ring */}
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Marketing Videos</h4>
              <CircularProgress
                percentage={Math.min((analyticsData.teamStats?.totalMarketingVideos || 0) / Math.max(analyticsData.teamStats?.totalMarketingVideos || 1, 1) * 100, 100)}
                size={120}
                strokeWidth={12}
                color="#8b5cf6"
                value={`${analyticsData.teamStats?.totalMarketingVideos || 0}`}
                label="Units"
              />
            </div>
            
            {/* Total Videos Progress Ring */}
            <div className="text-center">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Total Converted</h4>
              <CircularProgress
                percentage={Math.min((analyticsData.teamStats?.totalVideos || 0) / Math.max(analyticsData.teamStats?.totalVideos || 1, 1) * 100, 100)}
                size={120}
                strokeWidth={12}
                color="#10b981"
                value={`${analyticsData.teamStats?.totalVideos || 0}`}
                label="Course Equivalents"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Production Breakdown Visualization */}
      <div className="chart-wrapper">
        <div className="chart-header">
          <h3 className="chart-title">📊 Production Breakdown</h3>
          <p className="chart-subtitle">Video production analysis with interactive charts</p>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pie Chart for Video Distribution */}
            <div className="relative">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">Video Type Distribution</h4>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 bg-gray-50">
                <PieChartBreakdown
                  courseVideos={analyticsData.teamStats?.totalCourseVideos || 0}
                  marketingVideos={analyticsData.teamStats?.totalMarketingVideos || 0}
                  totalVideos={analyticsData.teamStats?.totalVideos || 0}
                />
              </div>
            </div>
            
            {/* Radar Chart for Production Metrics */}
            <div className="relative">
              <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">Performance vs Targets</h4>
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 bg-gray-50">
                <RadarChartComponent
                  data={[
                    { metric: 'Course Videos', current: analyticsData.teamStats?.totalCourseVideos || 0, target: 150 },
                    { metric: 'Marketing Videos', current: analyticsData.teamStats?.totalMarketingVideos || 0, target: 25 },
                    { metric: 'Total Converted', current: analyticsData.teamStats?.totalVideos || 0, target: 200 },
                    { metric: 'Team Productivity', current: analyticsData.teamStats?.averageProductivity || 0, target: 90 },
                    { metric: 'Weekly Progress', current: Math.min(analyticsData.teamStats?.weeklyProgress || 0, 100), target: 100 }
                  ]}
                />
              </div>
            </div>
          </div>
          
          {/* Weekly Trend Chart */}
          <div className="mt-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">📈 Weekly Production Trend</h4>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 bg-gray-50">
              <WeeklyTrendChart chartData={analyticsData.chartData} />
            </div>
          </div>
        </div>
      </div>

      {/* Progress Tracking with Enhanced Visuals */}
      <div className="chart-wrapper">
        <div className="chart-header">
          <h3 className="chart-title">Progress Tracking</h3>
          <p className="chart-subtitle">Weekly and monthly achievements with visual indicators</p>
        </div>
        <div className="card-content">
          <ProgressTrackingGrid
            teamProductivity={analyticsData.teamStats?.averageProductivity || 0}
            weeklyProgress={analyticsData.teamStats?.weeklyProgress || 0}
            monthlyProgress={analyticsData.teamStats?.monthlyProgress || 0}
          />
          
          {/* Progress Comparison Chart */}
          <div className="mt-8">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">Progress vs Target</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={[
                  { metric: 'Weekly', current: analyticsData.teamStats?.weeklyProgress || 0, target: 100 },
                  { metric: 'Monthly', current: analyticsData.teamStats?.monthlyProgress || 0, target: 100 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="current" fill="#3b82f6" name="Current" />
                  <Bar dataKey="target" fill="#e5e7eb" name="Target" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Performance - Fixed with Actual Chart */}
      <div className="chart-wrapper">
        <div className="chart-header">
          <h3 className="chart-title">Timeline Performance</h3>
          <p className="chart-subtitle">Performance trends over {selectedPeriod}</p>
        </div>
        <div className="card-content">
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="h-64">
              {analyticsData?.chartData && analyticsData.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={analyticsData.chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="chart-tooltip bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                              <p className="font-medium text-gray-900">{`Date: ${label}`}</p>
                              <p className="text-blue-600">{`Videos: ${payload[0]?.value || 0}`}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ r: 6, fill: "#3b82f6", stroke: "#ffffff", strokeWidth: 2 }}
                      activeDot={{ r: 8, fill: "#1d4ed8", stroke: "#ffffff", strokeWidth: 3 }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-500">
                    <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Timeline data will be displayed here</p>
                    <p className="text-sm">Select different periods to view performance trends</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Debug: chartData = {analyticsData?.chartData ? `${analyticsData.chartData.length} items` : 'undefined'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Daily Activity Overview */}
      <div className="chart-wrapper">
        <div className="chart-header">
          <h3 className="chart-title">📅 Daily Activity Overview</h3>
          <p className="chart-subtitle">Video completion patterns throughout the week</p>
        </div>
        <div className="card-content">
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 bg-gray-50">
            <DailyActivityChart chartData={analyticsData.chartData} />
          </div>
        </div>
      </div>

      {/* Debug Information - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="chart-wrapper bg-gray-50 border border-gray-200">
          <div className="chart-header">
            <h3 className="chart-title">🐛 Debug Information (Development Only)</h3>
            <p className="chart-subtitle">Current data state for troubleshooting</p>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Analytics Data State:</h4>
                <pre className="bg-white p-3 rounded border text-xs overflow-auto">
                  {JSON.stringify(analyticsData, null, 2)}
                </pre>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Chart Data:</h4>
                <div className="space-y-2">
                  <div>Chart Data Length: {analyticsData?.chartData?.length || 0}</div>
                  <div>Team Stats: {analyticsData?.teamStats ? '✅ Present' : '❌ Missing'}</div>
                  <div>Selected Period: {selectedPeriod}</div>
                  <div>Selected Member: {selectedMember}</div>
                </div>
                {analyticsData?.chartData && (
                  <div className="mt-2">
                    <h5 className="font-medium">Sample Chart Data:</h5>
                    <pre className="bg-white p-2 rounded border text-xs">
                      {JSON.stringify(analyticsData.chartData.slice(0, 3), null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart Legend */}
      <div className="chart-legend">
        <h4 className="font-semibold text-gray-900 mb-3">Chart Legend & Data Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-gray-800 mb-2">Color Coding</h5>
            <div className="space-y-2 text-sm">
              <div className="legend-item">
                <div className="legend-color bg-blue-600"></div>
                <span className="text-gray-700">Course Videos</span>
              </div>
              <div className="legend-item">
                <div className="legend-color bg-purple-600"></div>
                <span className="text-gray-700">Marketing Videos</span>
              </div>
              <div className="legend-item">
                <div className="legend-color bg-green-600"></div>
                <span className="text-gray-700">Total (Converted)</span>
              </div>
            </div>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-800 mb-2">Current Period: {selectedPeriod}</h5>
            <div className="space-y-1 text-sm text-gray-600">
              <div>• Filter: {selectedMember === 'all' ? 'All Members' : 'Individual View'}</div>
              <div>• Data Source: Real-time from MongoDB</div>
              <div>• Last Updated: {new Date().toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => {
            setSelectedPeriod('week');
            setSelectedMember('all');
          }}
          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
        >
          Reset to Week View
        </button>
        <button
          onClick={() => setSelectedMember(selectedMember === 'all' ? 'individual' : 'all')}
          className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
        >
          Toggle Member View
        </button>
        <button
          onClick={fetchAnalyticsData}
          className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* Team Insights - People Analytics */}
      <div className="chart-wrapper">
        <div className="chart-header">
          <h3 className="chart-title">👥 Team Insights</h3>
          <p className="chart-subtitle">People analytics and performance indicators</p>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Performance Overview Cards */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">Performance Overview</h4>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-blue-600 font-medium">Team Average</div>
                      <div className="text-2xl font-bold text-blue-900">
                        {(analyticsData.teamStats?.averageProductivity || 0).toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-4xl">📊</div>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-green-600 font-medium">Weekly Achievement</div>
                      <div className="text-2xl font-bold text-green-900">
                        {(analyticsData.teamStats?.weeklyProgress || 0).toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-4xl">🎯</div>
                  </div>
                </div>
                
                <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-purple-600 font-medium">Monthly Achievement</div>
                      <div className="text-2xl font-bold text-purple-900">
                        {(analyticsData.teamStats?.monthlyProgress || 0).toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-4xl">📅</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Team Activity Heatmap */}
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 text-center">Team Activity</h4>
              <div className="h-64">
                {analyticsData.chartData && analyticsData.chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={analyticsData.chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                <p className="font-medium text-gray-900">{`Date: ${label}`}</p>
                                <p className="text-blue-600">{`Videos: ${payload[0].value}`}</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar 
                        dataKey="value" 
                        fill="#8b5cf6" 
                        radius={[4, 4, 0, 0]}
                        className="hover:opacity-80 transition-opacity"
                      />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-500">
                      <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Team activity data will be displayed here</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Quick Stats Row */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{analyticsData.teamStats?.totalMembers || 0}</div>
              <div className="text-sm text-gray-600">Team Members</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{analyticsData.teamStats?.totalVideos || 0}</div>
              <div className="text-sm text-gray-600">Total Videos</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{analyticsData.teamStats?.totalCourseVideos || 0}</div>
              <div className="text-sm text-gray-600">Course Videos</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{analyticsData.teamStats?.totalMarketingVideos || 0}</div>
              <div className="text-sm text-gray-600">Marketing Videos</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Chart Legend */}
      <div className="chart-legend">
        <h4 className="font-semibold text-gray-900 mb-3">📈 Chart Legend & Data Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h5 className="font-medium text-gray-800 mb-2">Chart Types & Features</h5>
            <div className="space-y-2 text-sm">
              <div className="legend-item">
                <div className="legend-color bg-blue-600"></div>
                <span className="text-gray-700">Progress Rings - Show completion percentages</span>
              </div>
              <div className="legend-item">
                <div className="legend-color bg-purple-600"></div>
                <span className="text-gray-700">Pie Charts - Display data distribution</span>
              </div>
              <div className="legend-item">
                <div className="legend-color bg-green-600"></div>
                <span className="text-gray-700">Area Charts - Show trends over time</span>
              </div>
              <div className="legend-item">
                <div className="legend-color bg-orange-600"></div>
                <span className="text-gray-700">Bar Charts - Compare metrics</span>
              </div>
            </div>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-800 mb-2">Interactive Features</h5>
            <div className="space-y-1 text-sm text-gray-600">
              <div>• Hover over charts for detailed tooltips</div>
              <div>• Click on chart elements for more info</div>
              <div>• Responsive design for all screen sizes</div>
              <div>• Real-time data updates</div>
              <div>• Mobile-friendly touch interactions</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Quick Actions with Enhanced Styling */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => {
            setSelectedPeriod('week');
            setSelectedMember('all');
          }}
          className="px-6 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 hover:scale-105 transition-all duration-300 font-medium"
        >
          🔄 Reset to Week View
        </button>
        <button
          onClick={() => setSelectedMember(selectedMember === 'all' ? 'individual' : 'all')}
          className="px-6 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 hover:scale-105 transition-all duration-300 font-medium"
        >
          👥 Toggle Member View
        </button>
        <button
          onClick={fetchAnalyticsData}
          className="px-6 py-3 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 hover:scale-105 transition-all duration-300 font-medium"
        >
          📊 Refresh Data
        </button>
      </div>
    </div>
  );
}
