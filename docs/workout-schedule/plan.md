# Workout Schedule Feature --- Implementation Plan

## 1. Overview

Add a **Workout Schedule** feature that lets users plan when they intend
to perform routines, workouts, cardio, and other activities.

The feature will have: - A dedicated schedule page with a monthly
calendar. - A selected-day view showing scheduled activities. - The
ability to add, edit, move, and delete scheduled activities. - Recurring
weekly schedules, such as Upper Body A every Monday. - A Home screen
section showing the current week's schedule. - Local persistence
initially, with an architecture that can later support server
synchronization.

### Terminology

---

Term Meaning

---

Exercise An individual exercise in the
exercise library.

Routine / Program A collection of exercises, such as
Upper Body A or Push Day.

Workout Schedule The plan for when activities should
take place.

Scheduled Activity One activity assigned to a
particular date.

Recurring Schedule A rule that repeats an activity on
selected weekdays.

---

Use **Workout Schedule** as the main feature name. This is broad enough
to include routines, cardio, and custom activities rather than only
program-based workouts.

---

## 2. Goals and Scope

### Initial goals

1.  Let users view a monthly workout calendar.
2.  Let users select a date and see its scheduled activities.
3.  Let users schedule existing routines on specific dates.
4.  Let users add custom activities, including cardio.
5.  Let users edit, move, and delete scheduled activities.
6.  Let users create recurring weekly schedules.
7.  Show the current week's schedule on the Home screen.
8.  Persist schedule data locally.
9.  Keep data access separate from the UI so server synchronization can
    be added later.

### Out of scope for the initial implementation

- Google Calendar or Apple Calendar integration.
- Push notifications and workout reminders.
- AI-generated schedules.
- Automatic rescheduling.
- Schedule sharing.
- Trainer/client scheduling.
- Backend synchronization.
- Advanced calendar functionality beyond the initial month and week
  views.

---

## 3. Implementation Plan

## Phase 1 --- Foundation and Data Model

Establish the scheduling concepts and data structures before building
the complete interface.

### Task 1.1 --- Define scheduling behaviour

Decide and document: - Whether a date can contain multiple activities. -
Whether the same routine can be scheduled more than once on a date. -
Which activity types are supported. - How unscheduled and rest days are
represented. - How recurring schedules relate to individual scheduled
activities.

### Task 1.2 --- Define the scheduled activity model

Create a basic model for an activity assigned to a date.

Potential fields: - `id` - `date` - `activityType` - `name` (where
applicable) - `routineId` (optional) - `notes` (optional) - Timestamps,
if needed by the existing data conventions.

Use the existing project's naming and typing conventions. Avoid
duplicating an entire routine object when a stable routine ID can be
referenced.

### Task 1.3 --- Define the recurring schedule model

Represent a repeating weekly rule separately from an individual
scheduled activity.

Potential fields: - `id` - `weekday` - `activityType` - `routineId`
(optional) - `name` (where applicable) - `startDate` - `endDate`
(optional) - `isActive`

The final model should be based on the app's existing architecture and
date-handling conventions.

### Task 1.4 --- Define local data operations

Create a schedule data layer with operations to: - Read schedules. -
Create scheduled activities. - Update scheduled activities. - Delete
scheduled activities. - Read recurring rules. - Create, update, and
delete recurring rules.

### Task 1.5 --- Add local persistence

Use the app's existing persistence approach where possible. If there is
no suitable existing solution, use an appropriate local persistence
mechanism such as AsyncStorage.

**Deliverable:** Typed schedule models and a local data layer that can
later be replaced or extended with a server-backed implementation.

---

## Phase 2 --- Workout Schedule Page and Calendar

Build the dedicated schedule page using sample data initially.

### Task 2.1 --- Create the schedule route

Create a dedicated page accessible through Expo Router.

Suggested route: `/schedule`

### Task 2.2 --- Build the monthly calendar

Display: - Current month and year. - Previous-month and next-month
controls. - Weekday labels. - Dates arranged in a calendar grid. - A
visual indicator for dates containing activities. - A distinct indicator
for today. - A distinct appearance for the selected date.

