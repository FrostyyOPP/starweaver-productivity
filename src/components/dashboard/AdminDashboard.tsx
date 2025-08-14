'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Star, TrendingUp, Clock, Target, Award, Calendar, BarChart3, Users, Plus, LogOut, Shield, UserPlus, UserMinus, X } from 'lucide-react';
import ProductivityCharts from './ProductivityCharts';

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
  shiftStart: string;
  shiftEnd: string;
  videosCompleted: number;
  targetVideos: number;
  productivityScore: number;
  mood: string;
  energyLevel: string;
  challenges: string;
  achievements: string;
  totalHours: number;
  userId: string;
  userName: string;
}

interface DashboardStats {
  totalUsers: number;
  totalEntries: number;
  totalVideos: number;
  totalHours: number;
  averageProductivity: number;
  weeklyProgress: number;
  monthlyProgress: number;
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
    totalHours: 0,
    averageProductivity: 0,
    weeklyProgress: 0,
    monthlyProgress: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMemberLoading, setAddMemberLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'entries'>('overview');
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoMessage, setDemoMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (user) {
      fetchAdminData();
    }
  }, [user, selectedPeriod]);

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
        setStats(statsData);
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

  const handleAddDemoEntries = async () => {
    if (!confirm('Are you sure you want to add demo entries? This will overwrite existing entries.')) return;

    try {
      setDemoLoading(true);
      setDemoMessage(null);

      const token = localStorage.getItem('accessToken');
      if (!token) {
        setDemoMessage({ type: 'error', text: 'No access token found' });
        return;
      }

      const response = await fetch('/api/demo/entries', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setDemoMessage({ type: 'success', text: 'Demo entries added successfully!' });
        fetchAdminData(); // Refresh data
      } else {
        const errorData = await response.json();
        setDemoMessage({ type: 'error', text: errorData.error || 'Failed to add demo entries' });
      }
    } catch (error) {
      setDemoMessage({ type: 'error', text: 'An error occurred while adding demo entries' });
    } finally {
      setDemoLoading(false);
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
                  <div className="stat-value">{stats.totalUsers || 0}</div>
                  <div className="stat-label">Total Users</div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div className="stat-value">{stats.totalEntries || 0}</div>
                  <div className="stat-label">Total Entries</div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <Target className="w-6 h-6" />
                  </div>
                  <div className="stat-value">{stats.totalVideos || 0}</div>
                  <div className="stat-label">Total Videos</div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div className="stat-value">{(stats.averageProductivity || 0).toFixed(1)}%</div>
                  <div className="stat-label">System Productivity</div>
                </div>
              </div>

              {/* Productivity Charts */}
              <div className="dashboard-section mt-8">
                <h3 className="section-title">System Analytics</h3>
                <ProductivityCharts entries={entries} />
              </div>

              {/* Quick Actions */}
              <div className="card mt-8">
                <div className="card-header">
                  <h3 className="card-title">Quick Actions</h3>
                  <p className="text-gray-600">Common administrative tasks</p>
                </div>
                <div className="card-content">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <UserPlus className="w-8 h-8 text-blue-600 mb-2" />
                      <h4 className="font-semibold text-gray-900">Add Team Member</h4>
                      <p className="text-sm text-gray-600">Invite new users to the system</p>
                    </button>
                    
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
                  </div>
                  
                  {/* Demo Data Section */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3">Demo Data</h4>
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={handleAddDemoEntries}
                        disabled={demoLoading}
                        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                      >
                        {demoLoading ? (
                          <>
                            <div className="loading-spinner w-4 h-4" />
                            <span>Adding Demo Data...</span>
                          </>
                        ) : (
                          <>
                            <BarChart3 className="w-4 h-4" />
                            <span>Add Demo Entries</span>
                          </>
                        )}
                      </button>
                      
                      {demoMessage && (
                        <div className={`px-4 py-2 rounded-lg text-sm ${
                          demoMessage.type === 'success' 
                            ? 'bg-green-100 text-green-800 border border-green-200' 
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {demoMessage.text}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Add sample productivity data for testing and demonstration purposes.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Team Management Tab */}
          {activeTab === 'team' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Team Management</h3>
                <p className="text-gray-600">Manage your team members and their roles</p>
              </div>
              <div className="card-content">
                {teamMembers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No team members yet. Add your first team member!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {teamMembers.map((member) => (
                      <div key={member._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{member.name}</h4>
                              <p className="text-sm text-gray-600">{member.email}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  member.role === 'admin' ? 'bg-red-100 text-red-800' :
                                  member.role === 'manager' ? 'bg-green-100 text-green-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  member.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {member.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="text-xs text-gray-500">Last login</p>
                            <p className="text-sm font-medium">{formatDate(member.lastLogin || '')}</p>
                            <button
                              onClick={() => handleRemoveTeamMember(member._id)}
                              className="mt-2 text-red-600 hover:text-red-800 transition-colors"
                              title="Remove team member"
                            >
                              <UserMinus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* All Entries Tab */}
          {activeTab === 'entries' && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">All User Entries</h3>
                <p className="text-gray-600">Monitor productivity across all users</p>
              </div>
              <div className="card-content">
                {entries.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No entries found in the system</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {entries.map((entry) => (
                      <div key={entry._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-gray-900">{entry.userName}</h4>
                            <p className="text-sm text-gray-600">{formatDate(entry.date)}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(entry.shiftStart).toLocaleTimeString()} - {new Date(entry.shiftEnd).toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-blue-600">{entry.videosCompleted}</div>
                            <div className="text-sm text-gray-500">videos</div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Productivity:</span>
                            <span className="ml-2 font-medium text-green-600">{entry.productivityScore}%</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Hours:</span>
                            <span className="ml-2 font-medium">{entry.totalHours}h</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Mood:</span>
                            <span className="ml-2">{getMoodEmoji(entry.mood)} {entry.mood}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Energy:</span>
                            <span className="ml-2">{getEnergyEmoji(entry.energyLevel)} {entry.energyLevel}</span>
                          </div>
                        </div>
                        
                        {entry.challenges && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Challenges:</span> {entry.challenges}
                            </p>
                          </div>
                        )}
                        
                        {entry.achievements && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Achievements:</span> {entry.achievements}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
      </div>
    </div>
  );
}
