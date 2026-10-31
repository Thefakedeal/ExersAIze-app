
export interface HealthResult {
  distance: number;
  loading: boolean;
  error: string | null;
  isAvailable: boolean;
  requestPermissions: () => Promise<boolean>;
  refresh: () => Promise<void>;
}

export interface DistanceCountOptions {
  /**
   * Automatically request distance data when the hook mounts
   * if permission has already been granted.
   */
  autoFetch?: boolean;
}
