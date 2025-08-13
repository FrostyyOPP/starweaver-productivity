"use client"

import React, { useState, useEffect } from 'react';
import { Star, Clock, Target, TrendingUp, Download, Edit3, Calendar, Users, Award, BarChart3 } from 'lucide-react';

const StarweaverDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [expandedLeaderboard, setExpandedLeaderboard] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Sample data - replace with real API data
  const teamMembers = [
    { name: 'Aman', videos: 87, target: 90, percentage: 96.7, rank: 1 },
    { name: 'Akshay', videos: 85, target: 90, percentage: 94.4, rank: 2 },
    { name: 'Anshika', videos: 82, target: 90, percentage: 91.1, rank: 3 },
    { name: 'Kavita', videos: 80, target: 90, percentage: 88.9, rank: 4 },
    { name: 'Astha', videos: 78, target: 90, percentage: 86.7, rank: 5 },
    { name: 'Prashansha', videos: 75, target: 90, percentage: 83.3, rank: 6 },
    { name: 'Ashu', videos: 72, target: 90, percentage: 80.0, rank: 7 }
  ];

  const weeklyData = [
    { name: 'Aman', weekTarget: 15, weekAchieved: 14, monthTarget: 60, monthAchieved: 57 },
    { name: 'Akshay', weekTarget: 15, weekAchieved: 15, monthTarget: 60, monthAchieved: 58 },
    { name: 'Anshika', weekTarget: 15, weekAchieved: 13, monthTarget: 60, monthAchieved: 55 }
  ];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getShiftTimeRemaining = () => {
    const now = new Date();
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
          <p className="font-medium text-slate-100">{member.name}</p>
          <p className="text-sm text-slate-400">{member.videos}/{member.target} videos</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <p className="font-bold text-slate-100">{member.percentage}%</p>
        {index < 3 && <Star className="w-4 h-4 text-yellow-500" />}
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-logo">
            <Star className="w-8 h-8 text-yellow-400" />
            <h1>STARWEAVER</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="btn btn-primary">
              <Download className="w-4 h-4" />
              Export Report
            </button>
            <button className="btn btn-outline">
              <Edit3 className="w-4 h-4" />
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
                  <Clock className="w-6 h-6 text-blue-500" />
                  <h2 className="card-title">Current Shift</h2>
                </div>
              </div>
              <div className="card-content space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {isClient ? currentTime.toLocaleTimeString('en-US', { 
                      hour12: false, 
                      hour: '2-digit', 
                      minute: '2-digit', 
                      second: '2-digit' 
                    }) : '--:--:--'}
                  </div>
                  <div className="text-lg text-gray-600">
                    {isClient ? currentTime.toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : 'Loading...'}
                  </div>
                </div>
                <div className="text-center pt-4">
                  <div className="text-2xl font-semibold text-blue-600">
                    {isClient ? getShiftTimeRemaining() : 'Loading...'}
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Progress */}
            <div className="card">
              <div className="card-header">
                <div className="flex items-center space-x-3">
                  <Target className="w-6 h-6 text-green-500" />
                  <h2 className="card-title">Weekly Progress</h2>
                </div>
              </div>
              <div className="card-content space-y-6">
                <div className="space-y-4">
                  {weeklyData.map((member, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">{member.name}</span>
                        <span className="text-sm text-gray-600">
                          {member.weekAchieved}/{member.weekTarget} videos
                        </span>
                      </div>
                      <ProgressBar value={member.weekAchieved} max={member.weekTarget} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-icon bg-blue-500 text-white">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="stat-value">87</div>
                <div className="stat-label">Videos Completed</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon bg-green-500 text-white">
                  <Target className="w-6 h-6" />
                </div>
                <div className="stat-value">90</div>
                <div className="stat-label">Target Videos</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon bg-purple-500 text-white">
                  <Award className="w-6 h-6" />
                </div>
                <div className="stat-value">96.7%</div>
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
                  <Users className="w-6 h-6 text-yellow-500" />
                  <h2 className="card-title">Team Leaderboard</h2>
                </div>
              </div>
              <div className="card-content">
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
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Quick Actions</h2>
              </div>
              <div className="card-content space-y-4">
                <button className="btn btn-primary w-full">
                  <Calendar className="w-4 h-4" />
                  Start New Entry
                </button>
                <button className="btn btn-outline w-full">
                  <BarChart3 className="w-4 h-4" />
                  View Analytics
                </button>
                <button className="btn btn-outline w-full">
                  <Users className="w-4 h-4" />
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
