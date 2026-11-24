# Home Page Scheduled Content

## Overview

The Home page (`src/app/(home)/index.tsx`) displays the user's scheduled activities and logged workouts for the day selected in the weekly calendar. The selected-day content intentionally mirrors the behavior of the Schedule screen (`src/screens/schedule-screen.tsx`) so that interacting with a day feels consistent across the app.

## User Flow

1. The user opens the Home page.
2. The weekly calendar defaults to today.
3. The area below the calendar shows:
   - **Scheduled Activities** for the selected date.
   - **Workouts** (logged workout sessions) for the selected date.
4. Tapping a day in the calendar updates the content immediately.
5. Tapping a scheduled activity opens the activity detail screen, where the existing start/resume flows live.
6. Tapping a workout session opens the session view screen.
7. If the selected day has neither scheduled activities nor logged workouts, the content area is hidden entirely.

## Architecture

### State Ownership

Selected-day state lives in `HomeScreen`:

```tsx
const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()));
```

`WeeklyWorkoutCalendar` is a controlled component that receives `selectedDate` and `onDateSelect`.

### Data Loading

`ScheduledDayContent` loads the same data sources as the Schedule screen:

- `useScheduledOccurrences({ startDate: selectedDate, endDate: selectedDate })` — scheduled occurrences for the date.
- `useWorkoutSessions()` — all workout sessions, filtered to the selected date with `isSameDay`.

### Rendering Order

Unlike the Schedule screen, the Home page explicitly renders scheduled activities **before** workouts:

1. Scheduled Activities
2. Workouts

This matches the product requirement that activities should be shown first.

## Components

### `ScheduledDayContent`

**Location:** `src/components/scheduled-day-content.tsx`

**Responsibilities:**
- Load scheduled occurrences and workout sessions for `selectedDate`.
- Filter workout sessions to the selected date.
- Render the "Scheduled Activities" section.
- Render the "Workouts" section (only for non-future dates).
- Return `null` when there is nothing to show.

**Key behaviors:**
- Future dates do not show the Workouts section.
- Empty days do not render any placeholder.

### `ActivityCard`

**Location:** `src/components/schedule/activity-card.tsx`

**Responsibilities:**
- Display a single scheduled occurrence.
- Show title, scheduled time, and dynamic status.
- Navigate to the activity detail screen on press.

**Shared usage:**
- Used by `ScheduleScreen`.
- Used by `ScheduledDayContent`.

This shared component ensures the Home page and Schedule screen render scheduled activities identically and use the same status logic (`getScheduledActivityStatus`).

### `SessionCard`

**Location:** `src/components/session/session-card.tsx`

**Responsibilities:**
- Display a logged workout session.
- Show title, date/time, duration, and exercise preview.
- Navigate to the session view screen on press.

**Usage:**
- Used by `ScheduleScreen` for the Workouts section.
- Used by `ScheduledDayContent` for the Workouts section.

### `WeeklyWorkoutCalendar`

**Location:** `src/components/weekly-workout-calendar.tsx`

**Changes made for this feature:**
- Converted from uncontrolled to controlled by accepting `selectedDate` and `onDateSelect` props.
- Removed internal selected-index state; selection is derived from `selectedDate`.

## Date/Time Handling

All date comparisons are timezone-safe through `date-fns`:

- `startOfDay(new Date())` for the initial selected date.
- `isSameDay(new Date(session.startTime), selectedDate)` to place sessions on the correct day.
- `isFuture(selectedDate)` to hide future workout sessions.

Scheduled times are displayed by interpreting the stored `HH:mm` string in local time, consistent with the Schedule screen:

```tsx
new Date(`${occurrence.scheduledDate}T${occurrence.startTime}`)
```

## Navigation

| Action | Route |
|--------|-------|
| View scheduled activity | `/schedule/activity-detail?id={occurrence.id}` |
| View workout session | `/session/view-session?id={session.id}` |
| Start activity or workout | Handled by the activity detail screen via `/session/exercise-session?...` |

The Home page does not duplicate start logic. Starting an activity or workout follows the existing flow initiated from the activity detail screen.

## Empty States

The Home page intentionally does not show an empty-state card for days with no content. `ScheduledDayContent` returns `null` when both scheduled activities and workouts are absent, keeping the Home page clean.

The Schedule screen retains its own empty-state card with an "Add Activity" prompt, since that screen is dedicated to scheduling.

## Design Consistency

- Uses existing theme tokens (`Spacing`, `theme` colors).
- Uses existing components (`ThemedText`, `ThemedView`, `SessionCard`, `ActivityCard`).
- Keeps the Home page's existing layout: welcome title, step tracker, start-workout card, nav tiles, schedule section, calendar, date header, content, quote card.

## Future Considerations

- If the app later supports ad-hoc workouts that are not linked to a scheduled occurrence, they will already appear in the Workouts section because `ScheduledDayContent` reads all workout sessions for the selected date.
- If a scheduled occurrence and a workout session represent the same completed workout, both will be listed (once under Scheduled Activities, once under Workouts). This mirrors the Schedule screen and is intentional.
