'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building, 
  Zap, 
  Award, 
  Video, 
  TrendingUp, 
  FileText, 
  MessageCircle, 
  Target, 
  Download, 
  Settings, 
  Plus,
  ChevronDown,
  ChevronUp,
  Star,
  Trophy,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  UserCheck,
  Clock,
  Target as TargetIcon
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  AreaChart,
  Area
} from 'recharts';

// Company data structure
const companyData = {
  teams: [
    {
      id: 1,
      name: "Development Team",
      memberCount: 8,
      monthlyVideos: 312,
      productivity: 94,
      streak: 15,
      topPerformer: "Sarah Johnson",
      status: "active",
      members: [
        { name: "Sarah Johnson", role: "Team Lead", videos: 52, productivity: 98, status: "online", avatar: "SJ" },
        { name: "Mike Chen", role: "Senior", videos: 48, productivity: 95, status: "online", avatar: "MC" },
        { name: "Alex Kim", role: "Senior", videos: 45, productivity: 93, status: "online", avatar: "AK" },
        { name: "David Park", role: "Junior", videos: 42, productivity: 90, status: "away", avatar: "DP" },
        { name: "Lisa Wang", role: "Junior", videos: 38, productivity: 88, status: "online", avatar: "LW" },
        { name: "Tom Brown", role: "Junior", videos: 35, productivity: 85, status: "offline", avatar: "TB" },
        { name: "Emma Davis", role: "Junior", videos: 32, productivity: 82, status: "online", avatar: "ED" },
        { name: "James Wilson", role: "Junior", videos: 20, productivity: 78, status: "online", avatar: "JW" }
      ]
    },
    {
      id: 2, 
      name: "Content Team",
      memberCount: 7,
      monthlyVideos: 289,
      productivity: 89,
      streak: 12,
      topPerformer: "Alex Rodriguez",
      status: "active",
      members: [
        { name: "Alex Rodriguez", role: "Team Lead", videos: 48, productivity: 96, status: "online", avatar: "AR" },
        { name: "Maria Garcia", role: "Senior", videos: 45, productivity: 93, status: "online", avatar: "MG" },
        { name: "Carlos Lopez", role: "Senior", videos: 42, productivity: 90, status: "online", avatar: "CL" },
        { name: "Ana Martinez", role: "Junior", videos: 40, productivity: 87, status: "away", avatar: "AM" },
        { name: "Jose Hernandez", role: "Junior", videos: 37, productivity: 84, status: "online", avatar: "JH" },
        { name: "Isabella Torres", role: "Junior", videos: 34, productivity: 81, status: "online", avatar: "IT" },
        { name: "Diego Silva", role: "Junior", videos: 23, productivity: 76, status: "offline", avatar: "DS" }
      ]
    },
    {
      id: 3,
      name: "Marketing Team", 
      memberCount: 8,
      monthlyVideos: 246,
      productivity: 87,
      streak: 9,
      topPerformer: "Emma Wilson",
      status: "active",
      members: [
        { name: "Emma Wilson", role: "Team Lead", videos: 44, productivity: 94, status: "online", avatar: "EW" },
        { name: "Ryan Thompson", role: "Senior", videos: 41, productivity: 91, status: "online", avatar: "RT" },
        { name: "Sophie Anderson", role: "Senior", videos: 38, productivity: 88, status: "online", avatar: "SA" },
        { name: "Lucas Miller", role: "Junior", videos: 35, productivity: 85, status: "away", avatar: "LM" },
        { name: "Chloe Taylor", role: "Junior", videos: 32, productivity: 82, status: "online", avatar: "CT" },
        { name: "Noah White", role: "Junior", videos: 29, productivity: 79, status: "online", avatar: "NW" },
        { name: "Ava Johnson", role: "Junior", videos: 18, productivity: 75, status: "offline", avatar: "AJ" },
        { name: "Ethan Davis", role: "Junior", videos: 9, productivity: 68, status: "online", avatar: "ED" }
      ]
    }
  ],
  companyStats: {
    totalMembers: 23,
    totalTeams: 3,
    monthlyVideos: 847,
    companyProductivity: 91,
    growthRate: 18
  },
  crossTeamActivities: [
    { type: "milestone", team: "Development", message: "hit 300-video milestone", time: "1 hour ago", icon: "🎯" },
    { type: "individual", user: "Sarah", team: "Content", message: "completed React training", time: "2 hours ago", icon: "🎓" },
    { type: "achievement", team: "Marketing", message: "achieved 95% weekly target", time: "3 hours ago", icon: "🏆" },
    { type: "record", team: "All", message: "New company record: 127 videos in one day", time: "1 day ago", icon: "🔥" },
    { type: "collaboration", team: "Cross-team", message: "Dev + Content teams collaborated on new course", time: "2 days ago", icon: "🤝" },
    { type: "milestone", team: "Content", message: "Reached 250-video milestone", time: "3 days ago", icon: "📈" }
  ]
};

