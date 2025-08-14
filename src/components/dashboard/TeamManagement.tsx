'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Edit, 
  Eye, 
  UserPlus, 
  Settings, 
  Filter, 
  Search, 
  X,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Target,
  Clock,
  Award,
  BarChart3,
  Calendar,
  Video,
  Star
} from 'lucide-react';
import TeamProductivityCharts from './TeamProductivityCharts';
import TeamMemberList from './TeamMemberList';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  position: string;
  department: string;
  employeeId: string;
  avatar?: string;
  skills: string[];
  joinDate: string;
  isActive: boolean;
  lastLogin?: string;
  productivityScore: number;
  videosCompleted: number;
  targetVideos: number;
}

interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  averageProductivity: number;
  totalVideosCompleted: number;
  weeklyProgress: number;
  monthlyProgress: number;
  teamTarget: number;
  teamAchievement: number;
}

interface Team {
  id: string;
  name: string;
  code: string;
  color: string;
  description: string;
}

interface Entry {
  _id: string;
  userId: string;
  userName: string;
  date: string;
  videosCompleted: number;
  targetVideos: number;
  productivityScore: number;
  videoCategory: string;
  notes: string;
}

export default function TeamManagement() {
  const [team, setTeam] = useState<Team | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      _id: '1',
      name: 'Sachin Kumar',
      email: 'sachin.kumar@starweaver.com',
      position: 'Team Manager',
      department: 'Content Production',
      employeeId: 'TM001',
      avatar: '',
      skills: ['Team Management', 'Content Strategy', 'Project Planning'],
      joinDate: '2024-01-01',
      isActive: true,
      productivityScore: 92,
      videosCompleted: 45,
      targetVideos: 50
    },
    {
      _id: '2',
      name: 'Ashu Kumar',
      email: 'ashu.kumar@starweaver.com',
      position: 'Content Editor',
      department: 'Content Production',
      employeeId: 'CE001',
      avatar: '',
      skills: ['Video Editing', 'Content Creation', 'Quality Control'],
      joinDate: '2024-01-01',
      isActive: true,
      productivityScore: 88,
      videosCompleted: 38,
      targetVideos: 40
    },
    {
      _id: '3',
      name: 'Prashansha Manral',
      email: 'prashansha.manral@starweaver.com',
      position: 'Content Editor',
      department: 'Content Production',
      employeeId: 'CE002',
      avatar: '',
      skills: ['Video Editing', 'Storytelling', 'Creative Direction'],
      joinDate: '2024-01-01',
      isActive: true,
      productivityScore: 85,
      videosCompleted: 35,
      targetVideos: 40
    }
  ]);
  const [teamStats, setTeamStats] = useState<TeamStats>({
    totalMembers: 8,
    activeMembers: 8,
    averageProductivity: 85,
    totalVideosCompleted: 156,
    weeklyProgress: 78,
    monthlyProgress: 82,
    teamTarget: 120,
    teamAchievement: 156
  });
  const [recentEntries, setRecentEntries] = useState<Entry[]>([
    {
      _id: '1',
      userId: '1',
      userName: 'Sachin Kumar',
      date: '2025-01-14',
      videosCompleted: 5,
      targetVideos: 5,
      productivityScore: 100,
      videoCategory: 'course',
      notes: 'Completed weekly target'
    },
    {
      _id: '2',
      userId: '2',
      userName: 'Ashu Kumar',
      date: '2025-01-14',
      videosCompleted: 4,
      targetVideos: 4,
      productivityScore: 100,
      videoCategory: 'marketing',
      notes: 'Marketing content completed'
    },
    {
      _id: '3',
      userId: '3',
      userName: 'Prashansha Manral',
      date: '2025-01-14',
      videosCompleted: 3,
      targetVideos: 4,
      productivityScore: 75,
      videoCategory: 'course',
      notes: 'Working on advanced editing'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'analytics' | 'entries'>('overview');

  useEffect(() => {
    console.log('🔄 TeamManagement useEffect triggered');
    console.log('📊 Current teamMembers:', teamMembers);
    console.log('📈 Current teamStats:', teamStats);
    fetchTeamData();
  }, []); // Only run once on mount

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      
      // Get auth token
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('No access token found');
        return;
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      // Fetch team members
      console.log('🔍 Fetching team data...');
      const membersResponse = await fetch('/api/teams/manager', { headers });
      if (membersResponse.ok) {
        const membersData = await membersResponse.json();
        console.log('📊 Team data received:', membersData);
        setTeamMembers(membersData.members || []);
        setTeamStats(membersData.stats || {});
        setTeam(membersData.team || null);
      } else {
        console.error('❌ Failed to fetch team data:', membersResponse.status);
      }

      // Fetch recent entries
      const entriesResponse = await fetch('/api/entries?limit=10', { headers });
      if (entriesResponse.ok) {
        const entriesData = await entriesResponse.json();
        console.log('📝 Entries data received:', entriesData);
        setRecentEntries(entriesData.entries || []);
      } else {
        console.error('❌ Failed to fetch entries:', entriesResponse.status);
      }
          } catch (error) {
        console.error('❌ Error fetching team data:', error);
        // Set some fallback data if API fails
        if (teamMembers.length === 0) {
          console.log('⚠️ Using fallback data due to API error');
        }
      } finally {
        setLoading(false);
      }
  };

  const handleEditMember = (memberId: string) => {
    // Handle member editing
    console.log('Edit member:', memberId);
  };

  const handleViewMember = (memberId: string) => {
    // Handle member viewing
    console.log('View member:', memberId);
  };

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || member.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const getProductivityColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 75) return 'text-blue-600 bg-blue-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getProductivityIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="w-4 h-4" />;
    if (score >= 75) return <TrendingUp className="w-4 h-4" />;
    if (score >= 60) return <Clock className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {team ? `${team.name} - Team Management` : 'Team Management'}
            </h1>
            <p className="text-gray-600">
              {team ? team.description : 'Manage your team members and monitor performance'}
            </p>
            {team && (
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-sm text-gray-500">Team Code:</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                  {team.code}
                </span>
              </div>
            )}
          </div>
          <div className="flex space-x-3">
            <button className="btn-primary flex items-center space-x-2">
              <UserPlus className="w-4 h-4" />
              <span>Add Member</span>
            </button>
            <button className="btn-secondary flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>

        

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          {/* Total Members Card */}
          <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                  <p className="text-blue-100 text-sm font-medium tracking-wide uppercase">Total Members</p>
                </div>
                <p className="text-3xl font-bold text-white mb-1">{teamStats.totalMembers}</p>
                <p className="text-blue-200 text-sm font-medium">{teamMembers.length} active members</p>
              </div>
              <div className="bg-blue-500/20 p-3 rounded-full">
                <Users className="w-7 h-7 text-blue-200" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-500/30">
              <div className="flex items-center justify-between text-xs text-blue-200">
                <span>Team Capacity</span>
                <span className="font-medium">{Math.round((teamStats.totalMembers / 10) * 100)}%</span>
              </div>
            </div>
          </div>
          
          {/* Active Members Card */}
          <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-emerald-300 rounded-full"></div>
                  <p className="text-emerald-100 text-sm font-medium tracking-wide uppercase">Active Members</p>
                </div>
                <p className="text-3xl font-bold text-white mb-1">{teamStats.activeMembers}</p>
                <p className="text-emerald-200 text-sm font-medium">{Math.round((teamStats.activeMembers / teamStats.totalMembers) * 100)}% engagement</p>
              </div>
              <div className="bg-emerald-500/20 p-3 rounded-full">
                <CheckCircle className="w-7 h-7 text-emerald-200" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-emerald-500/30">
              <div className="flex items-center justify-between text-xs text-emerald-200">
                <span>Online Now</span>
                <span className="font-medium">{Math.min(teamStats.activeMembers, 3)}</span>
              </div>
            </div>
          </div>
          
          {/* Productivity Card */}
          <div className="bg-gradient-to-br from-violet-600 via-violet-700 to-violet-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-violet-300 rounded-full"></div>
                  <p className="text-violet-100 text-sm font-medium tracking-wide uppercase">Avg Productivity</p>
                </div>
                <p className="text-3xl font-bold text-white mb-1">{teamStats.averageProductivity}%</p>
                <p className="text-violet-200 text-sm font-medium">
                  {teamStats.averageProductivity >= 80 ? 'Excellent' : 
                   teamStats.averageProductivity >= 60 ? 'Good' : 
                   teamStats.averageProductivity >= 40 ? 'Average' : 'Needs Improvement'}
                </p>
              </div>
              <div className="bg-violet-500/20 p-3 rounded-full">
                <TrendingUp className="w-7 h-7 text-violet-200" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-violet-500/30">
              <div className="w-full bg-violet-500/30 rounded-full h-2">
                <div 
                  className="bg-violet-300 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${teamStats.averageProductivity}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Videos Completed Card */}
          <div className="bg-gradient-to-br from-amber-600 via-amber-700 to-amber-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-amber-300 rounded-full"></div>
                  <p className="text-amber-100 text-sm font-medium tracking-wide uppercase">Videos Completed</p>
                </div>
                <p className="text-3xl font-bold text-white mb-1">{teamStats.totalVideosCompleted}</p>
                <p className="text-amber-200 text-sm font-medium">This week's target</p>
              </div>
              <div className="bg-amber-500/20 p-3 rounded-full">
                <Video className="w-7 h-7 text-amber-200" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-amber-500/30">
              <div className="flex items-center justify-between text-xs text-amber-200">
                <span>Daily Average</span>
                <span className="font-medium">{Math.round(teamStats.totalVideosCompleted / 7)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-6 px-4">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'members', label: 'Team Members', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'entries', label: 'Recent Entries', icon: Calendar }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Team Performance</h3>
                  <TeamProductivityCharts 
                    period={selectedPeriod}
                    memberId={selectedMember}
                    teamMembers={teamMembers}
                  />
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <button className="w-full btn-primary flex items-center justify-center space-x-2">
                      <Plus className="w-4 h-4" />
                      <span>Add New Member</span>
                    </button>
                    <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                      <BarChart3 className="w-4 h-4" />
                      <span>Generate Report</span>
                    </button>
                    <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                      <Settings className="w-4 h-4" />
                      <span>Team Settings</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search members..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Departments</option>
                    <option value="Content Production">Content Production</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                  </select>
                  
                  <button className="btn-primary flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Add Member</span>
                  </button>
                </div>
              </div>
              

              
              <TeamMemberList
                members={filteredMembers}
                onEditMember={handleEditMember}
                onViewMember={handleViewMember}
              />
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Performance Analytics</h3>
                <div className="flex space-x-2">
                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="quarter">This Quarter</option>
                    <option value="year">This Year</option>
                  </select>
                  
                  <select
                    value={selectedMember}
                    onChange={(e) => setSelectedMember(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Members</option>
                    {teamMembers.map(member => (
                      <option key={member._id} value={member._id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <TeamProductivityCharts 
                period={selectedPeriod}
                memberId={selectedMember}
                teamMembers={teamMembers}
              />
            </div>
          )}

          {/* Entries Tab */}
          {activeTab === 'entries' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Entries</h3>
                <button className="btn-primary flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Add Entry</span>
                </button>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Member
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Videos
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Productivity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recentEntries.map((entry) => (
                        <tr key={entry._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-medium text-sm">
                                  {entry.userName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{entry.userName}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(entry.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {entry.videosCompleted} / {entry.targetVideos}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getProductivityColor(entry.productivityScore)}`}>
                              {getProductivityIcon(entry.productivityScore)}
                              <span className="ml-1">{entry.productivityScore}%</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button className="text-blue-600 hover:text-blue-900">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button className="text-green-600 hover:text-green-900">
                                <Edit className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
