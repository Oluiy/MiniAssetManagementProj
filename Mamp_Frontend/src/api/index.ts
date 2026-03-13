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
    MaintenanceTaskRequest
} from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5235',
});

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
    api.post<ServiceResponse<SignupResponse>>('/api/Auth/refresh-token', { refreshToken })
};

export default api;