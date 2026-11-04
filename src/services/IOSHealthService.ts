import type {
  ObjectTypeIdentifier,
  SampleTypeIdentifierWriteable
} from '@kingstinct/react-native-healthkit';
import {
  AuthorizationRequestStatus,
  AuthorizationStatus,
  authorizationStatusFor,
  getRequestStatusForAuthorization,
  BiologicalSex as HKBiologicalSex,
  getBiologicalSex as hkGetBiologicalSex,
  getDateOfBirth as hkGetDateOfBirth,
  isHealthDataAvailable,
  queryQuantitySamples,
  requestAuthorization,
  saveQuantitySample,
} from '@kingstinct/react-native-healthkit';

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

export class IOSHealthService implements IHealthService {
  async initialize(): Promise<boolean> {
    try {
      return isHealthDataAvailable();
    } catch {
      return false;
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      return isHealthDataAvailable();
    } catch {
      return false;
    }
  }

  async getPermissions(): Promise<HealthPermissionsStatus> {
    const isWriteAuthorized = (identifier: SampleTypeIdentifierWriteable): boolean => {
      try {
        return authorizationStatusFor(identifier) === AuthorizationStatus.sharingAuthorized;
      } catch {
        return false;
      }
    };

    const checkReadStatus = async (type: ObjectTypeIdentifier): Promise<boolean> => {
      try {
        const status = await getRequestStatusForAuthorization({ toRead: [type] });
        return status === AuthorizationRequestStatus.unnecessary;
      } catch {
        return false;
      }
    };

    const [
      stepsRead,
      activeCaloriesRead,
      distanceRead,
      heightRead,
      weightRead,
      dateOfBirthRead,
      biologicalSexRead,
    ] = await Promise.all([
      checkReadStatus('HKQuantityTypeIdentifierStepCount'),
      checkReadStatus('HKQuantityTypeIdentifierActiveEnergyBurned'),
      checkReadStatus('HKQuantityTypeIdentifierDistanceWalkingRunning'),
      checkReadStatus('HKQuantityTypeIdentifierHeight'),
      checkReadStatus('HKQuantityTypeIdentifierBodyMass'),
      checkReadStatus('HKCharacteristicTypeIdentifierDateOfBirth'),
      checkReadStatus('HKCharacteristicTypeIdentifierBiologicalSex'),
    ]);

    return {
      steps: { read: stepsRead, write: false },
      activeCalories: { read: activeCaloriesRead, write: false },
      distance: { read: distanceRead, write: false },
      height: {
        read: heightRead,
        write: isWriteAuthorized('HKQuantityTypeIdentifierHeight'),
      },
      weight: {
        read: weightRead,
        write: isWriteAuthorized('HKQuantityTypeIdentifierBodyMass'),
      },
      dateOfBirth: { read: dateOfBirthRead, write: false },
      biologicalSex: { read: biologicalSexRead, write: false },
    };
  }

