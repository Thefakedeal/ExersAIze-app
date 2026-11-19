# Support Custom Workouts Without Routines

## Objective

Scheduled activities must not require an existing routine.

Users should be able to schedule and log workouts independently of their saved routine library.

Examples:

- Schedule an existing routine, such as Upper Body A.
- Schedule a custom workout without selecting a routine.
- Create a workout session without following a saved routine.
- Support other activity types in future versions.

## Data Model Changes

### WeeklyScheduleEntry

The `routineId` field must be optional.

```ts
interface WeeklyScheduleEntry {
  id: string;
  scheduleId: string;

  routineId?: string;
  title: string;

  weekday: number;

  startTime?: string;
  endTime?: string;

  notes?: string;
  location?: string;
}
```

### ScheduledOccurrence

The `routineId` field must also be optional.

```ts
interface ScheduledOccurrence {
  id: string;

  source: "weekly_schedule" | "manual";

  scheduleId?: string;
  scheduleEntryId?: string;

  routineId?: string;
  title: string;

  originalDate?: string;
  scheduledDate: string;

  startTime?: string;
  endTime?: string;

  notes?: string;
  location?: string;

  status: "scheduled" | "completed" | "skipped" | "cancelled";

  workoutSessionId?: string;

  createdAt: string;
  updatedAt: string;
}
```

## Scheduling Behaviour

Users should have two ways to schedule an activity:

1. **Existing Routine:** Select a saved routine. The scheduled activity references its routine ID and uses its name as the title.
2. **Custom Workout:** Enter a title and schedule the activity without selecting a saved routine.

The title must be available regardless of whether a routine is selected.

## Workout Session Integration

Actual workout sessions must also support workouts performed without a saved routine.

Requirements:

- A workout session must not require a routine ID.
- Users can start a workout from a scheduled activity, whether or not it references a routine.
- A workout session can optionally reference a scheduled occurrence.
- Unscheduled workout sessions must remain supported.
- Completing a linked workout session should update the scheduled occurrence to completed.

## Important Rules

1. `routineId` is optional in both weekly schedule entries and scheduled occurrences.
2. Every scheduled activity must have a title.
3. Custom workouts must work independently of the routine library.
4. Workout sessions must not require a saved routine.
5. Do not automatically create a routine when scheduling a custom workout.
6. Keep the data model extensible for future activity types such as running, cycling, swimming, and walking.

## Scope

This change applies to the data model and scheduling behaviour. It does not introduce additional activity types in V1.
