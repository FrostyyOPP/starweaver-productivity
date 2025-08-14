'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Star, 
  Plus, 
  LogOut, 
  BarChart3,
  Calendar,
  Clock,
  Target,
  TrendingUp,
  Users,
  Video,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import ProductivityCharts from './ProductivityCharts';

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
}

interface DashboardStats {
  totalEntries: number;
  totalVideos: number;
  totalHours: number;
  averageProductivity: number;
  averageMood: number;
  averageEnergy: number;
  weeklyProgress: number;
  monthlyProgress: number;
}

export default function EditorDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalEntries: 0,
    totalVideos: 0,
    totalHours: 0,
    averageProductivity: 0,
    averageMood: 0,
    averageEnergy: 0,
    weeklyProgress: 0,
    monthlyProgress: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  
  // Form state
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    videosCompleted: '',
    videoCategory: 'course' as 'course' | 'marketing' | 'leave',
    remarks: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Demo data state
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoMessage, setDemoMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user, selectedPeriod]);

  const fetchUserData = async () => {
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
      
      // Fetch user's entries
      const entriesResponse = await fetch('/api/entries', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (entriesResponse.ok) {
        const entriesData = await entriesResponse.json();
        setEntries(entriesData.entries || []);
      }

      // Fetch user's dashboard stats
      const statsResponse = await fetch(`/api/dashboard?period=${selectedPeriod}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        // Ensure all stats have default values
        setStats({
          totalEntries: statsData.userStats?.entriesCount || 0,
          totalVideos: statsData.userStats?.totalVideos || 0,
          totalHours: statsData.userStats?.totalHours || 0,
          averageProductivity: statsData.userStats?.averageProductivity || 0,
          averageMood: 0, // Not provided by API yet
          averageEnergy: 0, // Not provided by API yet
          weeklyProgress: statsData.goalProgress?.weekly?.percentage || 0,
          monthlyProgress: statsData.goalProgress?.monthly?.percentage || 0
        });
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Set default values on error
      setStats({
        totalEntries: 0,
        totalVideos: 0,
        totalHours: 0,
        averageProductivity: 0,
        averageMood: 0,
        averageEnergy: 0,
        weeklyProgress: 0,
        monthlyProgress: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Invalid Date';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
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

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleSubmitEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setSubmitting(true);
      setFormMessage(null);
      
      // Calculate target videos based on category
      let targetVideos = 3; // Default daily target
      if (formData.videoCategory === 'leave') {
        targetVideos = -3; // Leave deducts 3 videos
      }
      
      // Use default shift times (full day)
      const shiftStart = new Date(`${formData.date}T00:00:00Z`);
      const shiftEnd = new Date(`${formData.date}T23:59:59Z`);
      
      const entryData = {
        date: formData.date,
        shiftStart: shiftStart.toISOString(),
        shiftEnd: shiftEnd.toISOString(),
        videosCompleted: parseFloat(formData.videosCompleted),
        videoCategory: formData.videoCategory,
        targetVideos: targetVideos,
        productivityScore: formData.videoCategory === 'leave' ? 0 : Math.min(100, (parseFloat(formData.videosCompleted) / 3) * 100),
        mood: 'good',
        energyLevel: 4,
        challenges: [],
        achievements: [],
        totalHours: formData.videoCategory === 'leave' ? 0 : 8,
        remarks: formData.remarks
      };

      const token = localStorage.getItem('accessToken');
      if (!token) {
        setFormMessage({ type: 'error', text: 'Authentication required. Please login again.' });
        return;
      }

      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(entryData)
      });

      if (response.ok) {
        setFormMessage({ type: 'success', text: 'Entry added successfully!' });
        resetForm();
        fetchUserData(); // Refresh data to show new entry
      } else {
        const errorData = await response.json();
        setFormMessage({ type: 'error', text: errorData.error || 'Failed to add entry' });
      }
    } catch (error) {
      setFormMessage({ type: 'error', text: 'An error occurred while adding entry' });
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      videosCompleted: '',
      videoCategory: 'course' as 'course' | 'marketing' | 'leave',
      remarks: ''
    });
    setFormMessage(null);
  };

  const handleAddDemoEntries = async () => {
    if (!user) {
      setDemoMessage({ type: 'error', text: 'User not logged in. Please log in to add demo data.' });
      return;
    }

    setDemoLoading(true);
    setDemoMessage(null);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setDemoMessage({ type: 'error', text: 'Authentication required. Please login again.' });
        return;
      }

      const demoEntries = [
        {
          date: '2023-10-26',
          shiftStart: '2023-10-26T09:00:00Z',
          shiftEnd: '2023-10-26T17:00:00Z',
          videosCompleted: 3,
          targetVideos: 3,
          productivityScore: 100,
          mood: 'excellent',
          energyLevel: 'high',
          challenges: [],
          achievements: ['Completed 3 course videos'],
          totalHours: 8,
          notes: 'Regular day of work',
          videoCategory: 'course'
        },
        {
          date: '2023-10-27',
          shiftStart: '2023-10-27T09:00:00Z',
          shiftEnd: '2023-10-27T17:00:00Z',
          videosCompleted: 0,
          targetVideos: 3,
          productivityScore: 0,
          mood: 'poor',
          energyLevel: 'low',
          challenges: ['Low energy'],
          achievements: [],
          totalHours: 8,
          notes: 'Sick day',
          videoCategory: 'leave'
        },
        {
          date: '2023-10-28',
          shiftStart: '2023-10-28T09:00:00Z',
          shiftEnd: '2023-10-28T17:00:00Z',
          videosCompleted: 1,
          targetVideos: 3,
          productivityScore: 33,
          mood: 'good',
          energyLevel: 'medium',
          challenges: [],
          achievements: ['Completed 1 marketing video'],
          totalHours: 8,
          notes: 'Marketing day',
          videoCategory: 'marketing'
        },
        {
          date: '2023-10-29',
          shiftStart: '2023-10-29T09:00:00Z',
          shiftEnd: '2023-10-29T17:00:00Z',
          videosCompleted: 3,
          targetVideos: 3,
          productivityScore: 100,
          mood: 'excellent',
          energyLevel: 'high',
          challenges: [],
          achievements: ['Completed 3 course videos'],
          totalHours: 8,
          notes: 'Regular day of work',
          videoCategory: 'course'
        },
        {
          date: '2023-10-30',
          shiftStart: '2023-10-30T09:00:00Z',
          shiftEnd: '2023-10-30T17:00:00Z',
          videosCompleted: 0,
          targetVideos: 3,
          productivityScore: 0,
          mood: 'poor',
          energyLevel: 'low',
          challenges: ['Low energy'],
          achievements: [],
          totalHours: 8,
          notes: 'Sick day',
          videoCategory: 'leave'
        }
      ];

      const response = await fetch('/api/entries/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ entries: demoEntries })
      });

      if (response.ok) {
        setDemoMessage({ type: 'success', text: 'Demo entries added successfully!' });
        fetchUserData(); // Refresh data to show new entries
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

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="loading-spinner w-8 h-8 mx-auto mb-4" />
            <p className="text-gray-600">Loading your dashboard...</p>
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
              <p className="text-sm text-gray-400">Welcome back,</p>
              <p className="text-lg font-semibold text-white">{user?.name || 'User'}</p>
            </div>
            
            {/* User Initial with Hover Dropdown */}
            <div className="relative group">
              <div className="user-initial">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
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
          {/* Period Selector */}
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Personal Dashboard</h2>
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
          </div>

          {/* Add Today's Entry Button */}
          <div className="dashboard-section">
            {!showEntryForm ? (
              <button
                onClick={() => setShowEntryForm(true)}
                className="flex items-center space-x-3 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
              >
                <Plus className="w-5 h-5" />
                <span>Add Today's Entry</span>
              </button>
            ) : (
              <div className="form-section entry-form-container">
                <div className="form-section-header">
                  <h3 className="form-section-title">Add Today's Entry</h3>
                  <button
                    onClick={() => setShowEntryForm(false)}
                    className="form-close-button"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form Message Display */}
                {formMessage && (
                  <div className={`mb-4 p-3 rounded-lg ${
                    formMessage.type === 'success' 
                      ? 'bg-green-50 border border-green-200 text-green-700' 
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}>
                    {formMessage.text}
                  </div>
                )}

                {/* Target Summary */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-3 text-base">Daily & Weekly Targets</h4>
                  <div className="grid grid-cols-1 md-grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-semibold text-blue-800">Daily Target:</span>
                      <span className="ml-2 text-blue-700 font-medium">3 videos</span>
                    </div>
                    <div>
                      <span className="font-semibold text-blue-800">Weekly Target:</span>
                      <span className="ml-2 text-blue-700 font-medium">15 videos</span>
                    </div>
                    <div>
                      <span className="font-semibold text-blue-800">Marketing Video:</span>
                      <span className="ml-2 text-blue-700 font-medium">1 complete = 6 videos</span>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-blue-700">
                    <p className="mb-1">• Course videos: 1 video = 1 video</p>
                    <p className="mb-1">• Marketing videos: Max 0.5 per day, need 2 consecutive days to complete 1</p>
                    <p className="mb-0">• Leave: Deducts 3 videos from daily target</p>
                  </div>
                </div>

                <form onSubmit={handleSubmitEntry} className="space-y-6">
                  {/* Date and Video Category Row */}
                  <div className="form-input-group">
                    <div className="flex-1">
                      <label htmlFor="date" className="form-label">Date</label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="form-input"
                        required
                      />
                    </div>
                    
                    <div className="flex-1">
                      <label htmlFor="videoCategory" className="form-label">Video Category</label>
                      <select
                        id="videoCategory"
                        name="videoCategory"
                        value={formData.videoCategory}
                        onChange={(e) => setFormData({ ...formData, videoCategory: e.target.value as any })}
                        className="form-input"
                        required
                      >
                        <option value="course">Course Video</option>
                        <option value="marketing">Marketing Video</option>
                        <option value="leave">Leave</option>
                      </select>
                    </div>
                  </div>

                  {/* Videos Completed Row */}
                  <div className="form-input-group">
                    <div className="flex-1">
                      <label htmlFor="videosCompleted" className="form-label">
                        {formData.videoCategory === 'marketing' ? 'Marketing Videos (0.5 per day)' : 
                         formData.videoCategory === 'leave' ? 'Leave Day' : 'Videos Completed Today'}
                      </label>
                      <input
                        type="number"
                        id="videosCompleted"
                        name="videosCompleted"
                        value={formData.videosCompleted}
                        onChange={(e) => setFormData({ ...formData, videosCompleted: e.target.value })}
                        className="form-input"
                        min={formData.videoCategory === 'marketing' ? 0 : 0}
                        max={formData.videoCategory === 'marketing' ? 0.5 : 10}
                        step={formData.videoCategory === 'marketing' ? 0.5 : 1}
                        placeholder={formData.videoCategory === 'marketing' ? '0.5' : 
                                   formData.videoCategory === 'leave' ? '0' : '3'}
                        required
                        disabled={formData.videoCategory === 'leave'}
                      />
                    </div>
                    
                    <div className="flex-1">
                      <label htmlFor="remarks" className="form-label">Remarks (Optional)</label>
                      <input
                        type="text"
                        id="remarks"
                        name="remarks"
                        value={formData.remarks}
                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                        className="form-input"
                        placeholder="Any notes about today's work"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="btn-enhanced secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="btn-enhanced primary disabled-opacity-50 disabled-cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <div className="loading-spinner w-4 h-4" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Submit Entry</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Demo Data Button */}
            <button
              onClick={handleAddDemoEntries}
              disabled={demoLoading}
              className="ml-4 px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-semibold shadow-sm hover:shadow-md"
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
              <div className={`mt-3 px-4 py-2 rounded-lg text-sm ${
                demoMessage.type === 'success' 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                {demoMessage.text}
              </div>
            )}
          </div>
          
          {/* Component separator with visual line */}
          <div className="component-separator"></div>
          
          {/* Stats Grid */}
          <div className="dashboard-section">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-title">Total Entries</div>
                <div className="stat-value">{stats.totalEntries || 0}</div>
                <div className="stat-change positive">+{stats.totalEntries || 0} this week</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Videos Completed</div>
                <div className="stat-value">{stats.totalVideos || 0}</div>
                <div className="stat-change positive">+{stats.totalVideos || 0} this week</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Total Hours</div>
                <div className="stat-value">{(stats.totalHours || 0).toFixed(1)}h</div>
                <div className="stat-change positive">+{(stats.totalHours || 0).toFixed(1)}h this week</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-title">Avg Productivity</div>
                <div className="stat-value">{(stats.averageProductivity || 0).toFixed(1)}%</div>
                <div className="stat-change positive">+{(stats.averageProductivity || 0).toFixed(1)}% this week</div>
              </div>
            </div>
          </div>

          {/* Productivity Charts */}
          <div className="dashboard-section">
            <h3 className="section-title">Productivity Analytics</h3>
            <ProductivityCharts entries={entries} />
          </div>

          {/* Recent Entries Section */}
          <div className="dashboard-section recent-entries-section">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Entries</h3>
            <p className="text-gray-600">Your latest productivity entries</p>
            <div className="card-content">
              {entries.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No entries yet. Start tracking your productivity!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {entries.slice(0, 5).map((entry) => (
                    <div key={entry._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{formatDate(entry.date)}</h4>
                          <p className="text-sm text-gray-600">
                            {entry.shiftStart && entry.shiftEnd ? 
                              `${new Date(entry.shiftStart).toLocaleTimeString()} - ${new Date(entry.shiftEnd).toLocaleTimeString()}` : 
                              'Time not specified'
                            }
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">{entry.videosCompleted || 0}</div>
                          <div className="text-sm text-gray-500">videos</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Productivity:</span>
                          <span className="ml-2 font-medium text-green-600">{entry.productivityScore || 0}%</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Hours:</span>
                          <span className="ml-2 font-medium">{entry.totalHours || 0}h</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Mood:</span>
                          <span className="ml-2">{getMoodEmoji(entry.mood || 'neutral')} {entry.mood || 'neutral'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Energy:</span>
                          <span className="ml-2">{getEnergyEmoji(entry.energyLevel || 'medium')} {entry.energyLevel || 'medium'}</span>
                        </div>
                      </div>
                      
                      {entry.challenges && entry.challenges.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Challenges:</span> {Array.isArray(entry.challenges) ? entry.challenges.join(', ') : entry.challenges}
                          </p>
                        </div>
                      )}
                      
                      {entry.achievements && entry.achievements.length > 0 && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Achievements:</span> {Array.isArray(entry.achievements) ? entry.achievements.join(', ') : entry.achievements}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
 