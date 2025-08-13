'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { analyticsAPI, AnalyticsData } from '@/lib/api';

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('week');

  useEffect(() => {
    fetchAnalyticsData();
  }, [period]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await analyticsAPI.getAnalytics({ 
        period, 
        includeTrends: true, 
        includeInsights: true 
      });
      setAnalyticsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="loading-spinner w-8 h-8 mx-auto mb-4" />
            <p className="text-secondary-600">Loading analytics...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg">
          <p className="font-medium">Error loading analytics</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={fetchAnalyticsData}
            className="btn-primary mt-2"
          >
            Retry
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (!analyticsData) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-secondary-600">No analytics data available</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Analytics</h1>
            <p className="text-secondary-600">
              Detailed insights into your productivity patterns
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="select"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">
                {analyticsData.analytics.summary.totalVideos}
              </div>
              <div className="text-sm text-secondary-600">Total Videos</div>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <div className="text-3xl font-bold text-success-600">
                {analyticsData.analytics.summary.totalHours}h
              </div>
              <div className="text-sm text-secondary-600">Total Hours</div>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <div className="text-3xl font-bold text-warning-600">
                {analyticsData.analytics.summary.averageProductivity}%
              </div>
              <div className="text-sm text-secondary-600">Avg Productivity</div>
            </div>
          </div>
          <div className="card">
            <div className="text-center">
              <div className="text-3xl font-bold text-danger-600">
                {analyticsData.analytics.summary.consistencyScore}%
              </div>
              <div className="text-sm text-secondary-600">Consistency</div>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Performance Highlights</h3>
            </div>
            <div className="card-content space-y-4">
              <div className="flex items-center justify-between p-3 bg-success-50 rounded-lg">
                <div>
                  <p className="font-medium text-success-900">Best Day</p>
                  <p className="text-sm text-success-700">
                    {new Date(analyticsData.analytics.performance.bestDay.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-success-600">
                    {analyticsData.analytics.performance.bestDay.productivityScore}%
                  </p>
                  <p className="text-sm text-success-600">
                    {analyticsData.analytics.performance.bestDay.videosCompleted} videos
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-warning-50 rounded-lg">
                <div>
                  <p className="font-medium text-warning-900">Needs Improvement</p>
                  <p className="text-sm text-warning-700">
                    {new Date(analyticsData.analytics.performance.worstDay.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-warning-600">
                    {analyticsData.analytics.performance.worstDay.productivityScore}%
                  </p>
                  <p className="text-sm text-warning-600">
                    {analyticsData.analytics.performance.worstDay.videosCompleted} videos
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
                <div>
                  <p className="font-medium text-primary-900">Peak Hour</p>
                  <p className="text-sm text-primary-700">Most productive time</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary-600">
                    {analyticsData.analytics.performance.mostProductiveHour}:00
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Key Metrics</h3>
            </div>
            <div className="card-content space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-secondary-700">Average Videos/Day</span>
                <span className="font-medium text-secondary-900">
                  {analyticsData.analytics.summary.averageVideosPerDay}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary-700">Average Hours/Day</span>
                <span className="font-medium text-secondary-900">
                  {analyticsData.analytics.summary.averageHoursPerDay}h
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary-700">Target Achievement</span>
                <span className={`font-medium ${
                  analyticsData.analytics.summary.targetAchievement >= 100 
                    ? 'text-success-600' : 'text-warning-600'
                }`}>
                  {analyticsData.analytics.summary.targetAchievement}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-secondary-700">Improvement Rate</span>
                <span className={`font-medium ${
                  analyticsData.analytics.summary.improvementRate >= 0 
                    ? 'text-success-600' : 'text-danger-600'
                }`}>
                  {analyticsData.analytics.summary.improvementRate > 0 ? '+' : ''}
                  {analyticsData.analytics.summary.improvementRate}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Insights */}
        {analyticsData.analytics.insights && (
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Productivity Insights</h3>
              <p className="card-description">Patterns in your mood and energy levels</p>
            </div>
            <div className="card-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {analyticsData.analytics.insights.mood && analyticsData.analytics.insights.mood.length > 0 && (
                  <div>
                    <h4 className="font-medium text-secondary-900 mb-3">Mood Distribution</h4>
                    <div className="space-y-2">
                      {analyticsData.analytics.insights.mood.map((mood: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-secondary-600 capitalize">{mood.mood}</span>
                          <span className="text-sm font-medium text-secondary-900">
                            {mood.count} days
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analyticsData.analytics.insights.energy && analyticsData.analytics.insights.energy.length > 0 && (
                  <div>
                    <h4 className="font-medium text-secondary-900 mb-3">Energy Levels</h4>
                    <div className="space-y-2">
                      {analyticsData.analytics.insights.energy.map((energy: any, index: number) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-secondary-600">Level {energy.level}</span>
                          <span className="text-sm font-medium text-secondary-900">
                            {energy.count} days
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
