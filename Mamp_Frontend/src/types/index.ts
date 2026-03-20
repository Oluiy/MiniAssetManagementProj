export enum AssetStatus { Active = 1, Inactive = 2, UnderMaintenance = 3 }
export enum MaintenancePriority { Low = 1, Medium = 2, High = 3 }
export enum MaintenanceStatus { Pending = 1, InProgress = 2, Completed = 3 }

export interface AssetResponse {
    id: string;
    name: string;
    type: string;
    location: string;
    status: AssetStatus;
    dateCreated: string;
}

export interface DashboardResponse {
    totalAsset: number;
    totalProperty: number;
    taskPending: number;
    taskInProgress: number;
    taskCompleted: number;
}

export interface MaintenanceTaskResponse {
    id: string;
    title: string;
    description: string;
    assetId: string;
    priority: MaintenancePriority;
    status: MaintenanceStatus;
    dueDate: string;
}

export interface ServiceResponse<T> {
    statusCode: number;
    success: boolean;
    message: string | null;
    data: T | null;
}

export interface TokenResponse {
    accessToken: string;
    accessTokenExpiresAtUtc: string;
    refreshToken: string;
    refreshTokenExpiresAt: string;
}

export interface SignupResponse {
    username: string;
    email: string;
    token: TokenResponse;
}

export interface AssetSummaryResponse {
    id: string;
    name: string;
    status: string;
}

export interface Property {
    id: string;
    name: string;
    address: string;
    type: string;
    description?: string;
    status: string;
    dateCreated: string;
    assetCount: number;
    assets: AssetSummaryResponse[];
}

export interface Asset extends AssetResponse {
    propertyId?: string;
    propertyName?: string;
}

export interface AssetRequest {
    name: string;
    type: string;
    location: string;
    status: AssetStatus;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface SignupRequest {
    username: string;
    email: string;
    password: string;
}

export interface MaintenanceTaskRequest {
    title: string;
    description: string;
    assetId: string;
    priority: MaintenancePriority;
    status: MaintenanceStatus;
    dueDate: string;
}