### Task 2.3 --- Implement date selection

When a user selects a date: - Update the selected-date state. -
Highlight the selected date. - Display that date's scheduled
activities. - Show an appropriate empty state if there are no
activities.

### Task 2.4 --- Implement month navigation

Allow users to move between months without losing schedule data or
creating incorrect date selections.

**Deliverable:** A navigable monthly calendar with working date
selection and sample schedule data.

---

## Phase 3 --- Display Scheduled Activities

Connect calendar dates to their activities.

### Task 3.1 --- Show activity indicators on calendar dates

Display a compact indicator for dates that have scheduled activities.
Keep the calendar readable when a date contains multiple activities.

### Task 3.2 --- Build the selected-day activity list

For the selected date, display: - Activity name. - Activity type. -
Associated routine, where applicable. - Notes, where applicable.

### Task 3.3 --- Support multiple activities per day

Allow more than one activity on a date, such as morning cardio and an
evening strength workout.

### Task 3.4 --- Add empty states

When a date has no activities: - Clearly communicate that nothing is
scheduled. - Provide an action to add an activity.

**Deliverable:** The calendar and selected-day view display schedule
information clearly.

---

## Phase 4 --- Create and Schedule Activities

Allow users to add activities to selected dates.

### Task 4.1 --- Add an activity action

Add an action for scheduling an activity on the currently selected date.

### Task 4.2 --- Build the activity selection interface

Initially support: 1. Existing routine. 2. Cardio. 3. Custom activity.

Keep the interface extensible so additional activity types can be
introduced later.

### Task 4.3 --- Connect the routine library

- Retrieve routines from the existing routine library.
- Let the user select a routine.
- Save its stable routine ID in the scheduled activity.
- Display the selected routine's name and relevant information.

### Task 4.4 --- Support custom activities

Allow users to create activities that are not existing routines, for
example: - Running. - Cycling. - Swimming. - Walking. - Other custom
activities.

### Task 4.5 --- Save scheduled activities

Save the new activity for the selected date and update the calendar and
selected-day view.

**Deliverable:** Users can schedule existing routines and basic custom
activities.

---

## Phase 5 --- Edit and Manage Scheduled Activities

Add the basic management operations.

### Task 5.1 --- Edit an activity

Allow users to change relevant activity details, such as: - Activity or
routine selection. - Scheduled date. - Name, where applicable. - Notes.

### Task 5.2 --- Delete an activity

Allow users to remove a scheduled activity. Include an appropriate
confirmation if needed by the app's existing interaction patterns.

### Task 5.3 --- Move an activity

Allow users to reschedule an activity to another date.

### Task 5.4 --- Handle duplicate activities

Decide and consistently implement whether identical activities can
appear more than once on the same date. The initial recommendation is to
allow this.

**Deliverable:** Users can create, edit, move, and delete individual
scheduled activities.

---

## Phase 6 --- Recurring Weekly Schedules

Allow users to define a repeating weekly workout pattern.

### Task 6.1 --- Select recurring weekdays

Allow users to select any combination of: - Sunday - Monday - Tuesday -
Wednesday - Thursday - Friday - Saturday

### Task 6.2 --- Assign activities to weekdays

Allow users to associate an activity with a selected weekday.

Example:

Day Activity

---

Monday Upper Body A
Tuesday Lower Body A
Wednesday Rest
Thursday Upper Body B
Friday Lower Body B
Saturday Cardio
Sunday Rest

Rest days do not necessarily need to be stored as scheduled activities.
They can be represented by the absence of scheduled activities unless an
explicit rest-day feature is later required.

### Task 6.3 --- Generate recurring calendar occurrences

Use recurring rules to determine which activities appear on each
calendar date.

Avoid manually creating permanent copies for every future date unless
there is a clear technical reason to do so.

### Task 6.4 --- Define recurring schedule boundaries

Support: - Start date. - Optional end date. - Active/inactive status.

### Task 6.5 --- Handle individual exceptions

Plan support for: - Skipping one occurrence. - Moving one occurrence. -
Replacing one occurrence. - Adding an extra activity on a date.

