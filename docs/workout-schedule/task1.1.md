# Phase 1 — Foundation and Data Model

## Task 1.1 — Define Scheduling Behaviour

### 1. Core Concept: Calendar Events

The Workout Schedule feature should function like a traditional calendar application.

Users can schedule workout routines as calendar events, assign dates and times, and optionally configure recurring schedules.

For the initial implementation, only existing workout routines will be supported as events.

Future event types, such as cardio and custom activities, can be introduced later.

### 2. Event Properties

Conceptually, each scheduled event should support:

- Event ID
- Routine ID
- Date
- Start time
- End time (optional)
- Notes (optional)
- Recurrence information (if applicable)

The actual TypeScript data model will be defined in Task 1.2.

### 3. Multiple Events Per Day

Users must be able to schedule multiple routines on the same day.

Each scheduled routine is an independent calendar event with its own date and time.

Example:

| Day       | Time    | Event        |
| --------- | ------- | ------------ |
| Monday    | 7:00 AM | Upper Body A |
| Monday    | 6:00 PM | Upper Body B |
| Tuesday   | 7:00 AM | Lower Body A |
| Wednesday | 6:00 PM | Upper Body A |
| Friday    | 7:00 AM | Lower Body B |

There should be no restriction on scheduling the same routine multiple times.

### 4. Recurring Events

Users must be able to schedule routines on a repeating weekly basis.

Example:

| Day      | Time    | Routine      |
| -------- | ------- | ------------ |
| Monday   | 7:00 AM | Upper Body A |
| Tuesday  | 7:00 AM | Lower Body A |
| Thursday | 7:00 AM | Upper Body B |
| Friday   | 7:00 AM | Lower Body B |

Users should be able to:

- Select one or multiple weekdays.
- Assign routines to selected days.
- Set a scheduled time.
- Set a start date.
- Optionally set an end date.

Recurring events should automatically appear on the appropriate calendar dates.

### 5. Event Management

Treat scheduled routines like regular calendar events.

Users should be able to:

| Action | Behaviour                                          |
| ------ | -------------------------------------------------- |
| Create | Schedule a routine on a date and time.             |
| Edit   | Change the routine, date, time, or notes.          |
| Delete | Remove a scheduled event.                          |
| Move   | Reschedule an event to another date or time.       |
| Skip   | Skip a particular occurrence of a recurring event. |

For recurring events, editing should eventually support:

1. This occurrence only.
2. This and future occurrences.
3. The entire recurring series.

### 6. Recurring Event Exceptions

Individual occurrences must be independently manageable without modifying the original recurring schedule.

Example:

A user schedules Upper Body A every Monday at 7:00 AM.

On November 23, the user decides to skip the workout.

Expected behaviour:

- Only the November 23 occurrence is skipped.
- The recurring schedule remains active.
- Future Monday occurrences remain unchanged.

Similarly, users should eventually be able to move or replace an individual occurrence without modifying the entire recurring series.

### 7. Time and Reminders

Scheduled events must support time from the beginning.

Although notifications and reminders are outside the initial implementation scope, storing event times will allow these features to be introduced later.

For now:

- Users can assign a start time.
- An optional end time can be supported.
- Events display their scheduled times.
- Multiple events are ordered chronologically.
- No notifications are triggered.

### 8. Supported Event Types

Initial implementation:

| Event Type                   | Availability |
| ---------------------------- | ------------ |
| Existing workout routines    | V1           |
| Cardio                       | Future       |
| Running / Cycling / Swimming | Future       |
| Custom activities            | Future       |

Keep the architecture extensible, but do not implement additional event types during the initial development.

### 9. Routine References

Scheduled events should reference existing routines using their stable routine IDs.

Expected behaviour:

| Situation        | Behaviour                                                                               |
| ---------------- | --------------------------------------------------------------------------------------- |
| Routine renamed  | Display the updated routine name.                                                       |
| Routine modified | Use the updated routine information.                                                    |
| Routine deleted  | Do not automatically delete scheduled events. Handle unavailable references gracefully. |
| Routine restored | Existing references may become valid again if IDs are preserved.                        |

Avoid copying the entire routine object into every scheduled event.

### 10. Relationship Between Scheduling and Workout Sessions

Scheduling and workout completion should remain separate concepts.

- A scheduled event represents an intended workout.
- A workout session represents an activity the user actually performed.

Eventually, these can be connected.

For example:

1. Upper Body A is scheduled for Monday at 7:00 AM.
2. The user starts the workout.
3. The user completes the workout.
4. The scheduled event can be associated with the completed workout session.

Workout completion tracking is not part of this task.

---

## 11. Consolidated Behaviour Specification

| Requirement                      | Decision               |
| -------------------------------- | ---------------------- |
| Scheduling concept               | Calendar events        |
| Initial event type               | Existing routines only |
| Multiple events per day          | Supported              |
| Duplicate routines               | Allowed                |
| Event start time                 | Supported              |
| Event end time                   | Optional               |
| Event notes                      | Optional               |
| Weekly recurrence                | Supported              |
| Multiple recurring weekdays      | Supported              |
| Recurrence start date            | Required               |
| Recurrence end date              | Optional               |
| Event editing                    | Supported              |
| Event deletion                   | Supported              |
| Moving events                    | Supported              |
| Skipping recurring occurrences   | Supported              |
| Individual occurrence exceptions | Supported              |
| Notifications                    | Future                 |
| Cardio scheduling                | Future                 |
| Custom activities                | Future                 |
| Initial persistence              | Local                  |
| Future persistence               | Server synchronization |

---

## 12. Architectural Principles

### Separate Recurring Events and Individual Occurrences

A recurring event and an individual calendar occurrence should be treated as separate concepts.

Example:

- Recurring event: Upper Body A every Monday at 7:00 AM.
- Occurrence: Upper Body A on November 23 at 7:00 AM.
- Exception: Skip Upper Body A on November 23.

Skipping or modifying one occurrence must not unintentionally modify the entire recurring series.

### Keep the Calendar Independent of Scheduling Logic

The calendar should primarily handle presentation:

- Display dates.
- Display scheduled events.
- Highlight selected dates.
- Show event indicators.

Scheduling and recurrence logic should live in a separate data/service layer.

### Keep Future Extensions in Mind

The initial implementation should support routines only while keeping the architecture extensible for future event types.

Avoid unnecessary abstractions or implementing features that are not currently required.

---

## 13. Out of Scope

Do not implement the following as part of this task:

- Push notifications.
- Workout reminders.
- Google Calendar integration.
- Apple Calendar integration.
- AI-generated workout schedules.
- Automatic rescheduling.
- Cardio and custom activity scheduling.
- Advanced recurrence patterns, such as monthly or biweekly schedules.
- Workout completion tracking.
- Backend synchronization.

These will be considered separately.

---

## Task 1.1 — Completion Criteria

Task 1.1 is complete when the scheduling behaviour and requirements above are agreed upon.

**Next task: Phase 1 — Task 1.2: Define the Scheduled Event Data Model.**

The next task will establish the actual TypeScript interfaces, relationships, recurrence representation, and exception handling. No implementation code is required yet.
