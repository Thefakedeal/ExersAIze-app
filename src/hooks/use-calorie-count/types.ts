
export interface HealthResult {
  calories: number;
  loading: boolean;
  error: string | null;
  isAvailable: boolean;
  refresh: () => Promise<void>;
}

export interface DistanceCountOptions {
  /**
   * Automatically request distance data when the hook mounts
   * if permission has already been granted.
   */
  autoFetch?: boolean;
}
