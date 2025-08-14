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
  notes: string; // Added notes to the interface
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
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successDetails, setSuccessDetails] = useState<{ date: string; videos: string; category: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(10);

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

  // Pagination calculations
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = entries.slice(indexOfFirstEntry, indexOfLastEntry);
  const totalPages = Math.ceil(entries.length / entriesPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
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
        notes: formData.remarks // Changed from remarks to notes
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
        const successMessage = `🎉 Great job! You've successfully added your productivity entry for ${new Date(formData.date).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}. You completed ${formData.videosCompleted} ${formData.videoCategory === 'course' ? 'course video(s)' : formData.videoCategory === 'marketing' ? 'marketing video(s)' : 'leave day'}. Keep up the excellent work! 🚀`;
        
        setFormMessage({ type: 'success', text: successMessage });
        
        // Set success notification details
        setSuccessDetails({
          date: new Date(formData.date).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          videos: formData.videosCompleted,
          category: formData.videoCategory
        });
        setShowSuccessNotification(true);
        
        // Close the entry form automatically
        setShowEntryForm(false);
        
        resetForm();
        fetchUserData(); // Refresh data to show new entry
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => {
          setFormMessage(null);
        }, 5000);
        
        // Auto-hide success notification after 8 seconds
        setTimeout(() => {
          setShowSuccessNotification(false);
          setSuccessDetails(null);
        }, 8000);
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

        {/* Success Notification */}
        {showSuccessNotification && successDetails && (
          <div className="mb-6 p-6 bg-gradient-to-r from-green-100 to-emerald-100 border-2 border-green-400 rounded-xl shadow-lg">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                <span className="text-green-700 text-2xl">🎉</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-green-800 mb-2">
                  Entry Submitted Successfully!
                </h3>
                <p className="text-green-700 mb-2">
                  Great job! You've successfully added your productivity entry for <span className="font-semibold">{successDetails.date}</span>.
                </p>
                <p className="text-green-700">
                  You completed <span className="font-semibold">{successDetails.videos}</span> {successDetails.category === 'course' ? 'course video(s)' : successDetails.category === 'marketing' ? 'marketing video(s)' : 'leave day'}. Keep up the excellent work! 🚀
                </p>
              </div>
              <button
                onClick={() => {
                  setShowSuccessNotification(false);
                  setSuccessDetails(null);
                }}
                className="flex-shrink-0 text-green-600 hover:text-green-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

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
                    onClick={() => {
                      console.log('Top close button clicked');
                      setShowEntryForm(false);
                      resetForm();
                    }}
                    className="form-close-button"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Form Message Display */}
                {formMessage && (
                  <div className={`mb-4 p-4 rounded-lg border-2 shadow-sm ${
                    formMessage.type === 'success' 
                      ? 'bg-gradient-to-r from-green-100 to-emerald-100 border-green-400 text-green-800' 
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}>
                    <div className="flex items-start space-x-3">
                      {formMessage.type === 'success' ? (
                        <div className="flex-shrink-0 w-6 h-6 bg-green-200 rounded-full flex items-center justify-center">
                          <span className="text-green-700 text-lg">✓</span>
                        </div>
                      ) : (
                        <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                          <span className="text-red-600 text-lg">⚠</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <p className={`font-medium ${
                          formMessage.type === 'success' ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {formMessage.text}
                        </p>
                      </div>
                    </div>
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
                      onClick={() => {
                        console.log('Cancel button clicked');
                        setShowEntryForm(false);
                        resetForm();
                      }}
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
            
            {entries.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No entries yet. Start tracking your productivity!</p>
              </div>
            ) : (
              <>
                {/* Entries Datagrid */}
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                          Videos
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                          Productivity
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                          Hours
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                          Mood
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                          Energy
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-200">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentEntries.map((entry) => (
                        <tr key={entry._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{formatDate(entry.date)}</div>
                              <div className="text-xs text-gray-500">
                                {entry.shiftStart && entry.shiftEnd ? 
                                  `${new Date(entry.shiftStart).toLocaleTimeString()} - ${new Date(entry.shiftEnd).toLocaleTimeString()}` : 
                                  'Time not specified'
                                }
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            <span className="font-semibold text-blue-600">{entry.videosCompleted || 0}</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            <span className={`font-semibold ${
                              (entry.productivityScore || 0) >= 80 ? 'text-green-600' :
                              (entry.productivityScore || 0) >= 60 ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {entry.productivityScore || 0}%
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {entry.totalHours || 0}h
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center space-x-1">
                              <span>{getMoodEmoji(entry.mood || 'neutral')}</span>
                              <span className="capitalize">{entry.mood || 'neutral'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center space-x-1">
                              <span>{getEnergyEmoji(entry.energyLevel || 'medium')}</span>
                              <span className="capitalize">{entry.energyLevel || 'medium'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                            <div className="truncate" title={entry.notes || 'No notes'}>
                              {entry.notes || 'No notes'}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstEntry + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(indexOfLastEntry, entries.length)}
                      </span> of{' '}
                      <span className="font-medium">{entries.length}</span> entries
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                      
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                      
                      <button
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
 