import type { Permission, RecordType } from 'react-native-health-connect';
import {
  aggregateRecord,
  getGrantedPermissions,
  getSdkStatus,
  initialize,
  insertRecords,
  readRecords,
  requestPermission,
  SdkAvailabilityStatus,
} from 'react-native-health-connect';

type TimeRangeFilter = Parameters<typeof aggregateRecord>[0]['timeRangeFilter'];

import type {
  BiologicalSex,
  HealthFeatureResult,
  HealthMetricOptions,
  HealthMetricResult,
  HealthPermissionsStatus,
  HealthPermissionType,
  HealthRecordSample,
  IHealthService,
  ProfileQueryOptions,
  RequestPermissionsOptions,
  UserProfileMetric,
  UserProfileMetricSample,
} from '../types/health-types';

function parseProfileQueryArgs(
  startDateOrOptions?: Date | ProfileQueryOptions,
  endDate?: Date
): ProfileQueryOptions {
  if (startDateOrOptions instanceof Date) {
    return {
      startDate: startDateOrOptions,
      endDate: endDate ?? new Date(),
    };
  }
  if (startDateOrOptions && typeof startDateOrOptions === 'object') {
    return startDateOrOptions;
  }
  return {};
}

function getTimeZoneOffset(date: Date) {
  const totalSeconds = -date.getTimezoneOffset() * 60;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  return { id: timeZone, totalSeconds };
}

function buildTimeRangeFilter(options?: {
  startDate?: Date;
  endDate?: Date;
}): TimeRangeFilter {
  const start = options?.startDate;
  const end = options?.endDate;

  if (start && end) {
    return {
      operator: 'between',
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    };
  }
  if (start) {
    return {
      operator: 'after',
      startTime: start.toISOString(),
    };
  }
  if (end) {
    return {
      operator: 'before',
      endTime: end.toISOString(),
    };
  }
  return {
    operator: 'before',
    endTime: new Date().toISOString(),
  };
}

export class AndroidHealthService implements IHealthService {
  async initialize(): Promise<boolean> {
    try {
      const status = await getSdkStatus();
      if (status !== SdkAvailabilityStatus.SDK_AVAILABLE) {
        return false;
      }
      return await initialize();
    } catch {
      return false;
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const status = await getSdkStatus();
      return status === SdkAvailabilityStatus.SDK_AVAILABLE;
    } catch {
      return false;
    }
  }

  async getPermissions(): Promise<HealthPermissionsStatus> {
    try {
      const granted = await getGrantedPermissions();

      const has = (recordType: string, accessType: 'read' | 'write') =>
        granted.some(
          (p) =>
            'recordType' in p &&
            p.recordType === recordType &&
            p.accessType === accessType
        );

      return {
        steps: { read: has('Steps', 'read'), write: has('Steps', 'write') },
        activeCalories: {
          read: has('ActiveCaloriesBurned', 'read'),
          write: has('ActiveCaloriesBurned', 'write'),
        },
        distance: {
          read: has('Distance', 'read'),
          write: has('Distance', 'write'),
        },
        height: {
          read: has('Height', 'read'),
          write: has('Height', 'write'),
        },
        weight: {
          read: has('Weight', 'read'),
          write: has('Weight', 'write'),
        },
        dateOfBirth: { read: false, write: false },
        biologicalSex: { read: false, write: false },
      };
    } catch {
      return {
        steps: { read: false, write: false },
        activeCalories: { read: false, write: false },
        distance: { read: false, write: false },
        height: { read: false, write: false },
        weight: { read: false, write: false },
        dateOfBirth: { read: false, write: false },
        biologicalSex: { read: false, write: false },
      };
    }
  }

  async requestPermissions(
    permissions?: HealthPermissionType[] | RequestPermissionsOptions
  ): Promise<boolean> {
    const toRequest: Permission[] = [];

    const mapPermission = (type: HealthPermissionType, accessType: 'read' | 'write') => {
      let recordType: RecordType | null = null;
      switch (type) {
        case 'steps':
          recordType = 'Steps';
          break;
        case 'activeCalories':
          recordType = 'ActiveCaloriesBurned';
          break;
        case 'distance':
          recordType = 'Distance';
          break;
        case 'height':
          recordType = 'Height';
          break;
        case 'weight':
          recordType = 'Weight';
          break;
        case 'dateOfBirth':
        case 'biologicalSex':
          // Unsupported on Android Health Connect
          return;
      }
      if (recordType) {
        toRequest.push({ accessType, recordType });
      }
    };

    if (!permissions) {
      // Default: request all read permissions and write permissions for profile
      const allRead: HealthPermissionType[] = [
        'steps',
        'activeCalories',
        'distance',
        'height',
        'weight',
      ];
      allRead.forEach((p) => mapPermission(p, 'read'));
      mapPermission('height', 'write');
      mapPermission('weight', 'write');
    } else if (Array.isArray(permissions)) {
      permissions.forEach((p) => {
        mapPermission(p, 'read');
        if (p === 'height' || p === 'weight') {
          mapPermission(p, 'write');
        }
      });
    } else {
      permissions.read?.forEach((p) => mapPermission(p, 'read'));
      permissions.write?.forEach((p) => mapPermission(p, 'write'));
    }

    if (toRequest.length === 0) {
      return true;
    }

    try {
      const initialized = await this.initialize();
      if (!initialized) {
        return false;
      }
      const granted = await requestPermission(toRequest);
      return granted.length > 0;
    } catch {
      return false;
    }
  }

