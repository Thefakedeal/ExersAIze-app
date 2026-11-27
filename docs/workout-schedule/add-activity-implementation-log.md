# Add Activity screen — implementation log

This document records the full lifecycle of the Add Activity screen work: the
original request, the plan, the implementation, the UI review, and the follow-up
fixes. For day-to-day usage, see [add-activity-screen.md](./add-activity-screen.md);
for the list of UI review improvements, see
[add-activity-screen-ui-review.md](./add-activity-screen-ui-review.md).

## 1. Initial request

Add an **Add Activity** scheduling screen modeled on Google Calendar's Android
event-creation flow. The screen lets users plan when they intend to work out,
whether that activity is linked to an existing routine or is a standalone entry.

### Required fields

- **Routine** — optional. Selecting a routine fills the title but does not lock
  it.
- **Title** — editable, defaults to the selected routine's name.
- **Date** — the day the activity is scheduled.
- **All day** — toggle that hides start/end times when enabled.
- **Starts / Ends** — shown when All day is off.
- **Repeat** — none, weekly, or monthly.
- **Notes** — optional multiline text.

### Constraints

- Routine must not be mandatory; support standalone activities.
- Reuse existing project patterns: pickers, routine selection, theme tokens,
  types, and utilities.
- Build UI and interactions only; avoid unrelated refactors.
- Document the work in the simplest possible way.

## 2. Plan

The Add Activity screen sits inside the broader Workout Schedule feature. The
overall plan is in [plan.md](./plan.md). The pieces that directly shaped this
work were:

- [task1.3.md](./task1.3.md) — calendar display and occurrence generation.
- [task1.4.md](./task1.4.md) — local data operations for scheduled activities
  and recurring rules.
- [task1.5.md](./task1.5.md) — local persistence for scheduled activities,
  with `routineId` remaining optional.

From those tasks we derived the following concrete approach for the Add
Activity screen:

1. Extend `ScheduledOccurrence` with the new fields needed by the form:
   `endTime`, `allDay`, `recurrence`, `notes`, and `seriesId`.
2. Extend `saveScheduledOccurrence` so it persists the new fields and,
   for weekly/monthly activities, materializes a fixed horizon of future
   occurrences that share a `seriesId`.
3. Build a reusable `SelectRoutineScreen` modal that follows the existing
   `select-exercise-screen.tsx` pattern.
4. Rebuild `AddScheduleActivityScreen` as a Google Calendar–style form with
   a header checkmark save action.
5. Keep the calendar display layer unchanged by storing concrete occurrences
   rather than an expanding recurrence rule.

### Key decisions

- **Recurrence materialization.** Weekly/monthly activities generate 12 concrete
  future occurrences sharing a `seriesId`. This avoids changing the calendar
  display layer, which already consumes `ScheduledOccurrence[]`.
- **All-day uses a single date.** No date range; all-day activities store only
  `scheduledDate`.
- **Save returns occurrences.** `saveScheduledOccurrence` returns
  `Promise<ScheduledOccurrence[]>` so callers can react to the saved set.

## 3. Implementation

### 3.1 Type changes (`src/types/schedule.ts`)

Added the `Recurrence` union type and extended `ScheduledOccurrence`:

```ts
export type Recurrence = 'none' | 'weekly' | 'monthly';

export interface ScheduledOccurrence {
  id: string;
  scheduledDate: string;
  status: 'scheduled' | 'completed' | 'skipped' | 'cancelled';
  routineId?: string;
  title?: string;
  startTime?: string;
  endTime?: string;
  allDay?: boolean;
  recurrence?: Recurrence;
  notes?: string;
  seriesId?: string;
}
```

### 3.2 Storage changes (`src/services/schedule-storage.ts`)

- Added `RECURRENCE_LIMIT = 12`.
- `saveScheduledOccurrence` accepts the new optional fields.
- When `recurrence` is `weekly` or `monthly`, it generates 12 future
  occurrences with a shared `seriesId` using `addWeeks` / `addMonths`.
- When `recurrence` is `none`, it saves a single occurrence with no `seriesId`.
- Added `subscribeToScheduleUpdates` so UI can refresh after saves.

### 3.3 Routine picker modal (`src/screens/select-routine-screen.tsx`)

Created a new reusable modal that:

- Loads routines through the existing `useRoutines` hook.
- Provides a `SearchField` for filtering.
- Shows selected state with a check badge.
- Is presented as a page sheet on iOS and full screen on Android.

### 3.4 Add Activity screen (`src/screens/add-schedule-activity-screen.tsx`)

Rebuilt the screen with:

- A header with back action and checkmark save button.
- A large editable title.
- A card of form rows: Routine, Date, All day, Starts/Ends, Repeat.
- A separate notes card.
- Platform-specific date/time pickers using `@expo/ui/community/datetime-picker`.
- A modal repeat picker with radio semantics.

### 3.5 Icons (`src/components/ui/icons.tsx`)

Added a `RepeatIcon` SVG for the repeat row.

### 3.6 Route (`src/app/(home)/schedule/add-activity.tsx`)

The route file simply renders `AddScheduleActivityScreen`.

