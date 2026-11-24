# Scheduled Activity Interactions

## Requirements

### 1. Activity Status Management
- Allow users to view the status of scheduled activities.
- Status must reflect whether an activity is `Scheduled`, `Completed`, or `Skipped`.
- Status changes must be reflected immediately in the calendar and activity UI.
- Status must be derived from the activity date and associated workout session, not stored manually.

### 2. Navigate to Linked Routine
- For activities linked to a routine, provide an action to open the associated routine.
- Navigate to the existing routine detail screen (`/routine/view-routine`).
- Ensure the correct routine is opened.
- Handle missing or deleted routines gracefully.

### 3. Navigate to Linked Workout Session
- For completed activities with an associated workout session, provide an action to open the session.
- Navigate to the existing session detail screen (`/session/view-session`).
- Ensure the correct session is displayed.
- Handle missing or deleted sessions gracefully.

### 4. Start Linked Routine
- For activities linked to a routine, provide a **Start Routine** action.
- Starting the routine navigates to the existing workout session flow (`/session/exercise-session`).
- Pass the associated routine ID so the correct routine is loaded.
- Preserve the relationship between the scheduled activity and the resulting session.
- Link the resulting session ID to the scheduled activity.
- When the workout session is completed, the activity status becomes `Completed`.
- Avoid creating duplicate sessions if the user accidentally triggers the start action multiple times.
- Handle interrupted or abandoned sessions without incorrectly marking the activity as completed.

### 5. Date-Based Restrictions
- Status changes and routine starting are only available for activities scheduled today or in the past.
- Future activities cannot be marked completed, skipped, or started.
- Use local calendar dates for all today/past/future comparisons to avoid timezone errors.

### 6. Session Date and Time
- When starting a routine from a scheduled activity, initialize the workout session's start and end date/time using the activity's scheduled date and time.
- If the activity has a specific start and end time, use those values.
- If the activity has no specific time (all-day or date-only), default to:
  - Start: 10:00 AM
  - End: 1 hour after the resolved start time (e.g., 11:00 AM when start defaults to 10:00 AM)
  - Date: The scheduled activity's date.
- If only a start time is provided, default the end time to 1 hour after the start time.
- Ensure both timestamps use the activity's local calendar date, not the current date.

### 7. Dynamic Status Rules

| Activity date | Associated session | Displayed status |
|---|---|---|
| Future | Any | Scheduled |
| Today | No session | Scheduled |
| Today | Session exists | Completed |
| Past | Session exists | Completed |
| Past | No session | Skipped |

- Status is calculated dynamically using the activity's scheduled date and associated session.
- An activity automatically transitions from `Scheduled` to `Skipped` when its date passes without an associated session.
- An activity becomes `Completed` when an associated workout session exists.
- The status calculation is kept in one reusable function/hook.

## Implementation Plan

1. **Storage Layer**
   - Add `getScheduledOccurrenceById` to fetch a single occurrence.
   - Add `updateScheduledOccurrence` to update occurrence fields (e.g., linking a session ID).

2. **Status Calculation**
   - Create `src/utils/schedule-status.ts` with `getScheduledActivityStatus`.
   - Create `src/hooks/use-scheduled-activity-status.ts` to reuse the calculation and react to session changes.

3. **Calendar Integration**
   - Update `useMonthlyWorkoutStatus` and `useWeeklyWorkoutStatus` to derive day status from occurrences dynamically.
   - Fix skipped-status dot rendering in monthly and weekly calendars.

4. **Schedule Screen**
   - Make activity cards pressable and show dynamic status badges.

5. **Activity Detail Screen**
   - Create `src/screens/scheduled-activity-detail-screen.tsx` and route `src/app/(home)/schedule/activity-detail.tsx`.
   - Display activity details and dynamic status badge.
   - Provide actions for linked routine and session.
   - Provide Start Routine action for today/past activities.
   - Hide status management and routine start for future activities.

6. **Workout Session Flow**
   - Update `exercise-session-screen.tsx` to accept `scheduledOccurrenceId`.
   - When starting from a scheduled activity, initialize session start/end times from the activity.
   - Link the created session ID to the occurrence immediately to prevent duplicates.
   - Stop persisting occurrence `status` because it is now derived.

## Edit and Delete Scheduled Activities

