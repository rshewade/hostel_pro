/**
 * API Utilities and Constants
 *
 * Shared utilities for making API calls and handling responses.
 */

import { ApiResponse } from '@/types/api';

// ============================================================================
// API Base Configuration
// ============================================================================

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
export const API_TIMEOUT = 30000; // 30 seconds

// ============================================================================
// API Endpoints Constants
// ============================================================================

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/api/auth/login',
    FIRST_TIME_SETUP: '/api/auth/first-time-setup',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    LOGOUT: '/api/auth/logout',
    SESSION: '/api/auth/session',
  },

  // OTP
  OTP: {
    SEND: '/api/otp/send',
    VERIFY: '/api/otp/verify',
    RESEND: '/api/otp/resend',
  },

  // Applications
  APPLICATIONS: {
    LIST: '/api/applications',
    CREATE: '/api/applications',
    GET: (id: string) => `/api/applications/${id}`,
    UPDATE: (id: string) => `/api/applications/${id}`,
    DELETE: (id: string) => `/api/applications/${id}`,
    SUBMIT: (id: string) => `/api/applications/${id}/submit`,
    WITHDRAW: (id: string) => `/api/applications/${id}/withdraw`,
    TRACK: (trackingNumber: string) => `/api/applications/track/${trackingNumber}`,
  },

  // Interviews
  INTERVIEWS: {
    LIST: '/api/interviews',
    CREATE: '/api/interviews',
    GET: (id: string) => `/api/interviews/${id}`,
    UPDATE: (id: string) => `/api/interviews/${id}`,
    SLOTS: '/api/interviews/slots',
    RESCHEDULE: (id: string) => `/api/interviews/${id}/reschedule`,
    COMPLETE: (id: string) => `/api/interviews/${id}/complete`,
  },

  // Fees & Payments
  FEES: {
    LIST: '/api/fees',
    GET: (studentId: string) => `/api/fees/${studentId}`,
  },
  PAYMENTS: {
    INITIATE: '/api/payments',
    VERIFY: '/api/payments/verify',
    RECEIPT: (transactionId: string) => `/api/payments/receipt/${transactionId}`,
  },

  // Rooms & Allocations
  ROOMS: {
    LIST: '/api/rooms',
  },
  ALLOCATIONS: {
    LIST: '/api/allocations',
    CREATE: '/api/allocations',
    GET: (id: string) => `/api/allocations/${id}`,
    UPDATE: (id: string) => `/api/allocations/${id}`,
    VACATE: (id: string) => `/api/allocations/vacate/${id}`,
  },

  // Leaves
  LEAVES: {
    LIST: '/api/leaves',
    CREATE: '/api/leaves',
    GET: (id: string) => `/api/leaves/${id}`,
    UPDATE: (id: string) => `/api/leaves/${id}`,
    APPROVE: (id: string) => `/api/leaves/${id}/approve`,
    REJECT: (id: string) => `/api/leaves/${id}/reject`,
  },

  // Renewals
  RENEWALS: {
    LIST: '/api/renewals',
    CREATE: '/api/renewals',
    GET: (id: string) => `/api/renewals/${id}`,
    APPROVE: (id: string) => `/api/renewals/${id}/approve`,
  },

  // Dashboards
  DASHBOARD: {
    STUDENT: '/api/dashboard/student',
    SUPERINTENDENT: '/api/dashboard/superintendent',
    TRUSTEE: '/api/dashboard/trustee',
    PARENT: '/api/dashboard/parent',
  },

  // Documents
  DOCUMENTS: {
    UPLOAD: '/api/documents/upload',
    GET: (id: string) => `/api/documents/${id}`,
  },

  // User Profile
  USERS: {
    PROFILE: '/api/users/profile',
  },

  // Audit
  AUDIT: {
    LOGS: '/api/audit/logs',
    ENTITY: (type: string, id: string) => `/api/audit/entity/${type}/${id}`,
  },
} as const;

// ============================================================================
// HTTP Status Codes
// ============================================================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// ============================================================================
// API Error Class
// ============================================================================

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// ============================================================================
// API Request Helper
// ============================================================================

export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: Record<string, unknown> | FormData | string;
  timeout?: number;
};

/**
 * Make an API request with standardized error handling
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = API_TIMEOUT,
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      throw new APIError(
        data.message || data.error || 'Request failed',
        response.status,
        data
      );
    }

    return data as T;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof APIError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new APIError('Request timeout', 408);
      }
      throw new APIError(error.message, 500);
    }

    throw new APIError('Unknown error occurred', 500);
  }
}

// ============================================================================
// Convenience Methods
// ============================================================================

export const api = {
  get: <T = unknown>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = unknown>(endpoint: string, body?: RequestOptions['body'], options?: Omit<RequestOptions, 'method'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T = unknown>(endpoint: string, body?: RequestOptions['body'], options?: Omit<RequestOptions, 'method'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'PUT', body }),

  delete: <T = unknown>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),

  patch: <T = unknown>(endpoint: string, body?: RequestOptions['body'], options?: Omit<RequestOptions, 'method'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'PATCH', body }),
};

// ============================================================================
// Response Validators
// ============================================================================

/**
 * Validate API response structure
 */
export function isApiResponse<T = unknown>(data: unknown): data is ApiResponse<T> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'success' in data &&
    typeof data.success === 'boolean'
  );
}

/**
 * Extract data from API response or throw error
 */
export function unwrapResponse<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new APIError(
      response.error || response.message || 'Request failed',
      400,
      response
    );
  }

  if (response.data === undefined) {
    throw new APIError('Response data is missing', 500, response);
  }

  return response.data;
}

// ============================================================================
// Query String Helpers
// ============================================================================

/**
 * Build query string from params object
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

/**
 * Build URL with query parameters
 */
export function buildUrl(endpoint: string, params?: Record<string, any>): string {
  if (!params || Object.keys(params).length === 0) {
    return endpoint;
  }

  return `${endpoint}${buildQueryString(params)}`;
}

// ============================================================================
// Local Storage Helpers (for tokens/sessions)
// ============================================================================

const STORAGE_KEYS = {
  AUTH_TOKEN: 'hostel_auth_token',
  SESSION_TOKEN: 'hostel_session_token',
  USER_ROLE: 'hostel_user_role',
} as const;

export const storage = {
  setAuthToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    }
  },

  getAuthToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    }
    return null;
  },

  removeAuthToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    }
  },

  setSessionToken: (token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, token);
    }
  },

  getSessionToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
    }
    return null;
  },

  removeSessionToken: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
    }
  },

  setUserRole: (role: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
    }
  },

  getUserRole: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEYS.USER_ROLE);
    }
    return null;
  },

  removeUserRole: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.USER_ROLE);
    }
  },

  clearAll: () => {
    if (typeof window !== 'undefined') {
      Object.values(STORAGE_KEYS).forEach((key) => {
        localStorage.removeItem(key);
      });
    }
  },
};
