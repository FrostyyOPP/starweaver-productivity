'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Star, TrendingUp, Clock, Target, Award, Calendar, BarChart3, Users, Plus, LogOut } from 'lucide-react';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
}

interface TeamStats {
  totalMembers: number;
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

export default function ManagerDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats>({
    totalMembers: 0,
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

  useEffect(() => {
    if (user) {
      fetchTeamData();
    }
  }, [user, selectedPeriod]);

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

      // Fetch team dashboard stats
      const statsResponse = await fetch(`/api/dashboard?period=${selectedPeriod}&includeTeam=true`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setTeamStats(statsData);
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-logo">
            <Star className="w-8 h-8 text-yellow-500" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              STARWEAVER
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Team Manager</p>
              <p className="font-semibold text-gray-900">{user?.name}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold relative group cursor-pointer">
              {user?.name?.charAt(0).toUpperCase()}
              {/* Logout dropdown that appears on hover over initial */}
              <div className="absolute top-full right-0 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto z-10 transform origin-top scale-95 group-hover:scale-100">
                <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-150 w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        {/* Period Selector and Add Member Button */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Team Dashboard</h2>
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
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <Clock className="w-6 h-6" />
            </div>
            <div className="stat-value">{(teamStats.totalHours || 0).toFixed(1)}h</div>
            <div className="stat-label">Total Hours</div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="stat-value">{(teamStats.averageProductivity || 0).toFixed(1)}%</div>
            <div className="stat-label">Team Productivity</div>
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
                        <p className="text-sm font-medium">{formatDate(member.lastLogin)}</p>
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
  );
}
