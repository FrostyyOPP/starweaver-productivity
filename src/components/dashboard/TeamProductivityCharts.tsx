'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, Users, Video, Target } from 'lucide-react';

interface TeamMember {
  _id: string;
  name: string;
  department: string;
  productivityScore: number;
  videosCompleted: number;
  targetVideos: number;
}

interface ChartData {
  date: string;
  value: number;
  memberName?: string;
}

interface Props {
  period: string;
  memberId: string;
  teamMembers: TeamMember[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B6B'];

export default function TeamProductivityCharts({ period, memberId, teamMembers }: Props) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChartData();
  }, [period, memberId]);

  const fetchChartData = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch(`/api/teams/analytics?period=${period}&memberId=${memberId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setChartData(data);
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      case 'quarter':
        return 'This Quarter';
      case 'year':
        return 'This Year';
      default:
        return 'This Week';
    }
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="loading-spinner w-8 h-8" />
        </div>
      );
    }

    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <Video className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No data available for the selected period</p>
          </div>
        </div>
      );
    }

    // Render different chart types based on data
    if (memberId === 'all') {
      return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Team Productivity Line Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Team Productivity Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
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
            </ResponsiveContainer>
          </div>

          {/* Team Member Performance Bar Chart */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Member Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={teamMembers.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  stroke="#6b7280"
                  fontSize={10}
                  angle={-45}
                  textAnchor="end"
                  height={80}
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
                  dataKey="productivityScore" 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    } else {
      // Individual member chart
      return (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Individual Performance</h3>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
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
                stroke="#8b5cf6" 
                fill="#8b5cf6" 
                fillOpacity={0.3}
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      );
    }
  };

  const renderMetrics = () => {
    if (memberId === 'all') {
      const totalProductivity = teamMembers.reduce((sum, member) => sum + member.productivityScore, 0);
      const avgProductivity = teamMembers.length > 0 ? Math.round(totalProductivity / teamMembers.length) : 0;
      const totalVideos = teamMembers.reduce((sum, member) => sum + member.videosCompleted, 0);
      const totalTargets = teamMembers.reduce((sum, member) => sum + member.targetVideos, 0);

      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Team Members Card */}
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="bg-blue-500/20 p-2 rounded-lg mr-3">
                <Users className="w-6 h-6 text-blue-200" />
              </div>
              <div>
                <p className="text-xs font-medium text-blue-200 uppercase tracking-wide mb-1">Team Members</p>
                <p className="text-2xl font-bold text-white">{teamMembers.length}</p>
                <p className="text-xs text-blue-200">Active team</p>
              </div>
            </div>
          </div>

          {/* Productivity Card */}
          <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 text-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="bg-emerald-500/20 p-2 rounded-lg mr-3">
                <TrendingUp className="w-6 h-6 text-emerald-200" />
              </div>
              <div>
                <p className="text-xs font-medium text-emerald-200 uppercase tracking-wide mb-1">Avg Productivity</p>
                <p className="text-2xl font-bold text-white">{avgProductivity}%</p>
                <p className="text-xs text-emerald-200">
                  {avgProductivity >= 80 ? 'Excellent' : 
                   avgProductivity >= 60 ? 'Good' : 
                   avgProductivity >= 40 ? 'Average' : 'Needs Improvement'}
                </p>
              </div>
            </div>
          </div>

          {/* Videos Completed Card */}
          <div className="bg-gradient-to-br from-violet-600 via-violet-700 to-violet-800 text-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="bg-violet-500/20 p-2 rounded-lg mr-3">
                <Video className="w-6 h-6 text-violet-200" />
              </div>
              <div>
                <p className="text-xs font-medium text-violet-200 uppercase tracking-wide mb-1">Videos Completed</p>
                <p className="text-2xl font-bold text-white">{totalVideos}</p>
                <p className="text-xs text-violet-200">This period</p>
              </div>
            </div>
          </div>

          {/* Target Videos Card */}
          <div className="bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 text-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center">
              <div className="bg-amber-500/20 p-2 rounded-lg mr-3">
                <Target className="w-6 h-6 text-amber-200" />
              </div>
              <div>
                <p className="text-xs font-medium text-amber-200 uppercase tracking-wide mb-1">Target Videos</p>
                <p className="text-2xl font-bold text-white">{totalTargets}</p>
                <p className="text-xs text-amber-200">Goal set</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div ref={chartRef}>
      {/* Metrics Cards */}
      {renderMetrics()}

      {/* Chart */}
      {renderChart()}

      {/* Chart Controls */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">Period:</span>
          <span className="text-sm text-gray-600">{getPeriodLabel(period)}</span>
          
          {memberId !== 'all' && (
            <>
              <span className="text-sm font-medium text-gray-700">Member:</span>
              <span className="text-sm text-gray-600">
                {teamMembers.find(m => m._id === memberId)?.name || 'Unknown'}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">
            {chartData.length} data points
          </span>
        </div>
      </div>
    </div>
  );
}
