import { Platform } from 'react-native';

import type { IHealthService } from '../types/health-types';
import { AndroidHealthService } from './AndroidHealthService';
import { IOSHealthService } from './IOSHealthService';

/**
 * Unified platform-selected health service instance.
 * Automatically chooses AndroidHealthService on Android and IOSHealthService on iOS.
 */
export const healthService: IHealthService =
  Platform.OS === 'ios'
    ? new IOSHealthService()
    : new AndroidHealthService();

export default healthService;

export * from '../types/health-types';
export { AndroidHealthService } from './AndroidHealthService';
export { IOSHealthService } from './IOSHealthService';

export * from './exercise-storage';
export * from './number-formatter';