  async getSteps(
    startDate: Date,
    endDate: Date,
    options?: HealthMetricOptions
  ): Promise<HealthMetricResult> {
    if (
      isNaN(startDate.getTime()) ||
      isNaN(endDate.getTime()) ||
      startDate >= endDate
    ) {
      throw new Error('Invalid date range for step count.');
    }

    const timeRangeFilter: TimeRangeFilter = {
      operator: 'between',
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
    };

    let total = 0;
    try {
      const agg = await aggregateRecord({
        recordType: 'Steps',
        timeRangeFilter,
      });
      total = Math.round(agg.COUNT_TOTAL ?? 0);
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : 'Failed to retrieve steps.'
      );
    }

    const samples: HealthRecordSample[] = [];
    if (options?.includeSamples) {
      try {
        const { records } = await readRecords('Steps', {
          timeRangeFilter,
          ascendingOrder: true,
        });
        records.forEach((r) => {
          samples.push({
            value: r.count,
            startDate: r.startTime,
            endDate: r.endTime,
          });
        });
      } catch {
        // Samples optional, aggregate preserved
      }
    }

    return {
      value: total,
      unit: 'count',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      samples,
    };
  }

  async getActiveCalories(
    startDate: Date,
    endDate: Date,
    options?: HealthMetricOptions
  ): Promise<HealthMetricResult> {
    if (
      isNaN(startDate.getTime()) ||
      isNaN(endDate.getTime()) ||
      startDate >= endDate
    ) {
      throw new Error('Invalid date range for active calories.');
    }

    const timeRangeFilter: TimeRangeFilter = {
      operator: 'between',
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
    };

    let total = 0;
    try {
      const agg = await aggregateRecord({
        recordType: 'ActiveCaloriesBurned',
        timeRangeFilter,
      });
      total = agg.ACTIVE_CALORIES_TOTAL?.inKilocalories ?? 0;
    } catch (err) {
      throw new Error(
        err instanceof Error
          ? err.message
          : 'Failed to retrieve active calories.'
      );
    }

    const samples: HealthRecordSample[] = [];
    if (options?.includeSamples) {
      try {
        const { records } = await readRecords('ActiveCaloriesBurned', {
          timeRangeFilter,
          ascendingOrder: true,
        });
        records.forEach((r) => {
          samples.push({
            value: Math.round((r.energy?.inKilocalories ?? 0) * 100) / 100,
            startDate: r.startTime,
            endDate: r.endTime,
          });
        });
      } catch {
        // Samples optional, aggregate preserved
      }
    }

    return {
      value: Math.round(total * 100) / 100,
      unit: 'kcal',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      samples,
    };
  }

  async getDistance(
    startDate: Date,
    endDate: Date,
    options?: HealthMetricOptions
  ): Promise<HealthMetricResult> {
    if (
      isNaN(startDate.getTime()) ||
      isNaN(endDate.getTime()) ||
      startDate >= endDate
    ) {
      throw new Error('Invalid date range for distance.');
    }

    const timeRangeFilter: TimeRangeFilter = {
      operator: 'between',
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
    };

    let total = 0;
    try {
      const agg = await aggregateRecord({
        recordType: 'Distance',
        timeRangeFilter,
      });
      total = agg.DISTANCE?.inMeters ?? 0;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : 'Failed to retrieve distance.'
      );
    }

    const samples: HealthRecordSample[] = [];
    if (options?.includeSamples) {
      try {
        const { records } = await readRecords('Distance', {
          timeRangeFilter,
          ascendingOrder: true,
        });
        records.forEach((r) => {
          samples.push({
            value: Math.round((r.distance?.inMeters ?? 0) * 100) / 100,
            startDate: r.startTime,
            endDate: r.endTime,
          });
        });
      } catch {
        // Samples optional, aggregate preserved
      }
    }

    return {
      value: Math.round(total * 100) / 100,
      unit: 'm',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      samples,
    };
  }

  async getHeight(options?: ProfileQueryOptions): Promise<UserProfileMetric>;
  async getHeight(startDate?: Date, endDate?: Date): Promise<UserProfileMetric>;
  async getHeight(
    startDateOrOptions?: Date | ProfileQueryOptions,
    endDate?: Date
  ): Promise<UserProfileMetric> {
    const opts = parseProfileQueryArgs(startDateOrOptions, endDate);
    const timeRangeFilter = buildTimeRangeFilter(opts);

    try {
      const { records } = await readRecords('Height', {
        timeRangeFilter,
        pageSize: opts.limit ?? 100,
        ascendingOrder: opts.ascending ?? false,
      });

      if (!records || records.length === 0) {
        return {
          value: null,
          unit: 'cm',
          date: null,
          history: [],
        };
      }

      const history: UserProfileMetricSample[] = records.map((r) => ({
        value: Math.round(r.height.inMeters * 100 * 10) / 10,
        unit: 'cm',
        date: r.time,
      }));

      const primary = history[0];

      return {
        value: primary.value,
        unit: 'cm',
        date: primary.date,
        history,
      };
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : 'Failed to retrieve height.'
      );
    }
  }

  async getWeight(options?: ProfileQueryOptions): Promise<UserProfileMetric>;
  async getWeight(startDate?: Date, endDate?: Date): Promise<UserProfileMetric>;
  async getWeight(
    startDateOrOptions?: Date | ProfileQueryOptions,
    endDate?: Date
  ): Promise<UserProfileMetric> {
    const opts = parseProfileQueryArgs(startDateOrOptions, endDate);
    const timeRangeFilter = buildTimeRangeFilter(opts);

    try {
      const { records } = await readRecords('Weight', {
        timeRangeFilter,
        pageSize: opts.limit ?? 100,
        ascendingOrder: opts.ascending ?? false,
      });

      if (!records || records.length === 0) {
        return {
          value: null,
          unit: 'kg',
          date: null,
          history: [],
        };
      }

      const history: UserProfileMetricSample[] = records.map((r) => ({
        value: Math.round(r.weight.inKilograms * 10) / 10,
        unit: 'kg',
        date: r.time,
      }));

      const primary = history[0];

      return {
        value: primary.value,
        unit: 'kg',
        date: primary.date,
        history,
      };
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : 'Failed to retrieve weight.'
      );
    }
  }

  async getDateOfBirth(): Promise<HealthFeatureResult<Date>> {
    return {
      supported: false,
      value: null,
      reason: 'Date of birth is not supported on Android Health Connect.',
    };
  }

  async getBiologicalSex(): Promise<HealthFeatureResult<BiologicalSex>> {
    return {
      supported: false,
      value: null,
      reason: 'Biological sex is not supported on Android Health Connect.',
    };
  }

  async updateHeight(valueInCm: number, date: Date = new Date()): Promise<boolean> {
    if (valueInCm <= 0) {
      throw new Error('Height must be greater than 0.');
    }

    try {
      // Check recent records to avoid duplicate writes
      const windowStart = new Date(date.getTime() - 2000).toISOString();
      const windowEnd = new Date(date.getTime() + 2000).toISOString();

      const { records } = await readRecords('Height', {
        timeRangeFilter: {
          operator: 'between',
          startTime: windowStart,
          endTime: windowEnd,
        },
        pageSize: 5,
        ascendingOrder: false,
      });

      const duplicate = records.some(
        (r) =>
          Math.abs(r.height.inMeters * 100 - valueInCm) < 0.1 &&
          Math.abs(new Date(r.time).getTime() - date.getTime()) < 1000
      );

      if (duplicate) {
        return true;
      }

      await insertRecords([
        {
          recordType: 'Height',
          height: {
            value: valueInCm / 100,
            unit: 'meters',
          },
          time: date.toISOString(),
          zoneOffset: getTimeZoneOffset(date),
          metadata: {
            clientRecordId: `height_${date.getTime()}`,
          },
        },
      ]);

      return true;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : 'Failed to update height.'
      );
    }
  }

  async updateWeight(valueInKg: number, date: Date = new Date()): Promise<boolean> {
    if (valueInKg <= 0) {
      throw new Error('Weight must be greater than 0.');
    }

    try {
      // Check recent records to avoid duplicate writes
      const windowStart = new Date(date.getTime() - 2000).toISOString();
      const windowEnd = new Date(date.getTime() + 2000).toISOString();

      const { records } = await readRecords('Weight', {
        timeRangeFilter: {
          operator: 'between',
          startTime: windowStart,
          endTime: windowEnd,
        },
        pageSize: 5,
        ascendingOrder: false,
      });

      const duplicate = records.some(
        (r) =>
          Math.abs(r.weight.inKilograms - valueInKg) < 0.1 &&
          Math.abs(new Date(r.time).getTime() - date.getTime()) < 1000
      );

      if (duplicate) {
        return true;
      }

      await insertRecords([
        {
          recordType: 'Weight',
          weight: {
            value: valueInKg,
            unit: 'kilograms',
          },
          time: date.toISOString(),
          zoneOffset: getTimeZoneOffset(date),
          metadata: {
            clientRecordId: `weight_${date.getTime()}`,
          },
        },
      ]);

      return true;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : 'Failed to update weight.'
      );
    }
  }
}
