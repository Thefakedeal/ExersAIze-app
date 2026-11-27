# Task 1.4 — Define Local Data Operations

## Objective

Create a local schedule data layer responsible for reading and modifying scheduling data.

The data layer should separate database operations from business logic and UI components.

## 1. Schedule Operations

Provide operations to:

- Read all weekly schedules.
- Read a specific weekly schedule by ID.
- Create a weekly schedule.
- Update a weekly schedule.
- Delete or deactivate a weekly schedule.

## 2. Scheduled Activity Operations

Provide operations to:

- Read scheduled activities within a date range.
- Read a specific scheduled activity by ID.
- Create a scheduled activity.
- Update a scheduled activity.
- Delete a scheduled activity.

Scheduled activities must support both:

- Activities generated from recurring schedules.
- Independently created one-time activities.

A scheduled activity must not require a `routineId`. Custom workouts and classes should also be supported.

## 3. Recurring Rule Operations

Provide operations to:

- Read recurring rules.
- Read recurring rules applicable to a date range.
- Create recurring rules.
- Update recurring rules.
- Delete recurring rules.

Recurring rules should define the weekly pattern used to generate virtual scheduled occurrences.

## 4. Data Integrity

- Generate recurring occurrences dynamically rather than storing every future occurrence.
- Persist occurrence changes and exceptions when necessary.
- Deleting a recurring rule must not delete past workout sessions.
- Deleting a recurring rule must prevent future occurrences from being generated.
- Updating a recurring rule must preserve existing persisted occurrence exceptions.
- Deleting a scheduled activity must not delete its associated workout session.
- All database operations should use the existing local database architecture.

## 5. Implementation Guidelines

- Keep database operations inside the schedule data layer.
- Do not put database queries directly inside UI components.
- Keep functions small and focused.
- Reuse existing database utilities and conventions.
- Avoid introducing unnecessary abstractions or dependencies.
- Use TypeScript types for inputs and return values.
- Handle missing records and database errors consistently.

## 6. Expected Outcome

A dedicated schedule data layer that provides all necessary local CRUD operations for:

1. Weekly schedules.
2. Scheduled activities.
3. Recurring rules.

Calendar occurrence generation and aggregation should consume this data layer rather than accessing the database directly.
