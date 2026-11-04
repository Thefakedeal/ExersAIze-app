# Health Service

Cross-platform health service providing a unified interface for Apple HealthKit (iOS via `@kingstinct/react-native-healthkit`) and Health Connect (Android via `react-native-health-connect`).

## Features

- **Unified API**: Identical method signatures and return shapes across iOS and Android.
- **Automatic Platform Selection**: Importing `healthService` automatically routes to `IOSHealthService` on iOS and `AndroidHealthService` on Android.
- **Normalized Units**:
  - Distance: meters (`m`)
  - Height: centimeters (`cm`)
  - Weight: kilograms (`kg`)
  - Calories: kilocalories (`kcal`)
- **Safe Fallbacks & Deduplication**:
  - Consistent `{ supported: boolean, value, reason }` structure for platform-specific characteristics (e.g. `dateOfBirth`, `biologicalSex`).
  - Write deduplication to prevent duplicate samples within short timeframes.

## Usage Example

```typescript
import healthService from '@/services';

async function runHealthSync() {
  // 1. Initialize and check availability
  const available = await healthService.isAvailable();
  if (!available) {
    console.warn('Health service is not available on this device');
    return;
  }
  await healthService.initialize();

  // 2. Request permissions
  const granted = await healthService.requestPermissions();
  if (!granted) {
    console.warn('Permissions not granted');
    return;
  }

  // 3. Query metrics for today
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const steps = await healthService.getSteps(startOfDay, now);
  console.log(`Steps: ${steps.value} ${steps.unit}`);

  const calories = await healthService.getActiveCalories(startOfDay, now);
  console.log(`Active Calories: ${calories.value} ${calories.unit}`);

  const distance = await healthService.getDistance(startOfDay, now);
  console.log(`Distance: ${distance.value} ${distance.unit}`);

  // 4. Query user profile
  const height = await healthService.getHeight();
  console.log(`Current Height: ${height.value} ${height.unit}`);

  const weight = await healthService.getWeight();
  console.log(`Current Weight: ${weight.value} ${weight.unit}`);

  // 5. Query platform-dependent characteristics
  const dobResult = await healthService.getDateOfBirth();
  if (dobResult.supported && dobResult.value) {
    console.log(`Date of Birth: ${dobResult.value.toISOString()}`);
  } else if (!dobResult.supported) {
    console.log(`DOB not supported: ${dobResult.reason}`);
  }

  const sexResult = await healthService.getBiologicalSex();
  if (sexResult.supported) {
    console.log(`Biological Sex: ${sexResult.value}`);
  }

  // 6. Update user profile measurements
  await healthService.updateHeight(178.5); // cm
  await healthService.updateWeight(72.0);  // kg
}
```

## Native Configuration Requirements

### Android (`app.json`)
The following permissions are required in `android.permissions`:
```json
"android.permission.health.READ_STEPS",
"android.permission.health.READ_DISTANCE",
"android.permission.health.READ_ACTIVE_CALORIES_BURNED",
"android.permission.health.READ_HEIGHT",
"android.permission.health.WRITE_HEIGHT",
"android.permission.health.READ_WEIGHT",
"android.permission.health.WRITE_WEIGHT"
```
Plugin:
```json
"react-native-health-connect"
```

### iOS (`app.json`)
Config plugin:
```json
[
  "@kingstinct/react-native-healthkit",
  {
    "healthSharePermission": "Allow ExersAIze to read your health and fitness data.",
    "healthUpdatePermission": "Allow ExersAIze to save your workout and fitness data."
  }
]
```

### Prebuild / Rebuild Requirements
Because native permissions and Health Connect / HealthKit modules are configured via native plugins, any newly added permissions require regenerating the native projects:
```bash
npx expo prebuild --clean
# or rebuild development clients
npx expo run:android
npx expo run:ios
```
