export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'editor' | 'viewer';
}

export interface AuthResponse {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    lastLogin?: string;
  };
  accessToken: string;
}

export interface ApiError {
  error: string;
  details?: string[];
}

// API base URL
const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

// Helper function to make API calls
async function apiCall<T>(
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
    const token = localStorage.getItem('accessToken');
    if (token) {
      defaultOptions.headers = {
        ...defaultOptions.headers,
        'Authorization': `Bearer ${token}`,
      };
    }
  }

  const response = await fetch(url, defaultOptions);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }

  return data;
}

// Authentication functions
export const authAPI = {
  // Login
  async login(credentials: LoginData): Promise<AuthResponse> {
    return apiCall<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Signup
  async signup(userData: SignupData): Promise<AuthResponse> {
    return apiCall<AuthResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Logout
  async logout(): Promise<{ message: string }> {
    return apiCall<{ message: string }>('/api/auth/logout', {
      method: 'POST',
    });
  },

  // Refresh token
  async refreshToken(): Promise<AuthResponse> {
    return apiCall<AuthResponse>('/api/auth/refresh', {
      method: 'POST',
    });
  },
};

// Local storage helpers
export const authStorage = {
  setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  },

  removeToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
  },

  setUser(user: any) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user));
    }
  },

  getUser(): any {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  },

  removeUser() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
  },

  clear() {
    this.removeToken();
    this.removeUser();
  },
};
