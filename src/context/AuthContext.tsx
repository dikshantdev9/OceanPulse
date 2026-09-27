import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  authService,
  isDemoModeConfigured,
  type AuthResponse,
  type AuthUser,
} from '../services/authService';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  isDemoMode: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }) => Promise<AuthResponse>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoMode] = useState<boolean>(isDemoModeConfigured());

  // Restore existing session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('oceanpulse_token');
      const storedUser = localStorage.getItem('oceanpulse_user');

      if (!storedToken) {
        setLoading(false);
        return;
      }

      setToken(storedToken);

      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          // ignore corrupted json
        }
      }

      try {
        const { user: verifiedUser } = await authService.getMe();
        setUser(verifiedUser);
        localStorage.setItem('oceanpulse_user', JSON.stringify(verifiedUser));
      } catch (err) {
        console.warn('[OceanPulse Auth] Stored session invalid or expired, resetting:', err);
        // Clear invalid token
        localStorage.removeItem('oceanpulse_token');
        localStorage.removeItem('oceanpulse_user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    const response = await authService.login(email, password);

    setToken(response.token);
    setUser(response.user);

    localStorage.setItem('oceanpulse_token', response.token);
    localStorage.setItem('oceanpulse_user', JSON.stringify(response.user));

    return response;
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<AuthResponse> => {
    const response = await authService.register(data);

    setToken(response.token);
    setUser(response.user);

    localStorage.setItem('oceanpulse_token', response.token);
    localStorage.setItem('oceanpulse_user', JSON.stringify(response.user));

    return response;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('oceanpulse_token');
      localStorage.removeItem('oceanpulse_user');
    }
  };

  const isAuthenticated = Boolean(token && user);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        isDemoMode,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
