import axios from 'axios';

const BASE_URL = 'http://localhost:5000';

// Create axios instance
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

// API Types
export interface User {
  id: string;
  name: string;
  email: string;
  subscription: string;
  usageLimit: number;
  daily_usage: number;
  total_usage: number;
  is_api_key_available: boolean;
  apiKey?: string;
}

export interface UsageHistoryItem {
  _id: string;
  type: string;
  sourceType: string;
  sourceUrl?: string;
  sourceText: string;
  resultText: string;
  targetLanguage?: string;
  initialLanguage?: string;
  tokensUsed: number;
  initialAudioData?: string;
  targetAudioData?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateApiKeyRequest {
  apiKey: string;
}

// API Services
export const authService = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/login', data);
    return response.data;
  },
};

export const userService = {
  getProfile: async (): Promise<User> => {
    const response = await fetch(`${BASE_URL}/api/profile`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },

  updateApiKey: async (data: UpdateApiKeyRequest): Promise<void> => {
    const response = await fetch(`${BASE_URL}/api/update-api-key`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update API key');
  },

  getHistory: async (): Promise<UsageHistoryItem[]> => {
    const response = await fetch(`${BASE_URL}/api/history`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch history');
    return response.json();
  },

  getHistoryAudio: async (historyId: string): Promise<{ initialAudioData: string | null; targetAudioData: string | null }> => {
    const response = await fetch(`${BASE_URL}/api/history/${historyId}/audio`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch audio data');
    return response.json();
  },
}; 