"use client"

import React, { useState, useEffect } from 'react';
import { Star, Clock, Target, TrendingUp, Download, Edit3, Calendar, Users, Award, BarChart3 } from 'lucide-react';

const StarweaverDashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [expandedLeaderboard, setExpandedLeaderboard] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Type definitions
  interface TeamMember {
    name: string;
    videos: number;
    target: number;
    percentage: number;
    rank: number;
  }

  interface WeeklyData {
    name: string;
    weekTarget: number;
    weekAchieved: number;
    monthTarget: number;
    monthAchieved: number;
  }

  // Sample data - replace with real API data
  const teamMembers: TeamMember[] = [
    { name: 'Aman', videos: 87, target: 90, percentage: 96.7, rank: 1 },
    { name: 'Akshay', videos: 85, target: 90, percentage: 94.4, rank: 2 },
    { name: 'Anshika', videos: 82, target: 90, percentage: 91.1, rank: 3 },
    { name: 'Kavita', videos: 80, target: 90, percentage: 88.9, rank: 4 },
    { name: 'Astha', videos: 78, target: 90, percentage: 86.7, rank: 5 },
    { name: 'Prashansha', videos: 75, target: 90, percentage: 83.3, rank: 6 },
    { name: 'Ashu', videos: 72, target: 90, percentage: 80.0, rank: 7 }
  ];

  const weeklyData: WeeklyData[] = [
    { name: 'Aman', weekTarget: 15, weekAchieved: 14, monthTarget: 60, monthAchieved: 57 },
    { name: 'Akshay', weekTarget: 15, weekAchieved: 15, monthTarget: 60, monthAchieved: 58 },
    { name: 'Anshika', weekTarget: 15, weekAchieved: 13, monthTarget: 60, monthAchieved: 55 }
  ];

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getShiftTimeRemaining = () => {
    const now = new Date();
    const shiftEnd = new Date();
    shiftEnd.setHours(19, 0, 0, 0); // 7 PM
    
    const diff = shiftEnd.getTime() - now.getTime();
    if (diff <= 0) return "Shift Ended";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m remaining`;
  };

  const ProgressBar = ({ value, max, className = "" }: { value: number; max: number; className?: string }) => (
    <div className={`w-full bg-slate-700 rounded-full h-2 ${className}`}>
      <div 
        className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-300"
        style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
      />
    </div>
  );

  const LeaderboardCard = ({ member, index, isExpanded }: { member: TeamMember; index: number; isExpanded: boolean }) => (
    <div className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 hover:scale-[1.02] ${
      index < 3 
        ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-yellow-500/30' 
        : 'bg-slate-800/50 border-slate-700'
    }`}>
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
          index === 0 ? 'bg-yellow-500 text-black' :
          index === 1 ? 'bg-gray-400 text-black' :
          index === 2 ? 'bg-amber-600 text-white' :
          'bg-slate-700 text-slate-200'
        }`}>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Star className="w-8 h-8 text-yellow-400 flex-shrink-0" />
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400" style={{ fontFamily: 'Georgia, serif' }}>
                STARWEAVER
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors duration-200 flex-shrink-0">
                <Download className="w-4 h-4" />
                <span>Export Data</span>
              </button>
              <div className="text-right">
                <p className="text-sm text-slate-400">Editor Dashboard</p>
                <p className="font-semibold text-slate-100">Welcome, Aman</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Top Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Time Widget */}
          <div className="rounded-lg border border-slate-700 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center space-x-3 mb-4">
              <Clock className="w-6 h-6 text-blue-400 flex-shrink-0" />
              <h3 className="text-lg font-semibold text-slate-100">Current Time</h3>
            </div>
            {isClient ? (
              <>
                <p className="text-2xl font-bold mb-2 text-slate-100">
                  {currentTime.toLocaleTimeString('en-US', { 
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </p>
                <p className="text-sm text-slate-300 mb-4">
                  {(() => {
                    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
                    const weekday = weekdays[currentTime.getDay()]
                    const day = currentTime.getDate()
                    const month = months[currentTime.getMonth()]
                    const year = currentTime.getFullYear()
                    return `${weekday}, ${month} ${day}, ${year}`
                  })()}
                </p>
                <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                  <p className="text-sm font-medium text-blue-300">
                    {getShiftTimeRemaining()}
                  </p>
                </div>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold mb-2 text-slate-100">--:--:--</p>
                <p className="text-sm text-slate-300 mb-4">Loading...</p>
                <div className="p-3 bg-blue-500/20 rounded-lg border border-blue-500/30">
                  <p className="text-sm font-medium text-blue-300">Loading...</p>
                </div>
              </>
            )}
          </div>

          {/* Team Stats */}
          <div className="rounded-lg border border-slate-700 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center space-x-3 mb-4">
              <Target className="w-6 h-6 text-green-400 flex-shrink-0" />
              <h3 className="text-lg font-semibold text-slate-100">Team Performance</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">This Month</span>
                  <span className="text-slate-100">573/630 videos</span>
                </div>
                <ProgressBar value={573} max={630} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-300">This Week</span>
                  <span className="text-slate-100">98/105 videos</span>
                </div>
                <ProgressBar value={98} max={105} />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-lg border border-slate-700 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 p-6 hover:shadow-xl transition-all duration-200 md:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <Edit3 className="w-6 h-6 text-purple-400 flex-shrink-0" />
              <h3 className="text-lg font-semibold text-slate-100">Quick Actions</h3>
            </div>
            <div className="space-y-3">
              <button className="w-full bg-purple-600 hover:bg-purple-700 py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 hover:scale-[1.02]">
                <Calendar className="w-4 h-4" />
                <span>Daily Entry</span>
              </button>
              <button className="w-full bg-slate-700 hover:bg-slate-600 py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 hover:scale-[1.02]">
                <BarChart3 className="w-4 h-4" />
                <span>View Reports</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Leaderboard */}
          <div className="rounded-lg border border-slate-700 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Award className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                <h2 className="text-xl font-bold text-slate-100">Team Leaderboard</h2>
              </div>
              <button 
                onClick={() => setExpandedLeaderboard(!expandedLeaderboard)}
                className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-200 px-2 py-1 rounded hover:bg-blue-500/10"
              >
                {expandedLeaderboard ? 'Show Less' : 'View All'}
              </button>
            </div>
            
            <div className="space-y-3">
              {(expandedLeaderboard ? teamMembers : teamMembers.slice(0, 5)).map((member, index) => (
                <LeaderboardCard 
                  key={member.name} 
                  member={member} 
                  index={index} 
                  isExpanded={expandedLeaderboard}
                />
              ))}
            </div>
          </div>

          {/* Individual Performance */}
          <div className="rounded-lg border border-slate-700 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 p-6 hover:shadow-xl transition-all duration-200">
            <div className="flex items-center space-x-3 mb-6">
              <TrendingUp className="w-6 h-6 text-green-400 flex-shrink-0" />
              <h2 className="text-xl font-bold text-slate-100">Individual Performance</h2>
            </div>
            
            <div className="space-y-6">
              {weeklyData.map((member) => (
                <div key={member.name} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:bg-slate-800/70 transition-colors duration-200">
                  <h3 className="font-semibold mb-4 text-slate-100">{member.name}</h3>
                  
                  {/* Last Week */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-300">Last Week</span>
                      <span className="text-slate-100">{member.weekAchieved}/{member.weekTarget}</span>
                    </div>
                    <ProgressBar value={member.weekAchieved} max={member.weekTarget} />
                    <p className="text-xs text-slate-400 mt-2">
                      {((member.weekAchieved / member.weekTarget) * 100).toFixed(1)}% completion
                    </p>
                  </div>
                  
                  {/* Last Month */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-300">Last Month</span>
                      <span className="text-slate-100">{member.monthAchieved}/{member.monthTarget}</span>
                    </div>
                    <ProgressBar value={member.monthAchieved} max={member.monthTarget} />
                    <p className="text-xs text-slate-400 mt-2">
                      {((member.monthAchieved / member.monthTarget) * 100).toFixed(1)}% completion
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StarweaverDashboard;