## 4. UI/UX review

After the first implementation pass, a UI review identified 17 concrete
improvements. The issues fell into four groups:

### Bugs

1. Routine picker list did not scroll — long lists overflowed.
2. Picker header X both dismissed and cleared selection; clearing should be a
   separate explicit action.
3. Tapping an already-selected routine silently deselected it.
4. iOS date/time picker committed on the first scroll tick instead of on Done.
5. Time rows lacked an inline error state and invalid times were not blocking
   save.
6. End time did not auto-adjust when start time was moved past it.
7. Empty search state had no way to clear the query.

### Visual / UX

8. Title was inset from the card edge and had too much bottom margin.
9. Repeat label could truncate; row should use short values.
10. Repeat modal had a redundant Done button.
11. Notes card had an unnecessary bold header.
12. Save button was a filled circle; should be a bare check icon.

### Accessibility

13. Form and option rows had small touch targets.
14. All-day switch lacked proper role/state on the tappable row.

### Theme

15. Date/Time/Repeat icons used `primary`; should use `textSecondary`.
16. Switch used `thumbColor`, which looked off in dark mode.
17. Dividers were full-width; should be inset like the Settings screen.

The full list with the original "why" for each item is preserved in
[add-activity-screen-ui-review.md](./add-activity-screen-ui-review.md).

## 5. Fix plan and implementation

### Fix plan

Apply all 17 items in-place to the two screen files, keeping the data layer and
types unchanged:

- `src/screens/select-routine-screen.tsx` — items 1–3, 7, 13.
- `src/screens/add-schedule-activity-screen.tsx` — items 4–6, 8–12, 14–17.

### What was changed

#### `select-routine-screen.tsx`

- Replaced mapped `View` with `FlatList` for scrollability and safe-area
  padding.
- Header X now only dismisses.
- Added a **Clear** text action in the header, visible only when a routine is
  selected.
- Tapping a selected routine keeps it selected.
- Empty search state shows a **Clear search** action.
- Added `minHeight: 52` to option rows.

#### `add-schedule-activity-screen.tsx`

- Title aligned flush to the card edge with tighter bottom margin.
- Dividers inset with `marginLeft: Spacing.three` to match Settings.
- Icon colors corrected: `primary` for Routine, `textSecondary` for Date/Time/
  Repeat.
- All-day row is fully tappable with `accessibilityRole="switch"` and
  `accessibilityState={{ checked: allDay }}`; the inner `Switch` has
  `pointerEvents="none"` and no `thumbColor`.
- Time rows: clock icon only on **Starts**, placeholder styling on **Ends**,
  end time auto-bumps to start + 1h when start is moved past end, inline error
  message, and save disabled when end ≤ start.
- Repeat row uses short labels ("Never"/"Weekly"/"Monthly").
- Repeat modal uses `radiogroup`, has safe-area padding, and no Done button;
  selection immediately dismisses.
- Notes card dropped the bold header, gained `selectionColor`,
  `keyboardDismissMode="on-drag"`, and uses `minHeight` instead of
  `numberOfLines`.
- Save button is a bare `CheckIcon` colored `primary` when enabled and
  `textTertiary` when disabled, with proper `accessibilityState`.
- iOS date/time picker uses a draft value committed on **Done**; Android still
  commits on change via the native dialog.
- Form and option rows have a 52dp minimum touch target.

### Verification

After applying the fixes:

```bash
npx tsc --noEmit
npx eslint src/screens/add-schedule-activity-screen.tsx src/screens/select-routine-screen.tsx
```

Both commands passed with no errors.

## 6. Files changed

| File | Purpose |
| ---- | ------- |
| `src/types/schedule.ts` | Added `Recurrence` and extended `ScheduledOccurrence`. |
| `src/services/schedule-storage.ts` | Persisted new fields; added recurrence materialization and storage listeners. |
| `src/components/ui/icons.tsx` | Added `RepeatIcon`. |
| `src/screens/select-routine-screen.tsx` | Reusable searchable routine picker modal. |
| `src/screens/add-schedule-activity-screen.tsx` | Main Google Calendar–style form. |
| `src/app/(home)/schedule/add-activity.tsx` | Expo Router route for the screen. |
| `docs/workout-schedule/add-activity-screen.md` | User-facing documentation for the screen. |
| `docs/workout-schedule/add-activity-screen-ui-review.md` | UI review list and applied status. |
| `docs/workout-schedule/add-activity-implementation-log.md` | This file. |

## 7. Known limitations

- Recurrence is materialized as 12 concrete occurrences. Activities scheduled
  near the end of a 31-day month may roll over when generated monthly.
- The calendar display layer does not yet render `endTime`, `allDay`, or
  `notes`; those fields are persisted and ready for future UI work.
- `npx expo lint` still reports pre-existing errors in unrelated files.

## 8. Related documents

- [plan.md](./plan.md) — overall Workout Schedule feature plan.
- [add-activity-screen.md](./add-activity-screen.md) — how the screen works
  today.
- [add-activity-screen-ui-review.md](./add-activity-screen-ui-review.md) — the
  17 UI review improvements and their applied status.
