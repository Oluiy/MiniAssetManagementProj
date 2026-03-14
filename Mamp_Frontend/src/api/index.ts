import axios from 'axios';
import { 
    AssetResponse, 
    DashboardResponse, 
    MaintenanceTaskResponse, 
    ServiceResponse,
    LoginRequest,
    SignupRequest,
    SignupResponse,
    AssetRequest,
    MaintenanceTaskRequest,
    TokenResponse
} from '../types';

export const storeAuthTokens = (accessToken: string, refreshToken: string, username: string) => {
  localStorage.setItem('token', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('user', username);
  api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
};

export const clearAuthTokens = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  delete api.defaults.headers.common['Authorization'];
};

export const getAccessToken = (): string | null =>
  localStorage.getItem('token');

export const getRefreshToken = (): string | null =>
  localStorage.getItem('refreshToken');

export const getUsername = (): string | null =>
  localStorage.getItem('user');

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://miniassetmanagementproj.onrender.com',
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

// Normalise PascalCase .NET responses to camelCase
api.interceptors.response.use((response) => {
  response.data = toCamelCase(response.data);
  return response;
});

function toCamelCase(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([k, v]) => [
        k.charAt(0).toLowerCase() + k.slice(1),
        toCamelCase(v)
      ])
    );
  }
  return obj;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') ?? sessionStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as any;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !String(originalRequest.url || '').includes('/api/Auth/login') &&
      !String(originalRequest.url || '').includes('/api/Auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken =
        localStorage.getItem('refreshToken') ??
        sessionStorage.getItem('refreshToken');

      if (!refreshToken) {
        isRefreshing = false;
        processQueue(error, null);
        clearAuthTokens();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await authApi.refresh(refreshToken);
        const raw = (response as any)?.data?.data ?? (response as any)?.data ?? {};
        const payload = raw as Record<string, any>;
        const accessToken = payload.accessToken ?? payload.token ?? payload.AccessToken;
        const newRefreshToken = payload.refreshToken ?? payload.RefreshToken ?? refreshToken;
        const username = payload.username ?? payload.user ?? 'User';

        if (!accessToken) {
          throw new Error('Invalid refresh response');
        }

        storeAuthTokens(accessToken, newRefreshToken, username);
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        processQueue(null, accessToken);
        return api(originalRequest);
      } catch (refreshError: any) {
        processQueue(refreshError, null);
        clearAuthTokens();
        if (refreshError?.response?.status === 401 || refreshError?.response?.status === 403) {
          window.location.href = '/login';
        } else {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ── ASSETS ──────────────────────────────────────────────
export const assetsApi = {
  getAll:   ()                          => api.get<ServiceResponse<AssetResponse[]>>('/api/Asset'),
  getById:  (id: string)                => api.get<ServiceResponse<AssetResponse>>(`/api/Asset/${id}`),
  create:   (data: AssetRequest)                 => api.post<ServiceResponse<AssetResponse>>('/api/Asset', data),
  update:   (id: string, data: AssetRequest)     => api.put<ServiceResponse<AssetResponse>>(`/api/Asset/${id}`, data),
  delete:   (id: string)                => api.delete<ServiceResponse<unknown>>(`/api/Asset/${id}`),
};

// ── MAINTENANCE TASKS ────────────────────────────────────
export const tasksApi = {
  getAll:   ()                          => api.get<ServiceResponse<MaintenanceTaskResponse[]>>('/api/MaintenanceTask'),
  getById:      (id: string)                    => api.get<ServiceResponse<MaintenanceTaskResponse>>(`/api/MaintenanceTask/${id}`),
  create:       (data: MaintenanceTaskRequest)                     => api.post<ServiceResponse<MaintenanceTaskResponse>>('/api/MaintenanceTask', data),
  updateStatus: (id: string, status: number)    => api.patch<ServiceResponse<unknown>>(`/api/MaintenanceTask/${id}/status`, { status }),
  updatePriority: (id: string, priority: number) => api.patch<ServiceResponse<unknown>>(`/api/MaintenanceTask/${id}/priority`, { priority }),
  delete:       (id: string)                    => api.delete<ServiceResponse<unknown>>(`/api/MaintenanceTask/${id}`),
};

// ── DASHBOARD ────────────────────────────────────────────
export const dashboardApi = {
  getStats: () => api.get<ServiceResponse<DashboardResponse>>('/api/Dashboard/overview'),
};

// ── AUTH ─────────────────────────────────────────────────
export const authApi = {
  login:    (data: LoginRequest) =>
    api.post<ServiceResponse<SignupResponse>>('/api/Auth/login', data),
  register: (data: SignupRequest) =>
    api.post<ServiceResponse<unknown>>('/api/Auth/register', data),
  refreshToken: (refreshToken: string) =>
    api.post<ServiceResponse<SignupResponse>>('/api/Auth/refresh-token', { refreshToken }),
  refresh: (refreshToken: string) =>
    api.post<ServiceResponse<TokenResponse>>('/api/Auth/refresh', { refreshToken }),
};

export const notificationApi = {
  sendReminder: (daysAhead: number) =>
    api.post('/api/Notification/SendReminder', { daysAhead }),
};

export default api;