### 8. Edit Scheduled Activities
- Provide an **Edit** action for scheduled activities.
- Edit is reached from the activity detail screen via an **Edit** button with an icon.
- The edit screen reuses the same form fields as adding an activity: routine, date, all-day toggle, start/end time, recurrence, notes.
- For recurring activities, saving prompts the user to apply changes to:
  - **Only this occurrence** — updates the selected occurrence and detaches it from the series.
  - **This and future occurrences** — keeps past occurrences unchanged and updates/regenerates the selected and future occurrences.
  - **Entire series** — updates all occurrences; past occurrences preserve their dates and session links, future occurrences regenerate when recurrence or start date changes.
- Editing must never modify or delete historical workout records.

### 9. Delete Scheduled Activities
- Provide a **Delete** action for scheduled activities.
- Delete is reached from the activity detail screen via a **Delete** button with an icon.
- For non-recurring activities, delete removes the single occurrence after confirmation.
- For recurring activities, delete asks which occurrences to remove:
  - **Only this occurrence** — removes the selected occurrence.
  - **This and future occurrences** — removes occurrences in the series from the selected date onward.
  - **Entire series** — removes all occurrences sharing the series ID.
- Deleting schedule entries must never cascade into deleting completed workout sessions.

## What Was Done

### Files Added
- `src/utils/schedule-status.ts` — Reusable dynamic status calculation.
- `src/hooks/use-scheduled-activity-status.ts` — Hook wrapping the status calculation.
- `src/screens/scheduled-activity-detail-screen.tsx` — New detail/status/navigation screen.
- `src/app/(home)/schedule/activity-detail.tsx` — Route wrapper for the detail screen.
- `src/screens/edit-schedule-activity-screen.tsx` — New edit screen with recurring scope handling.
- `src/app/(home)/schedule/edit-activity.tsx` — Route wrapper for the edit screen.
- `src/components/schedule/schedule-activity-form.tsx` — Shared form component used by Add and Edit screens.

### Files Modified
- `src/services/schedule-storage.ts` — Added `getScheduledOccurrenceById`, `updateScheduledOccurrence`, `deleteScheduledOccurrence`, and `updateScheduledOccurrenceWithScope`.
- `src/hooks/use-monthly-workout-status.ts` — Derives day status dynamically from occurrences and sessions.
- `src/hooks/use-weekly-workout-status.ts` — Derives day status dynamically from occurrences and sessions.
- `src/components/monthly-calendar.tsx` — Fixed skipped-status dot style.
- `src/components/weekly-workout-calendar.tsx` — Fixed skipped-status dot style.
- `src/components/schedule/activity-card.tsx` — Activity cards navigate to the detail screen.
- `src/components/scheduled-day-content.tsx` — Renders activity cards for the Home page selected-day view.
- `src/screens/scheduled-activity-detail-screen.tsx` — Added Edit and Delete buttons with icons and recurring scope prompts.
- `src/screens/schedule-screen.tsx` — Activity cards are pressable, display dynamic status badges, and support edit/delete.
- `src/screens/add-schedule-activity-screen.tsx` — Refactored to use the shared `ScheduleActivityForm`.
- `src/screens/exercise-session-screen.tsx` — Accepts `scheduledOccurrenceId`, initializes session times from activity, links session ID, no longer persists status.
- `src/app/session/exercise-session.tsx` — Forwards `scheduledOccurrenceId` route param.
- `src/components/ui/icons.tsx` — Added `MoreHorizontalIcon`.

### Behavior
- Tapping a scheduled activity opens its detail view.
- The detail screen shows **Edit** and **Delete** buttons with icons.
- **Edit** opens the edit screen pre-filled with the activity's values.
- **Delete** asks for confirmation and, for recurring activities, asks which occurrences to remove.
- Recurring edits prompt for scope before applying changes.
- Detail view shows a dynamic status badge (`Scheduled`, `Completed`, or `Skipped`).
- Linked routines can be viewed and started (today/past only).
- Linked sessions can be viewed (completed) or continued (in-progress).
- Starting a routine creates a workout session with timestamps from the activity, links the session ID to the occurrence, and the activity becomes `Completed`.
- If a routine is started and abandoned, the occurrence stays linked to the in-progress session; the user sees **Continue Session**.
- If a linked session is deleted, the Workout Session section disappears, **Start Routine** is offered again, and the occurrence status reverts dynamically.
- If a scheduled occurrence or series is deleted, the linked workout session remains in storage and remains visible in the Workouts section.
- Future activities show no status actions and no Start Routine button.

## Verification
- `npx tsc --noEmit` passed.
- `npx expo lint` reported no issues in modified files.
- `npx expo-doctor` reported pre-existing issues unrelated to this work.
