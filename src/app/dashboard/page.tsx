"use client"

import { useState, useEffect } from 'react';
import { Star, Clock, Target, TrendingUp, Download, Calendar, Trophy, BarChart3, Zap } from 'lucide-react';

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const formatDate = (date: Date) => {
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const weekday = weekdays[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${weekday}, ${month} ${day}, ${year}`;
  };

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
    <div className={`w-full bg-slate-700 rounded-full h-2 ${className}`}>
      <div 
        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-300"
        style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
      />
    </div>
  );

  const teamMembers = [
    { name: 'Aman', videos: 87, target: 90, percentage: 96.7, rank: 1 },
    { name: 'Akshay', videos: 85, target: 90, percentage: 94.4, rank: 2 },
    { name: 'Anshika', videos: 82, target: 90, percentage: 91.1, rank: 3 },
    { name: 'Kavita', videos: 80, target: 90, percentage: 88.9, rank: 4 },
    { name: 'Astha', videos: 78, target: 90, percentage: 86.7, rank: 5 }
  ];

  const weeklyData = [
    { name: 'Aman', weekTarget: 15, weekAchieved: 14, monthTarget: 60, monthAchieved: 57 },
    { name: 'Akshay', weekTarget: 15, weekAchieved: 15, monthTarget: 60, monthAchieved: 58 },
    { name: 'Anshika', weekTarget: 15, weekAchieved: 13, monthTarget: 60, monthAchieved: 55 }
  ];

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                STARWEAVER
              </h1>
            </div>

            {/* Export Button */}
            <button className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105">
              <Download className="w-4 h-4" />
              <span>Export Data</span>
            </button>
          </div>
          
          {/* Sub Header */}
          <div className="mt-4">
            <h2 className="text-xl font-semibold text-slate-100">Editor Dashboard</h2>
            <p className="text-slate-400">Welcome, Aman</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Top Row - Current Time, Team Performance, Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Current Time Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200">
            <div className="flex items-center space-x-3 mb-4">
              <Clock className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-slate-100">Current Time</h3>
            </div>
            <div className="text-center">
              <div className="text-4xl font-mono font-bold text-blue-400 mb-2">
                {formatTime(currentTime)}
              </div>
              <div className="text-sm text-slate-300 mb-4">
                {formatDate(currentTime)}
              </div>
              <div className="pt-3 border-t border-slate-700">
                <div className="text-xs text-slate-400 mb-1">Shift ends in</div>
                <div className="text-lg font-mono font-semibold text-blue-400">
                  {getShiftTimeRemaining()}
                </div>
              </div>
            </div>
          </div>

          {/* Team Performance Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200">
            <div className="flex items-center space-x-3 mb-4">
              <Target className="w-6 h-6 text-purple-400" />
              <h3 className="text-lg font-semibold text-slate-100">Team Performance</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-slate-300 mb-2">
                  <span>This Month</span>
                  <span>573/630 videos</span>
                </div>
                <ProgressBar value={573} max={630} />
              </div>
              <div>
                <div className="flex justify-between text-sm text-slate-300 mb-2">
                  <span>This Week</span>
                  <span>98/105 videos</span>
                </div>
                <ProgressBar value={98} max={105} />
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200">
            <div className="flex items-center space-x-3 mb-4">
              <Zap className="w-6 h-6 text-yellow-400" />
              <h3 className="text-lg font-semibold text-slate-100">Quick Actions</h3>
            </div>
            <div className="space-y-3">
              <button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Daily Entry</span>
              </button>
              <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-lg transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>View Reports</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Row - Team Leaderboard and Individual Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Team Leaderboard */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <h3 className="text-lg font-semibold text-slate-100">Team Leaderboard</h3>
              </div>
              <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors duration-200">
                View All
              </button>
            </div>
            <div className="space-y-3">
              {teamMembers.map((member, index) => (
                <div key={member.name} className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 hover:scale-[1.02] ${
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
              ))}
            </div>
          </div>

          {/* Individual Performance */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200">
            <div className="flex items-center space-x-3 mb-4">
              <TrendingUp className="w-6 h-6 text-green-400" />
              <h3 className="text-lg font-semibold text-slate-100">Individual Performance</h3>
            </div>
            <div className="space-y-4">
              {weeklyData.map((member) => (
                <div key={member.name} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                  <h4 className="font-medium text-slate-100 mb-3">{member.name}</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm text-slate-300 mb-2">
                        <span>Last Week</span>
                        <span>{member.weekAchieved}/{member.weekTarget}</span>
                      </div>
                      <ProgressBar value={member.weekAchieved} max={member.weekTarget} />
                      <div className="text-right text-xs text-slate-400 mt-1">
                        {((member.weekAchieved / member.weekTarget) * 100).toFixed(1)}% completion
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm text-slate-300 mb-2">
                        <span>Last Month</span>
                        <span>{member.monthAchieved}/{member.monthTarget}</span>
                      </div>
                      <ProgressBar value={member.monthAchieved} max={member.monthTarget} />
                      <div className="text-right text-xs text-slate-400 mt-1">
                        {((member.monthAchieved / member.monthTarget) * 100).toFixed(1)}% completion
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
