'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Star, TrendingUp, Clock, Target, Award, Calendar, BarChart3, Users, Plus, LogOut, X, UserPlus, UserMinus, Settings, Download, Upload, ChevronDown, FileText, FileSpreadsheet, FileDown, Activity } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  courseVideos?: number;
  marketingVideos?: number;
  totalVideos?: number;
  productivityScore?: number;
  targetVideos?: number;
}

interface TeamStats {
  totalMembers: number;
  totalVideos: number;
  totalCourseVideos: number;
  totalMarketingVideos: number;
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
    <div className="modal-overlay">
      <div className="modal-content">
        {/* Modal Header */}
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
          <button
            onClick={onClose}
            className="modal-close-button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Modal Body */}
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

          {/* Form Actions */}
          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !email.trim()}
            >
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

export default function ManagerDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats>({
    totalMembers: 0,
    totalVideos: 0,
    totalCourseVideos: 0,
    totalMarketingVideos: 0,
    averageProductivity: 0,
    weeklyProgress: 0,
    monthlyProgress: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMemberLoading, setAddMemberLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showQuickActionsDropdown, setShowQuickActionsDropdown] = useState(false);
  const [showExportFormatDropdown, setShowExportFormatDropdown] = useState(false);

  useEffect(() => {
    if (user) {
      fetchTeamData();
    }
  }, [user, selectedPeriod]);

  // Close dropdown when clicking outside
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

  const fetchTeamData = async () => {
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
      


      
      // Fetch team data from the correct endpoint
      const teamResponse = await fetch('/api/teams/manager', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      

      
      if (teamResponse.ok) {
        const teamData = await teamResponse.json();

        
        setTeamMembers(teamData.members || []);
        
        // Use the stats from the API response
        if (teamData.stats) {

          setTeamStats({
            totalMembers: teamData.stats.totalMembers || 0,
            totalVideos: teamData.stats.totalVideosCompleted || 0,
            totalCourseVideos: teamData.stats.totalCourseVideos || 0,
            totalMarketingVideos: teamData.stats.totalMarketingVideos || 0,
            averageProductivity: teamData.stats.averageProductivity || 0,
            weeklyProgress: teamData.stats.weeklyProgress || 0,
            monthlyProgress: teamData.stats.monthlyProgress || 0
          });
        }
      } else {
        const errorText = await teamResponse.text();
        console.error('Team API Error:', teamResponse.status, errorText);
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
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
        fetchTeamData(); // Refresh team data
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
        fetchTeamData(); // Refresh team data
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: errorData.error || 'Failed to remove team member' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while removing team member' });
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
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
      case 'team-settings':
        alert('⚙️ Team settings functionality coming soon...');
        break;
      case 'import-data':
        alert('📤 Data import functionality coming soon...');
        break;
      case 'bulk-actions':
        alert('👥 Bulk actions functionality coming soon...');
        break;
      default:
        break;
    }
  };

  const handleExportFormat = (format: string) => {
    setShowExportFormatDropdown(false);
    // Handle export based on format
    switch (format) {
      case 'xlsx':
        alert('📊 Exporting data as XLSX file...');
        // TODO: Implement XLSX export
        break;
      case 'csv':
        alert('📊 Exporting data as CSV file...');
        // TODO: Implement CSV export
        break;
      case 'pdf':
        alert('📊 Exporting data as PDF file...');
        // TODO: Implement PDF export
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="loading-spinner w-8 h-8 mx-auto mb-4" />
            <p className="text-gray-600">Loading team dashboard...</p>
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
              <p className="text-sm text-gray-400">Team Manager</p>
              <p className="text-lg font-semibold text-white">{user?.name || 'Manager'}</p>
            </div>
            
            {/* User Initial with Hover Dropdown */}
            <div className="relative group">
              <div className="user-initial">
                {user?.name?.charAt(0)?.toUpperCase() || 'M'}
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

        {/* Quick Actions Bar */}
        <div className="quick-actions-bar">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-bold text-gray-900">Team Dashboard</h2>
              <div className="period-selector">
                {['week', 'month'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    className={`period-btn ${selectedPeriod === period ? 'active' : ''}`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Quick Actions Dropdown */}
            <div className="quick-actions-container">
              <button
                onClick={() => setShowQuickActionsDropdown(!showQuickActionsDropdown)}
                className="btn btn-primary flex items-center space-x-2 quick-actions-button"
              >
                <Plus className="w-4 h-4" />
                <span>Quick Actions</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showQuickActionsDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Quick Actions Dropdown Menu */}
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
                  <div className="dropdown-item" onClick={() => handleQuickAction('team-settings')}>
                    <Settings className="w-4 h-4" />
                    <span>Team Settings</span>
                  </div>
                  <div className="dropdown-item" onClick={() => handleQuickAction('import-data')}>
                    <Upload className="w-4 h-4" />
                    <span>Import Data</span>
                  </div>
                  <div className="dropdown-item" onClick={() => handleQuickAction('bulk-actions')}>
                    <Users className="w-4 h-4" />
                    <span>Bulk Actions</span>
                  </div>
                </div>
              )}

              {/* Export Format Dropdown */}
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
          {/* Team Stats Grid */}
        <div className="dashboard-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <Users className="w-6 h-6" />
            </div>
            <div className="stat-value">{teamStats.totalMembers || 0}</div>
            <div className="stat-label">Team Members</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Target className="w-6 h-6" />
            </div>
            <div className="stat-value">{teamStats.totalVideos || 0}</div>
            <div className="stat-label">Total Videos</div>
            <div className="stat-breakdown">
              <span className="breakdown-item">
                {teamStats.totalCourseVideos || 0} Course
              </span>
              <span className="breakdown-item">
                {teamStats.totalMarketingVideos || 0} Marketing
              </span>
            </div>
          </div>

            <div className="stat-card">
              <div className="stat-icon">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="stat-value">{(teamStats.averageProductivity || 0).toFixed(1)}%</div>
              <div className="stat-label">Team Productivity</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Activity className="w-6 h-6" />
              </div>
              <div className="stat-value">{(teamStats.weeklyProgress || 0).toFixed(1)}%</div>
              <div className="stat-label">Weekly Progress</div>
            </div>
          </div>

          {/* Team Members List */}
          <div className="card mt-8">
            <div className="card-header">
              <h3 className="card-title">Team Members</h3>
              <p className="text-gray-600">Manage your team members and view their status</p>
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
                          <p className="text-sm font-medium">{member.lastLogin ? formatDate(member.lastLogin) : 'Never'}</p>
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
