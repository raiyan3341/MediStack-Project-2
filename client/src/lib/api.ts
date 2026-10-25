export const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    // ONLY use localhost if browser is actually running on localhost
    if (isLocalhost) {
      return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    }

    // In production on any live domain (e.g. medistack2.vercel.app):
    if (
      process.env.NEXT_PUBLIC_API_URL &&
      !process.env.NEXT_PUBLIC_API_URL.includes('localhost')
    ) {
      return process.env.NEXT_PUBLIC_API_URL;
    }

    return `${window.location.origin}/api`;
  }

  // During build / SSR:
  if (
    process.env.NEXT_PUBLIC_API_URL &&
    !process.env.NEXT_PUBLIC_API_URL.includes('localhost')
  ) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  return 'https://medistack2.vercel.app/api';
};

export const getUrl = (endpoint: string): string => {
  const baseUrl = getApiBaseUrl();
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${cleanBase}${cleanEndpoint}`;
};

export const API_BASE_URL = getApiBaseUrl();

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  [key: string]: any;
}

export const apiRequest = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('medistock_token') : null;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const url = getUrl(endpoint);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `API request failed with status ${response.status}`);
    }

    return data;
  } catch (error: any) {
    console.error(`[API Client Error] ${endpoint}:`, error.message);
    throw error;
  }
};

export const api = {
  get: <T = any>(endpoint: string, headers?: HeadersInit) =>
    apiRequest<T>(endpoint, { method: 'GET', headers }),

  post: <T = any>(endpoint: string, body?: any, headers?: HeadersInit) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    }),

  put: <T = any>(endpoint: string, body?: any, headers?: HeadersInit) =>
    apiRequest<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    }),

  patch: <T = any>(endpoint: string, body?: any, headers?: HeadersInit) =>
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    }),

  delete: <T = any>(endpoint: string, headers?: HeadersInit) =>
    apiRequest<T>(endpoint, { method: 'DELETE', headers }),
};

