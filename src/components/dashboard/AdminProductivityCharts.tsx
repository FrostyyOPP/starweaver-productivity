'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Calendar, Users, Filter } from 'lucide-react';
import ExportButton from './ExportButton';

interface ChartData {
  date: string;
  videosCompleted: number;
  productivityScore: number;
  category: string;
  teamMember?: string;
}

interface AdminProductivityChartsProps {
  entries: any[];
  teamMembers: any[];
  systemStats: any;
}

type TimelinePeriod = 'this-week' | 'last-3-weeks' | 'last-month' | 'last-3-months' | 'last-quarter' | 'last-12-months';

const AdminProductivityCharts: React.FC<AdminProductivityChartsProps> = ({ 
  entries, 
  teamMembers, 
  systemStats 
}) => {
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar' | 'pie'>('line');
  const [activeMetric, setActiveMetric] = useState<'videos' | 'productivity'>('videos');
  const [period, setPeriod] = useState<TimelinePeriod>('this-week');
  const [selectedTeam, setSelectedTeam] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const chartRef = useRef<HTMLDivElement>(null);

  // Get date range based on selected period
  const getDateRange = (selectedPeriod: TimelinePeriod) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayOfWeek = today.getDay();
    
    switch (selectedPeriod) {
      case 'this-week':
        const startOfWeek = new Date(today);
        const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        startOfWeek.setDate(today.getDate() - mondayOffset);
        return { start: startOfWeek, end: today };
      
      case 'last-3-weeks':
        const threeWeeksAgo = new Date(today);
        const threeWeeksOffset = dayOfWeek === 0 ? 20 : dayOfWeek + 20;
        threeWeeksAgo.setDate(today.getDate() - threeWeeksOffset);
        return { start: threeWeeksAgo, end: today };
      
      case 'last-month':
        const lastMonth = new Date(today);
        const lastMonthOffset = dayOfWeek === 0 ? 27 : dayOfWeek + 27;
        lastMonth.setDate(today.getDate() - lastMonthOffset);
        return { start: lastMonth, end: today };
      
      case 'last-3-months':
        const threeMonthsAgo = new Date(today);
        threeMonthsAgo.setMonth(today.getMonth() - 3);
        return { start: threeMonthsAgo, end: today };
      
      case 'last-quarter':
        const lastQuarter = new Date(today);
        lastQuarter.setMonth(today.getMonth() - 3);
        return { start: lastQuarter, end: today };
      
      case 'last-12-months':
        const lastYear = new Date(today);
        lastYear.setFullYear(today.getFullYear() - 1);
        return { start: lastYear, end: today };
      
      default:
        return { start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), end: today };
    }
  };

  // Get period label for display
  const getPeriodLabel = (selectedPeriod: TimelinePeriod): string => {
    switch (selectedPeriod) {
      case 'this-week': return 'This Week (Mon-Fri)';
      case 'last-3-weeks': return 'Last 3 Weeks';
      case 'last-month': return 'Last Month';
      case 'last-3-months': return 'Last 3 Months';
      case 'last-quarter': return 'Last Quarter';
      case 'last-12-months': return 'Last 12 Months';
      default: return 'This Week (Mon-Fri)';
    }
  };

  // Get period duration for display
  const getPeriodDuration = (selectedPeriod: TimelinePeriod): string => {
    switch (selectedPeriod) {
      case 'this-week': return '5 days';
      case 'last-3-weeks': return '3 weeks';
      case 'last-month': return '4 weeks';
      case 'last-3-months': return '3 months';
      case 'last-quarter': return '3 months';
      case 'last-12-months': return '12 months';
      default: return '5 days';
    }
  };

  // Format date label based on period
  const formatDateLabel = (date: Date, selectedPeriod: TimelinePeriod): string => {
    switch (selectedPeriod) {
      case 'this-week':
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      
      case 'last-3-weeks':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay() + 1);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 4);
        
        const startMonth = weekStart.toLocaleDateString('en-US', { month: 'short' });
        const endMonth = weekEnd.toLocaleDateString('en-US', { month: 'short' });
        const startDay = weekStart.getDate();
        const endDay = weekEnd.getDate();
        
        if (startMonth === endMonth) {
          return `${startMonth} ${startDay}-${endDay}`;
        } else {
          return `${startMonth} ${startDay}-${endMonth} ${endDay}`;
        }
      
      case 'last-month':
        const weekNumber = Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7);
        return `Week ${weekNumber}`;
      
      case 'last-3-months':
        return date.toLocaleDateString('en-US', { month: 'short' });
      
      case 'last-quarter':
        const quarterMonth = date.getMonth();
        if (quarterMonth < 3) return 'Month A';
        if (quarterMonth < 6) return 'Month B';
        if (quarterMonth < 9) return 'Month C';
        return 'Month D';
      
      case 'last-12-months':
        return date.toLocaleDateString('en-US', { month: 'short' });
      
      default:
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Create week-based data for last 3 weeks
  const createWeekBasedData = (): ChartData[] => {
    console.log('📅 Creating week-based data for last 3 weeks');
    const weeks = [];
    const now = new Date();
    
    for (let i = 2; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7) - now.getDay() + 1);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 4);
      
      console.log(`📅 Week ${3-i}:`, { weekStart, weekEnd });
      
      let weekEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        const isValid = entryDate >= weekStart && entryDate <= weekEnd;
        if (isValid) {
          console.log(`📅 Entry in week ${3-i}:`, entry);
        }
        return isValid;
      });

      console.log(`📅 Entries for week ${3-i}:`, weekEntries.length);

      // Apply team/member filters
      if (selectedTeam !== 'all') {
        weekEntries = weekEntries.filter(entry => {
          const member = teamMembers.find(m => m._id === entry.userId);
          const isValid = member && member.role === selectedTeam;
          if (!isValid) {
            console.log(`👥 Entry filtered out by team in week ${3-i}:`, { entry, member, selectedTeam });
          }
          return isValid;
        });
        console.log(`👥 Entries after team filter for week ${3-i}:`, weekEntries.length);
      }

      if (selectedMember !== 'all') {
        weekEntries = weekEntries.filter(entry => {
          const isValid = entry.userId === selectedMember;
          if (!isValid) {
            console.log(`👤 Entry filtered out by member in week ${3-i}:`, { entry, selectedMember });
          }
          return isValid;
        });
        console.log(`👤 Entries after member filter for week ${3-i}:`, weekEntries.length);
      }
      
      const weekData = {
        date: formatDateLabel(weekStart, 'last-3-weeks'),
        videosCompleted: weekEntries.reduce((sum, entry) => sum + (entry.videosCompleted || 0), 0),
        productivityScore: weekEntries.length > 0 
          ? Math.round(weekEntries.reduce((sum, entry) => sum + (entry.productivityScore || 0), 0) / weekEntries.length)
          : 0,
        category: 'week'
      };
      
      console.log(`📊 Week ${3-i} data:`, weekData);
      weeks.push(weekData);
    }
    
    console.log('📊 All weeks data:', weeks);
    return weeks;
  };

  // Process chart data based on filters
  const processChartData = (): ChartData[] => {
    console.log('🔍 Processing chart data:', { entries: entries?.length, teamMembers: teamMembers?.length, period, selectedTeam, selectedMember });
    
    if (!entries || entries.length === 0) {
      console.log('❌ No entries available');
      return [];
    }

    if (period === 'last-3-weeks') {
      const weekData = createWeekBasedData();
      console.log('📅 Week-based data:', weekData);
      return weekData;
    }

    const { start, end } = getDateRange(period);
    console.log('📅 Date range:', { start, end, period });
    
    // Filter entries by date range
    let filteredEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      const isValid = entryDate >= start && entryDate <= end;
      if (!isValid) {
        console.log('📅 Entry filtered out by date:', { entryDate, start, end, entry });
      }
      return isValid;
    });

    console.log('📅 Entries after date filter:', filteredEntries.length);

    // Apply team filter
    if (selectedTeam !== 'all') {
      filteredEntries = filteredEntries.filter(entry => {
        const member = teamMembers.find(m => m._id === entry.userId);
        const isValid = member && member.role === selectedTeam;
        if (!isValid) {
          console.log('👥 Entry filtered out by team:', { entry, member, selectedTeam });
        }
        return isValid;
      });
      console.log('👥 Entries after team filter:', filteredEntries.length);
    }

    // Apply member filter
    if (selectedMember !== 'all') {
      filteredEntries = filteredEntries.filter(entry => {
        const isValid = entry.userId === selectedMember;
        if (!isValid) {
          console.log('👤 Entry filtered out by member:', { entry, selectedMember });
        }
        return isValid;
      });
      console.log('👤 Entries after member filter:', filteredEntries.length);
    }

    // Group by date and aggregate
    const groupedData = filteredEntries.reduce((acc, entry) => {
      const dateKey = formatDateLabel(new Date(entry.date), period);
      
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          videosCompleted: 0,
          productivityScore: 0,
          count: 0
        };
      }
      
      acc[dateKey].videosCompleted += entry.videosCompleted || 0;
      acc[dateKey].productivityScore += entry.productivityScore || 0;
      acc[dateKey].count += 1;
    }, {} as any);

    console.log('📊 Grouped data:', groupedData);

    // Convert to array and calculate averages
    const result = Object.values(groupedData).map((item: any) => ({
      date: item.date,
      videosCompleted: item.videosCompleted,
      productivityScore: item.count > 0 ? Math.round(item.productivityScore / item.count) : 0,
      category: 'aggregated'
    }));

    console.log('📊 Final chart data:', result);
    return result;
  };

  // Process pie chart data
  const processPieData = () => {
    if (!entries || entries.length === 0) return [];

    let filteredEntries = entries;

    // Apply team filter
    if (selectedTeam !== 'all') {
      filteredEntries = filteredEntries.filter(entry => {
        const member = teamMembers.find(m => m._id === entry.userId);
        return member && member.role === selectedTeam;
      });
    }

    // Apply member filter
    if (selectedMember !== 'all') {
      filteredEntries = filteredEntries.filter(entry => entry.userId === selectedMember);
    }

    // Group by team member
    const memberData = filteredEntries.reduce((acc, entry) => {
      const member = teamMembers.find(m => m._id === entry.userId);
      const memberName = member ? member.name : 'Unknown';
      
      if (!acc[memberName]) {
        acc[memberName] = {
          name: memberName,
          videos: 0,
          productivity: 0,
          count: 0
        };
      }
      
      acc[memberName].videos += entry.videosCompleted || 0;
      acc[memberName].productivity += entry.productivityScore || 0;
      acc[memberName].count += 1;
    }, {} as any);

    // Convert to array and calculate averages
    return Object.values(memberData).map((item: any) => ({
      name: item.name,
      value: activeMetric === 'videos' ? item.videos : Math.round(item.productivity / item.count),
      count: item.count
    }));
  };

  const chartData = processChartData();
  const pieData = processPieData();

  const renderChart = () => {
    const commonProps = {
      data: chartType === 'pie' ? pieData : chartData,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey={activeMetric === 'videos' ? 'videosCompleted' : 'productivityScore'} 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area 
              type="monotone" 
              dataKey={activeMetric === 'videos' ? 'videosCompleted' : 'productivityScore'} 
              stroke="#3b82f6" 
              fill="#3b82f6" 
              fillOpacity={0.3}
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar 
              dataKey={activeMetric === 'videos' ? 'videosCompleted' : 'productivityScore'} 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );

      case 'pie':
        return (
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent || 0) * 100}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        );

      default:
        // Fallback to line chart if no valid chart type
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey={activeMetric === 'videos' ? 'videosCompleted' : 'productivityScore'} 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        );
    }
  };

  return (
    <div className="chart-container" ref={chartRef}>
      <div className="chart-header">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="chart-title">Admin Productivity Analytics</h3>
            <p className="chart-subtitle">
              {getPeriodLabel(period)} • {getPeriodDuration(period)}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Team Filter */}
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
                className="metric-select"
              >
                <option value="all">All Teams</option>
                <option value="manager">Managers</option>
                <option value="editor">Editors</option>
                <option value="viewer">Viewers</option>
              </select>
            </div>

            {/* Member Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="metric-select"
              >
                <option value="all">All Members</option>
                {teamMembers.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name} ({member.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Export Button */}
            <ExportButton 
              entries={entries} 
              period={period} 
              chartRef={chartRef as React.RefObject<HTMLDivElement>}
            />
          </div>
        </div>
      </div>

      <div className="chart-controls">
        {/* Metric Selector */}
        <div className="metric-selector">
          <label className="metric-label">Metric:</label>
          <select
            value={activeMetric}
            onChange={(e) => setActiveMetric(e.target.value as 'videos' | 'productivity')}
            className="metric-select"
          >
            <option value="videos">Videos Completed</option>
            <option value="productivity">Productivity Score</option>
          </select>
        </div>

        {/* Chart Type Selector */}
        <div className="chart-type-selector">
          <label className="chart-type-label">Chart Type:</label>
          <div className="chart-type-buttons">
            {[
              { type: 'line', icon: TrendingUp, label: 'Line' },
              { type: 'area', icon: BarChart3, label: 'Area' },
              { type: 'bar', icon: BarChart3, label: 'Bar' },
              { type: 'pie', icon: PieChartIcon, label: 'Pie' }
            ].map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => setChartType(type as any)}
                className={`chart-type-btn ${chartType === type ? 'active' : ''}`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Selector */}
        <div className="timeline-selector">
          <label className="timeline-label">Timeline:</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as TimelinePeriod)}
            className="timeline-select"
          >
            <option value="this-week">This Week</option>
            <option value="last-3-weeks">Last 3 Weeks</option>
            <option value="last-month">Last Month</option>
            <option value="last-3-months">Last 3 Months</option>
            <option value="last-quarter">Last Quarter</option>
            <option value="last-12-months">Last 12 Months</option>
          </select>
        </div>
      </div>

      <div className="chart-content">
        {chartData.length === 0 ? (
          <div className="empty-chart">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No data available for the selected filters</p>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={400}>
              {renderChart()}
            </ResponsiveContainer>

            {/* Chart Summary */}
            <div className="chart-summary">
              <div className="summary-item">
                <span className="summary-label">Total {activeMetric === 'videos' ? 'Videos' : 'Productivity'}:</span>
                <span className="summary-value">
                  {activeMetric === 'videos' 
                    ? chartData.reduce((sum, item) => sum + item.videosCompleted, 0)
                    : Math.round(chartData.reduce((sum, item) => sum + item.productivityScore, 0) / chartData.length)
                  }
                  {activeMetric === 'productivity' ? '%' : ''}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Data Points:</span>
                <span className="summary-value">{chartData.length}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Period:</span>
                <span className="summary-value">{getPeriodLabel(period)}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminProductivityCharts;
