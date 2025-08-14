'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Star, TrendingUp, Clock, Target, Award, Calendar, BarChart3, LogOut, Plus, X } from 'lucide-react';

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
    
    if (!formData.videosCompleted || parseInt(formData.videosCompleted) <= 0) {
      setFormMessage({ type: 'error', text: 'Please enter a valid number of videos completed' });
      return;
    }

    // Validate video category specific rules
    if (formData.videoCategory === 'marketing') {
      const videos = parseFloat(formData.videosCompleted);
      if (videos > 0.5) {
        setFormMessage({ type: 'error', text: 'Marketing videos cannot exceed 0.5 per day. You need 2 consecutive days to complete 1 marketing video.' });
        return;
      }
    }

    if (formData.videoCategory === 'leave') {
      if (parseInt(formData.videosCompleted) !== 0) {
        setFormMessage({ type: 'error', text: 'When marking leave, videos completed should be 0' });
        return;
      }
    }

    try {
      setSubmitting(true);
      setFormMessage(null);

      const token = localStorage.getItem('accessToken');
      if (!token) {
        setFormMessage({ type: 'error', text: 'Authentication required. Please login again.' });
        return;
      }

      // Calculate effective videos based on category
      let effectiveVideos = 0;
      let targetVideos = 3; // Daily target is 3 videos
      
      switch (formData.videoCategory) {
        case 'course':
          effectiveVideos = parseInt(formData.videosCompleted);
          break;
        case 'marketing':
          effectiveVideos = parseFloat(formData.videosCompleted) * 6; // 1 marketing video = 6 videos
          break;
        case 'leave':
          effectiveVideos = -3; // Leave deducts 3 videos from target
          break;
      }

      const entryData = {
        date: formData.date,
        videosCompleted: parseInt(formData.videosCompleted),
        targetVideos: targetVideos,
        productivityScore: formData.videoCategory === 'leave' ? 0 : Math.min(100, (effectiveVideos / targetVideos) * 100),
        mood: formData.videoCategory === 'leave' ? 'neutral' : 'good',
        energyLevel: formData.videoCategory === 'leave' ? 1 : 3,
        challenges: formData.videoCategory === 'leave' ? ['On leave'] : [],
        achievements: formData.videoCategory === 'leave' ? ['Marked leave for the day'] : [`Completed ${formData.videosCompleted} ${formData.videoCategory} videos`],
        totalHours: formData.videoCategory === 'leave' ? 0 : 8,
        notes: formData.remarks || '',
        videoCategory: formData.videoCategory
      };

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
        setFormData({
          date: new Date().toISOString().split('T')[0],
          videosCompleted: '',
          videoCategory: 'course' as 'course' | 'marketing' | 'leave',
          remarks: ''
        });
        setShowEntryForm(false);
        
        // Refresh data to show new entry
        fetchUserData();
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
    setShowEntryForm(false);
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
              <p className="text-sm text-gray-600">Welcome back,</p>
              <p className="font-semibold text-gray-900">{user?.name}</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold relative group cursor-pointer">
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
              className="flex items-center space-x-3 px-6 py-3 bg-blue-600 text-white rounded-lg hover-bg-blue-700 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add Today's Entry</span>
            </button>
          ) : (
            <div className="form-section entry-form-container">
              <div className="form-section-header">
                <h3 className="form-section-title">Add Video Entry</h3>
                <button
                  onClick={resetForm}
                  className="form-close-button"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
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
              
              {formMessage && (
                <div className={`mb-4 p-3 rounded-lg ${
                  formMessage.type === 'success' 
                    ? 'bg-green-50 border border-green-200 text-green-700' 
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  {formMessage.text}
                </div>
              )}

              <form onSubmit={handleSubmitEntry} className="space-y-6">
                <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-4 gap-6">
                  <div className="form-input-group">
                    <label htmlFor="date" className="form-label">
                      Date
                    </label>
                    <input
                      type="date"
                      id="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="form-input"
                      required
                    />
                  </div>
                  
                  <div className="form-input-group">
                    <label htmlFor="videoCategory" className="form-label">
                      Video Category
                    </label>
                    <select
                      id="videoCategory"
                      value={formData.videoCategory}
                      onChange={(e) => setFormData({ ...formData, videoCategory: e.target.value as 'course' | 'marketing' | 'leave' })}
                      className="form-input"
                      required
                    >
                      <option value="course">Course Video</option>
                      <option value="marketing">Marketing Video</option>
                      <option value="leave">Leave</option>
                    </select>
                  </div>
                  
                  <div className="form-input-group">
                    <label htmlFor="videosCompleted" className="form-label">
                      {formData.videoCategory === 'marketing' ? 'Marketing Videos (Max 0.5/day)' : 
                       formData.videoCategory === 'leave' ? 'Videos Completed (Should be 0)' : 
                       'Videos Completed Today'}
                    </label>
                    <input
                      type={formData.videoCategory === 'marketing' ? 'number' : 'number'}
                      id="videosCompleted"
                      value={formData.videosCompleted}
                      onChange={(e) => setFormData({ ...formData, videosCompleted: e.target.value })}
                      placeholder={formData.videoCategory === 'marketing' ? '0.5' : '3'}
                      min={formData.videoCategory === 'leave' ? '0' : '0'}
                      max={formData.videoCategory === 'marketing' ? '0.5' : undefined}
                      step={formData.videoCategory === 'marketing' ? '0.1' : '1'}
                      className="form-input"
                      required
                    />
                    {formData.videoCategory === 'marketing' && (
                      <p className="form-helper-text info">
                        1 complete marketing video = 6 videos. Max 0.5 per day.
                      </p>
                    )}
                    {formData.videoCategory === 'leave' && (
                      <p className="form-helper-text warning">
                        Leave deducts 3 videos from daily target.
                      </p>
                    )}
                  </div>
                  
                  <div className="form-input-group">
                    <label htmlFor="remarks" className="form-label">
                      Remarks (Optional)
                    </label>
                    <input
                      type="text"
                      id="remarks"
                      value={formData.remarks}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                      placeholder="Any notes about today's work"
                      className="form-input"
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
        </div>
        
        {/* Component separator with visual line */}
        <div className="component-separator"></div>
        
        {/* Stats Grid */}
        <div className="dashboard-section">
          <div className="dashboard-grid">
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
              <div className="stat-label">Videos Completed</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Clock className="w-6 h-6" />
              </div>
              <div className="stat-value">{(stats.totalHours || 0).toFixed(1)}h</div>
              <div className="stat-label">Total Hours</div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="stat-value">{(stats.averageProductivity || 0).toFixed(1)}%</div>
              <div className="stat-label">Avg Productivity</div>
            </div>
          </div>
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
  );
}
 