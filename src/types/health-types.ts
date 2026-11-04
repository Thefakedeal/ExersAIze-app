export type HealthPermissionType =
  | 'steps'
  | 'activeCalories'
  | 'distance'
  | 'height'
  | 'weight'
  | 'dateOfBirth'
  | 'biologicalSex';

export interface PermissionStatus {
  read: boolean;
  write: boolean;
}

export interface HealthPermissionsStatus {
  steps: PermissionStatus;
  activeCalories: PermissionStatus;
  distance: PermissionStatus;
  height: PermissionStatus;
  weight: PermissionStatus;
  dateOfBirth: PermissionStatus;
  biologicalSex: PermissionStatus;
}

export interface RequestPermissionsOptions {
  read?: HealthPermissionType[];
  write?: ('height' | 'weight')[];
}

export interface HealthRecordSample {
  value: number;
  startDate: string;
  endDate: string;
}

export interface HealthMetricResult {
  value: number;
  unit: 'count' | 'kcal' | 'm';
  startDate: string;
  endDate: string;
  samples: HealthRecordSample[];
}

export interface HealthMetricOptions {
  includeSamples?: boolean;
}

export interface ProfileQueryOptions {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  ascending?: boolean;
}

export interface UserProfileMetricSample {
  value: number;
  unit: 'cm' | 'kg';
  date: string;
}

export interface UserProfileMetric {
  value: number | null;
  unit: 'cm' | 'kg';
  date: string | null;
  history: UserProfileMetricSample[];
}

export type BiologicalSex = 'female' | 'male' | 'other' | 'unknown';

export interface HealthFeatureResult<T> {
  supported: boolean;
  value: T | null;
  reason?: string;
}

export interface IHealthService {
  // Initialization & Permissions
  initialize(): Promise<boolean>;
  isAvailable(): Promise<boolean>;
  getPermissions(): Promise<HealthPermissionsStatus>;
  requestPermissions(
    permissions?: HealthPermissionType[] | RequestPermissionsOptions
  ): Promise<boolean>;

  // Health Metrics
  getSteps(
    startDate: Date,
    endDate: Date,
    options?: HealthMetricOptions
  ): Promise<HealthMetricResult>;

  getActiveCalories(
    startDate: Date,
    endDate: Date,
    options?: HealthMetricOptions
  ): Promise<HealthMetricResult>;

  getDistance(
    startDate: Date,
    endDate: Date,
    options?: HealthMetricOptions
  ): Promise<HealthMetricResult>;

  // User Profile
  getHeight(options?: ProfileQueryOptions): Promise<UserProfileMetric>;
  getHeight(startDate?: Date, endDate?: Date): Promise<UserProfileMetric>;
  getHeight(
    startDateOrOptions?: Date | ProfileQueryOptions,
    endDate?: Date
  ): Promise<UserProfileMetric>;

  getWeight(options?: ProfileQueryOptions): Promise<UserProfileMetric>;
  getWeight(startDate?: Date, endDate?: Date): Promise<UserProfileMetric>;
  getWeight(
    startDateOrOptions?: Date | ProfileQueryOptions,
    endDate?: Date
  ): Promise<UserProfileMetric>;

  getDateOfBirth(): Promise<HealthFeatureResult<Date>>;
  getBiologicalSex(): Promise<HealthFeatureResult<BiologicalSex>>;

  updateHeight(valueInCm: number, date?: Date): Promise<boolean>;
  updateWeight(valueInKg: number, date?: Date): Promise<boolean>;
}
