"use client"

import React, { useState, useEffect } from 'react';
import { Star, Clock, Target, TrendingUp, Download, Edit3, Calendar, Users, Award, BarChart3 } from 'lucide-react';

const StarweaverDashboard = () => {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [expandedLeaderboard, setExpandedLeaderboard] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setCurrentTime(new Date());
  }, []);

  // Placeholder data - replace with real API data
  const teamMembers: any[] = [];
  const weeklyData: any[] = [];

  useEffect(() => {
    if (!isClient) return;
    
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [isClient]);

  const getShiftTimeRemaining = () => {
    if (!currentTime) return "Loading...";
    
    const now = currentTime;
    const shiftEnd = new Date();
    shiftEnd.setHours(19, 0, 0, 0); // 7 PM
    
    const diff = shiftEnd.getTime() - now.getTime();
    if (diff <= 0) return "0h 0m remaining";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m remaining`;
  };

  const ProgressBar = ({ value, max, className = "" }: { value: number; max: number; className?: string }) => (
    <div className={`progress-bar ${className}`}>
      <div 
        className="progress-fill"
        style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
      />
    </div>
  );

  const LeaderboardCard = ({ member, index, isExpanded }: { member: any; index: number; isExpanded: boolean }) => (
    <div className={`leaderboard-item rank-${index < 3 ? index + 1 : 'other'}`}>
      <div className="flex items-center space-x-4">
        <div className="rank-number">
          {index + 1}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{member.name}</p>
          <p className="text-sm text-gray-600">{member.videos}/{member.target} videos</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <p className="font-bold text-gray-900">{member.percentage}%</p>
        {index < 3 && <Star className="w-5 h-5 text-yellow-500" />}
      </div>
    </div>
  );

  // Don't render time-sensitive content until client-side
  if (!isClient) {
    return (
      <div className="dashboard-container">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="loading-spinner w-8 h-8 mx-auto mb-4" />
            <p className="text-gray-300">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-logo">
            <Star className="w-10 h-10 text-yellow-400 drop-shadow-lg" />
            <h1>STARWEAVER</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="btn btn-primary">
              <Download className="w-5 h-5" />
              Export Report
            </button>
            <button className="btn btn-outline">
              <Edit3 className="w-5 h-5" />
              Edit Profile
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-grid">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Shift Timer */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center space-x-3">
                  <div className="stat-icon bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h2 className="card-title">Current Shift</h2>
                </div>
              </div>
              <div className="card-content">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {currentTime ? currentTime.toLocaleTimeString('en-US', { 
                      hour12: false,
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    }) : '--:--:--'}
                  </div>
                  <p className="text-gray-600">{getShiftTimeRemaining()}</p>
                </div>
              </div>
            </div>

            {/* Weekly Progress */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center space-x-3">
                  <div className="stat-icon bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                    <Target className="w-6 h-6" />
                  </div>
                  <h2 className="card-title">Weekly Progress</h2>
                </div>
              </div>
              <div className="card-content space-y-6">
                {weeklyData.length > 0 ? (
                  <div className="space-y-4">
                    {weeklyData.map((member, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-900">{member.name}</span>
                          <span className="text-sm text-gray-600">
                            {member.weekAchieved}/{member.weekTarget} videos
                          </span>
                        </div>
                        <ProgressBar value={member.weekAchieved} max={member.weekTarget} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No weekly data available</p>
                    <p className="text-sm text-gray-400">Start tracking your productivity to see progress</p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Stats */}
            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-icon bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="stat-value">--</div>
                <div className="stat-label">Videos Completed</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon bg-gradient-to-br from-green-500 to-emerald-600 text-white">
                  <Target className="w-6 h-6" />
                </div>
                <div className="stat-value">--</div>
                <div className="stat-label">Target Videos</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                  <Award className="w-6 h-6" />
                </div>
                <div className="stat-value">--</div>
                <div className="stat-label">Efficiency</div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Team Leaderboard */}
            <div className="leaderboard-card">
              <div className="card-header">
                <div className="flex items-center space-x-3">
                  <div className="stat-icon bg-gradient-to-br from-yellow-500 to-orange-600 text-white">
                    <Users className="w-6 h-6" />
                  </div>
                  <h2 className="card-title">Team Leaderboard</h2>
                </div>
              </div>
              <div className="card-content">
                {teamMembers.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {teamMembers.slice(0, expandedLeaderboard ? teamMembers.length : 5).map((member, index) => (
                        <LeaderboardCard key={index} member={member} index={index} isExpanded={expandedLeaderboard} />
                      ))}
                    </div>
                    {teamMembers.length > 5 && (
                      <button 
                        className="btn btn-ghost w-full mt-4"
                        onClick={() => setExpandedLeaderboard(!expandedLeaderboard)}
                      >
                        {expandedLeaderboard ? 'Show Less' : `Show ${teamMembers.length - 5} More`}
                      </button>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No team data available</p>
                    <p className="text-sm text-gray-400">Join or create a team to see leaderboards</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Quick Actions</h2>
              </div>
              <div className="card-content space-y-4">
                <button className="btn btn-primary w-full">
                  <Calendar className="w-5 h-5" />
                  Start New Entry
                </button>
                <button className="btn btn-outline w-full">
                  <BarChart3 className="w-5 h-5" />
                  View Analytics
                </button>
                <button className="btn btn-outline w-full">
                  <Users className="w-5 h-5" />
                  Team Management
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StarweaverDashboard;
