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
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Calendar } from 'lucide-react';
import ExportButton from './ExportButton';

interface ChartData {
  date: string;
  videosCompleted: number;
  productivityScore: number;
  totalHours: number;
  category: string;
}

interface ProductivityChartsProps {
  entries: any[];
}

type TimelinePeriod = 'this-week' | 'last-3-weeks' | 'last-month' | 'last-3-months' | 'last-quarter' | 'last-12-months';

const ProductivityCharts: React.FC<ProductivityChartsProps> = ({ entries }) => {
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar' | 'pie'>('line');
  const [activeMetric, setActiveMetric] = useState<'videos' | 'productivity' | 'hours'>('videos');
  const [period, setPeriod] = useState<TimelinePeriod>('this-week');
  const chartRef = useRef<HTMLDivElement>(null);

  // Get date range based on selected period
  const getDateRange = (selectedPeriod: TimelinePeriod) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayOfWeek = today.getDay(); // Calculate day of week once
    
    switch (selectedPeriod) {
      case 'this-week':
        // Start from Monday of current week
        const startOfWeek = new Date(today);
        const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, so offset by 6 to get Monday
        startOfWeek.setDate(today.getDate() - mondayOffset);
        return { start: startOfWeek, end: today };
      
      case 'last-3-weeks':
        // Start from 3 weeks ago (Monday to Friday)
        const threeWeeksAgo = new Date(today);
        const threeWeeksOffset = dayOfWeek === 0 ? 20 : dayOfWeek + 20; // 3 weeks = 21 days
        threeWeeksAgo.setDate(today.getDate() - threeWeeksOffset);
        return { start: threeWeeksAgo, end: today };
      
      case 'last-month':
        // Start from 4 weeks ago (Monday to Friday)
        const lastMonth = new Date(today);
        const lastMonthOffset = dayOfWeek === 0 ? 27 : dayOfWeek + 27; // 4 weeks = 28 days
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

  // Get period duration for summary
  const getPeriodDuration = (selectedPeriod: TimelinePeriod): string => {
    switch (selectedPeriod) {
      case 'this-week': return '5 Days (Mon-Fri)';
      case 'last-3-weeks': return '15 Days (3 Weeks)';
      case 'last-month': return '20 Days (4 Weeks)';
      case 'last-3-months': return '90 Days';
      case 'last-quarter': return '90 Days';
      case 'last-12-months': return '365 Days';
      default: return '5 Days (Mon-Fri)';
    }
  };

  // Format date labels based on selected period
  const formatDateLabel = (date: Date, selectedPeriod: TimelinePeriod): string => {
    switch (selectedPeriod) {
      case 'this-week':
        // Show day names (Mon, Tue, Wed, Thu, Fri)
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      
      case 'last-3-weeks':
        // Show actual week ranges like "Aug 1-5", "Aug 8-12", "Aug 15-19"
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay() + 1); // Start of week (Monday)
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 4); // End of week (Friday)
        
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
        // Show Week 1, Week 2, Week 3, Week 4, Week 5
        const monthWeekStart = new Date(date);
        monthWeekStart.setDate(date.getDate() - date.getDay() + 1);
        const monthWeekDiff = Math.floor((today.getTime() - monthWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
        if (monthWeekDiff <= 0) return 'Week 1';
        if (monthWeekDiff <= 7) return 'Week 2';
        if (monthWeekDiff <= 14) return 'Week 3';
        if (monthWeekDiff <= 21) return 'Week 4';
        return 'Week 5';
      
      case 'last-quarter':
        // Show Month A, Month B, Month C
        const quarterMonth = date.getMonth();
        const quarterDiff = today.getMonth() - quarterMonth;
        if (quarterDiff <= 0) return 'Month A';
        if (quarterDiff <= 1) return 'Month B';
        return 'Month C';
      
      case 'last-12-months':
        // Show Jan, Feb, Mar, etc.
        return date.toLocaleDateString('en-US', { month: 'short' });
      
      default:
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Get today's date for calculations
  const today = new Date();

  // Create week-based data structure for last 3 weeks
  const createWeekBasedData = (): ChartData[] => {
    const weeks = [];
    const now = new Date();
    
    // Create 3 weeks of data
    for (let i = 2; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7) - now.getDay() + 1); // Start of week (Monday)
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 4); // End of week (Friday)
      
      // Find entries for this week
      const weekEntries = entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= weekStart && entryDate <= weekEnd;
      });
      
      // Calculate totals for the week
      const weekData = {
        date: formatDateLabel(weekStart, 'last-3-weeks'),
        videosCompleted: weekEntries.reduce((sum, entry) => sum + (entry.videosCompleted || 0), 0),
        productivityScore: weekEntries.length > 0 
          ? Math.round(weekEntries.reduce((sum, entry) => sum + (entry.productivityScore || 0), 0) / weekEntries.length)
          : 0,
        totalHours: weekEntries.reduce((sum, entry) => sum + (entry.totalHours || 0), 0),
        category: 'week'
      };
      
      weeks.push(weekData);
    }
    
    return weeks;
  };

  // Process data for charts based on selected period
  const processChartData = (): ChartData[] => {
    if (!entries || entries.length === 0) return [];

    // Special handling for last 3 weeks to show week-based data
    if (period === 'last-3-weeks') {
      return createWeekBasedData();
    }

    const sortedEntries = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const { start, end } = getDateRange(period);
    
    // Filter entries based on period
    const filteredEntries = sortedEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= start && entryDate <= end;
    });
    
    return filteredEntries.map(entry => ({
      date: formatDateLabel(new Date(entry.date), period),
      videosCompleted: entry.videosCompleted || 0,
      productivityScore: entry.productivityScore || 0,
      totalHours: entry.totalHours || 0,
      category: entry.videoCategory || 'course'
    }));
  };

  // Process data for pie chart (category distribution)
  const processPieData = () => {
    if (!entries || entries.length === 0) return [];

    const { start, end } = getDateRange(period);
    const filteredEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= start && entryDate <= end;
    });

    const categoryCounts = filteredEntries.reduce((acc: any, entry) => {
      const category = entry.videoCategory || 'course';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(categoryCounts).map(([category, count]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: count,
      color: getCategoryColor(category)
    }));
  };

  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'course': return '#3b82f6';
      case 'marketing': return '#8b5cf6';
      case 'leave': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const chartData = processChartData();
  const pieData = processPieData();

  const getMetricData = () => {
    switch (activeMetric) {
      case 'videos':
        return chartData.map(item => ({ date: item.date, value: item.videosCompleted }));
      case 'productivity':
        return chartData.map(item => ({ date: item.date, value: item.productivityScore }));
      case 'hours':
        return chartData.map(item => ({ date: item.date, value: item.totalHours }));
      default:
        return chartData.map(item => ({ date: item.date, value: item.videosCompleted }));
    }
  };

  const getMetricLabel = () => {
    switch (activeMetric) {
      case 'videos': return 'Videos Completed';
      case 'productivity': return 'Productivity Score (%)';
      case 'hours': return 'Total Hours';
      default: return 'Videos Completed';
    }
  };

  const renderChart = () => {
    const metricData = getMetricData();

    switch (chartType) {
      case 'line':
        return (
          <LineChart data={metricData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
            />
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart data={metricData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#3b82f6" 
              fill="#3b82f6"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart data={metricData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            <Bar 
              dataKey="value" 
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
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
          </PieChart>
        );

      default:
        return null;
    }
  };

  if (!entries || entries.length === 0) {
    return (
      <div className="chart-container">
        <div className="chart-header">
          <h3 className="chart-title">Productivity Trends</h3>
          <p className="chart-subtitle">No data available</p>
        </div>
        <div className="empty-chart">
          <BarChart3 className="empty-chart-icon" />
          <p>Add some entries to see your productivity trends</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <div className="chart-header">
        <div className="chart-title-section">
          <h3 className="chart-title">Productivity Analytics</h3>
          <p className="chart-subtitle">
            {getPeriodLabel(period)} - Track your progress over time
          </p>
        </div>
        
        <div className="chart-controls">
          {/* Timeline Period Selector */}
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

          {/* Metric Selector */}
          <div className="metric-selector">
            <label className="metric-label">Metric:</label>
            <select
              value={activeMetric}
              onChange={(e) => setActiveMetric(e.target.value as any)}
              className="metric-select"
            >
              <option value="videos">Videos Completed</option>
              <option value="productivity">Productivity Score</option>
              <option value="hours">Total Hours</option>
            </select>
          </div>

          {/* Chart Type Selector */}
          <div className="chart-type-selector">
            <label className="chart-type-label">Chart Type:</label>
            <div className="chart-type-buttons">
              <button
                onClick={() => setChartType('line')}
                className={`chart-type-btn ${chartType === 'line' ? 'active' : ''}`}
                title="Line Chart"
              >
                <TrendingUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => setChartType('area')}
                className={`chart-type-btn ${chartType === 'area' ? 'active' : ''}`}
                title="Area Chart"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`chart-type-btn ${chartType === 'bar' ? 'active' : ''}`}
                title="Bar Chart"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setChartType('pie')}
                className={`chart-type-btn ${chartType === 'pie' ? 'active' : ''}`}
                title="Pie Chart"
              >
                <PieChartIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Export Button */}
          <ExportButton 
            entries={entries} 
            period={getPeriodLabel(period)} 
            chartRef={chartRef}
          />
        </div>
      </div>

      <div className="chart-content" ref={chartRef}>
        <ResponsiveContainer width="100%" height={300}>
          {renderChart()}
        </ResponsiveContainer>
      </div>

      <div className="chart-summary">
        <div className="summary-item">
          <span className="summary-label">Total {getMetricLabel()}:</span>
          <span className="summary-value">
            {getMetricData().reduce((sum, item) => sum + item.value, 0)}
            {activeMetric === 'productivity' ? '%' : activeMetric === 'hours' ? 'h' : ''}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Average:</span>
          <span className="summary-value">
            {(getMetricData().reduce((sum, item) => sum + item.value, 0) / getMetricData().length).toFixed(1)}
            {activeMetric === 'productivity' ? '%' : activeMetric === 'hours' ? 'h' : ''}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Best Day:</span>
          <span className="summary-value">
            {getMetricData().reduce((max, item) => item.value > max.value ? item : max).value}
            {activeMetric === 'productivity' ? '%' : activeMetric === 'hours' ? 'h' : ''}
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Timeline:</span>
          <span className="summary-value">
            {getPeriodDuration(period)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductivityCharts;
