export interface StepCountResult {
  steps: number;
  loading: boolean;
  error: string | null;
  isAvailable: boolean;
  requestPermissions: () => Promise<boolean>;
  refresh: () => Promise<void>;
}

export interface StepCountOptions {
  /**
   * Automatically request step data when the hook mounts
   * if permission has already been granted.
   */
  autoFetch?: boolean;
}
