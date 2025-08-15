'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Star, TrendingUp, Target, Users, Plus, LogOut, Shield, UserPlus, X, Settings, Download, Upload, ChevronDown, FileText, FileSpreadsheet, FileDown, Activity } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
}

interface SystemStats {
  totalUsers: number;
  totalEntries: number;
  totalVideos: number;
  averageProductivity: number;
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
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="modal-title">Add Team Member</h2>
              <p className="modal-subtitle">Add a new member to your team</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-button">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-field">
            <label htmlFor="email" className="form-label">
              <Users className="w-4 h-4" />
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="Enter teammate's email"
              required
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-2">
              We'll check if this user exists and add them to your team
            </p>
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-outline" disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || !email.trim()}>
              {loading ? (
                <>
                  <div className="loading-spinner w-4 h-4"></div>
                  Adding...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Add Member
                </>
              )}
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
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'entries'>('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMemberLoading, setAddMemberLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showQuickActionsDropdown, setShowQuickActionsDropdown] = useState(false);
  const [showExportFormatDropdown, setShowExportFormatDropdown] = useState(false);
  const [teamFilter, setTeamFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchAdminData();
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.quick-actions-dropdown') && !target.closest('.quick-actions-button')) {
        setShowQuickActionsDropdown(false);
      }
      if (!target.closest('.export-format-dropdown') && !target.closest('.export-report-button')) {
        setShowExportFormatDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      
      if (typeof window === 'undefined') return;
      
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.error('No access token found');
        return;
      }
      
      const teamResponse = await fetch('/api/teams', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (teamResponse.ok) {
        const teamData = await teamResponse.json();
        setTeamMembers(teamData.members || []);
      }

      const statsResponse = await fetch(`/api/dashboard?period=week&includeTeam=true&includeAllUsers=true`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setSystemStats(statsData.systemStats || null);
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
        fetchAdminData();
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
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      });
      
      if (response.ok) {
        setMessage({ type: 'success', text: 'Team member removed successfully!' });
        fetchAdminData();
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Failed to remove team member' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while removing team member' });
    }
  };

  const handleQuickAction = (action: string) => {
    setShowQuickActionsDropdown(false);
    switch (action) {
      case 'add-member':
        setShowAddModal(true);
        break;
      case 'export-report':
        setShowExportFormatDropdown(!showExportFormatDropdown);
        break;
      case 'system-settings':
        alert('⚙️ System settings functionality coming soon...');
        break;
      case 'import-data':
        alert('📤 Data import functionality coming soon...');
        break;
      case 'bulk-actions':
        alert('👥 Bulk actions functionality coming soon...');
        break;
      case 'data-migration':
        alert('🔄 Data migration functionality coming soon...');
        break;
      default:
        break;
    }
  };

  const handleExportFormat = (format: string) => {
    setShowExportFormatDropdown(false);
    switch (format) {
      case 'xlsx':
        alert('📊 Exporting admin data as XLSX file...');
        break;
      case 'csv':
        alert('📊 Exporting admin data as CSV file...');
        break;
      case 'pdf':
        alert('📊 Exporting admin data as PDF file...');
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
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
            
            <div className="relative group">
              <div className="user-initial">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              
              <div className="logout-dropdown">
                <button onClick={handleLogout} className="logout-button">
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="quick-actions-bar">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
              <div className="period-selector">
                {['week', 'month'].map((period) => (
                  <button
                    key={period}
                    onClick={() => {}}
                    className={`period-btn ${period === 'week' ? 'active' : ''}`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="quick-actions-container">
              <button
                onClick={() => setShowQuickActionsDropdown(!showQuickActionsDropdown)}
                className="btn btn-primary flex items-center space-x-2 quick-actions-button"
              >
                <Plus className="w-4 h-4" />
                <span>Quick Actions</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showQuickActionsDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showQuickActionsDropdown && (
                <div className="quick-actions-dropdown">
                  <div className="dropdown-item" onClick={() => handleQuickAction('add-member')}>
                    <UserPlus className="w-4 h-4" />
                    <span>Add New Member</span>
                  </div>
                  <div className="dropdown-item" onClick={() => handleQuickAction('export-report')}>
                    <FileDown className="w-4 h-4" />
                    <span>Export Report</span>
                  </div>
                  <div className="dropdown-item" onClick={() => handleQuickAction('system-settings')}>
                    <Settings className="w-4 h-4" />
                    <span>System Settings</span>
                  </div>
                  <div className="dropdown-item" onClick={() => handleQuickAction('import-data')}>
                    <Upload className="w-4 h-4" />
                    <span>Import Data</span>
                  </div>
                  <div className="dropdown-item" onClick={() => handleQuickAction('bulk-actions')}>
                    <Users className="w-4 h-4" />
                    <span>Bulk Actions</span>
                  </div>
                  <div className="dropdown-item" onClick={() => handleQuickAction('data-migration')}>
                    <Activity className="w-4 h-4" />
                    <span>Data Migration</span>
                  </div>
                </div>
              )}

              {showExportFormatDropdown && (
                <div className="export-format-dropdown">
                  <div className="dropdown-item" onClick={() => handleExportFormat('xlsx')}>
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Export as XLSX</span>
                  </div>
                  <div className="dropdown-item" onClick={() => handleExportFormat('csv')}>
                    <FileText className="w-4 h-4" />
                    <span>Export as CSV</span>
                  </div>
                  <div className="dropdown-item" onClick={() => handleExportFormat('pdf')}>
                    <FileDown className="w-4 h-4" />
                    <span>Export as PDF</span>
                  </div>
                </div>
              )}
            </div>
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

        {/* Main Content */}
        <div className="dashboard-main">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'team', label: 'Team Management', icon: Users },
              { id: 'entries', label: 'All Entries', icon: ChevronDown }
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
                    <Activity className="w-6 h-6" />
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
                      <ChevronDown className="w-8 h-8 text-purple-600 mb-2" />
                      <h4 className="font-semibold text-gray-900">View Entries</h4>
                      <p className="text-sm text-gray-600">Monitor all user entries</p>
                    </button>

                    <button
                      onClick={() => handleQuickAction('data-migration')}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                    >
                      <Activity className="w-8 h-8 text-orange-600 mb-2" />
                      <h4 className="text-semibold text-gray-900">Restore Data</h4>
                      <p className="text-sm text-gray-600">Migrate legacy entries to restore data</p>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Team Management Tab */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Team Performance Overview</h3>
                  <p className="text-gray-600">Overall team productivity and statistics</p>
                </div>
                <div className="card-content">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {teamMembers.length}
                      </div>
                      <div className="text-sm text-gray-600">Team Members</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {teamMembers.reduce((sum, member) => sum + (member.isActive ? 1 : 0), 0)}
                      </div>
                      <div className="text-sm text-gray-600">Active Members</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {teamMembers.length > 0 
                          ? Math.round(teamMembers.reduce((sum, member) => sum + (member.isActive ? 1 : 0), 0) / teamMembers.length * 100)
                          : 0}%
                      </div>
                      <div className="text-sm text-gray-600">Active Rate</div>
                    </div>
                  </div>
                </div>
              </div>

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
                  {teamMembers.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No team member data available</p>
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
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Last Login
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {teamMembers
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
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {member.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {member.lastLogin ? formatDate(member.lastLogin) : 'Never'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => handleRemoveTeamMember(member._id)}
                                  className="text-red-600 hover:text-red-900 transition-colors"
                                  title="Remove team member"
                                >
                                  <X className="w-4 h-4" />
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
            </div>
          )}

          {/* All Entries Tab */}
          {activeTab === 'entries' && (
            <div className="space-y-6">
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
                  {teamMembers.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No team members to show entries for.</p>
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
                              Role
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Last Login
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {teamMembers
                            .filter(member => teamFilter === 'all' || member.role === teamFilter)
                            .map((member) => (
                            <tr key={member._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3">
                                    {member.name.charAt(0)?.toUpperCase() || 'U'}
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
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  member.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {member.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {member.lastLogin ? formatDate(member.lastLogin) : 'Never'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
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
