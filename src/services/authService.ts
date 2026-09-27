import { apiClient, type ApiError } from './api';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt?: string;
  isDemo?: boolean;
}

export interface AuthResponse {
  message?: string;
  token: string;
  user: AuthUser;
}

export const DEMO_CREDENTIALS = {
  email: 'demo@oceanpulse.ai',
  password: 'Demo@123',
};

export const DEMO_USER: AuthUser = {
  id: 'user-demo-001',
  name: 'Demo Intelligence Officer',
  email: 'demo@oceanpulse.ai',
  role: 'agency',
  createdAt: new Date().toISOString(),
  isDemo: true,
};

export const isDemoModeConfigured = (): boolean => {
  return import.meta.env.VITE_APP_MODE === 'demo';
};

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const trimmedEmail = email.trim().toLowerCase();

    // 1. Try real backend API
    try {
      const res = await apiClient<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: trimmedEmail, password }),
      });
      return res;
    } catch (err: unknown) {
      const apiErr = err as ApiError;

      // If backend responded with 401 Unauthorized, rethrow real credential rejection
      if (apiErr.status === 401 || apiErr.status === 400) {
        throw err;
      }

      // 2. If backend is unavailable (network error) AND app is in DEMO mode:
      if (isDemoModeConfigured()) {
        if (
          trimmedEmail === DEMO_CREDENTIALS.email.toLowerCase() &&
          password === DEMO_CREDENTIALS.password
        ) {
          console.warn('[OceanPulse Auth] Using DEMO MODE simulated authentication fallback.');
          return {
            message: 'Login successful (Demo Mode).',
            token: `demo-token-${Date.now()}`,
            user: { ...DEMO_USER },
          };
        } else if (trimmedEmail === DEMO_CREDENTIALS.email.toLowerCase()) {
          const invalidErr = new Error('Invalid email or password.') as ApiError;
          invalidErr.status = 401;
          throw invalidErr;
        }
      }

      throw err;
    }
  },

  async register(data: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<AuthResponse> {
    try {
      const res = await apiClient<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return res;
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      if (apiErr.status === 409 || apiErr.status === 400) {
        throw err;
      }

      // Demo fallback if server is offline
      if (isDemoModeConfigured()) {
        console.warn('[OceanPulse Auth] Using DEMO MODE registration fallback.');
        const newUser: AuthUser = {
          id: `demo-user-${Date.now()}`,
          name: data.name,
          email: data.email,
          role: data.role || 'researcher',
          createdAt: new Date().toISOString(),
          isDemo: true,
        };
        return {
          message: 'Account created successfully (Demo Mode).',
          token: `demo-token-${Date.now()}`,
          user: newUser,
        };
      }

      throw err;
    }
  },

  async getMe(): Promise<{ user: AuthUser }> {
    const token = localStorage.getItem('oceanpulse_token');
    if (!token) {
      throw new Error('No authentication token found.');
    }

    if (token.startsWith('demo-token-')) {
      const cachedUser = localStorage.getItem('oceanpulse_user');
      if (cachedUser) {
        try {
          return { user: JSON.parse(cachedUser) };
        } catch {
          return { user: DEMO_USER };
        }
      }
      return { user: DEMO_USER };
    }

    return await apiClient<{ user: AuthUser }>('/auth/me', {
      method: 'GET',
    });
  },

  async logout(): Promise<void> {
    const token = localStorage.getItem('oceanpulse_token');
    if (token && !token.startsWith('demo-token-')) {
      try {
        await apiClient('/auth/logout', { method: 'POST' });
      } catch {
        // Continue clearing local state even if network call fails
      }
    }
  },
};
