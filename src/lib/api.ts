import { authStorage } from './auth';

// API base URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

// Helper function to make API calls
export async function apiCall<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  if (typeof window !== 'undefined') {
    const token = authStorage.getToken();
    if (token) {
      defaultOptions.headers = {
        ...defaultOptions.headers,
        'Authorization': `Bearer ${token}`,
      };
    }
  }

  const response = await fetch(url, defaultOptions);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// Dashboard API
export const dashboardAPI = {
  async getDashboard(period: string = 'week', includeTeam: boolean = false) {
    return apiCall(`/api/dashboard?period=${period}&includeTeam=${includeTeam}`);
  },
};

// Entries API
export const entriesAPI = {
  async getEntries(params: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    return apiCall(`/api/entries?${queryParams.toString()}`);
  },

  async createEntry(entryData: {
    date: string;
    shiftStart: string;
    shiftEnd: string;
    videosCompleted: number;
    targetVideos: number;
    notes?: string;
    mood?: 'excellent' | 'good' | 'average' | 'poor';
    energyLevel?: number;
    challenges?: string[];
    achievements?: string[];
  }) {
    return apiCall('/api/entries', {
      method: 'POST',
      body: JSON.stringify(entryData),
    });
  },

  async getEntry(id: string) {
    return apiCall(`/api/entries/${id}`);
  },

  async updateEntry(id: string, entryData: any) {
    return apiCall(`/api/entries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(entryData),
    });
  },

  async deleteEntry(id: string) {
    return apiCall(`/api/entries/${id}`, {
      method: 'DELETE',
    });
  },
};

// Analytics API
export const analyticsAPI = {
  async getAnalytics(params: {
    period?: string;
    includeTrends?: boolean;
    includeInsights?: boolean;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    return apiCall(`/api/analytics?${queryParams.toString()}`);
  },
};

// Teams API
export const teamsAPI = {
  async getTeams() {
    return apiCall('/api/teams');
  },

  async createTeam(teamData: {
    name: string;
    description?: string;
    goals?: {
      dailyTarget?: number;
      weeklyTarget?: number;
      monthlyTarget?: number;
    };
    settings?: {
      allowMemberInvites?: boolean;
      requireApproval?: boolean;
      visibility?: 'public' | 'private';
    };
  }) {
    return apiCall('/api/teams', {
      method: 'POST',
      body: JSON.stringify(teamData),
    });
  },
};

// Export API
export const exportAPI = {
  async exportData(params: {
    format?: 'json' | 'csv' | 'excel';
    startDate?: string;
    endDate?: string;
    includeAnalytics?: boolean;
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    const response = await fetch(`${API_BASE}/api/export?${queryParams.toString()}`, {
      headers: {
        'Authorization': `Bearer ${authStorage.getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    return response.blob();
  },
};

// Types for API responses
export interface DashboardData {
  period: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  userStats: {
    totalVideos: number;
    totalHours: number;
    averageProductivity: number;
    targetAchievement: number;
    consistencyScore: number;
  };
  goalProgress: {
    daily: { target: number; achieved: number; percentage: number };
    weekly: { target: number; achieved: number; percentage: number };
    monthly: { target: number; achieved: number; percentage: number };
  };
  recentEntries: any[];
  productivityTrends: any[];
  insights: {
    mood: any[];
    energy: any[];
  };
  teamStats?: any;
}

export interface Entry {
  _id: string;
  userId: string;
  date: string;
  shiftStart: string;
  shiftEnd: string;
  totalHours: number;
  videosCompleted: number;
  targetVideos: number;
  productivityScore: number;
  notes?: string;
  mood?: 'excellent' | 'good' | 'average' | 'poor';
  energyLevel?: number;
  challenges?: string[];
  achievements?: string[];
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsData {
  period: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  analytics: {
    summary: {
      totalVideos: number;
      totalHours: number;
      averageProductivity: number;
      averageVideosPerDay: number;
      averageHoursPerDay: number;
      targetAchievement: number;
      consistencyScore: number;
      improvementRate: number;
    };
    performance: {
      bestDay: {
        date: string;
        productivityScore: number;
        videosCompleted: number;
      };
      worstDay: {
        date: string;
        productivityScore: number;
        videosCompleted: number;
      };
      mostProductiveHour: number;
    };
    trends: any[];
    insights: {
      mood: any[];
      energy: any[];
    };
  };
}
