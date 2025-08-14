'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Star, TrendingUp, Clock, Target, Award, Calendar, BarChart3, Users, Plus, LogOut, Shield, UserPlus, UserMinus, X, Upload } from 'lucide-react';
import AdminProductivityCharts from './AdminProductivityCharts';
import DataImportModal from './DataImportModal';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
}

interface Entry {
  _id: string;
  date: string;
  videosCompleted: number;
  targetVideos: number;
  productivityScore: number;
  mood: string;
  energyLevel: string;
  challenges: string;
  achievements: string;
  userId: string;
  userName: string;
}

interface DashboardStats {
  totalUsers: number;
  totalEntries: number;
  totalVideos: number;
  averageProductivity: number;
  weeklyProgress: number;
  monthlyProgress: number;
}

interface SystemStats {
  totalUsers: number;
  totalEntries: number;
  totalVideos: number;
  averageProductivity: number;
  usersByRole: Array<{ _id: string; count: number }>;
}

interface TeamMemberPerformance {
  _id: string;
  name: string;
  email: string;
  role: string;
  totalVideos: number;
  totalEntries: number;
  averageProductivity: number;
  lastEntry: string;
}

interface AddTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (email: string) => void;
  loading: boolean;
}

function AddTeamMemberModal({ isOpen, onClose, onAdd, loading }: AddTeamMemberModalProps) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onAdd(email.trim());
      setEmail('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Add Team Member</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="Enter teammate's email"
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              We'll check if this user exists and add them to your team
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline flex-1"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={loading || !email.trim()}
            >
              {loading ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalEntries: 0,
    totalVideos: 0,
    averageProductivity: 0,
    weeklyProgress: 0,
    monthlyProgress: 0
  });
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [teamMemberPerformance, setTeamMemberPerformance] = useState<TeamMemberPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMemberLoading, setAddMemberLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'entries'>('overview');
  const [migrating, setMigrating] = useState(false);
  const [teamFilter, setTeamFilter] = useState<string>('all'); // 'all', 'editor', 'viewer', 'manager'
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchAdminData();
    }
  }, [user, selectedPeriod]);

  // Debug logging for chart data
  useEffect(() => {
    console.log('🔍 AdminDashboard - Data for charts:', { 
      entriesLength: entries?.length, 
      teamMembersLength: teamMembers?.length, 
      systemStats: systemStats,
      teamMemberPerformanceLength: teamMemberPerformance?.length
    });
  }, [entries, teamMembers, systemStats, teamMemberPerformance]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      // Check if we're on the client side
      if (typeof window === 'undefined') {
        return;
      }
      
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('No access token found');
        return;
      }
      
      // Fetch team data
      const teamResponse = await fetch('/api/teams', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (teamResponse.ok) {
        const teamData = await teamResponse.json();
        setTeamMembers(teamData.members || []);
      }

      // Fetch all entries (admin can see all)
      const entriesResponse = await fetch('/api/entries?limit=10', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (entriesResponse.ok) {
        const entriesData = await entriesResponse.json();
        setEntries(entriesData.entries || []);
      }

      // Fetch admin dashboard stats
      const statsResponse = await fetch(`/api/dashboard?period=${selectedPeriod}&includeTeam=true&includeAllUsers=true`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.userStats || stats);
        
        // Set system stats if available
        if (statsData.systemStats) {
          setSystemStats(statsData.systemStats);
        }
        
        // Set team stats if available
        if (statsData.teamStats) {
          setTeamMemberPerformance(statsData.teamStats.memberPerformance || []);
        }
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTeamMember = async (email: string) => {
    try {
      setAddMemberLoading(true);
      setMessage(null);
      
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ email })
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Team member added successfully!' });
        setShowAddModal(false);
        fetchAdminData(); // Refresh data
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Failed to add team member' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while adding team member' });
    } finally {
      setAddMemberLoading(false);
    }
  };

  const handleRemoveTeamMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    
    try {
      const response = await fetch(`/api/teams/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Team member removed successfully!' });
        fetchAdminData(); // Refresh data
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Failed to remove team member' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while removing team member' });
    }
  };

  const handleDataMigration = async () => {
    if (migrating) return;
    setMigrating(true);
    setMessage(null);

    try {
      const response = await fetch('/api/migrate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessage({ type: 'success', text: `Successfully migrated ${data.migratedEntries} entries.` });
        fetchAdminData(); // Refresh data
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Failed to migrate data' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred during data migration' });
    } finally {
      setMigrating(false);
    }
  };

  const handleUserImport = async (importData: any) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/import/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(importData)
      });

      if (response.ok) {
        const result = await response.json();
        setMessage({ 
          type: 'success', 
          text: `User import completed successfully! ${result.results.usersCreated} users created.` 
        });
        fetchAdminData(); // Refresh data
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: `User import failed: ${error.error}` });
        throw new Error(error.error);
      }
    } catch (error) {
      setMessage({ type: 'error', text: `User import failed: ${error}` });
      throw error;
    }
  };

  const handleDataImport = async (importData: any) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/import/data', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(importData)
      });

      if (response.ok) {
        const result = await response.json();
        setMessage({ 
          type: 'success', 
          text: `Data import completed successfully! ${result.results.entriesCreated} entries created.` 
        });
        fetchAdminData(); // Refresh data
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: `Data import failed: ${error.error}` });
        throw new Error(error.error);
      }
    } catch (error) {
      setMessage({ type: 'error', text: `Data import failed: ${error}` });
      throw error;
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMoodEmoji = (mood: string) => {
    const moodMap: { [key: string]: string } = {
      'excellent': '😄',
      'good': '🙂',
      'neutral': '😐',
      'poor': '😔',
      'terrible': '😢'
    };
    return moodMap[mood] || '😐';
  };

  const getEnergyEmoji = (energy: string) => {
    const energyMap: { [key: string]: string } = {
      'high': '⚡',
      'medium': '🔋',
      'low': '🪫'
    };
    return energyMap[energy] || '🔋';
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="loading-spinner w-8 h-8 mx-auto mb-4" />
            <p className="text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Header */}
        <div className="dashboard-header">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <h1 className="dashboard-title">STARWEAVER</h1>
          </div>
          
          <div className="user-section">
            <div className="text-right mr-4">
              <div className="flex items-center space-x-2 mb-1">
                <Shield className="w-4 h-4 text-red-500" />
                <span className="text-sm text-gray-400">System Administrator</span>
              </div>
              <p className="text-lg font-semibold text-white">{user?.name || 'Admin'}</p>
            </div>
            
            {/* User Initial with Hover Dropdown */}
            <div className="relative group">
              <div className="user-initial">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              
              {/* Logout Dropdown */}
              <div className="logout-dropdown">
                <button
                  onClick={handleLogout}
                  className="logout-button"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="dashboard-main">
          {/* Period Selector and Add Member Button */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
            <div className="flex space-x-3">
              <div className="flex space-x-2">
                {['week', 'month'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedPeriod === period
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="btn btn-primary flex items-center space-x-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Member</span>
              </button>
            </div>
          </div>

          {/* Message Display */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-700' 
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {message.text}
            </div>
          )}

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'team', label: 'Team Management', icon: Users },
              { id: 'entries', label: 'All Entries', icon: Calendar }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Admin Stats Grid */}
              <div className="dashboard-grid">
                <div className="stat-card">
                  <div className="stat-icon">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="stat-value">{systemStats?.totalUsers || 0}</div>
                  <div className="stat-label">Total Users</div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div className="stat-value">{systemStats?.totalEntries || 0}</div>
                  <div className="stat-label">Total Entries</div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <Target className="w-6 h-6" />
                  </div>
                  <div className="stat-value">{systemStats?.totalVideos || 0}</div>
                  <div className="stat-label">Total Videos</div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div className="stat-value">{(systemStats?.averageProductivity || 0).toFixed(1)}%</div>
                  <div className="stat-label">System Productivity</div>
                </div>
              </div>

              {/* Productivity Charts */}
              <div className="dashboard-section mt-8">
                <h3 className="section-title">System Analytics</h3>
                <AdminProductivityCharts 
                  entries={entries} 
                  teamMembers={teamMembers}
                  systemStats={systemStats}
                />
              </div>

              {/* User Distribution by Role */}
              {systemStats?.usersByRole && systemStats.usersByRole.length > 0 && (
                <div className="dashboard-section mt-8">
                  <h3 className="section-title">User Distribution by Role</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {systemStats.usersByRole.map((roleData) => (
                      <div key={roleData._id} className="card p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600 mb-2">
                          {roleData.count}
                        </div>
                        <div className="text-sm text-gray-600 capitalize">
                          {roleData._id} Users
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="card mt-8">
                <div className="card-header">
                  <h3 className="card-title">Quick Actions</h3>
                  <p className="text-gray-600">Common administrative tasks</p>
                </div>
                <div className="card-content">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => setActiveTab('team')}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <Users className="w-8 h-8 text-green-600 mb-2" />
                      <h4 className="font-semibold text-gray-900">Manage Team</h4>
                      <p className="text-sm text-gray-600">View and manage team members</p>
                    </button>
                    
                    <button
                      onClick={() => setActiveTab('entries')}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <Calendar className="w-8 h-8 text-purple-600 mb-2" />
                      <h4 className="font-semibold text-gray-900">View Entries</h4>
                      <p className="text-sm text-gray-600">Monitor all user entries</p>
                    </button>

                    <button
                      onClick={handleDataMigration}
                      disabled={migrating}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <BarChart3 className="w-8 h-8 text-orange-600 mb-2" />
                      <h4 className="text-semibold text-gray-900">Restore Data</h4>
                      <p className="text-sm text-gray-600">Migrate legacy entries to restore data</p>
                    </button>

                    <button
                      onClick={() => setShowImportModal(true)}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <Upload className="w-8 h-8 text-blue-600 mb-2" />
                      <h4 className="font-semibold text-gray-900">Import Data</h4>
                      <p className="text-sm text-gray-600">Import team structure and productivity data</p>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Team Management Tab */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              {/* Team Performance Overview */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Team Performance Overview</h3>
                  <p className="text-gray-600">Overall team productivity and statistics</p>
                </div>
                <div className="card-content">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {teamMemberPerformance.length}
                      </div>
                      <div className="text-sm text-gray-600">Team Members</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {teamMemberPerformance.reduce((sum, member) => sum + member.totalVideos, 0)}
                      </div>
                      <div className="text-sm text-gray-600">Total Videos</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {teamMemberPerformance.length > 0 
                          ? Math.round(teamMemberPerformance.reduce((sum, member) => sum + member.averageProductivity, 0) / teamMemberPerformance.length)
                          : 0}%
                      </div>
                      <div className="text-sm text-gray-600">Avg Productivity</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Member Performance Table */}
              <div className="card">
                <div className="card-header">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="card-title">Team Member Performance</h3>
                      <p className="text-gray-600">Detailed performance breakdown by team member</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="btn btn-primary flex items-center space-x-2 px-4 py-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Add Member</span>
                      </button>
                      <select
                        value={teamFilter}
                        onChange={(e) => setTeamFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Roles</option>
                        <option value="manager">Managers</option>
                        <option value="editor">Editors</option>
                        <option value="viewer">Viewers</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="card-content">
                  {teamMemberPerformance.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No team member performance data available</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Team Member
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total Videos
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Entries
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Avg Productivity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Last Entry
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {teamMemberPerformance
                            .filter(member => teamFilter === 'all' || member.role === teamFilter)
                            .map((member) => (
                            <tr key={member._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
                                    {member.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                    <div className="text-sm text-gray-500">{member.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  member.role === 'manager' ? 'bg-green-100 text-green-800' :
                                  member.role === 'editor' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-semibold text-blue-600">
                                  {member.totalVideos}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {member.totalEntries}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className={`text-sm font-semibold ${
                                  member.averageProductivity >= 80 ? 'text-green-600' :
                                  member.averageProductivity >= 60 ? 'text-yellow-600' :
                                  'text-red-600'
                                }`}>
                                  {member.averageProductivity}%
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {member.lastEntry ? formatDate(member.lastEntry) : 'No entries'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => handleRemoveTeamMember(member._id)}
                                  className="text-red-600 hover:text-red-900 transition-colors"
                                  title="Remove team member"
                                >
                                  <UserMinus className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Top Performers */}
              {teamMemberPerformance.length > 0 && (
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Top Performers</h3>
                    <p className="text-gray-600">Team members with highest video completion rates</p>
                  </div>
                  <div className="card-content">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {teamMemberPerformance.slice(0, 3).map((member, index) => (
                        <div key={member._id} className="p-4 border border-gray-200 rounded-lg text-center">
                          <div className="flex items-center justify-center mb-3">
                            {index === 0 && <span className="text-2xl mr-2">🥇</span>}
                            {index === 1 && <span className="text-2xl mr-2">🥈</span>}
                            {index === 2 && <span className="text-2xl mr-2">🥉</span>}
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-1">{member.name}</h4>
                          <p className="text-sm text-gray-600 mb-2">{member.role}</p>
                          <div className="text-lg font-bold text-blue-600 mb-1">
                            {member.totalVideos} videos
                          </div>
                          <div className="text-sm text-gray-500">
                            {member.averageProductivity}% productivity
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Team Analytics Charts */}
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Team Analytics</h3>
                  <p className="text-gray-600">Detailed team performance charts with filtering</p>
                </div>
                <div className="card-content">
                  <AdminProductivityCharts 
                    entries={entries} 
                    teamMembers={teamMembers}
                    systemStats={systemStats}
                  />
                </div>
              </div>
            </div>
          )}

          {/* All Entries Tab */}
          {activeTab === 'entries' && (
            <div className="space-y-6">
              {/* Entries Overview */}
              <div className="card">
                <div className="card-header">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="card-title">All User Entries</h3>
                      <p className="text-gray-600">Monitor productivity across all users</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="btn btn-primary flex items-center space-x-2 px-4 py-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Add Member</span>
                      </button>
                      <select
                        value={teamFilter}
                        onChange={(e) => setTeamFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="all">All Users</option>
                        <option value="manager">Managers</option>
                        <option value="editor">Editors</option>
                        <option value="viewer">Viewers</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="card-content">
                  {entries.length === 0 ? (
                    <div className="text-center py-8">
                      <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No entries found in the system</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              User
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
                              Mood
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Energy
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Notes
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {entries
                            .filter(entry => {
                              if (teamFilter === 'all') return true;
                              // Find the user's role from team members
                              const user = teamMembers.find(member => member._id === entry.userId);
                              return user && user.role === teamFilter;
                            })
                            .map((entry) => (
                            <tr key={entry._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
                                    {entry.userName?.charAt(0)?.toUpperCase() || 'U'}
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{entry.userName || 'Unknown User'}</div>
                                    <div className="text-sm text-gray-500">{entry.userId}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {formatDate(entry.date)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-lg font-bold text-blue-600">
                                  {entry.videosCompleted || 0}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className={`text-sm font-semibold ${
                                  (entry.productivityScore || 0) >= 80 ? 'text-green-600' :
                                  (entry.productivityScore || 0) >= 60 ? 'text-yellow-600' :
                                  'text-red-600'
                                }`}>
                                  {entry.productivityScore || 0}%
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  <span>{getMoodEmoji(entry.mood || 'neutral')}</span>
                                  <span className="text-sm text-gray-900 capitalize">
                                    {entry.mood || 'neutral'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  <span>{getEnergyEmoji(entry.energyLevel || 'medium')}</span>
                                  <span className="text-sm text-gray-900 capitalize">
                                    {entry.energyLevel || 'medium'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                                <div className="truncate" title={entry.challenges || entry.achievements || 'No notes'}>
                                  {entry.challenges || entry.achievements || 'No notes'}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Entries Summary */}
              {entries.length > 0 && (
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Entries Summary</h3>
                    <p className="text-gray-600">Quick overview of all entries data</p>
                  </div>
                  <div className="card-content">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                          {entries.length}
                        </div>
                        <div className="text-sm text-gray-600">Total Entries</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {entries.reduce((sum, entry) => sum + (entry.videosCompleted || 0), 0)}
                        </div>
                        <div className="text-sm text-gray-600">Total Videos</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {entries.length > 0 
                            ? Math.round(entries.reduce((sum, entry) => sum + (entry.productivityScore || 0), 0) / entries.length)
                            : 0}%
                        </div>
                        <div className="text-sm text-gray-600">Avg Productivity</div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {new Set(entries.map(entry => entry.userId)).size}
                        </div>
                        <div className="text-sm text-gray-600">Active Users</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Add Team Member Modal */}
        <AddTeamMemberModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddTeamMember}
          loading={addMemberLoading}
        />

        {/* Data Import Modal */}
        <DataImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onUserImport={handleUserImport}
          onDataImport={handleDataImport}
        />
      </div>
    </div>
  );
}
