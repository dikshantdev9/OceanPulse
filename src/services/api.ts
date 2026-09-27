const getBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/$/, '');
  }
  // Default to relative /api which is proxied by Vite in dev
  return '/api';
};

export const API_URL = getBaseUrl();

export interface ApiError {
  message: string;
  status?: number;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('oceanpulse_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.message || getDefaultErrorMessage(response.status);
      const error: ApiError = new Error(errorMsg) as ApiError;
      error.status = response.status;
      throw error;
    }

    return data as T;
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }
    // Network or connection failure
    const error: ApiError = new Error('Unable to connect to OceanPulse server.') as ApiError;
    error.status = 0;
    throw error;
  }
}

function getDefaultErrorMessage(status: number): string {
  switch (status) {
    case 400:
      return 'Invalid request data. Please check your input.';
    case 401:
      return 'Invalid email or password.';
    case 403:
      return 'Access denied. You do not have permission.';
    case 404:
      return 'Requested resource not found.';
    case 409:
      return 'An account with this email already exists.';
    case 500:
    case 502:
    case 503:
      return 'Authentication service is temporarily unavailable.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}