  async requestPermissions(
    permissions?: HealthPermissionType[] | RequestPermissionsOptions
  ): Promise<boolean> {
    if (!isHealthDataAvailable()) {
      return false;
    }

    const toRead: ObjectTypeIdentifier[] = [];
    const toShare: SampleTypeIdentifierWriteable[] = [];

    const mapReadPermission = (type: HealthPermissionType) => {
      switch (type) {
        case 'steps':
          toRead.push('HKQuantityTypeIdentifierStepCount');
          break;
        case 'activeCalories':
          toRead.push('HKQuantityTypeIdentifierActiveEnergyBurned');
          break;
        case 'distance':
          toRead.push('HKQuantityTypeIdentifierDistanceWalkingRunning');
          break;
        case 'height':
          toRead.push('HKQuantityTypeIdentifierHeight');
          break;
        case 'weight':
          toRead.push('HKQuantityTypeIdentifierBodyMass');
          break;
        case 'dateOfBirth':
          toRead.push('HKCharacteristicTypeIdentifierDateOfBirth');
          break;
        case 'biologicalSex':
          toRead.push('HKCharacteristicTypeIdentifierBiologicalSex');
          break;
      }
    };

    const mapWritePermission = (type: 'height' | 'weight') => {
      if (type === 'height') {
        toShare.push('HKQuantityTypeIdentifierHeight');
      } else if (type === 'weight') {
        toShare.push('HKQuantityTypeIdentifierBodyMass');
      }
    };

    if (!permissions) {
      const allRead: HealthPermissionType[] = [
        'steps',
        'activeCalories',
        'distance',
        'height',
        'weight',
        'dateOfBirth',
        'biologicalSex',
      ];
      allRead.forEach(mapReadPermission);
      mapWritePermission('height');
      mapWritePermission('weight');
    } else if (Array.isArray(permissions)) {
      permissions.forEach((p) => {
        mapReadPermission(p);
        if (p === 'height' || p === 'weight') {
          mapWritePermission(p);
        }
      });
    } else {
      permissions.read?.forEach(mapReadPermission);
      permissions.write?.forEach(mapWritePermission);
    }

    try {
      return await requestAuthorization({
        toRead: toRead.length > 0 ? toRead : undefined,
        toShare: toShare.length > 0 ? toShare : undefined,
      });
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

    try {
      const samples = await queryQuantitySamples('HKQuantityTypeIdentifierStepCount', {
        filter: {
          date: {
            startDate,
            endDate,
          },
        },
        unit: 'count',
        limit: 0,
      });

      const total = samples.reduce((sum, s) => sum + s.quantity, 0);

      const recordSamples: HealthRecordSample[] = options?.includeSamples
        ? samples.map((s) => ({
            value: s.quantity,
            startDate: s.startDate.toISOString(),
            endDate: s.endDate.toISOString(),
          }))
        : [];

      return {
        value: Math.round(total),
        unit: 'count',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        samples: recordSamples,
      };
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : 'Failed to retrieve steps.'
      );
    }
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

    try {
      const samples = await queryQuantitySamples(
        'HKQuantityTypeIdentifierActiveEnergyBurned',
        {
          filter: {
            date: {
              startDate,
              endDate,
            },
          },
          unit: 'kcal',
          limit: 0,
        }
      );

      const total = samples.reduce((sum, s) => sum + s.quantity, 0);

      const recordSamples: HealthRecordSample[] = options?.includeSamples
        ? samples.map((s) => ({
            value: Math.round(s.quantity * 100) / 100,
            startDate: s.startDate.toISOString(),
            endDate: s.endDate.toISOString(),
          }))
        : [];

      return {
        value: Math.round(total * 100) / 100,
        unit: 'kcal',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        samples: recordSamples,
      };
    } catch (err) {
      throw new Error(
        err instanceof Error
          ? err.message
          : 'Failed to retrieve active calories.'
      );
    }
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

    try {
      const samples = await queryQuantitySamples(
        'HKQuantityTypeIdentifierDistanceWalkingRunning',
        {
          filter: {
            date: {
              startDate,
              endDate,
            },
          },
          unit: 'm',
          limit: 0,
        }
      );

      const total = samples.reduce((sum, s) => sum + s.quantity, 0);

      const recordSamples: HealthRecordSample[] = options?.includeSamples
        ? samples.map((s) => ({
            value: Math.round(s.quantity * 100) / 100,
            startDate: s.startDate.toISOString(),
            endDate: s.endDate.toISOString(),
          }))
        : [];

      return {
        value: Math.round(total * 100) / 100,
        unit: 'm',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        samples: recordSamples,
      };
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : 'Failed to retrieve distance.'
      );
    }
  }

  async getHeight(options?: ProfileQueryOptions): Promise<UserProfileMetric>;
  async getHeight(startDate?: Date, endDate?: Date): Promise<UserProfileMetric>;
  async getHeight(
    startDateOrOptions?: Date | ProfileQueryOptions,
    endDate?: Date
  ): Promise<UserProfileMetric> {
    const opts = parseProfileQueryArgs(startDateOrOptions, endDate);

    try {
      const samples = await queryQuantitySamples('HKQuantityTypeIdentifierHeight', {
        filter:
          opts.startDate || opts.endDate
            ? {
                date: {
                  startDate: opts.startDate,
                  endDate: opts.endDate,
                },
              }
            : undefined,
        unit: 'cm',
        limit: opts.limit ?? (opts.startDate ? 0 : 100),
        ascending: opts.ascending ?? false,
      });

      if (!samples || samples.length === 0) {
        return {
          value: null,
          unit: 'cm',
          date: null,
          history: [],
        };
      }

      const history: UserProfileMetricSample[] = samples.map((s) => ({
        value: Math.round(s.quantity * 10) / 10,
        unit: 'cm',
        date: s.startDate.toISOString(),
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

    try {
      const samples = await queryQuantitySamples('HKQuantityTypeIdentifierBodyMass', {
        filter:
          opts.startDate || opts.endDate
            ? {
                date: {
                  startDate: opts.startDate,
                  endDate: opts.endDate,
                },
              }
            : undefined,
        unit: 'kg',
        limit: opts.limit ?? (opts.startDate ? 0 : 100),
        ascending: opts.ascending ?? false,
      });

      if (!samples || samples.length === 0) {
        return {
          value: null,
          unit: 'kg',
          date: null,
          history: [],
        };
      }

      const history: UserProfileMetricSample[] = samples.map((s) => ({
        value: Math.round(s.quantity * 10) / 10,
        unit: 'kg',
        date: s.startDate.toISOString(),
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
    try {
      const dob = hkGetDateOfBirth();
      return {
        supported: true,
        value: dob ?? null,
      };
    } catch (err) {
      return {
        supported: true,
        value: null,
        reason:
          err instanceof Error
            ? err.message
            : 'Unable to retrieve date of birth.',
      };
    }
  }

  async getBiologicalSex(): Promise<HealthFeatureResult<BiologicalSex>> {
    try {
      const sexEnum = hkGetBiologicalSex();
      let sex: BiologicalSex = 'unknown';
      if (sexEnum === HKBiologicalSex.female) {
        sex = 'female';
      } else if (sexEnum === HKBiologicalSex.male) {
        sex = 'male';
      } else if (sexEnum === HKBiologicalSex.other) {
        sex = 'other';
      } else {
        sex = 'unknown';
      }

      return {
        supported: true,
        value: sex,
      };
    } catch (err) {
      return {
        supported: true,
        value: 'unknown',
        reason:
          err instanceof Error
            ? err.message
            : 'Unable to retrieve biological sex.',
      };
    }
  }

  async updateHeight(valueInCm: number, date: Date = new Date()): Promise<boolean> {
    if (valueInCm <= 0) {
      throw new Error('Height must be greater than 0.');
    }

    try {
      // Avoid duplicate writes
      const recent = await queryQuantitySamples('HKQuantityTypeIdentifierHeight', {
        unit: 'cm',
        limit: 1,
        ascending: false,
      });

      if (
        recent.length > 0 &&
        Math.abs(recent[0].quantity - valueInCm) < 0.1 &&
        Math.abs(recent[0].startDate.getTime() - date.getTime()) < 1000
      ) {
        return true;
      }

      await saveQuantitySample(
        'HKQuantityTypeIdentifierHeight',
        'cm',
        valueInCm,
        date,
        date
      );

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
      // Avoid duplicate writes
      const recent = await queryQuantitySamples('HKQuantityTypeIdentifierBodyMass', {
        unit: 'kg',
        limit: 1,
        ascending: false,
      });

      if (
        recent.length > 0 &&
        Math.abs(recent[0].quantity - valueInKg) < 0.1 &&
        Math.abs(recent[0].startDate.getTime() - date.getTime()) < 1000
      ) {
        return true;
      }

      await saveQuantitySample(
        'HKQuantityTypeIdentifierBodyMass',
        'kg',
        valueInKg,
        date,
        date
      );

      return true;
    } catch (err) {
      throw new Error(
        err instanceof Error ? err.message : 'Failed to update weight.'
      );
    }
  }
}
