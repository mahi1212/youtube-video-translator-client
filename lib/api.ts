import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let currentToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  currentToken = token;
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    if (currentToken) {
      config.headers.Authorization = `Bearer ${currentToken}`;
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
      setAuthToken(null);
      if (typeof window !== 'undefined') {
        window.location.reload();
      }
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

export interface EditTextRequest {
  type: 'source' | 'translated';
  text: string;
}

export interface RemakeAudioRequest {
  voice?: string;
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
    const response = await fetch(`${BASE_URL}/profile`, {
      headers: {
        Authorization: `Bearer ${currentToken || ''}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return response.json();
  },

  updateApiKey: async (data: UpdateApiKeyRequest): Promise<void> => {
    const response = await fetch(`${BASE_URL}/update-api-key`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${currentToken || ''}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update API key');
  },

  getHistory: async (): Promise<UsageHistoryItem[]> => {
    const response = await fetch(`${BASE_URL}/history`, {
      headers: {
        Authorization: `Bearer ${currentToken || ''}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch history');
    return response.json();
  },

  getHistoryAudio: async (historyId: string): Promise<{ initialAudioData: string | null; targetAudioData: string | null }> => {
    const response = await fetch(`${BASE_URL}/history/${historyId}/audio`, {
      headers: {
        Authorization: `Bearer ${currentToken || ''}`,
      },
    });
    if (!response.ok) throw new Error('Failed to fetch audio data');
    return response.json();
  },

  editText: async (historyId: string, data: EditTextRequest): Promise<UsageHistoryItem> => {
    const response = await fetch(`${BASE_URL}/history/${historyId}/edit-text`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${currentToken || ''}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to edit text');
    return response.json();
  },

  retranslate: async (historyId: string): Promise<UsageHistoryItem> => {
    const response = await fetch(`${BASE_URL}/history/${historyId}/retranslate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${currentToken || ''}`,
      },
    });
    if (!response.ok) throw new Error('Failed to retranslate');
    return response.json();
  },

  remakeAudio: async (historyId: string, data: RemakeAudioRequest): Promise<UsageHistoryItem> => {
    const response = await fetch(`${BASE_URL}/history/${historyId}/remake-audio`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${currentToken || ''}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to remake audio');
    return response.json();
  },
}; 