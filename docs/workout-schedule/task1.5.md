# Task 1.5 — Add Local Persistence

## Objective

Implement persistent local storage for the workout scheduling feature.

Use the app's existing persistence approach wherever possible. If no suitable solution exists, use an appropriate local persistence mechanism such as AsyncStorage.

## 1. Typed Schedule Models

Create or finalize TypeScript models for:

- Weekly schedules.
- Weekly schedule entries.
- Scheduled activities.
- Recurring rules.
- Persisted occurrence exceptions.

Models must support:

- Activities linked to existing routines.
- Custom workouts and classes without routines.
- Optional start and end times.
- Optional notes and locations.
- Scheduled activity statuses.
- Links between scheduled activities and actual workout sessions.

A `routineId` must remain optional.

## 2. Local Persistence

Implement persistent storage for:

- Creating schedule records.
- Reading schedule records.
- Updating schedule records.
- Deleting schedule records.
- Retrieving scheduled activities within a date range.
- Persisting recurring occurrence exceptions.

Data must remain available after the application is closed and reopened.

## 3. Data Layer Architecture

Keep persistence implementation separate from application logic.

Use a dedicated schedule data layer with clearly defined operations.

The rest of the application should interact with the data layer through typed functions rather than accessing the storage mechanism directly.

## 4. Future Server Compatibility

Structure the data layer so local persistence can later be replaced or extended with a server-backed implementation.

Requirements:

- Keep storage-specific logic isolated.
- Use consistent typed inputs and outputs.
- Avoid exposing AsyncStorage or database implementation details to UI components.
- Keep business logic independent of the persistence mechanism.
- Avoid unnecessary abstractions or premature API implementation.

## 5. Data Integrity

- Do not persist every future recurring occurrence.
- Persist only recurring rules and necessary occurrence exceptions.
- Preserve workout sessions independently of scheduled activities.
- Deleting a schedule must not delete actual workout history.
- Updating recurring rules must not silently overwrite existing occurrence exceptions.
- Handle missing records and storage errors consistently.

## 6. Implementation Guidelines

- Inspect the existing project before choosing a persistence mechanism.
- Reuse existing storage utilities and conventions where appropriate.
- Do not introduce another storage dependency if the project already has a suitable solution.
- Keep functions small and focused.
- Avoid unnecessary changes to existing workout tracking functionality.

## 7. Deliverable

A working local persistence implementation containing:

1. Typed schedule models.
2. Persistent storage for scheduling data.
3. A dedicated schedule data layer.
4. Typed CRUD operations.
5. A structure that can later support server-backed persistence.

**Important:** This task implements local persistence, not calendar UI or server synchronization.