Keep exceptions separate from the recurring rule so a one-day change
does not unintentionally alter every future week.

**Deliverable:** Users can create and manage repeating weekly schedules,
with a clear foundation for individual date exceptions.

---

## Phase 7 --- Home Screen Integration

Replace the existing dummy Workout of the Week section with real
schedule data.

### Task 7.1 --- Connect the Home screen section to schedule data

Remove hardcoded dates and activities. Read the current week's schedule
from the shared schedule data layer.

### Task 7.2 --- Make the section optional

When no schedule exists, either: - Hide the section; or - Show a compact
empty state inviting the user to create a schedule.

Recommended initial behaviour: show a small invitation to create a
schedule rather than displaying misleading dummy information.

### Task 7.3 --- Display the current week

Show: - Sunday through Saturday. - Actual dates. - Scheduled
activities. - Today's indicator. - Completed/upcoming status, if
supported by existing workout-session data.

### Task 7.4 --- Add navigation to the schedule page

Add a clear **View Schedule** action that opens `/schedule`.

### Task 7.5 --- Keep both interfaces synchronized

Changes made on the schedule page should immediately appear in the Home
screen section. Avoid maintaining separate copies of the same schedule
state.

**Deliverable:** The Home screen displays the user's actual weekly
schedule and links to the full schedule page.

---

## Phase 8 --- Edge Cases, Testing, and Future Integration

Complete the feature and prepare it for future development.

### Task 8.1 --- Test calendar boundaries

Test: - Months beginning on different weekdays. - February and leap
years. - Months with 30 and 31 days. - Previous- and next-month
navigation. - Dates at the beginning and end of a month.

### Task 8.2 --- Handle routine changes and deletion

Define behaviour when: - A referenced routine is renamed. - A referenced
routine is edited. - A referenced routine is deleted. - A scheduled
activity references a routine that is no longer available.

Avoid broken references and provide a sensible fallback where necessary.

### Task 8.3 --- Handle dates and time zones

Use a consistent date representation for date-only schedule entries.
Avoid accidental UTC conversions that shift an activity to the previous
or next calendar day.

### Task 8.4 --- Test persistence

Verify that schedules survive: - App restarts. - Navigation between
screens. - App backgrounding and resuming. - Updates to scheduled
activities.

### Task 8.5 --- Prepare for server synchronization

Keep UI components independent of the storage implementation.

Use a repository or service boundary so local storage can eventually be
replaced or supplemented by API operations without rewriting the
calendar UI.

### Task 8.6 --- Test the complete workflow

Test the complete user journey: 1. Open the schedule page. 2. Select a
date. 3. Add a routine. 4. Add another activity to the same date. 5.
Edit an activity. 6. Move an activity. 7. Delete an activity. 8. Create
a recurring weekly schedule. 9. Verify recurring activities in the
calendar. 10. Verify the current week's schedule on the Home screen. 11.
Restart the app and verify persistence.

**Deliverable:** A tested, locally persisted Workout Schedule feature
with a clean path to future backend integration.

---

## 4. Recommended Implementation Order

The phases above describe the feature areas. For implementation, use
this more focused task sequence:

    Order Task                                               Priority

---

        1 Define scheduling concepts and behaviour           Essential
        2 Create scheduled activity data model               Essential
        3 Create recurring schedule data model               Essential
        4 Implement local schedule data operations           Essential
        5 Implement local persistence                        Essential
        6 Create the `/schedule` route and page shell        Essential
        7 Build the monthly calendar                         Essential
        8 Implement date selection and month navigation      Essential
        9 Display scheduled activities for a selected date   Essential
       10 Add activity creation interface                    Essential
       11 Connect existing routines                          Essential
       12 Add custom activities and cardio                   High
       13 Implement editing and deletion                     Essential
       14 Implement moving activities between dates          High
       15 Implement recurring weekly rules                   Essential
       16 Display recurring occurrences on the calendar      Essential
       17 Handle recurring schedule exceptions               Later
       18 Replace Home screen dummy data                     Essential
       19 Add Home screen navigation to the schedule page    Essential
       20 Test persistence, date handling, and edge cases    Essential
       21 Prepare for backend synchronization                Later

