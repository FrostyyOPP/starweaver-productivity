'use client';

import React, { useState, useEffect } from 'react';
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

const ProductivityCharts: React.FC<ProductivityChartsProps> = ({ entries }) => {
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar' | 'pie'>('line');
  const [activeMetric, setActiveMetric] = useState<'videos' | 'productivity' | 'hours'>('videos');
  const [period, setPeriod] = useState<'week' | 'month'>('week');

  // Process data for charts based on selected period
  const processChartData = (): ChartData[] => {
    if (!entries || entries.length === 0) return [];

    const sortedEntries = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    // Filter entries based on period
    const now = new Date();
    const filteredEntries = sortedEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      if (period === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return entryDate >= weekAgo;
      } else {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return entryDate >= monthAgo;
      }
    });
    
    return filteredEntries.map(entry => ({
      date: new Date(entry.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      videosCompleted: entry.videosCompleted || 0,
      productivityScore: entry.productivityScore || 0,
      totalHours: entry.totalHours || 0,
      category: entry.videoCategory || 'course'
    }));
  };

  // Process data for pie chart (category distribution)
  const processPieData = () => {
    if (!entries || entries.length === 0) return [];

    const now = new Date();
    const filteredEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      if (period === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return entryDate >= weekAgo;
      } else {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return entryDate >= monthAgo;
      }
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
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
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
            Track your {period === 'week' ? 'weekly' : 'monthly'} progress
          </p>
        </div>
        
        <div className="chart-controls">
          {/* Period Selector */}
          <div className="period-selector">
            <label className="period-label">Period:</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as 'week' | 'month')}
              className="period-select"
            >
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
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
        </div>
      </div>

      <div className="chart-content">
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
          <span className="summary-label">Period:</span>
          <span className="summary-value">
            {period === 'week' ? '7 Days' : '30 Days'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductivityCharts;
