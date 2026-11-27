# Session Improvements — Review Against the Workout Schedule Plan

Status: **Merged into `main`** (PR #5, merge commit `5303703`).

This document compares the actual implementation delivered on the
`session-improvements` branch against `docs/workout-schedule/plan.md`.

## Scope of the branch

`session-improvements` contains 33 commits unique to the master line. Of
these, 20 implement the Workout Schedule feature. The remainder covers
routine/session refactors, `.agents`/`.opencode` documentation commits, and
`.gitignore` fixes.

Schedule feature files:

| Area | Files |
|---|---|
| Model | `src/types/schedule.ts` |
| Storage | `src/services/schedule-storage.ts` |
| Status logic | `src/utils/schedule-status.ts` |
| Hooks | `use-scheduled-occurrences`, `use-monthly-workout-status`, `use-weekly-workout-status`, `use-scheduled-activity-status`, `use-debounce` |
| Screens | `schedule-screen`, `add-schedule-activity-screen`, `edit-schedule-activity-screen`, `scheduled-activity-detail-screen`, `select-routine-screen` |
| Routes | `src/app/(home)/schedule/{index,add-activity,edit-activity,activity-detail}.tsx` |
| Components | `monthly-calendar`, `weekly-workout-calendar`, `schedule/activity-card`, `schedule/schedule-activity-form`, `scheduled-day-content`, `todays-workout`, `start-workout-card` |

## Plan → implementation mapping

| Plan area | Status | Notes |
|---|---|---|
| 1.2 Activity model | Done (deviated) | One `ScheduledOccurrence` type. Uses `title?` instead of the plan's `name`; has **no `activityType` field**. |
| 1.3 Recurring model | Deviated | **No separate recurring-rule model.** Recurrence is an enum on the occurrence (`none` / `weekly` / `monthly`). |
| 1.4–1.5 Data ops + persistence | Done well | AsyncStorage plus a subscription/notify mechanism for cross-screen sync. |
| 2. Schedule page + calendar | Done | `/schedule` route, `MonthlyCalendar` with month navigation, date selection, and status indicators. |
| 3. Display activities | Done | `ActivityCard`, empty state, multiple activities per day, status coloring. |
| 4. Create activities | Partial | Routine picker + free-text title. **No distinct "cardio" type** (cardio exists only in the Home "today's workout" card, unrelated to scheduling). |
| 5. Edit / delete / move | Done | Edit and delete screens; "move" is achieved via edit-date. Delete/edit support `this` / `future` / `all` scope. |
| 6. Recurring schedules | Partial | Weekly and monthly recurrence work, but **no per-weekday selection** (Phase 6.1) and no `startDate`/`endDate`/`isActive` (Phase 6.4). |
| 6.3 Occurrence generation | Deviated | **Materializes 12 future copies up front** (`RECURRENCE_LIMIT`), which the plan explicitly cautioned against. |
| 6.5 Exceptions | Roughly | Editing "this" detaches from the series; delete "this" approximates skip. No first-class skip/move-one UI. |
| 7. Home screen integration | Done | `WeeklyWorkoutCalendar` with "View Schedule" navigation and `useWeeklyWorkoutStatus`; replaces the dummy section. |
| 8.3 Dates / timezones | Done well | Date-only `yyyy-MM-dd` local strings plus `startOfDay`/`parseISO`, matching the plan's guidance. |
| 8.5 Server-sync boundary | Mostly | Storage isolated in `services/`; UI consumes it via hooks. Not a formal repository interface, but swappable. |

## Key deviations from the plan

1. **Single occurrence model instead of rule + activity separation.**
   The plan (Tasks 1.2/1.3 and the Architectural Guidelines) called for
   recurring *rules* kept separate from individual *activities*. The
   implementation flattens everything into materialized
   `ScheduledOccurrence` rows grouped by `seriesId`.

2. **Materialized future occurrences.** Recurring activities generate up to
   12 future occurrences up front, which the plan explicitly warned against
   ("avoid creating permanent copies for every future date"). Trade-off:
   simpler status/calendar queries and scoped edits, but a fixed horizon and
   more storage churn.

3. **Coarse recurrence.** No per-weekday ("every Monday") model — only
   "weekly" (same weekday as the start date) and "monthly" (same
   day-of-month). No recurrence end date or active/inactive toggle.

4. **No `activityType` / cardio.** Custom activities are free-text titles;
   routines are linked by `routineId`. "Cardio" as a first-class activity
   type is absent from the schedule model.

## Gaps

- Recurrence horizon of 12 means events beyond that never render (no
  on-demand/lazy regeneration).
- No recurrence end date or deactivation.
- "Rest days" are not represented (the plan marked this as optional).
- No skip-one-occurrence UI. The `skipped` status is only derived (past date
  with no linked session), never user-set.

## Noteworthy additions beyond the plan

- Derived status logic (`schedule-status.ts`) infers
  scheduled/completed/skipped from the date plus a linked workout session.
- `use-debounce` was added for the schedule screen (incidental, not in the
  plan).

## Suggested follow-ups

1. Migrate to a true recurring-rule model (or justify the materialization
   trade-off).
2. Add per-weekday recurrence selection.
3. Add recurrence end-date and active/inactive status.
4. Add an `activityType` (including cardio) to the schedule model.
