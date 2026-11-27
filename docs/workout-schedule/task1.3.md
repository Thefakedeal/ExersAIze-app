# Task 1.3 — Calendar Display & Occurrence Generation

## Objective

Define how weekly schedules, one-time scheduled activities, and actual workout sessions appear together on the calendar.

The calendar must combine planned activities with workouts that were actually performed, including workouts that were never scheduled.

## 1. Calendar Data Sources

The calendar displays three types of data:

### A. Recurring Schedule Occurrences

- Generated dynamically from active weekly schedules.
- Displayed on matching weekdays.
- Do not create database records simply because an occurrence is displayed.
- Apply persisted exceptions such as completed, skipped, cancelled, or moved occurrences.

### B. One-Time Scheduled Activities

- Created for a specific date.
- Stored as individual scheduled activities.
- Can reference an existing routine or represent a custom workout or class.
- Exist independently of recurring schedules.

### C. Actual Workout Sessions

- Represent workouts that were actually performed.
- Can optionally link to a scheduled activity.
- Must appear on the calendar even when the workout was never scheduled.
- Must not require a routine ID.

## 2. Calendar Views

V1 should support:

- Monthly calendar view.
- Weekly calendar view.
- Daily activity list when a date is selected.

All views should consume the same underlying calendar data.

## 3. Recurring Occurrence Generation

When displaying a calendar date:

1. Find recurring schedules applicable to that date.
2. Check whether each schedule is active and within its configured date range.
3. Generate virtual occurrences for matching weekdays.
4. Apply persisted occurrence exceptions.
5. Exclude occurrences suppressed by cancellations or moves.
6. Include manually scheduled activities.
7. Include actual workout sessions.
8. Combine the results without duplicates.

## 4. Occurrence Behaviour

- Untouched recurring occurrences remain virtual.
- Interacting with a recurring occurrence should persist the necessary exception.
- Completing an occurrence changes its status to completed.
- Skipping an occurrence affects only that occurrence.
- Cancelling an occurrence prevents it from being regenerated.
- Moving an occurrence creates an independent dated occurrence or persisted override.
- Moving an occurrence must not modify the original weekly schedule.
- Future weeks must continue following the recurring schedule.
- A moved occurrence must not appear on both its original and destination dates.

## 5. Workout Session Integration

- Completing a scheduled activity through a workout session should link the session to that activity.
- The linked session and scheduled activity should not appear as duplicate calendar entries.
- Unscheduled workout sessions should appear independently.
- A workout session must remain valid without a routine or scheduled activity.

## 6. Calendar Display Rules

Each calendar item should provide enough information to display:

- Activity title.
- Date.
- Optional start and end times.
- Activity type or category when available.
- Status when applicable.
- Associated routine when available.

Overlapping activities are allowed. The calendar may display a warning or visual indication of overlapping times.

## 7. Scope

This task covers:

- Calendar data sources.
- Recurring occurrence generation.
- Occurrence exception handling.
- One-time scheduled activities.
- Workout session integration.
- Duplicate prevention.

It does not cover:

- Calendar UI implementation.
- Notifications and reminders.
- External calendar synchronization.
- Server synchronization.
- Drag-and-drop interactions.

## Expected Outcome

A clearly defined calendar model that combines planned activities and actual workout history while keeping recurring schedules virtual and independent of individual workout sessions.