const StarweaverCompanyDashboard = () => {
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [expandedTeams, setExpandedTeams] = useState<number[]>([]);
  const [userRole, setUserRole] = useState('company_admin'); // company_admin, team_lead, member

  const toggleTeamExpansion = (teamId: number) => {
    setExpandedTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Team Lead': return 'bg-purple-100 text-purple-800';
      case 'Senior': return 'bg-blue-100 text-blue-800';
      case 'Junior': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const chartData = [
    { week: 'Week 1', development: 78, content: 72, marketing: 68 },
    { week: 'Week 2', development: 82, content: 75, marketing: 71 },
    { week: 'Week 3', development: 79, content: 78, marketing: 73 },
    { week: 'Week 4', development: 73, content: 64, marketing: 34 }
  ];

  const videoTypeData = [
    { team: 'Development', course: 280, marketing: 32 },
    { team: 'Content', course: 245, marketing: 44 },
    { team: 'Marketing', course: 180, marketing: 66 }
  ];

  const radarData = [
    { metric: 'Productivity', development: 94, content: 89, marketing: 87 },
    { metric: 'Quality', development: 92, content: 91, marketing: 88 },
    { metric: 'Speed', development: 89, content: 87, marketing: 85 },
    { metric: 'Collaboration', development: 91, content: 93, marketing: 89 },
    { metric: 'Innovation', development: 88, content: 85, marketing: 90 }
  ];

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Starweaver Company Dashboard</h1>
            <div className="flex items-center space-x-2">
              <Building className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-gray-600">Company Overview</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Team Selector */}
            <select 
              value={selectedTeam} 
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Teams</option>
              <option value="development">Development</option>
              <option value="content">Content</option>
              <option value="marketing">Marketing</option>
            </select>

            {/* User Role Indicator */}
            <div className="flex items-center space-x-2 px-3 py-2 bg-purple-100 rounded-lg">
              <UserCheck className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">
                {userRole === 'company_admin' ? 'Company Admin' : 
                 userRole === 'team_lead' ? 'Team Lead' : 'Member'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-8 space-y-8">
        {/* Hero Stats Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Teams</p>
                <p className="text-3xl font-bold text-gray-900">{companyData.companyStats.totalTeams}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Members</p>
                <p className="text-3xl font-bold text-gray-900">{companyData.companyStats.totalMembers}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Company Productivity</p>
                <p className="text-3xl font-bold text-gray-900">{companyData.companyStats.companyProductivity}%</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Zap className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Top Team</p>
                <p className="text-3xl font-bold text-gray-900">Development</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Videos</p>
                <p className="text-3xl font-bold text-gray-900">{companyData.companyStats.monthlyVideos}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Video className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Growth Rate</p>
                <p className="text-3xl font-bold text-gray-900">+{companyData.companyStats.growthRate}%</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Team Performance Leaderboard */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Team Performance Rankings - This Month</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {companyData.teams.map((team, index) => (
              <div key={team.id} className="relative bg-gradient-to-br from-gray-50 to-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
                {index === 0 && <div className="absolute -top-2 -right-2 text-3xl">🥇</div>}
                {index === 1 && <div className="absolute -top-2 -right-2 text-3xl">🥈</div>}
                {index === 2 && <div className="absolute -top-2 -right-2 text-3xl">🥉</div>}
                
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{team.name}</h3>
                  <div className="flex items-center justify-center space-x-2 mb-3">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{team.memberCount} members</span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-purple-600">{team.monthlyVideos}</div>
                    <div className="text-sm text-gray-600">videos this month</div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-lg font-semibold text-gray-900">{team.productivity}%</div>
                    <div className="text-sm text-gray-600">productivity</div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-center space-x-1">
                      <Clock className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm text-gray-600">{team.streak} day streak</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    Top: <span className="font-medium">{team.topPerformer}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cross-Team Activity Feed */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Company Activity Feed</h2>
          <div className="space-y-4">
            {companyData.crossTeamActivities.map((activity, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl">{activity.icon}</div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.team}</span> {activity.message}
                  </p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Company Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Team Comparison Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Team Weekly Progress</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="development" stroke="#8b5cf6" strokeWidth={3} name="Development" />
                <Line type="monotone" dataKey="content" stroke="#3b82f6" strokeWidth={3} name="Content" />
                <Line type="monotone" dataKey="marketing" stroke="#10b981" strokeWidth={3} name="Marketing" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Department Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Video Types by Team</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={videoTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="team" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="course" stackId="a" fill="#8b5cf6" name="Course Videos" />
                <Bar dataKey="marketing" stackId="a" fill="#3b82f6" name="Marketing Videos" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Team Overview Grid */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Team Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {companyData.teams.map((team) => (
              <div key={team.id} className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">{team.name}</h3>
                  <div className={`w-3 h-3 rounded-full ${team.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                </div>
                
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-purple-600">{team.productivity}%</div>
                  <div className="text-sm text-gray-600">productivity</div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{team.memberCount} members</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2">
                    <Video className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">{team.monthlyVideos} videos</span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="text-sm text-gray-600 mb-2">Top Performers:</div>
                  <div className="flex justify-center space-x-2">
                    {team.members.slice(0, 3).map((member, index) => (
                      <div key={index} className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-purple-800">{member.avatar}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                  View Team Details
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* All Company Members Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">All Company Members</h2>
          <div className="space-y-4">
            {companyData.teams.map((team) => (
              <div key={team.id} className="border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleTeamExpansion(team.id)}
                  className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                    <span className="text-sm text-gray-600">({team.memberCount} members)</span>
                  </div>
                  {expandedTeams.includes(team.id) ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  )}
                </button>
                
                {expandedTeams.includes(team.id) && (
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {team.members.map((member, index) => (
                      <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-purple-800">{member.avatar}</span>
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(member.status)}`}></div>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{member.name}</div>
                            <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                              {member.role}
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Videos:</span>
                            <span className="font-medium">{member.videos}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Productivity:</span>
                            <span className="font-medium">{member.productivity}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Company-Wide Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <button className="flex flex-col items-center space-y-2 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
              <Users className="w-6 h-6 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">View All Teams</span>
            </button>
            
            <button className="flex flex-col items-center space-y-2 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
              <FileText className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Company Reports</span>
            </button>
            
            <button className="flex flex-col items-center space-y-2 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
              <MessageCircle className="w-6 h-6 text-green-600" />
              <span className="text-sm font-medium text-green-800">Broadcast Message</span>
            </button>
            
            <button className="flex flex-col items-center space-y-2 p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
              <Target className="w-6 h-6 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Set Company Goals</span>
            </button>
            
            <button className="flex flex-col items-center space-y-2 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
              <Download className="w-6 h-6 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Export Data</span>
            </button>
            
            <button className="flex flex-col items-center space-y-2 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <Settings className="w-6 h-6 text-gray-600" />
              <span className="text-sm font-medium text-gray-800">Manage Teams</span>
            </button>
            
            <button className="flex flex-col items-center space-y-2 p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
              <Plus className="w-6 h-6 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-800">Add New Team</span>
            </button>
          </div>
        </div>

        {/* Executive Insights Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Executive Insights</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Performance Radar */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Team Performance Radar</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis />
                  <Radar name="Development" dataKey="development" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                  <Radar name="Content" dataKey="content" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                  <Radar name="Marketing" dataKey="marketing" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Company Growth Trends */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Company Growth Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="development" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="content" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="marketing" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Resource Allocation */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Resource Allocation</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={[
                      { name: 'Course Content', value: 65, color: '#8b5cf6' },
                      { name: 'Marketing Content', value: 25, color: '#3b82f6' },
                      { name: 'Training Materials', value: 10, color: '#10b981' }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {[
                      { name: 'Course Content', value: 65, color: '#8b5cf6' },
                      { name: 'Marketing Content', value: 25, color: '#3b82f6' },
                      { name: 'Training Materials', value: 10, color: '#10b981' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            {/* Performance Metrics Dashboard */}
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Company KPIs</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Overall Productivity</span>
                  <span className="text-lg font-bold text-green-600">91%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Goal Achievement</span>
                  <span className="text-lg font-bold text-blue-600">108%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Quality Score</span>
                  <span className="text-lg font-bold text-purple-600">4.7/5</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Employee Satisfaction</span>
                  <span className="text-lg font-bold text-green-600">94%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Monthly Growth</span>
                  <span className="text-lg font-bold text-green-600">+18%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StarweaverCompanyDashboard;