---

## 5. Recommended Release Strategy

### V1 --- Basic Workout Calendar

Include: - Schedule page. - Monthly calendar. - Date selection. -
Display scheduled activities. - Schedule existing routines on specific
dates. - Add custom activities. - Edit, move, and delete activities. -
Local persistence.

**Outcome:** Users can manually plan and manage individual workout
dates.

### V2 --- Recurring Schedules and Home Screen

Include: - Recurring weekly schedules. - Assign routines to weekdays. -
Generate recurring calendar occurrences. - Individual occurrence
exceptions. - Home screen weekly schedule integration. - View Schedule
navigation.

**Outcome:** Users can establish a weekly workout pattern and see it
throughout the app.

### V3 --- Advanced Scheduling

Potential additions: - Workout reminders and notifications. - Server
synchronization. - AI-assisted schedule suggestions. - Automatic
rescheduling. - Calendar integrations. - Advanced month/week views. -
Trainer/client scheduling.

**Outcome:** A more complete scheduling system.

---

## 6. Architectural Guidelines

Follow these principles throughout implementation.

### Separate recurring rules from individual activities

A recurring rule such as "Upper Body A every Monday" is different from
an individual activity scheduled for a particular date.

Keep these concepts separate. This makes it possible to skip or move one
occurrence without changing the entire recurring schedule.

### Keep the calendar focused on presentation

The calendar should display dates, selection state, and activity
indicators. It should not own the business logic for creating or
resolving recurring schedules.

### Keep scheduling logic in a dedicated layer

Separate responsibilities:

---

Layer Responsibility

---

Calendar UI Displays dates and activity
indicators.

Selected-day UI Displays activities for the
selected date.

Schedule management UI Provides create, edit, move, and
delete interactions.

Schedule service Resolves recurring rules and
individual activities.

Repository / storage Reads and persists schedule data.

---

Adapt these boundaries to the existing project structure rather than
introducing unnecessary abstractions.

### Reference routines by ID

Scheduled activities should reference routines using stable IDs rather
than copying entire routine objects.

Define sensible behaviour for deleted or unavailable routines.

### Reuse existing project conventions

Before implementation: - Inspect existing components and hooks. - Reuse
the current theme and design tokens. - Follow existing Expo Router
conventions. - Reuse existing routine and exercise data models. - Prefer
small, focused components and functions. - Avoid unnecessary
dependencies and large rewrites.

### Keep implementation incremental

Each implementation task should have: 1. A narrow scope. 2. A clear
expected result. 3. Acceptance criteria. 4. Relevant tests. 5. Minimal
changes outside the task's scope.

Do not ask a coding agent to implement the entire feature in one pass.

---

## 7. Initial Design Direction

The initial interface should contain:

### Home screen

A compact **Workout of the Week** section: - Sunday-to-Saturday
overview. - Actual dates. - Activity indicators. - Today's highlight. -
A **View Schedule** action. - An empty state when no schedule exists.

### Workout Schedule page

A dedicated page containing: - Month and year heading. - Previous and
next month controls. - Monthly calendar. - Indicators for scheduled
activities. - Selected date. - Selected-day activity list. - Add
activity action.

### Future enhancement

Add a Month / Week view switch.

The monthly view is useful for planning ahead. The weekly view is likely
more useful for following the workout plan day by day.

---

## 8. First Implementation Milestone

Start with the foundation, not the full interface.

The first milestone should include:

1.  Inspect the existing project structure and data models.
2.  Identify the current routine model and local persistence approach.
3.  Define the scheduled activity model.
4.  Define the recurring schedule model.
5.  Define the basic schedule repository/service interface.
6.  Implement local create, read, update, and delete operations.
7.  Verify that schedule data persists after an app restart.

Once this foundation is complete, move on to the calendar page.

**Important:** Do not implement every phase immediately. Work through
one small task at a time, inspect the existing code before making
changes, and preserve the app's current architecture and visual
conventions.
